import { useUi } from '../state/uiStore';
import { TRAIT_SUGGESTIONS as es } from './traits.es';
import { TRAIT_SUGGESTIONS as en } from './traits.en';
import { TRAIT_SUGGESTIONS as ca } from './traits.ca';

const dict = { es, en, ca } as const;

export function useTraitSuggestions() {
  const { lang } = useUi();
  return dict[lang as keyof typeof dict] ?? es;
}
