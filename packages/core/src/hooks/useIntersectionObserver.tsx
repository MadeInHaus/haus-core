import * as React from 'react';

/*
    IntersectionObserver hook

    Usage:
    const [inView, ref, el] = useIntersectionObserver(options);
    - inView is a boolean
    - ref is a callback ref that you pass to the element's ref prop
    - el is a ref object that you can use to access the Element if needed

    You can pass an optional options object as the first argument to the hook.
    The options object can contain the following properties:
    - once: boolean (default: true. If true, the observer will unobserve the element after it becomes visible)
    - root: Element | Document (passed to IntersectionObserver)
    - rootMargin: string (passed to IntersectionObserver)
    - threshold: number | number[] (passed to IntersectionObserver)

    Example:
    const [inView, ref] = useIntersectionObserver({
        once: false,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.5,
    });
    return (
        <div ref={ref}>
            {inView ? 'In view' : 'Not in view'}
        </div>
    );
*/

interface IntersectionObserverOptions extends IntersectionObserverInit {
    once?: boolean;
};

type IntersectionObserverResult = readonly [
    boolean,
    (el: Element | null) => void, // eslint-disable-line no-unused-vars
    React.MutableRefObject<Element | null>
];

export const useIntersectionObserver = ({
    once = true,
    root,
    rootMargin,
    threshold,
}: IntersectionObserverOptions = {}): IntersectionObserverResult => {
    const [inView, setInView] = React.useState<boolean>(false);
    const observer = React.useRef<IntersectionObserver | null>(null);
    const elRef = React.useRef<Element | null>(null);
    const fnRef = React.useCallback(
        (el: Element | null) => {
            if (el) {
                observer.current = new IntersectionObserver(
                    ([{ isIntersecting }]) => {
                        setInView(isIntersecting);
                        if (isIntersecting && once) {
                            observer.current?.unobserve(el);
                        }
                    },
                    { root, rootMargin, threshold }
                );
                observer.current.observe(el);
            } else {
                if (elRef.current) {
                    observer.current?.unobserve(elRef.current);
                }
            }
            elRef.current = el;
        },
        [once, root, rootMargin, threshold]
    );
    return [inView, fnRef, elRef] as const;
};
