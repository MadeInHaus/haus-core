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

export interface DisclosureItemProps extends DisclosureSharedProps {
    index: number;
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

const DisclosureItemContext = createContext<{
    detailsEl: HTMLDetailsElement | null;
    setDetailsEl: React.Dispatch<React.SetStateAction<HTMLDetailsElement | null>>;
    contentEl: HTMLElement | null;
    setContentEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}>({
    detailsEl: null,
    setDetailsEl: () => {},
    contentEl: null,
    setContentEl: () => {},
});

const Disclosure = ({
    children,
    className,
    animationOptions = defaultAnimationOptions,
}: DisclosureRootProps) => {
    return (
        <DisclosureContext.Provider
            value={{
                animationOptions,
            }}
        >
            <section className={className}>{children}</section>
        </DisclosureContext.Provider>
    );
};

// Inspired by: https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
const DisclosureSummary = ({ children, className }: DisclosureSharedProps) => {
    const summaryRef = React.useRef<HTMLElement>(null);

    const [animation, setAnimation] = useState<Animation | null | undefined>(null);
    const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);

    const { animationOptions } = useContext(DisclosureContext);
    const { detailsEl, contentEl } = useContext(DisclosureItemContext);

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
            className={joinClassNames(styles.trigger, className)}
        >
            {children}
        </summary>
    );
};

const DisclosureDetails = ({ children, className }: DisclosureItemProps) => {
    const [detailsEl, setDetailsEl] = useState<HTMLDetailsElement | null>(null);
    const [contentEl, setContentEl] = useState<HTMLElement | null>(null);

    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        setDetailsEl(detailsRef.current);
    }, []);

    return (
        <DisclosureItemContext.Provider
            value={{
                detailsEl,
                setDetailsEl,
                contentEl,
                setContentEl,
            }}
        >
            <details ref={detailsRef} className={className}>
                {children}
            </details>
        </DisclosureItemContext.Provider>
    );
};

const DisclosureContent = ({ children, className }: DisclosureSharedProps) => {
    const contentRef = React.useRef<HTMLDivElement>(null);

    const { setContentEl } = useContext(DisclosureItemContext);

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

export { Disclosure };
