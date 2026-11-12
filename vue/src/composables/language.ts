import { computed } from 'vue';
import { setCookie, state } from '../api';
import { userApi } from '../api/users';
import { cultureCookie } from '../locales';

const fiveYears = 5 * 365 * 86400;

export async function changeLanguage(languageName: string): Promise<void> {
    if (state.session?.user) await userApi.changeLanguage(languageName);
    setCookie(cultureCookie, languageName, fiveYears);
    location.reload();
}

/** Enabled languages and the current one, for the language switcher. */
export function useLanguages() {
    const languages = computed(() => (state.config?.localization?.languages ?? []).filter((x) => !x.isDisabled));
    const currentLanguage = computed(() => state.config?.localization?.currentLanguage?.name);
    return { languages, currentLanguage, changeLanguage };
}
