import { useUi } from '../state/uiStore';
import { TRAIT_SUGGESTIONS as ES } from './traits.es';
import { TRAIT_SUGGESTIONS as EN } from './traits.en';
import { TRAIT_SUGGESTIONS as CA } from './traits.ca';

type Locale = 'es' | 'en' | 'ca';
const MAP: Record<Locale, readonly string[]> = { es: ES, en: EN, ca: CA };

export function useTraitSuggestions() {
  const { lang } = useUi();
  return MAP[lang as Locale];

}
