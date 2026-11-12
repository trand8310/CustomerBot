export interface CookieOptions {
    /** Lifetime in seconds. Omit for a session cookie; 0 deletes the cookie. */
    maxAge?: number;
    /** Adds the Secure attribute so the cookie is only sent over HTTPS. */
    secure?: boolean;
}

/** Returns the decoded value of `name` from a `document.cookie` style string, or '' when absent. */
export function readCookie(cookieString: string, name: string): string {
    const entry = cookieString.split('; ').find((part) => part.startsWith(name + '='));
    if (!entry) return '';
    const raw = entry.slice(name.length + 1);
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

/** Builds a `document.cookie` assignment string. */
export function serializeCookie(name: string, value: string | number, options: CookieOptions = {}): string {
    let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    if (options.maxAge !== undefined) cookie += `; max-age=${options.maxAge}`;
    if (options.secure) cookie += '; Secure';
    return cookie;
}
