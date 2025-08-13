import { createFilterOptions } from '@mui/material/Autocomplete';
import type { Character } from '../../../types';

export const ARCH_CODE: Record<string, 'hero' | 'mentor' | 'threshold' | 'herald' | 'trickster' | 'shadow' | 'shapeshifter'> = {
  'Héroe': 'hero',
  'Mentor': 'mentor',
  'Guardián (del umbral)': 'threshold',
  'Heraldo': 'herald',
  'Pícaro / Embaucador': 'trickster',
  'Sombra': 'shadow',
  'Camaleón / Cambiante': 'shapeshifter',
};

export const CONFLICT_CODE: Record<string, 'extrapersonal' | 'personal' | 'internal'> = {
  'Extrapersonal': 'extrapersonal',
  'Personal': 'personal',
  'Interno': 'internal',
};

export const filterOptions = createFilterOptions<string>({
  ignoreAccents: true,
  ignoreCase: true,
  matchFrom: 'any',
  limit: 50,
});

export function createEmpty(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    archetypes: [],
    nature: [],
    attitude: [],
    needGlobal: '',
    needH1: '',
    needH2: '',
    arc: '',
    conflictLevel: 'Interno',
    conflictDesc: '',
    relations: [],
    paradoxes: '',
    biography: '',
    voice: '',
  };
}

export function summarizeInline(list?: string[], max = 3) {
  const safe = (list ?? []).map((s) => s.trim()).filter(Boolean);
  const shown = safe.slice(0, max);
  const rest = Math.max(0, safe.length - shown.length);
  return { text: shown.join(' · '), rest, full: safe.join(' · ') };
}

export function dedupeStrings(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

export function normalizeDraft(d: Character): Character {
  return {
    ...d,
    name: (d.name || '').trim(),
    archetypes: dedupeStrings(d.archetypes),
    nature: dedupeStrings(d.nature),
    attitude: dedupeStrings(d.attitude),
    needGlobal: (d.needGlobal || '').trim(),
    needH1: (d.needH1 || '').trim(),
    needH2: (d.needH2 || '').trim(),
    arc: (d.arc || '').trim(),
    conflictDesc: (d.conflictDesc || '').trim(),
    relations: (d.relations || []).map((r) => ({ ...r, description: (r.description || '').trim() })),
    paradoxes: (d.paradoxes || '').trim(),
    biography: (d.biography || '').trim(),
    voice: (d.voice || '').trim(),
  };
}

