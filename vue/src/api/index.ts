import axios from 'axios';
import { ElMessage } from 'element-plus';
import { apiBaseUrl, appBaseUrlTemplate } from '../config';
import { pinia, useSessionStore } from '../store';
import { loadMessages, t, tOr } from '../locales';
import { errorMessage, isUnauthorized, type AbpEnvelope } from '../utils/errors';
import { resolveTenancyName } from '../utils/tenancy';
import { accessToken, clearToken, endExpiredSession, scheduleExpiry, tokenStatus, watchAuthAcrossTabs } from './auth';
import { readItem, storageKeys, writeItem } from './storage';
import {
    TenantAvailabilityState,
    type IsTenantAvailableOutput,
    type SessionInfo,
    type UserConfiguration,
} from './types';

export { t, tOr };

export const state = useSessionStore(pinia);

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    params?: object;
    /** Skip the automatic error toast, for callers that report errors themselves. */
    silent?: boolean;
}

export async function api<T>(path: string, { method = 'GET', data, params, silent }: RequestOptions = {}): Promise<T> {
    // An expired token is never sent; the session ends and the user is sent back to login.
    if (tokenStatus() === 'expired') endExpiredSession();
    const token = accessToken();
    const tenant = readItem(storageKeys.tenantId);
    const culture = readItem(storageKeys.culture);
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
        // 401 with a token: the server no longer accepts it (expired, revoked or signing key changed).
        if (isUnauthorized(error) && token) endExpiredSession();
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
            writeItem(storageKeys.tenantId, String(tenant.tenantId));
    }
    state.config = await api<UserConfiguration>('/AbpUserConfiguration/GetAll');
    if (state.config) loadMessages(state.config);
    state.session = await service<SessionInfo>('Session', 'GetCurrentLoginInformations');
    if (state.session?.user) {
        scheduleExpiry();
        watchAuthAcrossTabs();
    }
}

/**
 * Whether the current user holds `name`. This only controls what the UI shows;
 * the backend must still authorize every request.
 */
export function permitted(name: string): boolean {
    return !!state.config?.auth?.grantedPermissions?.[name];
}

export function logout(): void {
    clearToken();
    location.href = '/account/login';
}
