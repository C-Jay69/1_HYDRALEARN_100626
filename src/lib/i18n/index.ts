import { defaultLocale, type Locale } from './config';
import { en, type MessageKey } from './en';
import { es } from './es';

export {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  localeNames,
  locales,
} from './config';
export type { Locale } from './config';
export type { MessageKey } from './en';
export { en, es };

export type Messages = Record<MessageKey, string>;
export type TranslationVars = Record<string, string | number>;

export const dictionaries: Record<Locale, Messages> = { en, es };

/** Translate a key, interpolating `{placeholders}` with `vars`. */
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: TranslationVars
): string {
  const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
  const template = dictionary[key] ?? dictionaries[defaultLocale][key] ?? key;
  if (!vars) return template;

  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : `{${name}}`
  );
}
