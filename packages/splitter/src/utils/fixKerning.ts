import { createPath, toSelector } from './dom';
import { NodeInfoSplit, Pair, SplitOptions } from './types';

export function fixKerning(
    elSource: HTMLElement,
    elSplit: HTMLElement,
    blockBuckets: NodeInfoSplit[][],
    options: Required<SplitOptions>
): void {
    const { fixKerning, kerningCache, kerningCacheKey, doubleWrap, debug } = options;
    if (!fixKerning) {
        return;
    }

    debug && console.time('fixKerning');

    if (elSplit.parentNode) {
        // Swap source element into the DOM
        elSplit.parentNode?.replaceChild(elSource, elSplit);
    }

    const spans = blockBuckets.reduce((acc, bucket) => {
        bucket.forEach(({ spans, isWhitelisted }) => {
            if (!isWhitelisted) {
                spans.forEach(({ span }) => {
                    acc.push(span);
                });
            }
        });
        return acc;
    }, [] as HTMLSpanElement[]);

    const pairs: Pair[] = spans
        // Get all bigrams
        .reduce((acc, span, i, a) => {
            if (i < a.length - 1) acc[i] = [span];
            if (i > 0) acc[i - 1].push(span);
            return acc;
        }, [] as HTMLSpanElement[][])
        .map(([a, b]) => {
            function getPathAndSelector(
                rootEl: HTMLElement,
                childEl: HTMLElement
            ): [HTMLElement[], string] {
                const path = createPath(rootEl, childEl);
                const selector = path
                    .map(el => {
                        const selector = toSelector(el, [`data-typeinternal`]);
                        const text = el === childEl ? el.textContent ?? '' : '';
                        return selector + (text.length ? ` \{${text}}` : '');
                    })
                    .join(' > ');
                return [path, selector];
            }
            const [aPath, aKey] = getPathAndSelector(elSplit, a);
            const [bPath, bKey] = getPathAndSelector(elSplit, b);
            return {
                key: kerningCacheKey ? kerningCacheKey(aKey, bKey) : `${aKey} # ${bKey}`,
                elements: [
                    { span: aPath.at(-1)!, path: aPath, key: aKey },
                    { span: bPath.at(-1)!, path: bPath, key: bKey },
                ],
            };
        });

    const uniquePairs: Pair[] = pairs.filter(({ key }) => {
        return !kerningCache.has(key);
    });

    interface MeasureElement extends Pair {
        wrapper: HTMLElement;
    }

    if (uniquePairs.length > 0) {
        // Deep-clone the two elements of each unique pair and wrap them
        // in a div for measuring the "kerning" (the difference in width
        // between one of the clones rendered with `kerning: normal` and
        // the other with `kerning: none`.
        debug && console.time('measureElements');
        const measureElements: MeasureElement[] = uniquePairs.map(({ key, elements }) => {
            const { span: a, path: aPath } = elements[0];
            const { span: b, path: bPath } = elements[1];

            const measureEl = document.createElement('div');
            const maxPathLen = Math.max(aPath.length, bPath.length);

            // Find the common root and reconstruct the DOM structure up to that point
            let i = 0;
            let currentRoot: HTMLElement = measureEl;
            while (aPath[i] === bPath[i] && i < maxPathLen) {
                if (aPath[i]) {
                    const newRoot = aPath[i].cloneNode(false) as HTMLElement;
                    currentRoot.appendChild(newRoot);
                    currentRoot = newRoot;
                }
                i++;
            }

            // Reconstruct the DOM structure of the two paths,
            // each from the common root down to the span leaf
            // and append them to the common root.
            function reconstruct(
                index: number,
                path: HTMLElement[],
                span: HTMLElement,
                currentRoot: HTMLElement
            ) {
                while (path[index]) {
                    let newEl;
                    const el = path[index];
                    if (el === span) {
                        const child = el.firstChild as HTMLElement;
                        if (doubleWrap === 'chars' || doubleWrap === 'both') {
                            if (child.hasChildNodes()) {
                                newEl = child.firstChild!.cloneNode(false) as HTMLElement;
                            } else {
                                newEl = child.cloneNode(true) as HTMLElement;
                            }
                        } else {
                            newEl = child.cloneNode(false) as HTMLElement;
                        }
                    } else {
                        newEl = el.cloneNode(false) as HTMLElement;
                    }
                    currentRoot.appendChild(newEl);
                    currentRoot = newEl;
                    index++;
                }
            }
            reconstruct(i, aPath, a, currentRoot);
            reconstruct(i, bPath, b, currentRoot);

            // Normalize text nodes
            // Safari needs this
            measureEl.normalize();

            return {
                key,
                elements,
                wrapper: measureEl,
            };
        });
        debug && console.timeEnd('measureElements');

        debug && console.time('cloneMeasure');
        const measureDiv = document.createElement('div');
        measureElements.forEach(({ wrapper }) => {
            measureDiv.appendChild(wrapper);
        });
        debug && console.timeEnd('cloneMeasure');

        debug && console.time('measureKernings');
        debug && console.time('kern');
        measureDiv.dataset.type = 'kern';
        elSplit.insertBefore(measureDiv, elSplit.firstChild);
        elSource.parentNode?.replaceChild(elSplit, elSource);
        const kerningData = measureElements.map(({ wrapper }) => {
            const kernWidth = wrapper.getBoundingClientRect().width;
            let tmp = wrapper;
            while (tmp.firstChild?.nodeType === Node.ELEMENT_NODE) {
                tmp = tmp.firstChild as HTMLElement;
            }
            const fontSize = parseFloat(window.getComputedStyle(tmp).getPropertyValue('font-size'));
            return { kernWidth, fontSize };
        });
        debug && console.timeEnd('kern');

        debug && console.time('nokern');
        measureDiv.dataset.type = 'nokern';
        measureElements.forEach(({ key, wrapper }, i) => {
            const { kernWidth, fontSize } = kerningData[i];
            const noKernWidth = wrapper.getBoundingClientRect().width;
            const kerningValue = (kernWidth - noKernWidth) / fontSize;
            kerningCache.set(key, kerningValue);
        });
        debug && console.timeEnd('nokern');
        debug && console.timeEnd('measureKernings');

        // Swap original element into the DOM
        elSplit.parentNode?.replaceChild(elSource, elSplit);

        // Clean up
        elSplit.removeChild(measureDiv);
    }

    // Apply kerning values
    pairs.forEach(({ key, elements }) => {
        const { span } = elements[0];
        const kerningValue = kerningCache.get(key);
        if (kerningValue) {
            span.style.setProperty('--kerning', `${kerningValue}em`);
        }
    });

    debug && console.timeEnd('fixKerning');
}
