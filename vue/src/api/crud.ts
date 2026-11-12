import { service } from './index';
export function crudApi(name: 'User' | 'Role' | 'Tenant') {
    return {
        getAll: (params: Record<string, unknown>) => service(name, 'GetAll', { params }),
        get: (id: number) => service(name, 'Get', { params: { Id: id } }),
        create: (data: unknown) => service(name, 'Create', { method: 'POST', data }),
        update: (data: unknown) => service(name, 'Update', { method: 'PUT', data }),
        delete: (id: number) => service(name, 'Delete', { method: 'DELETE', params: { Id: id } }),
    };
}
