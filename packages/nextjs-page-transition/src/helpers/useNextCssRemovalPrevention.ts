import * as React from 'react';
import { useRouter } from 'next/router';

export const useNextCssRemovalPrevention = () => {
    const { events } = useRouter();
    const fullAsPath = useFullAsPath();
    const cssHashMap = React.useRef<Map<string, Set<string>>>(new Map());
    const currentUrl = React.useRef<string | null>(null);
    const previousUrl = React.useRef<string | null>(null);
    const referenceNode = React.useRef<Element | null>(null);

    const registerCssHash = React.useCallback((pageUrl: string | null, href: string | null) => {
        if (pageUrl && href) {
            const hashMap = cssHashMap.current;
            const hashes = hashMap.get(pageUrl) ?? new Set();
            const hash = getHash(href);
            if (hash && !hashes.has(hash)) {
                hashes.add(hash);
                hashMap.set(pageUrl, hashes);
            }
        }
    }, []);

    const getActiveStyleNodes = React.useCallback(() => {
        const linkNodesSelector = 'head > link[data-n-p-perm]';
        const styleNodesSelector = 'head > style[data-n-href-perm]';
        const nodes = querySelectorAllArray([linkNodesSelector, styleNodesSelector].join(','));
        return nodes.map(node => {
            const href =
                node.nodeName === 'LINK'
                    ? node.getAttribute('href')
                    : node.getAttribute('data-n-href-perm');
            const hash = getHash(href);
            return { node, hash };
        });
    }, []);

    const getActiveCssHashes = React.useCallback(() => {
        const currentHashes = currentUrl.current
            ? cssHashMap.current.get(currentUrl.current) ?? new Set()
            : new Set();
        const previousHashes = previousUrl.current
            ? cssHashMap.current.get(previousUrl.current) ?? new Set()
            : new Set();
        return [...currentHashes, ...previousHashes];
    }, []);

    const removeExpiredStyles = React.useCallback(() => {
        const activeCssHashes = getActiveCssHashes();
        getActiveStyleNodes().forEach(({ node, hash }) => {
            if (!activeCssHashes.includes(hash)) {
                node.parentNode?.removeChild(node);
            }
        });
    }, [getActiveStyleNodes, getActiveCssHashes]);

    React.useEffect(() => {
        if (fullAsPath && !currentUrl.current) {
            currentUrl.current = fullAsPath;
            // For all <link href data-n-p> nodes (server rendered stylesheets):
            // - rename the data-n-p attribute to data-n-p-perm
            //   (this prevents Next.js from removing them)
            // - register the css hash
            // - move the node below the reference node (maintaining order)
            querySelectorAllArray('head > link[data-n-p]')
                .reverse()
                .forEach(linkNode => {
                    linkNode.removeAttribute('data-n-p');
                    linkNode.setAttribute('data-n-p-perm', '');
                    registerCssHash(fullAsPath, linkNode.getAttribute('href'));
                    moveNodeBelowReferenceNode(linkNode);
                });
        }
    }, [fullAsPath, registerCssHash]);

    React.useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            referenceNode.current = getReferenceNode();
            previousUrl.current = currentUrl.current;
            currentUrl.current = url;
        };
        const handleRouteChangeComplete = () => {
            removeExpiredStyles();
            previousUrl.current = null;
        };
        events.on('routeChangeStart', handleRouteChangeStart);
        events.on('routeChangeComplete', handleRouteChangeComplete);
        return () => {
            events.off('routeChangeStart', handleRouteChangeStart);
            events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [events, removeExpiredStyles]);

    React.useEffect(() => {
        const mutationHandler: MutationCallback = mutations => {
            mutations.forEach(({ target, addedNodes }) => {
                if (target.nodeName === 'HEAD') {
                    // For all newly added <style data-n-href> nodes (page stylesheets):
                    // - rename the data-n-href attribute to data-n-href-perm
                    //   (This prevents Next.js from removing or disabling them)
                    // - remove the media attribute if its value is "x"
                    // - register the css hash
                    // - move the node below the reference node (maintaining order)
                    addedNodes.forEach(node => {
                        const el = node as Element;
                        if (el.nodeName === 'STYLE' && el.hasAttribute('data-n-href')) {
                            const href = el.getAttribute('data-n-href') ?? '';
                            el.setAttribute('data-n-href-perm', href);
                            el.removeAttribute('data-n-href');
                            if (el.getAttribute('media') === 'x') {
                                el.removeAttribute('media');
                            }
                            registerCssHash(currentUrl.current, href);
                            moveNodeBelowReferenceNode(el);
                            referenceNode.current = el;
                        }
                    });
                }
            });
        };

        // Observe changes to the head element and its descendents.
        const observer = new MutationObserver(mutationHandler);
        observer.observe(document.head, { childList: true, subtree: true });

        return () => {
            // Disconnect the observer when the component unmounts.
            observer.disconnect();
        };
    }, [registerCssHash]);

    return removeExpiredStyles;
};

function getHash(url: string | null): string | null {
    return url?.match(/([a-z0-9]+).css$/)?.[1] ?? null;
}

function querySelectorAllArray(selector: string): Element[] {
    return Array.from(document.querySelectorAll(selector));
}

function getReferenceNode(): Element | null {
    return document.querySelector('noscript[data-n-css]');
}

function moveNodeBelowReferenceNode(node: Element) {
    const referenceNode = getReferenceNode();
    referenceNode?.parentNode?.insertBefore(node, referenceNode?.nextSibling);
}

function useFullAsPath() {
    const { isReady, asPath, basePath, locale } = useRouter();
    const getFullAsPath = React.useCallback(() => {
        if (!isReady) return null;
        let result = asPath;
        if (basePath) result = basePath + (result === '/' ? '' : result);
        if (locale) result = `/${locale}${result}`;
        return result;
    }, [asPath, isReady, basePath, locale]);
    const [fullAsPath, setFullAsPath] = React.useState(getFullAsPath());
    React.useEffect(() => {
        setFullAsPath(getFullAsPath());
    }, [getFullAsPath]);
    return fullAsPath;
}
