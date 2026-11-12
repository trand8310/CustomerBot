import { defineStore } from 'pinia';
import type { NavigationItem } from '../api/navigation';
import { collectPages } from '../utils/navigation';

export { collectPages };

export const useNavigationStore = defineStore('navigation', {
    state: () => ({
        items: null as NavigationItem[] | null,
    }),
    getters: {
        pages: (state) => collectPages(state.items ?? []),
    },
});
