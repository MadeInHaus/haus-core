/**
 * Return a slugified copy of a string.
 *
 * @param {string} str The string to be slugified
 * @return {string} The slugified string.
 */
export function toSlug(str: string): string {
    if (!str) {
        return '';
    }
    return str
        .trim()
        .normalize('NFKD') // Decompose the string
        .replace(/\p{Diacritic}/gu, '') // Remove diacritics
        .toLocaleLowerCase('en-US') // Convert to lowercase
        .replace(/\s+/g, '-') // Replace whitespaces with "-"
        .replace(/[^a-z0-9-]+/g, '') // Remove all non-alphanumeric chars
        .replace(/-+/g, '-') // Replace multiple "-" with single "-"
        .replace(/^-+/g, '') // Trim "-" from start of text
        .replace(/-+$/g, ''); // Trim "-" from end of text
}

/**
 * Preload an image.
 *
 * @param {string} url The image's URL.
 * @return {Promise<HTMLImageElement>} A promise that resolves to the preloaded image.
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        if (img.complete && img.naturalWidth && img.naturalHeight) {
            resolve(img);
        } else {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
        }
    });
}

/**
 * Remove the hash from an URL.
 *
 * @param {string} url The URL.
 * @return {string} The URL without the hash.
 */
export function removeHash(url: string): string {
    const urlBase = 'http://a';
    const urlObj = new URL(url, urlBase);
    if (urlObj.origin !== urlBase) {
        urlObj.hash = '';
        return urlObj.toString();
    }
    return `${urlObj.pathname}${urlObj.search}`;
}

/**
 * Get the hash from an URL.
 *
 * @param {string} url The URL.
 * @return {string} The Hash ('#' followed by the fragment identifier of the URL).
 */
export function getHash(url: string): string {
    return new URL(url, 'http://a').hash;
}

/**
 * Get the last segment of an URL. This might be a slug, or a file name.
 * Returns undefined if the URL has no segments.
 *
 * @param {string} url The URL.
 * @return {string | undefined} The last segment of the URL, or undefined if no segment exists (for example "/").
 */
export function getLastSegment(url: string = ''): string | undefined {
    const { pathname } = new URL(url, 'http://a');
    const segments = pathname.split('/');
    return segments.length > 1 ? segments[segments.length - 1].trim() || undefined : undefined;
}
