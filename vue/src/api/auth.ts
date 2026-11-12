import { ElNotification } from 'element-plus';
import { t } from '../locales';
import { createStoredToken, isTokenExpired, parseStoredToken, type StoredToken } from '../utils/token';
import { readItem, removeItem, storageKeys, writeItem } from './storage';
import type { AuthenticateResult } from './types';

/**
 * The backend issues a JWT with a fixed lifetime and has no refresh endpoint, so the client
 * tracks the expiry itself: it stops sending an expired token, warns shortly before expiry,
 * and returns the user to the login page when the token expires or the server rejects it.
 */

const warnBeforeMs = 5 * 60_000;
const maxTimeoutMs = 2_000_000_000; // setTimeout overflows above ~24.8 days
let timers: ReturnType<typeof setTimeout>[] = [];
let ending = false;

function readToken(): StoredToken | undefined {
    return parseStoredToken(readItem(storageKeys.auth));
}

function clearTimers(): void {
    timers.forEach(clearTimeout);
    timers = [];
}

/** Runs `action` after `ms`, chaining timeouts for delays longer than setTimeout supports. */
function later(action: () => void, ms: number): void {
    if (ms > maxTimeoutMs) timers.push(setTimeout(() => later(action, ms - maxTimeoutMs), maxTimeoutMs));
    else timers.push(setTimeout(action, Math.max(ms, 0)));
}

/** Stores the login result. `remember` keeps it across browser restarts; otherwise only for this tab. */
export function saveToken(result: AuthenticateResult, remember: boolean): void {
    writeItem(storageKeys.auth, JSON.stringify(createStoredToken(result)), remember);
    ending = false;
    scheduleExpiry();
}

export function clearToken(): void {
    removeItem(storageKeys.auth);
    clearTimers();
}

export type TokenStatus = 'none' | 'valid' | 'expired';

export function tokenStatus(): TokenStatus {
    const token = readToken();
    if (!token) return 'none';
    return isTokenExpired(token) ? 'expired' : 'valid';
}

/** The access token for the Authorization header, or '' when there is none or it has expired. */
export function accessToken(): string {
    const token = readToken();
    return token && !isTokenExpired(token) ? token.accessToken : '';
}

/** The encrypted token SignalR passes in its query string, or '' when absent or expired. */
export function encryptedAccessToken(): string {
    const token = readToken();
    return token && !isTokenExpired(token) ? token.encryptedAccessToken : '';
}

/**
 * Ends the session after the token expired or the server answered 401, then opens the login page,
 * which explains why and returns to the current page after signing in again.
 */
export function endExpiredSession(): void {
    clearToken();
    if (ending || location.pathname.startsWith('/account/')) return;
    ending = true;
    const redirect = encodeURIComponent(location.pathname + location.search);
    location.assign(`/account/login?expired=1&redirect=${redirect}`);
}

/** Schedules the expiry warning and the automatic return to login for the stored token. */
export function scheduleExpiry(): void {
    clearTimers();
    const token = readToken();
    if (!token) return;
    const remaining = token.expiresAt - Date.now();
    if (remaining > warnBeforeMs)
        later(
            () =>
                ElNotification({
                    type: 'warning',
                    title: t('SessionExpiringSoonTitle'),
                    message: t('SessionExpiringSoon', Math.round(warnBeforeMs / 60_000)),
                    duration: 0,
                }),
            remaining - warnBeforeMs
        );
    later(endExpiredSession, remaining - 30_000);
}

let watching = false;

/** Keeps tabs in step: logging out (or in) in one tab updates the others. */
export function watchAuthAcrossTabs(): void {
    if (watching) return;
    watching = true;
    window.addEventListener('storage', (event) => {
        if (event.key !== storageKeys.auth) return;
        if (!event.newValue && location.pathname.startsWith('/app')) location.assign('/account/login');
        else scheduleExpiry();
    });
}
