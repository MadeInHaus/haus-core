import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

export interface AccordionSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface AccordionRootProps extends AccordionSharedProps {
    type?: 'single' | 'multiple';
    id: string;
}

export interface AccordionItemProps extends AccordionSharedProps {
    index: number;
}

// eslint-disable-next-line no-unused-vars
type SetOPenIndices = (updateFn: (prevOpenIndices: number[]) => number[]) => void;

const AccordionContext = createContext<{
    id?: string;
    type: 'single' | 'multiple';
    openIndices: number[];
    setOpenIndices: React.Dispatch<React.SetStateAction<number[]>>;
}>({
    id: undefined,
    type: 'multiple',
    openIndices: [],
    setOpenIndices: () => {},
});

const AccordionItemContext = createContext<{
    index: number;
    animation: Animation | null | undefined;
    setAnimation: React.Dispatch<React.SetStateAction<Animation | null | undefined>>;
    isClosing: boolean;
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>;
    isExpanding: boolean;
    setIsExpanding: React.Dispatch<React.SetStateAction<boolean>>;
    detailsEl: HTMLDetailsElement | null;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentEl: HTMLElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}>({
    index: 0,
    animation: null,
    setAnimation: () => {},
    isClosing: false,
    setIsClosing: () => {},
    isExpanding: false,
    setIsExpanding: () => {},
    detailsEl: null,
    setDetailsEl: () => {},
    contentEl: null,
    setContentEl: () => {},
});

const Accordion = ({ children, className, id, type = 'multiple' }: AccordionRootProps) => {
    const [openIndices, setOpenIndices] = useState<number[]>([]);

    return (
        <AccordionContext.Provider
            value={{
                openIndices,
                setOpenIndices,

                id,
                type,
            }}
        >
            <section className={className}>{children}</section>
        </AccordionContext.Provider>
    );
};

const handleSelectSingle = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices((prevOpenIndices: number[]) => {
        return prevOpenIndices.includes(index) ? [] : [index];
    });
};

const handleSelectMultiple = (index: number, setOpenIndices: SetOPenIndices) => {
    setOpenIndices((prevOpenIndices: number[]) => {
        return prevOpenIndices.includes(index)
            ? prevOpenIndices.filter((select: number) => select !== index)
            : [...prevOpenIndices, index];
    });
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const {
        animation,
        setAnimation,
        detailsEl,
        isClosing,
        setIsClosing,
        isExpanding,
        setIsExpanding,
        contentEl,
    } = useContext(AccordionItemContext);

    console.log({ isClosing, isExpanding });

    const handleShrink = () => {
        console.log('Shrink');
        setIsClosing(true);

        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef?.current && summaryRef.current.offsetHeight) || 0;

        if (animation) {
            animation.cancel();
        }

        const shrinkAnimation = detailsEl?.animate(
            {
                height: [`${startHeight}px`, `${endHeight}px`],
            },
            {
                duration: 300,
                easing: 'ease-in-out',
            }
        );

        setAnimation(shrinkAnimation);

        shrinkAnimation!.onfinish = () => onAnimationFinish(false);
        shrinkAnimation!.oncancel = () => setIsClosing(false);

        console.log({ startHeight, endHeight });
    };

    const handleExpand = () => {
        console.log('Expand');
        setIsExpanding(true);

        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef.current?.offsetHeight || 0) + (contentEl?.offsetHeight || 0);

        if (animation) {
            animation.cancel();
        }

        const expandAnimation = detailsEl?.animate(
            {
                height: [`${startHeight}px`, `${endHeight}px`],
            },
            {
                duration: 300,
                easing: 'ease-in-out',
            }
        );

        setAnimation(expandAnimation);

        expandAnimation!.onfinish = () => onAnimationFinish(true);
        expandAnimation!.oncancel = () => setIsExpanding(false);

        console.log({ startHeight, endHeight });
    };

    function onAnimationFinish(open: boolean) {
        detailsEl!.open = open;
        detailsEl!.style.height = '';
        detailsEl!.style.overflow = '';

        setAnimation(null);
        setIsClosing(false);
        setIsExpanding(false);
    }

    const handleOpen = () => {
        detailsEl!.style.height = `${detailsEl?.offsetHeight}px`;
        detailsEl!.open = true;

        requestAnimationFrame(() => handleExpand());
    };

    const handleClick = () => {
        detailsEl!.style.overflow = 'hidden';
        if (isClosing || !detailsEl!.open) {
            handleOpen();
        } else if (isExpanding || detailsEl!.open) {
            handleShrink();
        }
    };

    return (
        <summary
            ref={summaryRef}
            onClick={handleClick}
            className={joinClassNames(styles.trigger, className)}
        >
            {children}
        </summary>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const [animation, setAnimation] = useState<Animation | null | undefined>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setDetailsEl(detailsRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detailsRef]);

    return (
        <AccordionItemContext.Provider
            value={{
                index,
                animation,
                setAnimation,
                isClosing,
                setIsClosing,
                isExpanding,
                setIsExpanding,
                detailsEl,
                setDetailsEl,
                contentEl,
                setContentEl,
            }}
        >
            <details ref={detailsRef} className={className}>
                {children}
            </details>
        </AccordionItemContext.Provider>
    );
};

const AccordionContent = ({ children, className }: AccordionSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentEl } = useContext(AccordionItemContext);

    useEffect(() => {
        setContentEl(contentRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentRef]);

    return (
        <div ref={contentRef} className={className}>
            {children}
        </div>
    );
};

Accordion.Root = Accordion;
Accordion.Trigger = AccordionTrigger;
Accordion.Item = AccordionItem;
Accordion.Content = AccordionContent;

export { Accordion };
