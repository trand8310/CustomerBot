/**
 * Web Storage helpers. The app keeps nothing in cookies: the access token, tenant and language
 * live here and are sent to the backend as request headers.
 */
export const storageKeys = {
    auth: 'customerbot.auth',
    tenantId: 'customerbot.tenantId',
    culture: 'customerbot.culture',
} as const;

/** Storage can throw (privacy modes, disabled storage); treat that as "nothing stored". */
function attempt<T>(action: () => T, fallback: T): T {
    try {
        return action();
    } catch {
        return fallback;
    }
}

/** Reads `key`, preferring the tab's sessionStorage over localStorage. Returns '' when absent. */
export function readItem(key: string): string {
    return attempt(() => sessionStorage.getItem(key) ?? localStorage.getItem(key) ?? '', '');
}

/** Writes `key` to localStorage (persistent) or sessionStorage (cleared when the tab closes). */
export function writeItem(key: string, value: string, persistent = true): void {
    removeItem(key);
    attempt(() => (persistent ? localStorage : sessionStorage).setItem(key, value), undefined);
}

export function removeItem(key: string): void {
    attempt(() => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
    }, undefined);
}
