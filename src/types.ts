export type User = { id: string; email: string; name: string };
export type Project = { id: string; name: string; createdAt: string };
export type TurningPointType = 'inciting'|'lockin'|'midpoint'|'crisis'|'climax';
export type ConflictLevel = 'Extrapersonal' | 'Personal' | 'Interno';

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
  subplots?: { id: string; name: string; purpose?: string; beats?: string[] }[];
  scenes: Scene[]; 
  ideation?: {
    rows: IdeaRow[];         // 1..5
    decidedRowId?: string;   // cuál se eligió (opcional)
  };
  characters?: Character[];
};

export type CharacterRelation = {
  id: string;           // uuid de la relación
  targetId: string;     // personaje relacionado
  description: string;  // p. ej. "amigo y mentor", "antagonista", etc.
};

export type Character = {
  id: string;
  name: string;
  archetypes: string[];        // Arquetipos (Vogler) — múltiple, pueden cambiar a lo largo de la historia
  nature: string[];            // Naturaleza (listas de adjetivos; múltiple)
  attitude: string[];          // Actitud (listas de adjetivos; múltiple)
  needGlobal: string;          // Necesidades dramáticas
  needH1: string;              // Necesidades dramáticas 1ª mitad (hasta la Ordalía)
  needH2: string;              // Necesidades dramáticas 2ª mitad (tras la Ordalía)
  arc: string;                // Arco (evolución)
  conflictLevel: ConflictLevel;// Conflicto (McKee)
  conflictDesc: string;       // Descripción del conflicto
  relations: CharacterRelation[];  // Relaciones con otros personajes
  paradoxes: string;      // Paradojas/Contradicciones
  biography: string;     // Biografía
  voice: string;        // Voz propia
};
