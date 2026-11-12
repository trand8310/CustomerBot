import { service } from './index';
import { crudApi } from './crud';
export const userApi = {
    ...crudApi('User'),
    getRoles: () => service('User', 'GetRoles'),
    resetPassword: (data: unknown) => service('User', 'ResetPassword', { method: 'POST', data }),
    changePassword: (data: unknown) => service('User', 'ChangePassword', { method: 'POST', data }),
    changeLanguage: (languageName: string) =>
        service('User', 'ChangeLanguage', { method: 'POST', data: { languageName } }),
};
