import type { NavigationItem, NavigationPage } from '../api/navigation';

/** Flattens navigation groups into the list of routable pages, in menu order. */
export function collectPages(items: readonly NavigationItem[]): NavigationPage[] {
    return items.flatMap((item) =>
        item.type === 'group' ? collectPages(item.children) : item.type === 'page' ? [item] : []
    );
}
