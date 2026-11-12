import { createI18n, type MessageCompiler } from 'vue-i18n';
import type { UserConfiguration } from '../api/types';
import { readItem, storageKeys } from '../api/storage';
import { builtInMessages, type MessageDictionary } from './messages';

function builtInFor(locale: string): MessageDictionary {
    const lang = locale.split(/[-_]/)[0].toLowerCase();
    return { ...builtInMessages.en, ...(builtInMessages[lang] ?? {}) };
}

function initialLocale(): string {
    if (typeof document === 'undefined') return 'en';
    return readItem(storageKeys.culture) || navigator.language || 'en';
}

/**
 * Backend (ABP) texts use `{0}`-style placeholders and may contain characters such as `@` or `|`
 * that vue-i18n's default syntax treats specially. This compiler keeps them literal and fills
 * `{0}` from list arguments and `{name}` from named arguments.
 */
const abpMessageCompiler: MessageCompiler = (message) => {
    const template = typeof message === 'string' ? message : '';
    return (ctx) =>
        template.replace(/\{(\w+)\}/g, (match, key: string) => {
            const value = /^\d+$/.test(key) ? ctx.list(Number(key)) : ctx.named(key);
            return value === undefined || value === null ? match : String(value);
        });
};

const startLocale = initialLocale();

export const i18n = createI18n({
    legacy: false,
    locale: startLocale,
    fallbackLocale: false,
    messages: { [startLocale]: builtInFor(startLocale) },
    messageCompiler: abpMessageCompiler,
    missingWarn: false,
    fallbackWarn: false,
});

/**
 * Loads the active language: built-in English, then built-in messages for that language,
 * then the backend's CustomerBot localization source, which always wins.
 */
export function loadMessages(config: UserConfiguration): void {
    const name = config.localization?.currentLanguage?.name || 'en';
    const backend = config.localization?.sources?.CustomerBot ?? {};
    i18n.global.setLocaleMessage(name, { ...builtInFor(name), ...backend });
    i18n.global.locale.value = name;
    document.documentElement.lang = name.replaceAll('_', '-');
}

/**
 * Translates `key` and fills `{0}`-style placeholders. Unknown keys are returned as-is.
 * In components you can equally use `$t` or `useI18n().t`; this helper is for plain TypeScript.
 */
export function t(key: string, ...args: unknown[]): string {
    return args.length ? i18n.global.t(key, args) : i18n.global.t(key);
}

/** Translates `key` when a translation exists, otherwise returns `fallback` (used for menu titles). */
export function tOr(key: string | undefined, fallback: string): string {
    return key && i18n.global.te(key) ? t(key) : fallback;
}
