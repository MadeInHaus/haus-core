import React, { createContext, useContext, useEffect, useState } from 'react';
import cx from 'clsx';
import styles from './Disclosure.module.css';

export interface DisclosureSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface DisclosureRootProps {
    children: React.ReactNode;
    className?: string;
    animationOptions?: OptionalEffectTiming;
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
}>({
    animationOptions: defaultAnimationOptions,
});

const DisclosureDetailsContext = createContext<{
    animationOptions?: OptionalEffectTiming | null;
    detailsElement: HTMLDetailsElement | null;
    setDetailsElement: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentElement: HTMLElement | null;
    setContentElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    animationOptions: defaultAnimationOptions,
    detailsElement: null,
    setDetailsElement: () => {},
    contentElement: null,
    setContentElement: () => {},
    setIsOpen: () => {},
});

const Disclosure = ({
    children,
    className,
    animationOptions = defaultAnimationOptions,
}: DisclosureRootProps) => {
    return (
        <DisclosureContext.Provider value={{ animationOptions }}>
            <section className={className}>{children}</section>
        </DisclosureContext.Provider>
    );
};

const DisclosureDetails = ({
    animationOptions,
    children,
    className,
    defaultOpen = false,
}: DisclosureDetailProps) => {
    const detailsRef = React.useRef<HTMLDetailsElement>(null);
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [detailsElement, setDetailsElement] = useState<HTMLDetailsElement | null>(null);
    const [contentElement, setContentElement] = useState<HTMLElement | null>(null);

    useEffect(() => setDetailsElement(detailsRef.current), []);

    return (
        <DisclosureDetailsContext.Provider
            value={{
                animationOptions,
                detailsElement,
                setDetailsElement,
                contentElement,
                setContentElement,
                setIsOpen,
            }}
        >
            <details ref={detailsRef} className={className} open={defaultOpen}>
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

    const { animationOptions: rootAnimationOptions } = useContext(DisclosureContext);

    const {
        animationOptions: detailsAnimationOptions,
        detailsElement,
        contentElement,
        setIsOpen,
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

        const _animation = detailsElement?.animate(
            { height: [`${startHeight}px`, `${endHeight}px`] },
            animationOptions
        );

        setAnimation(_animation);
        setIsOpen(open);
        _animation!.onfinish = () => onAnimationFinish(open);
        _animation!.oncancel = () => setAnimationState(AnimationState.IDLE);
    };

    const handleShrink = () => {
        const startHeight = detailsElement?.offsetHeight ?? 0;
        const endHeight = (summaryRef?.current && summaryRef.current.offsetHeight) || 0;

        handleAnimateHeight({
            animationState: AnimationState.SHRINKING,
            startHeight,
            endHeight,
            open: false,
        });
    };

    const handleExpand = () => {
        const startHeight = detailsElement?.offsetHeight ?? 0;
        const endHeight =
            (summaryRef.current?.offsetHeight || 0) + (contentElement?.offsetHeight || 0);

        handleAnimateHeight({
            animationState: AnimationState.EXPANDING,
            startHeight,
            endHeight,
            open: true,
        });
    };

    const onAnimationFinish = (open: boolean) => {
        if (!detailsElement) {
            return;
        }

        detailsElement.open = open;
        detailsElement.style.height = '';
        detailsElement.style.overflow = '';

        setAnimation(null);
        setAnimationState(AnimationState.IDLE);
    };

    const handleOpen = () => {
        if (!detailsElement) {
            return;
        }

        detailsElement.style.height = `${detailsElement.offsetHeight}px`;
        detailsElement.open = true;
        setIsOpen(true);

        requestAnimationFrame(() => handleExpand());
    };

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        if (!detailsElement) {
            return;
        }

        e.preventDefault();
        detailsElement.style.overflow = 'hidden';

        if (animationState === AnimationState.SHRINKING || !detailsElement.open) {
            handleOpen();
        } else if (animationState === AnimationState.EXPANDING || detailsElement.open) {
            handleShrink();
        }
    };

    return (
        <summary ref={summaryRef} className={cx(styles.summary, className)} onClick={handleClick}>
            {children}
        </summary>
    );
};

const DisclosureContent = ({ children, className }: DisclosureSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentElement } = useContext(DisclosureDetailsContext);

    useEffect(() => {
        setContentElement(contentRef.current);
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
