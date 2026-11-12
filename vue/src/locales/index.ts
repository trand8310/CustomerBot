import { createI18n } from 'vue-i18n';
export const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: {} });
export function loadMessages(config: Record<string, any>) {
    const locale = config.localization?.currentLanguage?.name || 'en';
    i18n.global.setLocaleMessage(locale, config.localization?.sources?.CustomerBot || {});
    i18n.global.locale.value = locale;
    document.documentElement.lang = locale.replaceAll('_', '-');
}
