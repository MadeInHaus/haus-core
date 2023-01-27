import * as React from 'react';

import { type EasingFunction, easings, modulo, clamp, sign, last } from '@madeinhaus/utils';

import { joinClassNames } from '../../utils';

import styles from './Carousel.module.scss';

interface CarouselItemProps {
    Wrapper: React.ElementType<any>;
    isDisabled: boolean;
    className?: string;
    children: React.ReactNode;
}

const CarouselItem = ({ Wrapper, isDisabled, className, children }: CarouselItemProps) => {
    const props = isDisabled
        ? { className }
        : {
              className: joinClassNames(styles.item, className),
              onDragStart: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
          };
    return <Wrapper {...props}>{children}</Wrapper>;
};

export type CarouselRef = {
    refresh: () => void;
    moveIntoView: (index: number) => void; // eslint-disable-line no-unused-vars
};

export interface CarouselProps {
    /** The item's alignment axis */
    align?: 'start' | 'center';
    /** Damping factor for the inertia effect */
    damping?: number;
    /** Disable item snapping */
    disableSnap?: boolean;
    /** Enable vertical scrolling */
    enableVerticalScroll?: boolean;
    /** Enable navigation gestures */
    enableNavigationGestures?: boolean;
    /** The index of the initial active item */
    activeItemIndex?: number;
    /** The carousel's container element (default: ul) */
    as?: React.ElementType<any>;
    /** The carousel's item wrapper element (default: li) */
    childAs?: React.ElementType<any>;
    /** Called when the user presses on the carousel */
    onPress?: (event: PointerEvent) => void; // eslint-disable-line no-unused-vars
    /** Called when the user starts dragging the carousel */
    onDrag?: () => void;
    /** Called when the carousel snaps to an item */
    onSnap?: (index: number) => void; // eslint-disable-line no-unused-vars
    /** The carousel's container class name */
    className?: string;
    /** The carousel's item wrapper class name */
    itemClassName?: string;
    /** The carousel's container style */
    style?: React.CSSProperties;
    /** The carousel's items */
    children: React.ReactNode;
}

type SnapDistanceResult = { index: number; distance: number };
type ItemPositionResult = { x1: number; x2: number };
type DragStartValue = { t: number; x: number };
type DragRegisterValue = { t: number; x: number; dt: number; dx: number };
type WheelDataValue = { t: number; d: number; dt?: number };

export const Carousel = React.forwardRef<CarouselRef, CarouselProps>((props, ref) => {
    const {
        align = 'start',
        damping = 200,
        disableSnap = false,
        enableVerticalScroll = false,
        enableNavigationGestures = false,
        activeItemIndex = 0,
        as: Container = 'ul',
        childAs: ChildWrapper = 'li',
        onPress,
        onDrag,
        onSnap,
        className,
        itemClassName,
        style,
        children,
    } = props;

    const snap = !disableSnap;

    const container = React.useRef<HTMLElement>();
    const containerWidth = React.useRef<number>(0);
    const gap = React.useRef<number>(0);
    const disabled = React.useRef<boolean>();
    const autoScroll = React.useRef<number>(0);
    const snapPos = React.useRef<number>();
    const snapPosStart = React.useRef<number>(0);
    const snapPosEnd = React.useRef<number>();
    const itemWidth = React.useRef<number>();
    const itemWidths = React.useRef<Map<number, number>>();
    const itemOffsets = React.useRef<Map<number, number>>();
    const visibleItems = React.useRef<Set<number>>(new Set());
    const activeItemIndexInternal = React.useRef<number>(activeItemIndex);
    const offset = React.useRef<number>(0);

    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);

    const items = React.useMemo<React.ReactNode[]>(
        () =>
            React.Children.map(children, child => {
                return (
                    <CarouselItem
                        Wrapper={ChildWrapper}
                        isDisabled={isDisabled}
                        className={itemClassName}
                    >
                        {child}
                    </CarouselItem>
                );
            }) as React.ReactNode[],
        [children, ChildWrapper, isDisabled, itemClassName]
    );

    ///////////////////////////////////////////////////////////////////////////
    // POSITIONING
    ///////////////////////////////////////////////////////////////////////////

    const calculateItemWidths = () => {
        itemWidths.current = new Map();
        container.current?.childNodes.forEach((child, index) => {
            itemWidths.current?.set(index, (child as HTMLElement).offsetWidth);
        });
    };

    const getItemWidth = (index: number): number => itemWidths.current?.get(index) ?? 0;

    const getDistanceToNeighbor = (i: number, dir: number) => {
        const totalItems = items.length;
        const index = modulo(i, totalItems);
        if (align === 'center') {
            const indexNeighbor = modulo(i - dir, totalItems);
            const currHalf = getItemWidth(index) / 2;
            const nextHalf = getItemWidth(indexNeighbor) / 2;
            return dir * ((gap.current ?? 0) + currHalf + nextHalf);
        } else {
            const indexNeighbor = modulo(i - Math.max(dir, 0), totalItems);
            const width = getItemWidth(indexNeighbor);
            return dir * ((gap.current ?? 0) + width);
        }
    };

    const getClosestDistance = (index: number): number => {
        const totalItems = items.length;
        const activeIndex = activeItemIndexInternal.current;
        const i1 = activeIndex > index ? index + totalItems - activeIndex : index - activeIndex;
        const i2 = activeIndex > index ? index - activeIndex : index - totalItems - activeIndex;
        const iDelta = Math.abs(i1) < Math.abs(i2) ? i1 : i2;
        const iDeltaSign = sign(iDelta);
        let distance = 0;
        for (let i = 0; Math.abs(i) < Math.abs(iDelta); i += iDeltaSign) {
            distance += getDistanceToNeighbor(activeIndex + i, -iDeltaSign);
        }
        return distance;
    };

    const calculateItemOffsets = () => {
        const totalItems = items.length;
        const offsets = new Map<number, number>();
        const iActive = activeItemIndexInternal.current;
        if (itemWidth.current) {
            for (let i = 0; i < totalItems; i++) {
                offsets.set(i, (iActive - i) * (itemWidth.current + (gap.current ?? 0)));
            }
        } else {
            offsets.set(iActive, 0); // Offset of activeItem is by definition 0
            const maxDist = Math.max(iActive, totalItems - iActive);
            for (let i = 1; i < maxDist; i++) {
                const iLeft = iActive - i;
                const iRight = iActive + i;
                if (iLeft >= 0) {
                    const iLeft0 = iLeft + 1;
                    const iLeft0Offset = offsets.get(iLeft0) ?? 0;
                    const neighborOffset = getDistanceToNeighbor(iLeft0, 1);
                    const offset = iLeft0Offset + neighborOffset;
                    offsets.set(iLeft, offset);
                }
                if (iRight < totalItems) {
                    const iRight0 = iRight - 1;
                    const iRight0Offset = offsets.get(iRight0) ?? 0;
                    const neighborOffset = getDistanceToNeighbor(iRight0, -1);
                    const offset = iRight0Offset + neighborOffset;
                    offsets.set(iRight, offset);
                }
            }
        }
        itemOffsets.current = offsets;
    };

    const getItemOffset = (index: number): number => itemOffsets.current?.get(index) ?? 0;

    const updateActiveItemIndex = (index: number) => {
        activeItemIndexInternal.current = index;
        offset.current = 0;
        calculateItemOffsets();
    };

    const findSnapDistance = (distance: number): SnapDistanceResult => {
        let index = activeItemIndexInternal.current;
        let offsetTarget = offset.current + distance;
        if (offsetTarget !== 0) {
            // Find the best offset (that is closest to offsetTarget)
            let offsetCurr = 0;
            let offsetDelta;
            let bestOffset = 0;
            let bestIndex = index;
            let bestDiff = Math.abs(offsetTarget);
            let failSafeCounter = 0;
            const dir = sign(offsetTarget);
            do {
                const distToNeighbor = getDistanceToNeighbor(index, dir);
                index -= dir;
                offsetCurr += distToNeighbor;
                offsetDelta = offsetTarget - offsetCurr;
                if (bestDiff > Math.abs(offsetDelta)) {
                    bestDiff = Math.abs(offsetDelta);
                    bestOffset = offsetCurr;
                    bestIndex = index;
                }
                if (failSafeCounter++ >= 50000) {
                    console.log('[findSnapDistance] fail safe triggered', {
                        index,
                        distance,
                        dir,
                        offsetCurr,
                        offsetDelta,
                        offsetTarget,
                        bestDiff,
                        bestOffset,
                        bestIndex,
                        offsetInitial: offset.current,
                        indexInitial: activeItemIndexInternal.current,
                    });
                    console.trace();
                    break;
                }
            } while (offsetDelta * dir > 0);
            return {
                index: modulo(bestIndex, items?.length ?? 0),
                distance: bestOffset - offset.current,
            };
        }
        return {
            index,
            distance: -offset.current,
        };
    };

    const getItemPosition = (index: number): ItemPositionResult => {
        let x1, x2;
        const itemWidth = getItemWidth(index);
        const itemOffset = getItemOffset(index);
        const x = offset.current + snapPosStart.current - itemOffset;
        if (align === 'center') {
            x1 = x - itemWidth / 2;
            x2 = x + itemWidth / 2;
        } else {
            x1 = x;
            x2 = x + itemWidth;
        }
        return { x1, x2 };
    };

    const position = (index: number, x1: number, x2: number) => {
        const isVisible = x1 < containerWidth.current && x2 > 0;
        if (isVisible) {
            if (visibleItems.current.has(index)) {
                throw new Error();
            } else {
                visibleItems.current.add(index);
                const node = container.current?.childNodes[index] as HTMLElement;
                if (node) {
                    node.style.transform = `translate3d(${x1}px, 0, 0)`;
                }
            }
        }
    };

    const positionRight = (index: number, x1: number) => {
        let failSafeCounter = 0;
        while (x1 < containerWidth.current) {
            const width = getItemWidth(index);
            const x2 = x1 + width;
            position(index, x1, x2);
            index = modulo(index + 1, items.length);
            x1 = x2 + (gap.current ?? 0);
            if (failSafeCounter++ >= 50000) {
                console.log('[positionRight] fail safe triggered', {
                    index,
                    x1,
                    x2,
                });
                break;
            }
        }
    };

    const positionLeft = (index: number, x2: number) => {
        let failSafeCounter = 0;
        while (x2 > 0) {
            const width = getItemWidth(index);
            const x1 = x2 - width;
            position(index, x1, x2);
            index = modulo(index - 1, items.length);
            x2 = x1 - (gap.current ?? 0);
            if (failSafeCounter++ >= 50000) {
                console.log('[positionLeft] fail safe triggered', {
                    index,
                    x1,
                    x2,
                });
                break;
            }
        }
    };

    const positionItems = () => {
        if (!container.current) return;
        const visibleItemsPrev = new Set(visibleItems.current);
        visibleItems.current = new Set();
        const index = activeItemIndexInternal.current;
        const { x1, x2 } = getItemPosition(index);
        position(index, x1, x2);
        positionRight(modulo(index + 1, items.length), x2 + (gap.current ?? 0));
        positionLeft(modulo(index - 1, items.length), x1 - (gap.current ?? 0));
        visibleItemsPrev.forEach(index => {
            if (!visibleItems.current.has(index)) {
                const node = container.current?.childNodes[index] as HTMLElement;
                if (node) {
                    node.style.transform = ``;
                }
            }
        });
    };

    // ///////////////////////////////////////////////////////////////////////////
    // // ANIMATIONS
    // ///////////////////////////////////////////////////////////////////////////

    const rafAutoScroll = React.useRef<number>(0);
    const rafThrow = React.useRef<number>(0);
    const rafEased = React.useRef<number>(0);

    const stopAutoScrollAnimation = () => {
        window.cancelAnimationFrame(rafAutoScroll.current);
        rafAutoScroll.current = 0;
    };

    const stopThrowAnimation = () => {
        cancelAnimationFrame(rafThrow.current);
        rafThrow.current = 0;
    };

    const stopEasedAnimation = () => {
        cancelAnimationFrame(rafEased.current);
        rafEased.current = 0;
    };

    const stopAllAnimations = () => {
        stopAutoScrollAnimation();
        stopThrowAnimation();
        stopEasedAnimation();
    };

    const shouldStartAutoScroll = () => {
        return autoScroll.current !== 0 && !disabled.current && !rafAutoScroll.current;
    };

    const animateAutoScroll = (v0: number = 0, tweenDuration: number = 500) => {
        if (!shouldStartAutoScroll()) {
            return;
        }
        const startTime = performance.now();
        const endTime = startTime + tweenDuration;
        let lastTime = startTime;
        const loop = () => {
            const currentTime = performance.now();
            const v = hermite(currentTime, v0, autoScroll.current, startTime, endTime);
            offset.current += (currentTime - lastTime) * v;
            positionItems();
            lastTime = currentTime;
            rafAutoScroll.current = requestAnimationFrame(loop);
        };
        rafAutoScroll.current = requestAnimationFrame(loop);
    };

    const animateEased = (
        targetOffset: number,
        targetIndex: number,
        options: { easeFn?: EasingFunction; duration?: number } = {}
    ) => {
        const { easeFn = easings.easeInOutCubic, duration = 700 } = options;
        const startTime = performance.now();
        const startOffset = offset.current;
        if (snap && onSnap) onSnap(targetIndex);
        const loop = () => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            const t = elapsedTime / duration;
            if (t < 1) {
                const ease = easeFn(t);
                const dist = targetOffset - startOffset;
                offset.current = startOffset + dist * ease;
                rafEased.current = requestAnimationFrame(loop);
            } else {
                rafEased.current = 0;
                updateActiveItemIndex(targetIndex);
            }
            positionItems();
        };
        rafEased.current = requestAnimationFrame(loop);
    };

    const animateThrow = (v0: number, t0: number) => {
        const startPos = offset.current;

        // See https://www.desmos.com/calculator/uejv80whgp for the math
        let index: number;
        let velocity = v0;
        let duration = -damping * Math.log(6 / (1000 * Math.abs(v0)));
        let distance = v0 * damping * (1 - Math.exp(-duration / damping));
        if (snap && autoScroll.current === 0) {
            const { index: iSnap, distance: dSnap } = findSnapDistance(distance);
            velocity = dSnap / (damping * (1 - Math.exp(-duration / damping)));
            duration = -damping * Math.log(6 / (1000 * Math.abs(velocity)));
            distance = dSnap;
            index = iSnap;
            if (onSnap) onSnap(index);
        }

        if (sign(velocity) !== sign(autoScroll.current)) {
            // Reverse auto-scroll direction if it goes in the
            // opposite direction of the throw.
            autoScroll.current *= -1;
        }

        const loop = () => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - t0;
            const exp = Math.exp(-elapsedTime / damping);
            const v = velocity * exp;
            if (shouldStartAutoScroll()) {
                // If auto-scroll is enabled, and the velocity of the
                // throw gets smaller than the auto-scroll velocity,
                // auto-scroll takes over.
                if (Math.abs(v) <= Math.abs(autoScroll.current)) {
                    rafThrow.current = 0;
                    animateAutoScroll(v, 1000);
                    return;
                }
            }
            // Total distance traveled until now
            const d = velocity * damping * (1 - exp);
            // Exit condition: We're either
            // - sufficiently near the target (normal exit)
            // - or out of time (fail-safe)
            const isNearTarget = Math.abs(distance - d) < 0.1;
            const isOutOfTime = elapsedTime >= duration;
            if (isNearTarget || isOutOfTime) {
                rafThrow.current = 0;
                if (typeof index !== 'undefined') {
                    updateActiveItemIndex(index);
                }
                positionItems();
                animateAutoScroll();
            } else {
                rafThrow.current = requestAnimationFrame(loop);
                offset.current = startPos + d;
                positionItems();
            }
        };
        loop();
    };

    // ///////////////////////////////////////////////////////////////////////////
    // // POINTER EVENTS, DRAGGING, THROWING
    // ///////////////////////////////////////////////////////////////////////////

    const dragStart = React.useRef<DragStartValue>({ t: 0, x: 0 });
    const dragRegister = React.useRef<DragRegisterValue[]>([]);
    const dragScrollLock = React.useRef<boolean>();
    const dragPreventClick = React.useRef<boolean>();

    const addPointerEvents = () => {
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerCancel);
        window.addEventListener('pointermove', handlePointerMove);
        const el = container.current;
        if (el) {
            el.addEventListener('touchstart', handleTouchStart);
            el.addEventListener('touchmove', handleTouchMove);
        }
    };

    const removePointerEvents = () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerCancel);
        window.removeEventListener('pointermove', handlePointerMove);
        const el = container.current;
        if (el) {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
        }
    };

    const handlePointerDown = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        stopAllAnimations();
        addPointerEvents();
        dragStart.current = { t: performance.now(), x: event.screenX };
        dragRegister.current = [];
        dragScrollLock.current = false;
        dragPreventClick.current = false;
        if (onPress) onPress(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        dragEnd(event);
    };

    const handlePointerCancel = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        dragEnd(event);
    };

    const handlePointerMove = (event: PointerEvent) => {
        if (!event.isPrimary) return;
        if (!dragScrollLock.current) {
            // Dragged horizontally for at least 5px: This is a legit swipe.
            // Prevent-default touchmoves to stop browser from taking over.
            const distTotal = Math.abs(event.screenX - dragStart.current.x);
            const isDrag = distTotal >= 5;
            if (isDrag) {
                dragScrollLock.current = true;
                if (onDrag) onDrag();
            }
        }
        if (dragScrollLock.current) {
            // This needs to be set, otherwise we won't get pointer up/cancel
            // events when the mouse leaves the window on drag
            container.current?.setPointerCapture(event.pointerId);
        }
        // Determine current position and velocity:
        const prev = last(dragRegister.current) || dragStart.current;
        const t = performance.now();
        const x = event.screenX;
        const dt = t - prev.t;
        const dx = x - prev.x;
        if (dx !== 0) {
            dragRegister.current.push({ t, x, dt, dx });
            offset.current += dx;
            positionItems();
        }
    };

    const handleTouchStart = (event: TouchEvent) => {
        if (!enableNavigationGestures) {
            const { pageX } = event.touches[0];
            if (pageX < 30 || pageX > window.innerWidth - 30) {
                // Prevent navigation gestures from edges of screen
                event.preventDefault();
            }
        }
    };

    const handleTouchMove = (event: TouchEvent) => {
        if (dragScrollLock.current) {
            // Prevent-default touchmove events:
            // - Browser won't scroll and take over the pointer
            // - Pointer events continue to be dispatched to us
            if (event.cancelable) event.preventDefault();
        }
    };

    const handleClick = (event: MouseEvent) => {
        if (dragPreventClick.current) {
            // Prevent-default click events:
            // After dragging, we don't want a dangling click to go through
            event.stopPropagation();
            event.preventDefault();
        }
    };

    const dragEnd = (event: PointerEvent) => {
        // Clean up:
        dragScrollLock.current = false;
        container.current?.releasePointerCapture(event.pointerId);
        removePointerEvents();
        // Discard first sample
        dragRegister.current.shift();
        // Calculate total distance the pointer moved
        const distance = dragRegister.current.reduce((a, sample) => a + Math.abs(sample.dx), 0);
        // Calculate age of last pointer move
        const currentTime = performance.now();
        const lastTime = last(dragRegister.current)?.t ?? currentTime;
        const dt = currentTime - lastTime;
        if (distance < 1 && dt >= 50) {
            // This was a long click:
            // Block clicks, snap to nearest item and bail out.
            dragPreventClick.current = true;
            dragThrow(0, 0);
            return;
        }
        // Require at least 2 samples (3 with the discarded first sample)
        // and at least 1px of total pointer movement (to weed out clicks)
        if (dragRegister.current.length >= 2 && distance >= 1) {
            // Block clicks
            dragPreventClick.current = true;
            // Latest sample must be less than 50ms old
            if (dt < 50) {
                // Determine velocity v0:
                // Average the last max 5 sample velocities.
                // Latest samples are applied a smaller weight than older ones
                // because velocity in the last one or two frames tends to
                // decrease significantly
                const relevantSamples = dragRegister.current.slice(-5).reverse();
                let v0 = 0;
                let weightSum = 0;
                relevantSamples.forEach((sample, i) => {
                    v0 += ((i + 1) * sample.dx) / sample.dt;
                    weightSum += i + 1;
                });
                v0 /= weightSum;
                dragThrow(v0, lastTime);
                return;
            }
        }
        // Snap to nearest item
        dragThrow(0, 0);
    };

    const dragThrow = (v0: number, t0: number) => {
        if (Math.abs(v0) > 0.1 && damping > 0) {
            // Throw it!
            // console.log(`[dragThrow] calling animateThrow`, { v0, t0 });
            animateThrow(v0, t0);
        } else {
            // This was not a throw.
            if (shouldStartAutoScroll()) {
                // Auto scroll
                animateAutoScroll();
            } else if (snap) {
                // Snap back
                let { distance, index } = findSnapDistance(0);
                // console.log(`[dragThrow] snap back `, { index, distance });
                animateEased(offset.current + distance, index);
            }
        }
    };

    React.useEffect(() => {
        const el = container.current;
        el?.addEventListener('click', handleClick, true);
        return () => {
            el?.removeEventListener('click', handleClick, true);
            removePointerEvents();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ///////////////////////////////////////////////////////////////////////////
    // // MOUSE WHEEL
    // ///////////////////////////////////////////////////////////////////////////

    const wheelDisabled = React.useRef<boolean>(false);
    const wheelInertia = React.useRef<boolean>(false);
    const wheelData = React.useRef<WheelDataValue[]>([]);
    const wheelTimeout = React.useRef<number>(0);
    const wheelDirection = React.useRef<number>(0);

    const isInertia = (d: number): boolean => {
        const t = performance.now();
        if (wheelData.current.length === 0) {
            wheelData.current = [{ t, d }];
            wheelDirection.current = sign(d);
        } else {
            if (wheelDirection.current !== sign(d)) {
                wheelDirection.current = sign(d);
                wheelData.current = [{ t, d }];
            } else {
                const dt = t - last(wheelData.current).t;
                wheelData.current.push({ t, dt, d });
            }
        }
        let result = false;
        const sampleSize = 8;
        const len = wheelData.current.length;
        if (len > sampleSize) {
            let signCount = 0;
            let equalCount = 0;
            for (let i = len - sampleSize; i < len; i++) {
                const dPrev = wheelData.current[i - 1].d;
                const dCur = wheelData.current[i].d;
                const dd = dCur - dPrev;
                if (dd === 0) {
                    // Weed out mouse wheels which always emit the same
                    // high delta (usually >= 100)
                    if (Math.abs(dPrev) > 10 && Math.abs(dCur) > 10) {
                        equalCount++;
                    }
                } else if (sign(dd) === wheelDirection.current) {
                    // When actively swiping, the signs of the first dy and
                    // subsequent ddys tend to be the same (accelerate).
                    // When inertia kicks in, the signs differ (decelerate).
                    signCount++;
                }
            }
            // Report inertia, when out of the latest [sampleSize] events
            // - less than [sampleSize / 2] accelerated (most decelerated)
            // - all showed some de-/acceleration for higher deltas
            result = signCount < Math.round(sampleSize / 2) && equalCount !== sampleSize;
        }
        return result;
    };

    const onWheelTimeout = () => {
        wheelInertia.current = false;
        wheelData.current = [];
    };

    const handleWheel = (event: WheelEvent) => {
        if (wheelDisabled.current || disabled.current) return;
        // https://github.com/facebook/react/blob/master/packages/react-dom/src/events/SyntheticEvent.js#L556-L559
        // > Browsers without "deltaMode" is reporting in raw wheel delta where
        // > one notch on the scroll is always +/- 120, roughly equivalent to
        // > pixels. A good approximation of DOM_DELTA_LINE (1) is 5% of
        // > viewport size or ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5%
        // > of viewport size.
        let multiplicator = 1;
        if (event.deltaMode === 1) {
            multiplicator = window.innerHeight * 0.05;
        } else if (event.deltaMode === 2) {
            multiplicator = window.innerHeight * 0.875;
        }
        const dx = event.deltaX * multiplicator;
        const dy = event.deltaY * multiplicator;
        // Calculate angle of the swipe
        // -180 ... -135: left (upper 8th)
        // -135 ... -45: up
        // -45 ... 0: right (upper 8th)
        // 0 ... 45: right (lower 8th)
        // 45 ... 135: down
        // 135 .. 180: left (lower 8th)
        const a = (Math.atan2(dy, dx) * 180) / Math.PI;
        // Go forwards if swiped to the right or down
        // Go backwards if swiped to the left or up
        const forwards = a >= -45 && a <= 135;
        // The distance swiped since last event, with correct sign
        const d = Math.hypot(dx, dy) * (forwards ? 1 : -1);
        // Restrict to horizontal axis (if vertical scroll is disabled)
        const horiz = !((a >= -135 && a <= -45) || (a >= 45 && a <= 135));
        if (horiz || enableVerticalScroll) {
            event.preventDefault();
            if (!isInertia(d)) {
                // Swipe
                stopAllAnimations();
                offset.current -= d;
                positionItems();
                wheelInertia.current = false;
            } else if (!wheelInertia.current) {
                // Inertia
                const latestData = last(wheelData.current);
                if (latestData.dt) {
                    const v0 = -latestData.d / latestData.dt;
                    if (v0 !== 0) {
                        // console.log(`[handleWheel] calling animateThrow`, {
                        //     v0,
                        // });
                        animateThrow(v0, performance.now());
                        wheelInertia.current = true;
                    }
                }
            }
        }
        clearTimeout(wheelTimeout.current);
        wheelTimeout.current = window.setTimeout(onWheelTimeout, 100);
    };

    React.useEffect(() => {
        const el = container.current;
        el?.addEventListener('wheel', handleWheel);
        return () => {
            el?.removeEventListener('wheel', handleWheel);
            clearTimeout(wheelTimeout.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ///////////////////////////////////////////////////////////////////////////
    // // INIT/RESIZE/API
    // ///////////////////////////////////////////////////////////////////////////

    const moveIntoView = (index: number) => {
        stopAllAnimations();
        animateEased(getClosestDistance(index), index, { duration: 700 });
    };

    const refresh = () => {
        if (!container.current) return;
        // Update CSS custom properties:
        // --carousel-gap
        // --carousel-snap-position
        // --carousel-snap-position-start
        // --carousel-snap-position-end
        // --carousel-item-width
        // --carousel-autoscroll
        // --carousel-disabled
        const values = getCSSValues(container.current);
        gap.current = values.gap;
        itemWidth.current = values.width;
        snapPos.current = values.snap;
        snapPosStart.current = values.snapStart;
        snapPosEnd.current = values.snapEnd;
        disabled.current = values.disabled;
        if (Math.abs(autoScroll.current) !== Math.abs(values.autoScroll)) {
            autoScroll.current = values.autoScroll;
        }
        // Disable the carousel if needed
        container.current.classList.toggle('disabled', disabled.current);
        if (disabled.current !== isDisabled) {
            setIsDisabled(disabled.current);
        }
        if (disabled.current) {
            stopAllAnimations();
            items.forEach((_, index) => {
                const node = container.current?.childNodes[index] as HTMLElement;
                if (node) {
                    node.style.transform = '';
                }
            });
            return;
        }
        // Initialize some other refs:
        const { width } = container.current.getBoundingClientRect();
        containerWidth.current = width;
        calculateItemWidths();
        calculateItemOffsets();
        // console.log(activeItemIndexInternal.current, activeItemIndex);
        if (activeItemIndexInternal.current !== activeItemIndex) {
            // activeItemIndexInternal.current = activeItemIndex;
        }
        try {
            positionItems();
        } catch (e) {
            console.error('boom');
            throw e;
        }
        // Start or stop auto-scroll animation
        if (autoScroll.current) {
            animateAutoScroll();
        } else {
            stopAutoScrollAnimation();
        }
    };

    React.useEffect(() => {
        const el = container.current as HTMLElement;
        const resizeObserver = new ResizeObserver(() => refresh());
        resizeObserver.observe(el);
        return () => resizeObserver.unobserve(el);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    React.useImperativeHandle(
        ref,
        () => ({
            refresh: () => {
                refresh();
            },
            moveIntoView: (index: number) => {
                moveIntoView(index);
            },
        }),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    return (
        <Container
            ref={container}
            onPointerDown={isDisabled ? null : handlePointerDown}
            className={joinClassNames(styles.root, className)}
            style={style}
        >
            {items}
        </Container>
    );
});

type CSSValues = {
    gap: number;
    snap: number;
    snapStart: number;
    snapEnd: number;
    width: number;
    autoScroll: number;
    disabled: boolean;
};

function getCSSValues(container: HTMLElement): CSSValues {
    const GAP = '--carousel-gap';
    const SNAP = '--carousel-snap-position';
    const SNAPSTART = '--carousel-snap-position-start';
    const SNAPEND = '--carousel-snap-position-end';
    const WIDTH = '--carousel-item-width';
    const SCROLL = '--carousel-autoscroll';
    const DISABLED = '--carousel-disabled';
    const styles = [
        `position: relative`,
        `padding-left: var(${GAP})`,
        `padding-right: var(${SNAP})`,
        `margin-left: var(${SNAPSTART})`,
        `margin-right: var(${SNAPEND})`,
        `left: var(${WIDTH})`,
        'position: absolute',
        'width: 100%',
    ];
    const dummy = document.createElement('div');
    dummy.setAttribute('style', styles.join(';'));
    container.appendChild(dummy);
    const computed = getComputedStyle(dummy);
    const hasSnapStart = computed.getPropertyValue(SNAPSTART) !== '';
    const hasSnapEnd = computed.getPropertyValue(SNAPEND) !== '';
    const gap = parseFloat(computed.getPropertyValue('padding-left'));
    const snap = parseFloat(computed.getPropertyValue('padding-right'));
    const snapStart = parseFloat(computed.getPropertyValue('margin-left'));
    const snapEnd = parseFloat(computed.getPropertyValue('margin-right'));
    const width = parseFloat(computed.getPropertyValue('left'));
    const autoScroll = parseFloat(computed.getPropertyValue(SCROLL));
    const disabled = parseInt(computed.getPropertyValue(DISABLED), 10);
    container.removeChild(dummy);
    return {
        gap: Math.max(Number.isFinite(gap) ? gap : 0, 0),
        snap: Number.isFinite(snap) ? snap : 0,
        snapStart: hasSnapStart && Number.isFinite(snapStart) ? snapStart : snap,
        snapEnd: hasSnapEnd && Number.isFinite(snapEnd) ? snapEnd : snap,
        width: Math.max(Number.isFinite(width) ? width : 0, 0),
        autoScroll: Number.isFinite(autoScroll) ? autoScroll : 0,
        disabled: (Number.isFinite(disabled) ? disabled : 0) !== 0,
    };
}

function hermite(
    time: number,
    from: number = 0,
    to: number = 1,
    timeStart: number = 0,
    timeEnd: number = 1
): number {
    time = clamp(time, timeStart, timeEnd);
    const t = (time - timeStart) / (timeEnd - timeStart);
    return (-2 * t * t * t + 3 * t * t) * (to - from) + from;
}

Carousel.displayName = 'Carousel';
