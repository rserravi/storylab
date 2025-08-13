export const ARCHETYPES = [
  'hero',
  'mentor',
  'threshold',
  'herald',
  'trickster',
  'shadow',
  'shapeshifter'
] as const;

export type ArchetypeCode = typeof ARCHETYPES[number];
