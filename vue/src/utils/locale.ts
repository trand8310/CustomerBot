/** Element Plus locale files this app can load, keyed by their file name. */
export const elementLocaleKeys = [
    'en',
    'zh-cn',
    'zh-tw',
    'zh-hk',
    'ar',
    'de',
    'es',
    'fa',
    'fr',
    'it',
    'ja',
    'ko',
    'lt',
    'nl',
    'pt',
    'pt-br',
    'ru',
    'sk',
    'sv',
    'tr',
    'vi',
] as const;

export type ElementLocaleKey = (typeof elementLocaleKeys)[number];

/** Maps an ABP language name such as "zh-Hans", "pt-BR" or "es-MX" to an Element Plus locale file. */
export function elementLocaleKey(languageName: string): ElementLocaleKey {
    const name = languageName.toLowerCase().replaceAll('_', '-');
    const [base] = name.split('-');
    if (base === 'zh') {
        if (name === 'zh-hk' || name === 'zh-mo') return 'zh-hk';
        if (name.startsWith('zh-hant') || name === 'zh-tw') return 'zh-tw';
        return 'zh-cn';
    }
    if (name === 'pt-br') return 'pt-br';
    const known = elementLocaleKeys as readonly string[];
    if (known.includes(name)) return name as ElementLocaleKey;
    if (known.includes(base)) return base as ElementLocaleKey;
    return 'en';
}
