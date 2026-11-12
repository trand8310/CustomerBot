import { service } from './index';
import { crudApi } from './crud';
import type { ListResult, PermissionDto, RoleDto, RoleForEditOutput, RoleForm } from './types';

export const roleApi = {
    ...crudApi<RoleDto, RoleForm>('Role'),
    getForEdit: (id: number) => service<RoleForEditOutput>('Role', 'GetRoleForEdit', { params: { Id: id } }),
    getPermissions: () => service<ListResult<PermissionDto>>('Role', 'GetAllPermissions'),
};
