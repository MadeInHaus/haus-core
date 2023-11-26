import { NodeInfo, NodeInfoSplit, SplitOptions } from './types';
import { deepCloneUntil, moveAttributes, moveChildNodes } from './dom';
import { fixKerning } from './fixKerning';

const BLOCK_LEVEL_DISPLAY_VALUES = ['block', 'flex', 'grid', 'table', 'list-item', 'flow-root'];

const WHITESPACE_REGEXP = /[ \n\t\u200B\u200E\u200F\uFEFF]+/;

export function split(elSource: HTMLElement, options: Required<SplitOptions>): HTMLElement[] {
    const { debug } = options;

    debug && console.time('split');

    // Work on a clone of the source element
    const elSplit = elSource.cloneNode(true) as HTMLElement;

    // Split characters and wrap them into spans
    const blockBuckets = splitChars(elSource, elSplit, options);

    // Fix the kerning
    fixKerning(elSource, elSplit, blockBuckets, options);

    // Split lines and wrap them into spans
    const blockBucketsMeasured = splitLines(elSource, elSplit, blockBuckets, options);

    // Index chars and lines,
    // rename internal data-type attributes,
    // add `data-type="splitter"` to root element
    cleanUp(elSource, elSplit, blockBucketsMeasured, options);

    moveChildNodes(elSplit, elSource);
    moveAttributes(elSplit, elSource);

    if (elSplit.parentNode) {
        // Swap source element into the DOM
        elSplit.parentNode?.replaceChild(elSource, elSplit);
    }

    // TODO: This could be a map() instead of reduce()
    const charWrappers = blockBucketsMeasured.reduce((acc, bucket) => {
        bucket.forEach(({ spans }) => {
            spans.forEach(({ span }) => {
                acc.push(span);
            });
        });
        return acc;
    }, [] as HTMLElement[]);

    debug && console.timeEnd('split');

    return charWrappers;
}

export function splitChars(
    elSource: Node,
    elSplit: Node,
    options: Required<SplitOptions>
): NodeInfoSplit[][] {
    if (elSource.parentNode) {
        // Swap split element into the DOM
        elSource.parentNode?.replaceChild(elSplit, elSource);
    }

    const { graphemeSplitter, whitelistSelectors, doubleWrap, debug } = options;

    debug && console.time('splitChars');

    const iterator = walk(
        elSplit,
        (node: Node) =>
            node.nodeType === Node.TEXT_NODE ||
            whitelistSelectors.includes(node.nodeName.toLowerCase())
    );
    const nodeInfoSplit = [...iterator]
        // Filter out empty text nodes
        .filter(({ text, isWhitelisted }) => (text?.length ?? 0) > 0 || isWhitelisted)
        // Sibling textElements with the same nearestBlockLevelParent
        // are grouped together into buckets.
        .reduce((acc, textElement) => {
            const needsNewBucket =
                acc.length === 0 ||
                (acc.at(-1)!.length > 0 &&
                    acc.at(-1)!.at(0)!.nearestBlockLevelParent !==
                        textElement.nearestBlockLevelParent);
            if (needsNewBucket) {
                acc.push([textElement]);
            } else {
                acc.at(-1)!.push(textElement);
            }
            return acc;
        }, [] as NodeInfo[][])
        // Wrap graphemes and whitelisted elements in spans
        .map(blockBucket =>
            blockBucket.map(nodeInfo => {
                const doubleWrapChars = doubleWrap === 'chars' || doubleWrap === 'both';
                if (nodeInfo.isWhitelisted) {
                    const span = document.createElement('span');
                    span.dataset.typeinternal = 'whitelisted';
                    nodeInfo.node.parentNode?.replaceChild(span, nodeInfo.node);
                    if (doubleWrapChars) {
                        const span2 = document.createElement('span');
                        span2.dataset.typeinternal = 'whitelisted-inner';
                        span2.appendChild(nodeInfo.node);
                        span.appendChild(span2);
                    } else {
                        span.appendChild(nodeInfo.node);
                    }
                    return { ...nodeInfo, spans: [{ span }] };
                } else {
                    const fragment = document.createDocumentFragment();
                    const spans = graphemeSplitter(nodeInfo.text!).map(char => {
                        const span = document.createElement('span');
                        span.dataset.typeinternal = 'char';
                        if (doubleWrapChars && !char.match(WHITESPACE_REGEXP)) {
                            const span2 = document.createElement('span');
                            span2.dataset.typeinternal = 'char-inner';
                            span2.textContent = char;
                            span.appendChild(span2);
                        } else {
                            span.textContent = char;
                        }
                        fragment.appendChild(span);
                        return { span };
                    });
                    nodeInfo.node.parentNode?.replaceChild(fragment, nodeInfo.node);
                    return { ...nodeInfo, spans };
                }
            })
        );

    debug && console.timeEnd('splitChars');

    return nodeInfoSplit;
}

export function splitLines(
    elSource: HTMLElement,
    elSplit: HTMLElement,
    blockBuckets: NodeInfoSplit[][],
    options: Required<SplitOptions>
): NodeInfoSplit[][] {
    const { splitLines, doubleWrap, debug } = options;
    if (!splitLines) {
        return blockBuckets;
    }

    debug && console.time('splitLines');

    const doubleWrapLines = doubleWrap === 'lines' || doubleWrap === 'both';

    if (elSource.parentNode) {
        // Swap split element into the DOM
        elSource.parentNode.replaceChild(elSplit, elSource);
    }

    let line = 0;
    const blockBucketsMeasured = blockBuckets.map(blockBucket => {
        let lastXPos: number;
        const blockBucketMeasured = blockBucket.map(nodeInfo => {
            const spans = nodeInfo.spans.map(({ span }) => {
                const rect = span.getBoundingClientRect();
                if (lastXPos != null && rect.x < lastXPos) {
                    line++;
                }
                lastXPos = rect.x;
                return { span, line, rect };
            });
            return { ...nodeInfo, spans };
        });
        line++;
        return blockBucketMeasured;
    });

    // Swap source element into the DOM
    elSplit.parentNode?.replaceChild(elSource, elSplit);

    let currentLine = 0;

    const lines: {
        rootEl: HTMLElement;
        isOneLiner: boolean;
        startSpan: HTMLSpanElement;
        endSpan: HTMLSpanElement;
    }[] = [];

    blockBucketsMeasured.forEach(blockBucket => {
        const rootEl = blockBucket.at(0)!.nearestBlockLevelParent as HTMLElement;
        const spans = blockBucket.map(nodeInfo => nodeInfo.spans).flat();
        let startSpan: HTMLSpanElement = spans.at(0)!.span;
        let endSpan: HTMLSpanElement = startSpan;
        spans.forEach(({ span, line }) => {
            if (line !== currentLine) {
                lines.push({ rootEl, isOneLiner: false, startSpan, endSpan });
                startSpan = endSpan = span;
                currentLine = line;
            } else {
                endSpan = span;
            }
        });
        const isOneLiner = startSpan === spans.at(0)!.span && endSpan === spans.at(-1)!.span;
        lines.push({ rootEl, isOneLiner, startSpan, endSpan });
        currentLine++;
    });

    lines.forEach(({ rootEl, isOneLiner, endSpan }) => {
        const span = document.createElement('span');
        span.dataset.typeinternal = 'line';
        let lineSpan = span;
        if (doubleWrapLines) {
            lineSpan = document.createElement('span');
            lineSpan.dataset.typeinternal = 'line-inner';
            span.appendChild(lineSpan);
        }
        if (isOneLiner) {
            moveChildNodes(rootEl, lineSpan);
        } else {
            moveChildNodes(deepCloneUntil(rootEl, endSpan), lineSpan);
        }
        rootEl.appendChild(span);
    });

    debug && console.timeEnd('splitLines');

    return blockBucketsMeasured;
}

export function cleanUp(
    elSource: HTMLElement,
    elSplit: HTMLElement,
    blockBuckets: NodeInfoSplit[][],
    options: Required<SplitOptions>
) {
    const { debug, splitLines } = options;

    debug && console.time('cleanUp');

    if (elSplit.parentNode) {
        // Swap source element into the DOM
        elSplit.parentNode?.replaceChild(elSource, elSplit);
    }

    // Process chars (and whitelisted elements)
    let charIndex = 0;
    blockBuckets
        .reduce((acc, bucket) => {
            bucket.forEach(({ spans }) => {
                spans.forEach(({ span }) => {
                    acc.push(span);
                });
            });
            return acc;
        }, [] as HTMLSpanElement[])
        .forEach(span => {
            const type = span.dataset.typeinternal;
            const isChar = type === 'char';
            const isWhitelisted = type === 'whitelisted';
            const isSpace = isChar && span.textContent?.match(WHITESPACE_REGEXP);
            if (isChar || isWhitelisted) {
                // Rename internal data type attribute to public facing one
                // and set the value to 'space' if it's a whitespace character
                span.dataset.type = isSpace ? 'space' : type;
                delete span.dataset.typeinternal;

                // Rename inner span's internal data type attribute to public facing one
                const innerSpan = span.firstChild as HTMLElement;
                if (innerSpan && innerSpan.nodeName === 'SPAN' && innerSpan.dataset.typeinternal) {
                    innerSpan.dataset.type = innerSpan.dataset.typeinternal;
                    delete innerSpan.dataset.typeinternal;
                }

                if (!isSpace) {
                    // The span contains either a whitelisted element or a letter:
                    // Index this span.
                    span.style.setProperty('--char-index', charIndex.toString());
                    charIndex++;
                }
            }
        });

    elSplit.dataset.type = 'splitter';
    elSplit.style.setProperty('--total-chars', charIndex.toString());

    if (splitLines) {
        // Process lines
        let lineIndex = 0;

        elSplit.querySelectorAll<HTMLElement>('[data-typeinternal="line"]').forEach(line => {
            // Rename line's internal data type attribute to public facing one
            line.dataset.type = line.dataset.typeinternal;
            delete line.dataset.typeinternal;

            // Rename inner line's internal data type attribute to public facing one
            const innerSpan = line.firstChild as HTMLElement;
            if (innerSpan && innerSpan.nodeName === 'SPAN' && innerSpan.dataset.typeinternal) {
                innerSpan.dataset.type = innerSpan.dataset.typeinternal;
                delete innerSpan.dataset.typeinternal;
            }

            // Index this line.
            line.style.setProperty('--line-index', lineIndex.toString());
            lineIndex++;
        });

        elSplit.style.setProperty('--total-lines', lineIndex.toString());
    }

    debug && console.timeEnd('cleanUp');
}

function* walk(
    node: Node,
    matcher: (node: Node) => boolean = () => true,
    nearestBlockLevelParent: Node = node
): IterableIterator<NodeInfo> {
    switch (node.nodeType) {
        case Node.TEXT_NODE: {
            if (matcher(node) && node.parentNode) {
                // This is a matching text node:
                if (node.parentNode.childNodes.length === 1) {
                    // This is the only child of its parent
                    // It's safe to get innerText directly from the parent
                    yield {
                        node,
                        isWhitelisted: false,
                        nearestBlockLevelParent,
                        text: (node.parentNode as HTMLElement).innerText,
                    };
                } else {
                    // Wrap nodeValue in a temporary span
                    // This will get us the innerText
                    const spanTmp = document.createElement('span');
                    spanTmp.textContent = node.textContent;
                    spanTmp.style.setProperty('all', 'unset');
                    node.parentNode.replaceChild(spanTmp, node);
                    const text = spanTmp.innerText;
                    // Swap the original node back in
                    spanTmp.parentNode!.replaceChild(node, spanTmp);
                    yield {
                        node,
                        isWhitelisted: false,
                        nearestBlockLevelParent,
                        text,
                    };
                }
            }
            break;
        }
        case Node.ELEMENT_NODE:
        case Node.DOCUMENT_NODE: {
            // Check if this a block-level element
            const display = window
                .getComputedStyle(node as HTMLElement)
                .getPropertyValue('display');
            if (BLOCK_LEVEL_DISPLAY_VALUES.includes(display)) {
                nearestBlockLevelParent = node;
            }
            if (matcher(node)) {
                yield { node, isWhitelisted: true, nearestBlockLevelParent };
            }
            // Recurse
            var children = node.childNodes;
            for (var i = 0; i < children.length; i++) {
                yield* walk(children[i], matcher, nearestBlockLevelParent);
            }
            break;
        }
        default: {
            // Ignore comments, cdatas etc.
            break;
        }
    }
}

export function cx(...items: (string | undefined | null)[]) {
    return [...items].filter(Boolean).join(' ');
}
