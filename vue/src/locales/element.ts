import en from 'element-plus/es/locale/lang/en';
import { elementLocaleKey, type ElementLocaleKey } from '../utils/locale';

export type ElementLocale = typeof en;
export { en as defaultElementLocale };

type Loader = () => Promise<{ default: ElementLocale }>;

/** Each non-English locale becomes its own small chunk, loaded only when that language is active. */
const loaders: Record<Exclude<ElementLocaleKey, 'en'>, Loader> = {
    'zh-cn': () => import('element-plus/es/locale/lang/zh-cn'),
    'zh-tw': () => import('element-plus/es/locale/lang/zh-tw'),
    'zh-hk': () => import('element-plus/es/locale/lang/zh-hk'),
    ar: () => import('element-plus/es/locale/lang/ar'),
    de: () => import('element-plus/es/locale/lang/de'),
    es: () => import('element-plus/es/locale/lang/es'),
    fa: () => import('element-plus/es/locale/lang/fa'),
    fr: () => import('element-plus/es/locale/lang/fr'),
    it: () => import('element-plus/es/locale/lang/it'),
    ja: () => import('element-plus/es/locale/lang/ja'),
    ko: () => import('element-plus/es/locale/lang/ko'),
    lt: () => import('element-plus/es/locale/lang/lt'),
    nl: () => import('element-plus/es/locale/lang/nl'),
    pt: () => import('element-plus/es/locale/lang/pt'),
    'pt-br': () => import('element-plus/es/locale/lang/pt-br'),
    ru: () => import('element-plus/es/locale/lang/ru'),
    sk: () => import('element-plus/es/locale/lang/sk'),
    sv: () => import('element-plus/es/locale/lang/sv'),
    tr: () => import('element-plus/es/locale/lang/tr'),
    vi: () => import('element-plus/es/locale/lang/vi'),
};

export async function loadElementLocale(languageName: string): Promise<ElementLocale> {
    const key = elementLocaleKey(languageName);
    if (key === 'en') return en;
    try {
        return (await loaders[key]()).default;
    } catch {
        return en;
    }
}
