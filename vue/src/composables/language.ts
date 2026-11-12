import { setCookie, state } from '../api';
import { userApi } from '../api/users';
export async function changeLanguage(languageName: string) {
    if (state.session?.user) await userApi.changeLanguage(languageName);
    setCookie('Abp.Localization.CultureName', languageName, 5 * 365 * 86400);
    location.reload();
}
