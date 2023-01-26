// Remove any falsy values in an array and then join them
// Use to join classNames
export function joinClassNames(...items: (string | undefined | null | boolean)[]) {
    return [...items].filter(Boolean).join(' ');
}
