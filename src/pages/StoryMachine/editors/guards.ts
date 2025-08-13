import type { Screenplay, TurningPointType, IdeaRow, UniversalTheme, Scene } from '../../../types';

export const hasMinSynopsis = (synopsis?: string) => (synopsis?.trim().split(/\s+/).length || 0) >= 120;

export const hasFiveTurningPoints = (
  tps?: { type: TurningPointType; summary: string }[]
) => {
  const required: TurningPointType[] = ['inciting','lockin','midpoint','crisis','climax'];
  const types = new Set((tps||[]).map(t=>t.type));
  return required.every(r => types.has(r)) && (tps||[]).every(t=>t.summary.trim().length >= 10);
};

export const hasTreatmentLength = (t?: string) => {
  const words = (t?.trim().split(/\s+/).length || 0);
  return words >= 600 && words <= 1500; // ~2–5 páginas aprox
};

export const hasProtagonist = (chars?: { name: string; isProtagonist?: boolean }[]) =>
  !!(chars||[]).find(c => c.isProtagonist && c.name.trim().length > 1);

export const hasLinkedSubplots = (subs?: { name: string; ownerId?: string }[]) =>
  (subs||[]).every(s => s.name.trim() && s.ownerId);

export const hasMinKeyScenes = (scenes?: Scene[]) =>
  (scenes||[]).filter(s => s.isKey).length >= 5;

export const hasAllScenes = (scenes?: unknown[]) => (scenes||[]).length >= 30; // mock

const CAUSAL_RE = /(conduce a|lleva a|provoca|desemboca en|termina en|da lugar a)/i;

export const isValidIdea = (s?: string) => {
  const n = (s || '').trim();
  return n.length >= 8 && n.length <= 140;
};

export const isValidPremise = (s?: string) => {
  const n = (s || '').trim();
  return n.length >= 12 && CAUSAL_RE.test(n);
};

export const isValidTheme = (t?: UniversalTheme) => !!t;

export const isValidIdeaRow = (r: IdeaRow) =>
  isValidIdea(r.idea) && isValidPremise(r.premise) && isValidTheme(r.mainTheme);
