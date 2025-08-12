import { create } from 'zustand';

type UiState = {
  darkMode: boolean;
  lang: 'es' | 'en';
  toggleDark: () => void;
  switchLang: (lang?: 'es'|'en') => void;
};

const LS_DARK = 'ui_dark';
const LS_LANG = 'ui_lang';

export const useUi = create<UiState>((set, get) => ({
  darkMode: localStorage.getItem(LS_DARK) === '1',
  lang: (localStorage.getItem(LS_LANG) as 'es'|'en') || 'es',
  toggleDark: () => set(s => {
    const next = !s.darkMode;
    localStorage.setItem(LS_DARK, next ? '1' : '0');
    return { darkMode: next };
  }),
  switchLang: (lang) => set(s => {
    const next = lang || (s.lang === 'es' ? 'en' : 'es');
    localStorage.setItem(LS_LANG, next);
    return { lang: next };
  })
}));
