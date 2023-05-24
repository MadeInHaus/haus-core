import * as React from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface Size {
    width: number;
    height: number;
}

export function useMeasure<T extends HTMLElement = HTMLDivElement>(): [
    (node: T | null) => void,
    Size
] {
    // Mutable values like 'ref.current' aren't valid dependencies
    // because mutating them doesn't re-render the component.
    // Instead, we use a state as a ref to be reactive.
    const [ref, setRef] = React.useState<T | null>(null);
    const [size, setSize] = React.useState<Size>({
        width: 0,
        height: 0,
    });

    // Prevent too many rendering using useCallback
    const handleSize = React.useCallback(() => {
        setSize({
            width: ref?.offsetWidth || 0,
            height: ref?.offsetHeight || 0,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    React.useEffect(() => {
        window.addEventListener('resize', handleSize);
        return () => {
            window.removeEventListener('resize', handleSize);
        };
    }, []);

    useIsomorphicLayoutEffect(() => {
        handleSize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref?.offsetHeight, ref?.offsetWidth]);

    return [setRef, size];
}
