import { shallowRef } from 'vue';
import type { UserConfiguration } from '../api/types';
import { readCookie } from '../utils/cookies';
import { formatMessage } from '../utils/format';
import { builtInMessages, type MessageDictionary } from './messages';

export const cultureCookie = 'Abp.Localization.CultureName';

function builtInFor(locale: string): MessageDictionary {
    const lang = locale.split(/[-_]/)[0].toLowerCase();
    return { ...builtInMessages.en, ...(builtInMessages[lang] ?? {}) };
}

function initialLocale(): string {
    if (typeof document === 'undefined') return 'en';
    return readCookie(document.cookie, cultureCookie) || navigator.language || 'en';
}

/** Current language name, e.g. "en" or "zh-Hans". */
export const locale = shallowRef(initialLocale());

/**
 * Active dictionary: built-in English, then built-in messages for the current language,
 * then the backend's CustomerBot localization source, which always wins.
 */
const messages = shallowRef<MessageDictionary>(builtInFor(locale.value));

export function loadMessages(config: UserConfiguration): void {
    const name = config.localization?.currentLanguage?.name || 'en';
    const backend = config.localization?.sources?.CustomerBot ?? {};
    locale.value = name;
    messages.value = { ...builtInFor(name), ...backend };
    document.documentElement.lang = name.replaceAll('_', '-');
}

export function hasMessage(key: string): boolean {
    return Object.hasOwn(messages.value, key);
}

/** Translates `key` when a translation exists, otherwise returns `fallback` (used for menu titles). */
export function tOr(key: string | undefined, fallback: string): string {
    return key && hasMessage(key) ? t(key) : fallback;
}

/** Translates `key` and fills `{0}`-style placeholders. Unknown keys are returned as-is. */
export function t(key: string, ...args: unknown[]): string {
    const dictionary = messages.value;
    return formatMessage(Object.hasOwn(dictionary, key) ? dictionary[key] : key, args);
}
