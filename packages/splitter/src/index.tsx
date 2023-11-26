import * as React from 'react';

import { split, cx } from './utils';
import { moveAttributes, moveChildNodes } from './utils/dom';
import { SplitOptions, SplitResult } from './utils/types';

import styles from './Splitter.module.scss';

export interface SplitterProps extends SplitOptions {
    as?: React.ElementType<any>;
    enabled?: boolean;
    onSplit?: (props: SplitResult) => void;
    className?: string;
    children: React.ReactNode;
}

const Splitter: React.FC<SplitterProps> = props => {
    const { as: Container = 'div', enabled = false, onSplit, className, children, ...rest } = props;
    const {
        whitelistSelectors = ['img', 'svg'],
        graphemeSplitter = str => [...str.normalize('NFC')],
        kerningCache = new Map<string, number>(),
        kerningCacheKey = (a: string, b: string) => `${a}-${b}`,
        doubleWrap = 'none',
        splitLines: splitLinesProp = true,
        fixKerning: fixKerningProp = true,
        debug = false,
    } = rest as Required<SplitOptions>;

    const splitOptions = React.useMemo<Required<SplitOptions>>(
        () => ({
            whitelistSelectors,
            graphemeSplitter,
            kerningCache,
            kerningCacheKey,
            doubleWrap,
            splitLines: splitLinesProp,
            fixKerning: fixKerningProp,
            debug,
        }),
        [
            whitelistSelectors,
            graphemeSplitter,
            kerningCache,
            kerningCacheKey,
            doubleWrap,
            splitLinesProp,
            fixKerningProp,
            debug,
        ]
    );

    const elSourceRef = React.useRef<HTMLElement>();
    const elSourceCloneRef = React.useRef<HTMLElement>();
    const resizeObserverRef = React.useRef<ResizeObserver>();

    const resizeObserverCallback = React.useCallback(
        ([entry]: ResizeObserverEntry[]) => {
            if (elSourceRef.current && elSourceCloneRef.current) {
                if (splitLinesProp) {
                    const elCloned = elSourceCloneRef.current.cloneNode(true) as HTMLElement;
                    moveChildNodes(elSourceCloneRef.current, elSourceRef.current);
                    moveAttributes(elSourceCloneRef.current, elSourceRef.current);
                    elSourceCloneRef.current = elCloned;
                    const charWrappers = split(elSourceRef.current, splitOptions);
                    if (onSplit) {
                        onSplit({
                            elSource: elSourceCloneRef.current,
                            elSplit: elSourceRef.current,
                            charWrappers,
                        });
                    }
                }
            } else {
                elSourceRef.current = entry.target as HTMLElement;
                elSourceCloneRef.current = elSourceRef.current.cloneNode(true) as HTMLElement;
                const charWrappers = split(elSourceRef.current, splitOptions);
                if (onSplit) {
                    onSplit({
                        elSource: elSourceCloneRef.current,
                        elSplit: elSourceRef.current,
                        charWrappers,
                    });
                }
            }
        },
        [splitLinesProp, splitOptions, onSplit]
    );

    const wrapperRef = React.useCallback(
        (elSource: HTMLElement | null) => {
            if (elSource) {
                if (enabled) {
                    resizeObserverRef.current = new ResizeObserver(resizeObserverCallback);
                    resizeObserverRef.current.observe(elSource);
                    return;
                }
            }
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = undefined;
            }
            if (elSourceRef.current && elSourceCloneRef.current) {
                moveChildNodes(elSourceCloneRef.current, elSourceRef.current);
                moveAttributes(elSourceCloneRef.current, elSourceRef.current);
                elSourceRef.current = undefined;
                elSourceCloneRef.current = undefined;
            }
        },
        [enabled, resizeObserverCallback]
    );

    return (
        <Container ref={wrapperRef} className={cx(styles.root, className)}>
            {children}
        </Container>
    );
};

export default Splitter;
