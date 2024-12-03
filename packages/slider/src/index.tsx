import * as React from 'react';

import { useMeasure } from '@madeinhaus/hooks';
import { mergeRefs } from '@madeinhaus/utils';
import cx from 'clsx';

import Slide from './Slide';
import styles from './Slider.module.css';

export type SliderContextType = {
    activeIndices: number[];
    setActiveIndices: React.Dispatch<React.SetStateAction<number[]>>;
    hasOverflow: boolean;
    isBeginning: boolean;
    isEnd: boolean;
    scrollToIndex: (index: number) => void;
    handleNavigation: (direction: 'prev' | 'next') => void;
};

export const SliderContext = React.createContext<SliderContextType>({
    activeIndices: [],
    setActiveIndices: () => {},
    hasOverflow: true,
    isBeginning: true,
    isEnd: false,
    scrollToIndex: () => {},
    handleNavigation: () => {},
});

export type SliderProps = {
    children: React.ReactNode[];
    className?: string;
    slideClassName?: string;
    renderNavigation?: (props: {
        isBeginning: boolean;
        isEnd: boolean;
        handleNavigation: (direction: 'prev' | 'next') => void;
    }) => React.ReactNode;
};

const Slider = ({ children, className, slideClassName, renderNavigation }: SliderProps) => {
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [activeIndices, setActiveIndices] = React.useState([0]);
    const [hasOverflow, setHasOverflow] = React.useState(true);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLUListElement>(null);

    const [widthRef, { width: containerWidth }] = useMeasure();
    const trackWidth = trackRef?.current?.scrollWidth ?? 0;
    const slideWith = trackWidth / children.length;

    const isBeginning = Math.floor(scrollLeft) === 0;
    const isEnd = Math.ceil(containerWidth + scrollLeft) >= trackWidth;

    const handleNavigation = (direction: 'prev' | 'next') => {
        const scroll = {
            prev: slideWith * -1,
            next: slideWith,
        };

        containerRef.current &&
            containerRef.current.scrollBy({
                left: scroll[direction],
            });
    };

    const handleContainerScroll = () => {
        setScrollLeft(containerRef?.current?.scrollLeft ?? 0);
    };

    const scrollToIndex = (index: number) => {
        const scrollLeft = index * slideWith;

        containerRef.current &&
            containerRef.current.scrollTo({
                left: scrollLeft,
                behavior: 'smooth',
            });
    };

    React.useEffect(() => {
        setHasOverflow(trackWidth > Math.ceil(containerWidth));
    }, [containerWidth, trackWidth]);

    React.useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        container.addEventListener('scroll', handleContainerScroll);
        return () => {
            container.removeEventListener('scroll', handleContainerScroll);
        };
    }, []);

    return (
        <SliderContext.Provider
            value={{
                activeIndices,
                hasOverflow,
                isBeginning,
                isEnd,
                setActiveIndices,
                scrollToIndex,
                handleNavigation,
            }}
        >
            <section
                ref={mergeRefs([containerRef, widthRef])}
                className={cx(className, { [styles.hasOverflow]: hasOverflow })}
            >
                <ul ref={trackRef} className={styles.track}>
                    {React.Children.map(children, (child: React.ReactNode, index) => {
                        if (!React.isValidElement(child)) {
                            return null;
                        }
                        return (
                            <Slide
                                key={child.key ?? index}
                                index={index}
                                className={cx(styles.slide, slideClassName)}
                                setActiveIndices={setActiveIndices}
                            >
                                {React.cloneElement(child)}
                            </Slide>
                        );
                    })}
                </ul>
            </section>
            {hasOverflow &&
                renderNavigation &&
                renderNavigation({ isBeginning, isEnd, handleNavigation })}
        </SliderContext.Provider>
    );
};

export default Slider;
