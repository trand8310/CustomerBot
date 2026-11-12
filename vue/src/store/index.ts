import { createPinia, defineStore } from 'pinia';
export interface SessionInfo {
    user?: Record<string, any> | null;
    tenant?: Record<string, any> | null;
    application?: Record<string, any>;
}
export const pinia = createPinia();
export const useSessionStore = defineStore('session', {
    state: () => ({ config: null as Record<string, any> | null, session: null as SessionInfo | null }),
});
