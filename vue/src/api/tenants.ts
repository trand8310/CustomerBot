import { crudApi } from './crud';
import type { TenantDto, TenantForm } from './types';

export const tenantApi = crudApi<TenantDto, TenantForm>('Tenant');
