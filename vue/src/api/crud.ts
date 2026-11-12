import { service } from './index';
import type { PagedQuery, PagedResult } from './types';

export type CrudEntity = 'User' | 'Role' | 'Tenant';

export interface CrudApi<TDto, TForm> {
    getAll(params: PagedQuery): Promise<PagedResult<TDto>>;
    get(id: number): Promise<TDto>;
    create(data: TForm): Promise<TDto>;
    update(data: TForm): Promise<TDto>;
    delete(id: number): Promise<void>;
}

export function crudApi<TDto, TForm>(name: CrudEntity): CrudApi<TDto, TForm> {
    return {
        getAll: (params) => service(name, 'GetAll', { params }),
        get: (id) => service(name, 'Get', { params: { Id: id } }),
        create: (data) => service(name, 'Create', { method: 'POST', data }),
        update: (data) => service(name, 'Update', { method: 'PUT', data }),
        delete: (id) => service(name, 'Delete', { method: 'DELETE', params: { Id: id } }),
    };
}
