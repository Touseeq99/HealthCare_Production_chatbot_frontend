/**
 * Utility to get a cookie value by name on the client side.
 */
export function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}
