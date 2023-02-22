import React, { createContext, useContext, useEffect, useState } from 'react';
import { joinClassNames } from '../../utils';
import styles from './Disclosure.module.scss';

export interface DisclosureSharedProps {
    children: React.ReactNode;
    className?: string;
}

export interface DisclosureRootProps extends DisclosureSharedProps {
    animationOptions: OptionalEffectTiming;
}

export interface DisclosureDetailProps {
    animationOptions?: OptionalEffectTiming | null;
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

    const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (detailsRef.current) {
            detailsRef.current.open = defaultOpen;
        }
    }, []);

    if (className) {
        console.warn('%c Disclosure from @madeinhaus/core ↓ ', 'color: red; font-size: 14px');
        console.warn(
            'Use className to style the Disclosure.Details element, sparingly. To style the trigger, please apply style to Detail.Summary. To style the content within the Disclosure.Details, please apply styles to Disclosure.Content.'
        );
    }

    useEffect(() => {
        setDetailsEl(detailsRef.current);
    }, []);

    return (
        <DisclosureDetailsContext.Provider
            value={{
                animationOptions,
                detailsEl,
                setDetailsEl,
                contentEl,
                setContentEl,
                setIsOpen,
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

    const { animationOptions: rootAnimationOptions } = useContext(DisclosureContext);

    const {
        animationOptions: detailsAnimationOptions,
        detailsEl,
        contentEl,
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
        e.preventDefault();
        detailsEl!.style.overflow = 'hidden';

        if (animationState === AnimationState.SHRINKING || !detailsEl!.open) {
            handleOpen();
        } else if (animationState === AnimationState.EXPANDING || detailsEl!.open) {
            handleShrink();
        }
    };

    return (
        <summary
            ref={summaryRef}
            onClick={handleClick}
            className={joinClassNames(styles.summary, className)}
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
