// Remove any falsy values in an array and then join them
export function joinClassNames(...items: (string | undefined | null)[]) {
    return [...items].filter(Boolean).join(' ');
}
