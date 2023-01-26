// Stolen & Rewritten from https://github.com/paulcollett/react-masonry-css

import React, { useState, useEffect } from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';

import styles from './Masonry.module.scss';

export interface MasonryProps {
    breakpointCols: {
        default: number;
        [key: number]: number;
    };
    className?: string;
    columnClassName?: string;
    children: React.ReactNode;
}

const DEFAULT_COLUMNS = 2;

export const Masonry = ({
    breakpointCols,
    className,
    columnClassName,
    children,
    ...rest
}: MasonryProps) => {
    const [columnCount, setColumnCount] = useState(breakpointCols?.default || DEFAULT_COLUMNS);

    const { width: windowWidth } = useWindowSize();

    const reCalculateColumnCount = () => {
        let breakpointColsObject = breakpointCols;

        // Allow passing a single number to `breakpointCols` instead of an object
        if (typeof breakpointColsObject !== 'object') {
            breakpointColsObject = {
                default: parseInt(breakpointColsObject) || DEFAULT_COLUMNS,
            };
        }

        let columns = breakpointColsObject.default || DEFAULT_COLUMNS;

        for (let breakpoint in breakpointColsObject) {
            if (windowWidth && Number(breakpoint) <= windowWidth) {
                columns = breakpointColsObject[breakpoint];
            }
        }

        setColumnCount(columns);
    };

    const itemsInColumns = () => {
        const currentColumnCount = columnCount;
        const itemsInColumns = new Array(currentColumnCount);

        // Force children to be handled as an array
        const items = React.Children.toArray(children);

        for (let i = 0; i < items.length; i++) {
            const columnIndex = i % currentColumnCount;

            if (!itemsInColumns[columnIndex]) {
                itemsInColumns[columnIndex] = [];
            }

            itemsInColumns[columnIndex].push(items[i]);
        }

        return itemsInColumns;
    };

    const renderColumns = () => {
        const childrenInColumns = itemsInColumns();
        const columnWidth = `${100 / childrenInColumns.length}%`;

        return childrenInColumns.map((items, index) => {
            return (
                <div
                    className={columnClassName}
                    style={{
                        width: columnWidth,
                    }}
                    key={index}
                >
                    {items}
                </div>
            );
        });
    };

    useEffect(() => {
        reCalculateColumnCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth]);

    return (
        <div {...rest} className={[styles.root, className].filter(Boolean).join(' ')}>
            {renderColumns()}
        </div>
    );
};
