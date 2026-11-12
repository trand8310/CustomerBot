import { service } from './index';
import { crudApi } from './crud';
import type { ListResult, RoleDto, UserDto, UserForm } from './types';

export interface ResetPasswordInput {
    userId: number;
    adminPassword: string;
    newPassword: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export const userApi = {
    ...crudApi<UserDto, UserForm>('User'),
    getRoles: () => service<ListResult<RoleDto>>('User', 'GetRoles'),
    resetPassword: (data: ResetPasswordInput) => service<boolean>('User', 'ResetPassword', { method: 'POST', data }),
    changePassword: (data: ChangePasswordInput) => service<boolean>('User', 'ChangePassword', { method: 'POST', data }),
    changeLanguage: (languageName: string) =>
        service<void>('User', 'ChangeLanguage', { method: 'POST', data: { languageName } }),
};
