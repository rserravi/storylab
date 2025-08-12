export type User = { id: string; email: string; name: string };
export type Project = { id: string; name: string; createdAt: string };
export type TurningPointType = 'inciting'|'lockin'|'midpoint'|'crisis'|'climax';

export type Scene = {
  id: string; number: number; slugline: string; characters: string[];
  synopsis: string; isKey: boolean;
};

export type UniversalTheme =
  | 'Amor' | 'Odio'
  | 'Mesías' | 'Malvado'
  | 'Búsqueda' | 'Secreto'
  | 'Condena' | 'Libertad'
  | 'Engaño' | 'Verdad';

export type IdeaRow = {
  id: string;
  idea: string;              // frase
  premise: string;           // proposición causal (Egri)
  mainTheme: UniversalTheme; // tema principal elegido
  genre: string;             // input libre
  subgenres?: string[];      // subgéneros (opcional)
  synopsisDraft?: string;    // generado por IA (mock)
  chosen?: boolean;          // marcar la fila “ganadora”
};

export type Screenplay = {
  id: string; 
  title: string; 
  projectId: string;
  synopsis?: string; treatment?: string;
  turningPoints?: { id: string; type: TurningPointType; summary: string }[];
  characters?: { id: string; name: string; bio?: string }[];
  subplots?: { id: string; name: string; purpose?: string; beats?: string[] }[];
  scenes: Scene[]; 
  ideation?: {
    rows: IdeaRow[];         // 1..5
    decidedRowId?: string;   // cuál se eligió (opcional)
  };
};
