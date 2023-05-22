import * as React from 'react';

import { useIntersectionObserver } from '../../hooks/src/useIntersectionObserver';
import { useMeasure } from '../../hooks/src/useMeasure';
import cx from 'clsx';

import Slide from './Slide';
import styles from './Slider.module.scss';

export type SliderContextType = {
    activeIndices: number[];
    setActiveIndices: React.Dispatch<React.SetStateAction<number[]>>;
    hasOverflow: boolean;
    isBeginning: boolean;
    isEnd: boolean;
    scrollToIndex: (index: number) => void;
};

export const SliderContext = React.createContext<SliderContextType>({
    activeIndices: [],
    setActiveIndices: () => {},
    hasOverflow: true,
    isBeginning: true,
    isEnd: false,
    scrollToIndex: () => {},
});

export type SliderProps = {
    children: React.ReactNode[];
    className?: string;
    containerClassName?: string;
    slideClassName?: string;
};

const Slider = ({ children, className, containerClassName, slideClassName }: SliderProps) => {
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

    const [inView, intersectionRef] = useIntersectionObserver();

    // const handleNavigation = direction => {
    //     const scroll = {
    //         prev: slideWith * -1,
    //         next: slideWith,
    //     };

    //     containerRef.current.scrollBy({
    //         left: scroll[direction],
    //     });
    // };

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
        containerRef?.current && containerRef.current.scrollTo({ left: 0 });
    }, [containerRef]);

    React.useEffect(() => {
        setHasOverflow(trackWidth > Math.ceil(containerWidth));
    }, [containerWidth, trackWidth]);

    React.useEffect(() => {
        if (!containerRef?.current) {
            return;
        }

        containerRef.current.addEventListener('scroll', handleContainerScroll);

        return () => {
            if (!containerRef?.current) {
                return;
            }

            containerRef.current.removeEventListener('scroll', handleContainerScroll);
        };
    }, [containerRef]);

    return (
        <SliderContext.Provider
            value={{
                activeIndices,
                hasOverflow,
                isBeginning,
                isEnd,
                setActiveIndices,
                scrollToIndex,
            }}
        >
            <section
                ref={intersectionRef}
                className={cx(styles.root, className, {
                    [styles.hasOverflow]: hasOverflow,
                    [styles.isInView]: inView,
                })}
            >
                <div ref={containerRef} className={cx(styles.container, containerClassName)}>
                    <div ref={widthRef}>
                        <ul ref={trackRef} className={styles.track}>
                            {React.Children.map(children, (child: any, index) => {
                                return (
                                    <Slide
                                        key={child!.key!}
                                        index={index}
                                        className={cx(styles.slide, slideClassName)}
                                    >
                                        {React.cloneElement(child)}
                                    </Slide>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </section>
        </SliderContext.Provider>
    );
};

export default Slider;
