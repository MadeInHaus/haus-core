import * as React from 'react';

import { useIntersectionObserver } from '../../../hooks/src/useIntersectionObserver';

const Slide = ({
    children,
    className,
    index,
    setActiveIndices,
}: {
    children: React.ReactNode;
    className?: string;
    index: number;
    setActiveIndices: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
    const [inView, intersectionRef] = useIntersectionObserver({
        once: false,
        rootMargin: '0px',
        threshold: 0,
    });

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
