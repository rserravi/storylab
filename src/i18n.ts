import { useUi } from './state/uiStore';

const dict = {
  es: {
    projects: 'Proyectos',
    storyMachine: 'Story Machine',
    storyDraft: 'Story Draft',
    logout: 'Salir'
  },
  en: {
    projects: 'Projects',
    storyMachine: 'Story Machine',
    storyDraft: 'Story Draft',
    logout: 'Log out'
  }
} as const;

export function useT() {
  const { lang } = useUi();
  return (k: keyof typeof dict['es']) => dict[lang][k] || String(k);
}
