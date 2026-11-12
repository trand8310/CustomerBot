import { defineStore } from 'pinia';
import type { NavigationItem, NavigationPage } from '../api/navigation';

export function collectPages(items: NavigationItem[]): NavigationPage[] {
    return items.flatMap((item) =>
        item.type === 'group' ? collectPages(item.children) : item.type === 'page' ? [item] : []
    );
}

export const useNavigationStore = defineStore('navigation', {
    state: () => ({
        items: null as NavigationItem[] | null,
    }),
    getters: {
        pages: (state) => collectPages(state.items ?? []),
    },
});
