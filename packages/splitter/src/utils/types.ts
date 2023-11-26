export interface SplitOptions {
    /* Whitelist of selectors to wrap in spans. Default: ["img", "svg"] */
    whitelistSelectors?: string[];
    /* Function to split a string into characters/graphemes. Default: string => [...string.normalize('NFC')] */
    graphemeSplitter?: (str: string) => string[];
    /* Cache map object to store key/kerning pairs */
    kerningCache?: Map<string, number>;
    /* Key to store kerning values under in `kerningCache`. Default: `${key}-${a}-${b}` */
    kerningCacheKey?: (a: string, b: string) => string;
    /* Whether to double-wrap characters and/or lines. Default: 'none' */
    doubleWrap?: 'none' | 'chars' | 'lines' | 'both';
    /* Whether to split lines. Default: true */
    splitLines?: boolean;
    /* Whether to fix kerning. Default: true */
    fixKerning?: boolean;
    /* Show timings. Default: false */
    debug?: boolean;
}

export interface SplitResult {
    elSource: HTMLElement;
    elSplit: HTMLElement;
    charWrappers: HTMLElement[];
}

export interface NodeInfo {
    node: Node;
    isWhitelisted: boolean;
    nearestBlockLevelParent: Node;
    text?: string;
}

export interface NodeInfoSplit extends NodeInfo {
    spans: {
        span: HTMLSpanElement;
        rect?: DOMRect;
        line?: number;
    }[];
}

export interface Pair {
    key: string;
    elements: {
        span: HTMLSpanElement;
        path: HTMLElement[];
        key: string;
    }[];
}
