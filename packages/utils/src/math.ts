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
