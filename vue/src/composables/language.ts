import { computed } from 'vue';
import { state } from '../api';
import { storageKeys, writeItem } from '../api/storage';
import { userApi } from '../api/users';

export async function changeLanguage(languageName: string): Promise<void> {
    if (state.session?.user) await userApi.changeLanguage(languageName);
    writeItem(storageKeys.culture, languageName);
    location.reload();
}

/** Enabled languages and the current one, for the language switcher. */
export function useLanguages() {
    const languages = computed(() => (state.config?.localization?.languages ?? []).filter((x) => !x.isDisabled));
    const currentLanguage = computed(() => state.config?.localization?.currentLanguage?.name);
    return { languages, currentLanguage, changeLanguage };
}
