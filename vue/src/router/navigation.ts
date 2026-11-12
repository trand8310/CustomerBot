import router from './index';
import { fetchNavigation } from '../api/navigation';
import { pinia } from '../store';
import { collectPages, useNavigationStore } from '../store/navigation';

const pages = {
    home: { component: () => import('../views/home/home.vue') },
    users: { component: () => import('../views/users/users.vue'), permission: 'Pages.Users' },
    roles: { component: () => import('../views/roles/roles.vue'), permission: 'Pages.Roles' },
    tenants: { component: () => import('../views/tenants/tenants.vue'), permission: 'Pages.Tenants' },
    'update-password': { component: () => import('../views/change-password/change-password.vue') },
} as const;

function getPage(name: string) {
    if (!Object.hasOwn(pages, name)) throw new Error('Unknown navigation page: ' + name);
    return pages[name as keyof typeof pages];
}

export async function initializeNavigation() {
    const store = useNavigationStore(pinia);
    if (store.items) return;

    const items = await fetchNavigation();
    const records = collectPages(items);
    const names = new Set<string>();
    const paths = new Set<string>();

    for (const record of records) {
        getPage(record.page);
        if (names.has(record.page) || paths.has(record.path)) {
            throw new Error('Duplicate navigation route: ' + record.page);
        }
        names.add(record.page);
        paths.add(record.path);
    }
    if (!names.has('home')) throw new Error('Missing default navigation page: home');

    for (const record of records) {
        const page = getPage(record.page);
        router.addRoute('app', {
            path: record.path,
            name: record.page,
            component: page.component,
            meta: { permission: 'permission' in page ? page.permission : undefined },
        });
    }

    store.items = items;
}
