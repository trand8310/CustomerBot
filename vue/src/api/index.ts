import axios from 'axios';
import { ElMessage } from 'element-plus';
import { apiBaseUrl, appBaseUrlTemplate } from '../config';
import { pinia, useSessionStore } from '../store';
import { cultureCookie, loadMessages, t, tOr } from '../locales';
import { readCookie, serializeCookie } from '../utils/cookies';
import { errorMessage, isUnauthorized, type AbpEnvelope } from '../utils/errors';
import { resolveTenancyName } from '../utils/tenancy';
import {
    TenantAvailabilityState,
    type IsTenantAvailableOutput,
    type SessionInfo,
    type UserConfiguration,
} from './types';

export { t, tOr };

export const state = useSessionStore(pinia);

export const authTokenCookie = 'Abp.AuthToken';
export const encryptedTokenCookie = 'enc_auth_token';
export const tenantCookie = 'Abp.TenantId';

/** Decoded cookie value, or '' when absent. */
export function cookie(name: string): string {
    return readCookie(document.cookie, name);
}

/**
 * Writes a cookie readable by this app. Secure is added automatically on HTTPS pages.
 * These cookies cannot be HttpOnly because the app must read the token to send it as a
 * Bearer header; moving to HttpOnly cookies needs a backend change (see readme).
 */
export function setCookie(name: string, value: string | number, maxAge?: number): void {
    document.cookie = serializeCookie(name, value, { maxAge, secure: location.protocol === 'https:' });
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    params?: object;
    /** Skip the automatic error toast, for callers that report errors themselves. */
    silent?: boolean;
}

function clearAuthCookies(): void {
    setCookie(authTokenCookie, '', 0);
    setCookie(encryptedTokenCookie, '', 0);
}

export async function api<T>(path: string, { method = 'GET', data, params, silent }: RequestOptions = {}): Promise<T> {
    const token = cookie(authTokenCookie);
    const tenant = cookie(tenantCookie);
    const culture = cookie(cultureCookie);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (tenant) headers['Abp.TenantId'] = tenant;
    if (culture) headers['.AspNetCore.Culture'] = `c=${culture}|uic=${culture}`;
    try {
        const response = await axios.request<unknown>({
            url: apiBaseUrl + path,
            method,
            data,
            params: Object.fromEntries(
                Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
            ),
            headers,
        });
        const body = response.data;
        const envelope = body && typeof body === 'object' ? (body as AbpEnvelope<T>) : undefined;
        if (envelope?.success === false)
            throw Object.assign(new Error(envelope.error?.message || 'Request failed'), { abp: envelope });
        if (envelope && Object.hasOwn(envelope, 'result')) return envelope.result as T;
        return body as T;
    } catch (error) {
        if (isUnauthorized(error) && token) {
            clearAuthCookies();
            if (!location.pathname.startsWith('/account/')) location.assign('/account/login');
        }
        if (!silent) ElMessage.error(errorMessage(error, t('NetworkRequestFailed')));
        throw error;
    }
}

/** Calls an ABP application service: /api/services/app/{name}/{action}. */
export function service<T>(name: string, action: string, options?: RequestOptions): Promise<T> {
    return api<T>(`/api/services/app/${name}/${action}`, options);
}

export async function initialize(): Promise<void> {
    const tenantName = resolveTenancyName(location.href, appBaseUrlTemplate);
    if (tenantName) {
        const tenant = await service<IsTenantAvailableOutput>('Account', 'IsTenantAvailable', {
            method: 'POST',
            data: { tenancyName: tenantName },
        });
        if (tenant.state === TenantAvailabilityState.Available && tenant.tenantId !== undefined)
            setCookie(tenantCookie, tenant.tenantId);
    }
    state.config = await api<UserConfiguration>('/AbpUserConfiguration/GetAll');
    if (state.config) loadMessages(state.config);
    state.session = await service<SessionInfo>('Session', 'GetCurrentLoginInformations');
}

/**
 * Whether the current user holds `name`. This only controls what the UI shows;
 * the backend must still authorize every request.
 */
export function permitted(name: string): boolean {
    return !!state.config?.auth?.grantedPermissions?.[name];
}

export function logout(): void {
    clearAuthCookies();
    location.href = '/account/login';
}
