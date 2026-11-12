/** Access token as the client stores it, with its absolute expiry time (epoch milliseconds). */
export interface StoredToken {
    accessToken: string;
    encryptedAccessToken: string;
    expiresAt: number;
}

/** Converts the login response into a stored token, turning `expireInSeconds` into an absolute time. */
export function createStoredToken(
    result: { accessToken: string; encryptedAccessToken: string; expireInSeconds: number },
    now: number = Date.now()
): StoredToken {
    return {
        accessToken: result.accessToken,
        encryptedAccessToken: result.encryptedAccessToken,
        expiresAt: now + result.expireInSeconds * 1000,
    };
}

/** Parses a stored token; returns undefined for missing or malformed data. */
export function parseStoredToken(raw: string | null | undefined): StoredToken | undefined {
    if (!raw) return undefined;
    try {
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== 'object') return undefined;
        const { accessToken, encryptedAccessToken, expiresAt } = value as Record<string, unknown>;
        if (typeof accessToken !== 'string' || !accessToken) return undefined;
        if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) return undefined;
        return {
            accessToken,
            encryptedAccessToken: typeof encryptedAccessToken === 'string' ? encryptedAccessToken : '',
            expiresAt,
        };
    } catch {
        return undefined;
    }
}

/**
 * True once the token is within `marginMs` of its expiry. The margin keeps the client from sending
 * a token that would expire in transit or be rejected because of clock differences.
 */
export function isTokenExpired(token: StoredToken, now: number = Date.now(), marginMs = 30_000): boolean {
    return now >= token.expiresAt - marginMs;
}
