import { create } from 'zustand';

type Locale = 'es' | 'en' | 'ca';
type UiState = {
  darkMode: boolean;
  toggleDark: () => void;
  lang: Locale;
  switchLang: () => void;      // compat: sigue existiendo
  setLang: (lang: Locale) => void; // 👈 NUEVO
};

export const useUi = create<UiState>((set, get) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  toggleDark: () =>
    set((s) => {
      const next = !s.darkMode;
      localStorage.setItem('darkMode', String(next));
      return { darkMode: next };
    }),

  lang: (localStorage.getItem('lang') as Locale) || 'es',
  setLang: (lang) => {          // 👈 NUEVO
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  switchLang: () => {           // (opcional) dejamos el ciclo por compatibilidad
    const order: Locale[] = ['es', 'en', 'ca'];
    const cur = get().lang;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    get().setLang(next);
  }
}));
