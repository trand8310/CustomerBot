import { service } from './index';
import { crudApi } from './crud';
export const roleApi = {
    ...crudApi('Role'),
    getForEdit: (id: number) => service('Role', 'GetRoleForEdit', { params: { Id: id } }),
    getPermissions: () => service('Role', 'GetAllPermissions'),
};
