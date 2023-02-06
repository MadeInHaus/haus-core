import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

interface HTMLSummaryElement extends HTMLElement {}

declare var HTMLSummaryElement: {
    prototype: HTMLSummaryElement;
    new (): HTMLSummaryElement;
};

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

enum AnimationState {
    IDLE = 'idle',
    EXPANDING = 'expanding',
    SHRINKING = 'shrinking',
}

const AccordionItemContext = createContext<{
    index: number;
    animation: Animation | null | undefined;
    setAnimation: React.Dispatch<React.SetStateAction<Animation | null | undefined>>;
    animationState: 'idle' | 'expanding' | 'shrinking';
    setAnimationState: React.Dispatch<React.SetStateAction<'idle' | 'expanding' | 'shrinking'>>;
    summaryEl: HTMLSummaryElement | null;
    setSummaryEl: React.Dispatch<React.SetStateAction<HTMLSummaryElement | null>>;
    contentEl: HTMLDivElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
}>({
    index: 0,
    animation: null,
    setAnimation: () => {},
    animationState: AnimationState.IDLE,
    setAnimationState: () => {},
    summaryEl: null,
    setSummaryEl: () => {},
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

// const handleSelectSingle = (index: number, setOpenIndices: SetOPenIndices) => {
//     setOpenIndices((prevOpenIndices: number[]) => {
//         return prevOpenIndices.includes(index) ? [] : [index];
//     });
// };

// const handleSelectMultiple = (index: number, setOpenIndices: SetOPenIndices) => {
//     setOpenIndices((prevOpenIndices: number[]) => {
//         return prevOpenIndices.includes(index)
//             ? prevOpenIndices.filter((select: number) => select !== index)
//             : [...prevOpenIndices, index];
//     });
// };

const animationOptions = {
    duration: 300,
    easing: 'ease-in-out',
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const { setSummaryEl } = useContext(AccordionItemContext);

    const summaryRef = React.useRef<HTMLSummaryElement>(null);

    useEffect(() => {
        setSummaryEl(summaryRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [summaryRef]);

    return (
        <summary ref={summaryRef} className={joinClassNames(styles.trigger, className)}>
            {children}
        </summary>
    );
};

const AccordionItem = ({ children, className, index }: AccordionItemProps) => {
    const [animation, setAnimation] = useState<Animation | null | undefined>(null);
    const [animationState, setAnimationState] = useState<'idle' | 'expanding' | 'shrinking'>(
        AnimationState.IDLE
    );

    const [summaryEl, setSummaryEl] = useState<HTMLSummaryElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);
    const detailsEl = detailsRef.current;

    // const handleSelect = () =>
    //     (type === 'single' ? handleSelectSingle : handleSelectMultiple)(index, setOpenIndices);

    const handleAnimateHeight = ({
        startHeight,
        endHeight,
        open,
    }: {
        startHeight: number;
        endHeight: number;
        open: boolean;
    }) => {
        const animation = detailsEl!.animate(
            { height: [`${startHeight}px`, `${endHeight}px`] },
            animationOptions
        );

        setAnimation(animation);

        animation.onfinish = () => onAnimationFinish(open);
        animation.oncancel = () => setAnimationState(AnimationState.IDLE);
    };

    function onAnimationFinish(open: boolean) {
        if (!detailsEl) {
            return;
        }

        detailsEl.open = open;
        detailsEl.style.height = '';
        detailsEl.style.overflow = '';

        setAnimation(null);
        setAnimationState(AnimationState.IDLE);
    }

    const handleExpand = () => {
        console.log('Expand');
        setAnimationState(AnimationState.EXPANDING);

        if (animation) {
            animation.cancel();
        }

        const startHeight = detailsEl?.offsetHeight || 0;
        const endHeight = (summaryEl?.offsetHeight || 0) + (contentEl?.offsetHeight || 0);

        handleAnimateHeight({ startHeight, endHeight, open: true });
    };

    const handleShrink = () => {
        console.log('Shrink');
        setAnimationState(AnimationState.SHRINKING);

        if (animation) {
            animation.cancel();
        }

        const startHeight = detailsEl?.offsetHeight || 0;
        const endHeight = summaryEl?.offsetHeight || 0;

        handleAnimateHeight({ startHeight, endHeight, open: false });
    };

    const handleOpen = () => {
        detailsEl!.style.height = `${detailsEl?.offsetHeight}px`;
        detailsEl!.open = true;

        requestAnimationFrame(() => handleExpand());
    };

    const handleToggle = () => {
        detailsEl!.style.overflow = 'hidden';

        if (animationState === AnimationState.SHRINKING || !detailsEl!.open) {
            handleOpen();
        }

        if (animationState === AnimationState.EXPANDING || detailsEl!.open) {
            handleShrink();
        }
    };

    return (
        <AccordionItemContext.Provider
            value={{
                index,
                animation,
                setAnimation,
                animationState,
                setAnimationState,
                summaryEl,
                setSummaryEl,
                contentEl,
                setContentEl,
            }}
        >
            <details ref={detailsRef} onToggle={handleToggle} className={className}>
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
