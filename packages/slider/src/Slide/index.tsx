import * as React from 'react';

import { useIntersectionObserver } from '../../../hooks/src/useIntersectionObserver';

import { SliderContext } from '../index';

const Slide = ({
    children,
    className,
    index,
}: {
    children: React.ReactNode;
    className?: string;
    index: number;
}) => {
    const [inView, intersectionRef] = useIntersectionObserver({
        once: false,
        rootMargin: '0px',
        threshold: 0,
    });

    const { setActiveIndices } = React.useContext(SliderContext);

    React.useEffect(() => {
        setActiveIndices((prevActiveIndices: number[]) =>
            inView
                ? [...prevActiveIndices, index]
                : prevActiveIndices.filter((idx: number) => idx !== index)
        );
    }, [inView, setActiveIndices, index]);

    return (
        <li ref={intersectionRef} className={className}>
            {children}
        </li>
    );
};

export default Slide;
