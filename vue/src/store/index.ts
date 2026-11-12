import { createPinia, defineStore } from 'pinia';
import type { SessionInfo, UserConfiguration } from '../api/types';

export type { SessionInfo } from '../api/types';

export const pinia = createPinia();
export const useSessionStore = defineStore('session', {
    state: () => ({ config: null as UserConfiguration | null, session: null as SessionInfo | null }),
});
