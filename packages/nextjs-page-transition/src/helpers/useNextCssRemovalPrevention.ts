import * as React from 'react';

export const useNextCssRemovalPrevention = () => {
    React.useEffect(() => {
        // Remove data-n-p attribute from all link nodes.
        // This prevents Next.js from removing server rendered stylesheets.
        document.querySelectorAll('head > link[data-n-p]').forEach(linkNode => {
            linkNode.removeAttribute('data-n-p');
        });

        const mutationHandler = (mutations: MutationRecord[]) => {
            mutations.forEach(({ target, addedNodes }: MutationRecord) => {
                if (target.nodeName === 'HEAD') {
                    // Add data-n-href-perm attribute to all style nodes with attribute data-n-href,
                    // and remove data-n-href and media attributes from those nodes.
                    // This prevents Next.js from removing or disabling dynamic stylesheets.
                    addedNodes.forEach(node => {
                        const el = node as Element;
                        if (el.nodeName === 'STYLE' && el.hasAttribute('data-n-href')) {
                            const href = el.getAttribute('data-n-href');
                            if (href) {
                                el.setAttribute('data-n-href-perm', href);
                                el.removeAttribute('data-n-href');
                                el.removeAttribute('media');
                            }
                        }
                    });

                    // Remove all stylesheets that we don't need anymore
                    // (all except the two that were most recently added).
                    const styleNodes = document.querySelectorAll('head > style[data-n-href-perm]');
                    const requiredHrefs = new Set<string>();
                    for (let i = styleNodes.length - 1; i >= 0; i--) {
                        const el = styleNodes[i];
                        if (requiredHrefs.size < 2) {
                            const href = el.getAttribute('data-n-href-perm');
                            if (href) {
                                if (requiredHrefs.has(href)) {
                                    el.parentNode!.removeChild(el);
                                } else {
                                    requiredHrefs.add(href);
                                }
                            }
                        } else {
                            el.parentNode!.removeChild(el);
                        }
                    }
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
    }, []);
};
