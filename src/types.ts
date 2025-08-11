export type User = { id: string; email: string; name: string };
export type Project = { id: string; name: string; createdAt: string };
export type TurningPointType = 'inciting'|'lockin'|'midpoint'|'crisis'|'climax';

export type Scene = {
  id: string; number: number; slugline: string; characters: string[];
  synopsis: string; isKey: boolean;
};

export type Screenplay = {
  id: string; title: string; projectId: string;
  synopsis?: string; treatment?: string;
  turningPoints?: { id: string; type: TurningPointType; summary: string }[];
  characters?: { id: string; name: string; bio?: string }[];
  subplots?: { id: string; name: string; purpose?: string; beats?: string[] }[];
  scenes: Scene[];
};
