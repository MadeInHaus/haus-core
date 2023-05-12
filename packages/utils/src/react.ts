import * as React from 'react';

/**
 * Merge multiple refs.
 *
 * Useful when you need to pass multiple refs to a single element, for example
 * when the component has a forwardRef on an element, but you also need to
 * access the element inside the component.
 *
 * Usage:
 *
 * const ExampleComponent = React.forwardRef((props, refExternal) => {
 *     const refInternal = React.useRef(null);
 *     return (
 *        <div ref={mergeRefs([refExternal, refInternal])}>
 *     );
 * });
 */
export function mergeRefs<T = any>(
    refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
    return value => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}
