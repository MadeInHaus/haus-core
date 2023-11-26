export function toSelector(node: Element, attributeIgnoreList: string[] = []) {
    attributeIgnoreList = [...new Set([...attributeIgnoreList, 'id', 'class'])];
    let selector = node.nodeName.toLowerCase();
    const id = node.getAttribute('id');
    if (id != null) {
        selector += '#' + id;
    }
    selector += Array.from(node.classList)
        .map(className => `.${className}`)
        .join('');
    selector += Array.from(node.attributes)
        .filter(({ name }) => !attributeIgnoreList.includes(name))
        .map(({ name, value }) => (value ? `[${name}="${value}"]` : `[${name}]`))
        .join('');
    return selector;
}

/**
 * Returns an array of Nodes that make up the path from `root` to `child,
 * excluding `root` and including `child`.
 *
 * @param root - The node where the path starts
 * @param child - The node where the path ends. Must be a child of `root`
 * @returns An array of Nodes
 *
 * @example
 * For the following markup:
 * ```html
 * <div>
 *    <span>
 *       <b>
 *         <i>hello</i>
 *      </b>
 *    </span>
 * </div>
 * ```
 * createPath(span, i) will return `[b, i]`
 */
export function createPath(root: HTMLElement, child: HTMLElement): HTMLElement[] {
    const path: HTMLElement[] = [child];
    let el = child;
    while (el.parentElement && el.parentElement !== root) {
        el = el.parentElement;
        path.unshift(el);
    }
    return path;
}

/**
 * Moves all child nodes from node `from` to node `to`.
 *
 * @param from - The source node
 * @param to - The destination node
 */
export function moveChildNodes(from: Node | null, to: Node | null) {
    if (!(to instanceof Element)) return;
    if (!from || !to) return;
    (to as Element).replaceChildren(...Array.from(from.childNodes));
}

/**
 * Merge attributes of node `from` with those of node `to`.
 *
 * @param from - The source node
 * @param to - The destination node
 */
export function mergeAttributes(from: Node | null, to: Node | null) {
    if (!(from instanceof HTMLElement) || !(to instanceof HTMLElement)) return;
    const toEl = to as HTMLElement;
    const fromEl = from as HTMLElement;
    fromEl.classList.forEach(className => {
        toEl.classList.add(className);
    });
    for (let i = 0; i < fromEl.style.length; i++) {
        const name = fromEl.style[i];
        toEl.style.setProperty(name, fromEl.style.getPropertyValue(name));
    }
    for (const { name, value } of fromEl.attributes) {
        if (name !== 'style' && name !== 'id' && name !== 'class') {
            toEl.setAttribute(name, value);
        }
    }
}

/**
 * Replaces attributes of node `to` with those of node `from`.
 *
 * @param from - The source node
 * @param to - The destination node
 */
export function moveAttributes(from: Node | null, to: Node | null) {
    if (!(from instanceof HTMLElement) || !(to instanceof HTMLElement)) return;
    const toEl = to as HTMLElement;
    toEl.getAttributeNames().forEach(name => {
        toEl.removeAttribute(name);
    });
    mergeAttributes(from, to);
}

export function deepCloneUntil(node: Node, lastNode: Node, initialNode?: Node) {
    initialNode ??= node;
    if (!initialNode.contains(lastNode)) {
        return null;
    }
    if (node !== lastNode && node.contains(lastNode)) {
        const clonedNode = node.cloneNode(false);
        while (node.hasChildNodes()) {
            const firstChild = node.firstChild!;
            const deepClonedChild = deepCloneUntil(firstChild, lastNode, initialNode);
            if (deepClonedChild) {
                clonedNode.appendChild(deepClonedChild);
                if (firstChild === lastNode) {
                    break;
                }
            } else {
                break;
            }
        }
        return clonedNode;
    } else {
        return node;
    }
}
