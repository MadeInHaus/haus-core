import React, { createContext, useContext, useEffect, useState } from 'react';
import cx from 'clsx';
import styles from './Disclosure.module.scss';

export interface DisclosureSharedProps {
    children: React.ReactNode;
    className?: string;
}

export type RegisterDetails = () => {
    handleClick: (e: React.MouseEvent) => void;
    index: number;
};

export interface DisclosureRootProps {
    children: (registerDetails: RegisterDetails) => React.ReactNode | React.ReactNode[];
    className?: string;
    animationOptions?: OptionalEffectTiming;
    defaultOpenIndex?: number;
    preventCloseAll?: boolean;
}

export interface DisclosureDetailProps {
    animationOptions?: OptionalEffectTiming | null;
    index?: number;
    handleClick?: (e: React.MouseEvent) => void;
    children: React.ReactNode | (({ isOpen }: { isOpen: boolean }) => React.ReactNode);
    className?: string;
    defaultOpen?: boolean;
}

enum AnimationState {
    IDLE = 'idle',
    EXPANDING = 'expanding',
    SHRINKING = 'shrinking',
}

const defaultAnimationOptions = {
    duration: 300,
    easing: 'ease-in-out',
};

const DisclosureContext = createContext<{
    animationOptions: OptionalEffectTiming;
    openIndex: number;
}>({
    animationOptions: defaultAnimationOptions,
    openIndex: 1,
});

const DisclosureDetailsContext = createContext<{
    index?: number;
    handleClick?: (e: React.MouseEvent) => void;
    animationOptions?: OptionalEffectTiming | null;
    detailsEl: HTMLDetailsElement | null;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentEl: HTMLElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    animationOptions: defaultAnimationOptions,
    detailsEl: null,
    setDetailsEl: () => {},
    contentEl: null,
    setContentEl: () => {},
    setIsOpen: () => {},
    index: undefined,
    handleClick: undefined,
});

const Disclosure = ({
    children,
    className,
    animationOptions = defaultAnimationOptions,
    defaultOpenIndex = 0,
    preventCloseAll = false,
}: DisclosureRootProps) => {
    const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);

    let counter = -1;

    const registerDetails = () => {
        const _index = counter + 1;
        counter = _index;

        return {
            index: _index,
            handleClick: (e: React.MouseEvent) => {
                e.preventDefault();
                setOpenIndex(openIndex !== _index ? _index : preventCloseAll ? _index : -1);
            },
        };
    };

    return (
        <DisclosureContext.Provider value={{ animationOptions, openIndex }}>
            <section className={className}>
                {typeof children === 'function' ? children(registerDetails) : children}
            </section>
        </DisclosureContext.Provider>
    );
};

const DisclosureDetails = ({
    animationOptions,
    children,
    className,
    index,
    handleClick,
    defaultOpen = false,
}: DisclosureDetailProps) => {
    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    const { openIndex } = useContext(DisclosureContext);

    useEffect(() => {
        if (detailsRef.current) {
            detailsRef.current.open = index === openIndex;
        }
    }, []);

    useEffect(() => {
        setDetailsEl(detailsRef.current);
    }, []);

    return (
        <DisclosureDetailsContext.Provider
            value={{
                index: index ?? 0,
                animationOptions,
                detailsEl,
                setDetailsEl,
                contentEl,
                setContentEl,
                setIsOpen,
                handleClick: handleClick ? handleClick : undefined,
            }}
        >
            <details ref={detailsRef} className={className}>
                {typeof children === 'function' ? children({ isOpen }) : children}
            </details>
        </DisclosureDetailsContext.Provider>
    );
};

// Inspired by: https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
const DisclosureSummary = ({ children, className }: DisclosureSharedProps) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const [animation, setAnimation] = useState<Animation | null | undefined>(null);
    const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);

    const { animationOptions: rootAnimationOptions, openIndex } = useContext(DisclosureContext);

    const {
        animationOptions: detailsAnimationOptions,
        detailsEl,
        contentEl,
        setIsOpen,
        index,
        handleClick: handleAccordionClick,
    } = useContext(DisclosureDetailsContext);

    const animationOptions = detailsAnimationOptions ?? rootAnimationOptions;

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
        setIsOpen(open);
        _animation!.onfinish = () => onAnimationFinish(open);
        _animation!.oncancel = () => setAnimationState(AnimationState.IDLE);
    };

    const handleShrink = () => {
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

    const onAnimationFinish = (open: boolean) => {
        detailsEl!.open = open;
        detailsEl!.style.height = '';
        detailsEl!.style.overflow = '';

        setAnimation(null);
        setAnimationState(AnimationState.IDLE);
    };

    const handleOpen = () => {
        detailsEl!.style.height = `${detailsEl?.offsetHeight}px`;
        detailsEl!.open = true;
        setIsOpen(true);

        requestAnimationFrame(() => handleExpand());
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        if (handleAccordionClick) {
            return;
        }

        e.preventDefault();
        detailsEl!.style.overflow = 'hidden';

        if (animationState === AnimationState.SHRINKING || !detailsEl!.open) {
            handleOpen();
        } else if (animationState === AnimationState.EXPANDING || detailsEl!.open) {
            handleShrink();
        }
    };

    useEffect(() => {
        if (!detailsEl || !handleAccordionClick) {
            return;
        }

        detailsEl!.style.overflow = 'hidden';

        if (openIndex === index) {
            if (animationState === AnimationState.SHRINKING || !detailsEl!.open) {
                handleOpen();
            }
        } else {
            if (animationState === AnimationState.EXPANDING || detailsEl!.open) {
                handleShrink();
            }
        }
    }, [index, openIndex, animationState, detailsEl]);

    return (
        <summary
            ref={summaryRef}
            className={cx(styles.summary, className)}
            onClick={handleAccordionClick ?? handleClick}
        >
            {children}
        </summary>
    );
};

const DisclosureContent = ({ children, className }: DisclosureSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentEl } = useContext(DisclosureDetailsContext);

    useEffect(() => {
        setContentEl(contentRef.current);
    }, []);

    return (
        <div ref={contentRef} className={className}>
            {children}
        </div>
    );
};

Disclosure.Root = Disclosure;
Disclosure.Details = React.memo(DisclosureDetails);
Disclosure.Summary = DisclosureSummary;
Disclosure.Content = DisclosureContent;

export default Disclosure;
