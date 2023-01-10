const isUndef = (v: any) => isNaN(v) || typeof v === 'undefined';

export function getCSSValues(container: HTMLElement) {
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
    const hasGap = computed.getPropertyValue(GAP) !== '';
    const hasSnap = computed.getPropertyValue(SNAP) !== '';
    const hasSnapStart = computed.getPropertyValue(SNAPSTART) !== '';
    const hasSnapEnd = computed.getPropertyValue(SNAPEND) !== '';
    const hasWidth = computed.getPropertyValue(WIDTH) !== '';
    const gap = parseFloat(computed.getPropertyValue('padding-left'));
    const snap = parseFloat(computed.getPropertyValue('padding-right'));
    const snapStart = parseFloat(computed.getPropertyValue('margin-left'));
    const snapEnd = parseFloat(computed.getPropertyValue('margin-right'));
    const width = parseFloat(computed.getPropertyValue('left'));
    const autoScroll = parseFloat(computed.getPropertyValue(SCROLL)) || 0;
    const disabled = parseInt(computed.getPropertyValue(DISABLED), 10) ? 1 : 0;
    container.removeChild(dummy);
    return {
        gap: hasGap && !isUndef(gap) ? gap : undefined,
        snap: hasSnap && !isUndef(snap) ? snap : undefined,
        snapStart: hasSnapStart && !isUndef(snapStart) ? snapStart : undefined,
        snapEnd: hasSnapEnd && !isUndef(snapEnd) ? snapEnd : undefined,
        width: hasWidth && !isUndef(width) ? width : undefined,
        autoScroll,
        disabled,
    };
}

// Real modulo
export function modulo(a: number, b: number): number {
    return ((a % b) + b) % b;
}

// Get the last item of an array
export function last(array: any[]) {
    return typeof array !== 'undefined' && Array.isArray(array)
        ? array[array.length - 1]
        : undefined;
}

// Create an array of specified size
// Initialized with numbers 0 .. size-1
export function mappable(size: number): number[] {
    return new Array(size).fill(0).map((_, i) => i);
}

export function sign(value: number): number {
    return value < 0 ? -1 : 1;
}

export function clamp(value: number, bound1: number, bound2: number): number {
    const from = Math.min(bound1, bound2);
    const to = Math.max(bound1, bound2);
    return Math.max(Math.min(value, to), from);
}

export function hermite(
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
