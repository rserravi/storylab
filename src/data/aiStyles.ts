export const AI_STYLES = [
  'cinematic',
  'noir',
  'western',
  'sciFi',
  'fantasy',
  'thriller',
  'romance',
  'horror',
  'animation',
] as const;

export type AIStyle = typeof AI_STYLES[number];
