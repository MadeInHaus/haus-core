import * as React from 'react';

/**
 * If you need refs for a list of elements, this hook is for you.
 *
 * Usage:
 *
 * const [refFn, refs] = useRefList<HTMLDivElement>();
 *
 * {someCollection.map((item, index) => (
 *   <div ref={refFn(index)} />
 * ))}
 *
 * React.useEffect(() => {
 *   // refs.current is an array of elements
 *   // refs.current[0] is the first element,
 *   // refs.current[1] is the second element, etc.
 *   refs.current.forEach(element => {
 *       // do something with each element
 *   });
 * }, [refs.current]);
 *
 * Returns a ref callback HOF and an array of elements.
 */
const useRefList = <T = HTMLElement>(): [
    (index: number) => React.RefCallback<T>,
    React.MutableRefObject<(T | null)[]>
] => {
    const refs = React.useRef<(T | null)[]>([]);
    const refFn = React.useCallback(
        (index: number): React.RefCallback<T> =>
            node => {
                refs.current[index] = node;
            },
        []
    );
    return [refFn, refs];
};

export default useRefList;
