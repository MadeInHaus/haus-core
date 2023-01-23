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
