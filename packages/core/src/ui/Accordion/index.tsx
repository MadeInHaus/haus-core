import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Accordion.module.scss';

export interface AccordionSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface AccordionRootProps extends AccordionSharedProps {}

export interface AccordionItemProps extends AccordionSharedProps {
    index: number;
}

enum AnimationState {
    IDLE = 'idle',
    EXPANDING = 'expanding',
    SHRINKING = 'shrinking',
}

const AccordionItemContext = createContext<{
    index: number;
    animation: Animation | null | undefined;
    setAnimation: React.Dispatch<React.SetStateAction<Animation | null | undefined>>;
    animationState: AnimationState;
    setAnimationState: React.Dispatch<React.SetStateAction<AnimationState>>;
    detailsEl: HTMLDetailsElement | null;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentEl: HTMLElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}>({
    index: 0,
    animation: null,
    setAnimation: () => {},
    animationState: AnimationState.IDLE,
    setAnimationState: () => {},
    detailsEl: null,
    setDetailsEl: () => {},
    contentEl: null,
    setContentEl: () => {},
});

const Accordion = ({ children, className }: AccordionRootProps) => {
    return <section className={className}>{children}</section>;
};

const animationOptions = {
    duration: 300,
    easing: 'ease-in-out',
};

const AccordionTrigger = ({ children, className }: AccordionSharedProps) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const { animation, setAnimation, detailsEl, animationState, setAnimationState, contentEl } =
        useContext(AccordionItemContext);

    console.log({ animationState });

    const handleAnimateHeight = ({
        animationState,
        startHeight,
        endHeight,
        open,
    }: {
        animationState: AnimationState;
        startHeight: number;
        endHeight: number;
        open: boolean;
    }) => {
        setAnimationState(animationState);

        if (animation) {
            animation.cancel();
        }

        const _animation = detailsEl?.animate(
            { height: [`${startHeight}px`, `${endHeight}px`] },
            animationOptions
        );

        setAnimation(_animation);

        _animation!.onfinish = () => onAnimationFinish(open);
        _animation!.oncancel = () => setAnimationState(AnimationState.IDLE);

        console.log({ startHeight, endHeight });
    };

    const handleShrink = () => {
        setAnimationState(AnimationState.SHRINKING);

        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef?.current && summaryRef.current.offsetHeight) || 0;

        handleAnimateHeight({
            animationState: AnimationState.SHRINKING,
            startHeight,
            endHeight,
            open: false,
        });
    };

    const handleExpand = () => {
        const startHeight = detailsEl?.offsetHeight ?? 0;
        const endHeight = (summaryRef.current?.offsetHeight || 0) + (contentEl?.offsetHeight || 0);

        handleAnimateHeight({
            animationState: AnimationState.EXPANDING,
            startHeight,
            endHeight,
            open: true,
        });
    };

    function onAnimationFinish(open: boolean) {
        detailsEl!.open = open;
        detailsEl!.style.height = '';
        detailsEl!.style.overflow = '';

        setAnimation(null);
        setAnimationState(AnimationState.IDLE);
    }

    const handleOpen = () => {
        detailsEl!.style.height = `${detailsEl?.offsetHeight}px`;
        detailsEl!.open = true;

        requestAnimationFrame(() => handleExpand());
    };

    const handleClick = () => {
        detailsEl!.style.overflow = 'hidden';

        if (animationState === AnimationState.SHRINKING || !detailsEl!.open) {
            handleOpen();
        }

        if (animationState === AnimationState.EXPANDING || detailsEl!.open) {
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

    const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setDetailsEl(detailsRef.current);
    }, []);

    return (
        <AccordionItemContext.Provider
            value={{
                index,
                animation,
                setAnimation,
                animationState,
                setAnimationState,
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
    }, []);

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
