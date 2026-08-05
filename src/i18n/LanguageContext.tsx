import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDict, type Dict } from './dict';

export type Lang = 'he' | 'en';

/** English lives under /en/… ; Hebrew keeps the bare paths it has always had. */
export const EN_PREFIX = '/en';

const LanguageContext = createContext<Lang>('he');

export const useLang = () => useContext(LanguageContext);
export const useDir = () => (useLang() === 'he' ? 'rtl' : 'ltr');

/** The strings for the current language. */
export const useT = (): Dict => getDict(useContext(LanguageContext));

/** Strip the /en prefix so route matching and links stay language-agnostic. */
export function stripLangPrefix(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(EN_PREFIX + '/')) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

export function langFromPath(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(EN_PREFIX + '/') ? 'en' : 'he';
}

/** Build the href for a route in a given language. */
export function localizePath(path: string, lang: Lang): string {
  const bare = stripLangPrefix(path);
  if (lang === 'he') return bare;
  return bare === '/' ? EN_PREFIX : EN_PREFIX + bare;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'he' ? 'rtl' : 'ltr';
  }, [lang]);

  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>;
}
