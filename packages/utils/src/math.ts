// Real modulo
export function modulo(a: number, b: number): number {
    return ((a % b) + b) % b;
}

export function sign(value: number): number {
    return value < 0 ? -1 : 1;
}

export function clamp(value: number, bound1: number, bound2: number): number {
    const from = Math.min(bound1, bound2);
    const to = Math.max(bound1, bound2);
    return Math.max(Math.min(value, to), from);
}

export function mapRange(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function lerp(start: number, end: number, t: number) {
    return (1 - t) * start + t * end;
}

export function truncate(value: number, decimals: number) {
    return parseFloat(value.toFixed(decimals));
}
