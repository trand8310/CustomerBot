import { api, service } from './index';
export const accountApi = {
    authenticate: (data: unknown) => api('/api/TokenAuth/Authenticate', { method: 'POST', data }),
    register: (data: unknown) => service('Account', 'Register', { method: 'POST', data }),
    isTenantAvailable: (tenancyName: string) =>
        service('Account', 'IsTenantAvailable', { method: 'POST', data: { tenancyName } }),
};
