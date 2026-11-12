import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        /** ABP permission required to open the route. */
        permission?: string;
    }
}

export {};
