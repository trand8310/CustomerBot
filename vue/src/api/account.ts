import { api, service } from './index';
import type { AuthenticateResult, IsTenantAvailableOutput, RegisterOutput } from './types';

export interface AuthenticateInput {
    userNameOrEmailAddress: string;
    password: string;
    rememberClient: boolean;
}

export interface RegisterInput {
    name: string;
    surname: string;
    userName: string;
    emailAddress: string;
    password: string;
}

export const accountApi = {
    authenticate: (data: AuthenticateInput) =>
        api<AuthenticateResult>('/api/TokenAuth/Authenticate', { method: 'POST', data }),
    register: (data: RegisterInput) => service<RegisterOutput>('Account', 'Register', { method: 'POST', data }),
    isTenantAvailable: (tenancyName: string) =>
        service<IsTenantAvailableOutput>('Account', 'IsTenantAvailable', { method: 'POST', data: { tenancyName } }),
};
