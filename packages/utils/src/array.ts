// Get the last item of an array
export function last(array: any[]) {
    return Array.isArray(array) ? array[array.length - 1] : undefined;
}

// Create an array of specified size
// Initialized with numbers 0 .. size-1
export function mappable(size: number): number[] {
    return new Array(size).fill(0).map((_, i) => i);
}

// Remove any falsy values in an array and then join them
// Use to join classNames
export function join(array: string[]) {
    return array.filter(Boolean).join(' ');
}
