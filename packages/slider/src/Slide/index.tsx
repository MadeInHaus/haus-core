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
    const [inView, intersectionRef] = useIntersectionObserver();

    const { scrollToIndex, setActiveIndices } = React.useContext(SliderContext);

    React.useEffect(() => {
        setActiveIndices((prevActiveIndices: number[]) =>
            inView
                ? [...prevActiveIndices, index]
                : prevActiveIndices.filter((idx: number) => idx !== index)
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    const handleClick = React.useCallback(() => {
        scrollToIndex(index);
    }, [index, scrollToIndex]);

    return (
        <li ref={intersectionRef} className={className} onClick={handleClick} role="button">
            {children}
        </li>
    );
};

export default Slide;
