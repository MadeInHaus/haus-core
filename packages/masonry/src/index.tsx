'use client';

// Stolen & Rewritten from https://github.com/paulcollett/react-masonry-css
import React, { useState, useEffect } from 'react';
import cx from 'clsx';
import { useWindowSize } from '../../hooks/src/useWindowSize';

import styles from './Masonry.module.scss';

export interface MasonryProps {
    breakpointCols?: {
        default: number;
        [key: number]: number;
    };
    className?: string;
    columnClassName?: string;
    children: React.ReactNode;
}

const Masonry = ({
    breakpointCols = { default: 2 },
    className,
    columnClassName,
    children,
}: MasonryProps) => {
    const [columnCount, setColumnCount] = useState(breakpointCols.default);

    const { width: windowWidth } = useWindowSize();

    const calculateColumnCount = () => {
        let columns = breakpointCols.default;

        for (let breakpoint in breakpointCols) {
            if (windowWidth && Number(breakpoint) <= windowWidth) {
                columns = breakpointCols[breakpoint];
            }
        }

        setColumnCount(columns);
    };

    const getItemsInColumns = () => {
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
        const childrenInColumns = getItemsInColumns();

        return childrenInColumns.map((items, index) => {
            return (
                <div className={cx(styles.column, columnClassName)} key={index}>
                    {items}
                </div>
            );
        });
    };

    useEffect(() => {
        calculateColumnCount();
    }, [windowWidth]);

    return <div className={cx(styles.root, className)}>{renderColumns()}</div>;
};

export default Masonry;
