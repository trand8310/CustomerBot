import axios from 'axios';
import { ElMessage } from 'element-plus';
import { pinia, useSessionStore } from '../store';
import { i18n, loadMessages } from '../locales';
const base = (import.meta.env.VITE_API_BASE_URL || 'https://localhost:44311').replace(/\/$/, '');
export const state = useSessionStore(pinia);
export function cookie(name: string): string {
    return (
        document.cookie
            .split('; ')
            .find((x) => x.startsWith(name + '='))
            ?.split('=')
            .slice(1)
            .join('=') || ''
    );
}
export function setCookie(name: string, value: string | number, maxAge?: number) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${maxAge !== undefined ? `; max-age=${maxAge}` : ''}`;
}
export async function api(
    path: string,
    { method = 'GET', data, params }: { method?: string; data?: unknown; params?: Record<string, unknown> } = {}
): Promise<any> {
    const token = decodeURIComponent(cookie('Abp.AuthToken'));
    const tenant = decodeURIComponent(cookie('Abp.TenantId'));
    const culture = decodeURIComponent(cookie('Abp.Localization.CultureName'));
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (tenant) headers['Abp.TenantId'] = tenant;
    if (culture) headers['.AspNetCore.Culture'] = `c=${culture}|uic=${culture}`;
    try {
        const response = await axios.request({
            url: base + path,
            method,
            data,
            params: Object.fromEntries(
                Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
            ),
            headers,
        });
        const result = response.data;
        if (result?.success === false)
            throw Object.assign(new Error(result.error?.message || 'Request failed'), { abp: result });
        return result && Object.prototype.hasOwnProperty.call(result, 'result') ? result.result : result;
    } catch (error: any) {
        const result = error.response?.data || error.abp;
        const details = result?.error?.validationErrors?.map((x: any) => x.message).join('\n');
        const message = details || result?.error?.details || result?.error?.message || error.message || '网络请求失败';
        if ((error.response?.status === 401 || result?.unAuthorizedRequest) && token) {
            setCookie('Abp.AuthToken', '', 0);
            setCookie('enc_auth_token', '', 0);
            if (!location.pathname.startsWith('/account/')) location.assign('/account/login');
        }
        ElMessage.error(message);
        throw error;
    }
}
export const service = (name: string, action: string, options?: Parameters<typeof api>[1]) =>
    api(`/api/services/app/${name}/${action}`, options);
export async function initialize() {
    const template = import.meta.env.VITE_APP_BASE_URL || '';
    let tenantName = new URLSearchParams(location.search).get('abp_tenancy_name');
    if (template.includes('{TENANCY_NAME}')) {
        const [prefix, suffix] = template.split('{TENANCY_NAME}');
        if (location.href.startsWith(prefix)) {
            const rest = location.href.slice(prefix.length);
            const end = rest.indexOf(suffix);
            if (end > 0) tenantName = rest.slice(0, end);
        }
    }
    if (tenantName) {
        const tenant = await service('Account', 'IsTenantAvailable', {
            method: 'POST',
            data: { tenancyName: tenantName },
        });
        if (tenant.state === 1) setCookie('Abp.TenantId', tenant.tenantId);
    }
    state.config = await api('/AbpUserConfiguration/GetAll');
    if (state.config) loadMessages(state.config);
    state.session = await service('Session', 'GetCurrentLoginInformations');
}
export function t(key: string, fallback?: string, ...args: any[]) {
    if (i18n.global.te(key)) return String(i18n.global.t(key, args));
    let value = fallback || key;
    args.forEach((arg, i) => {
        value = value.replaceAll(`{${i}}`, arg);
    });
    return value;
}
export function permitted(name: string) {
    return !!state.config?.auth?.grantedPermissions?.[name];
}
export function logout() {
    setCookie('Abp.AuthToken', '', 0);
    setCookie('enc_auth_token', '', 0);
    location.href = '/account/login';
}
