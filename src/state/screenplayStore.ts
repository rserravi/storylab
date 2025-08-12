import { create } from 'zustand';
import { mockScreenplays } from '../services/mockApi';
import type { Screenplay, Scene, IdeaRow } from '../types';

type SPState = {
  screenplay: Screenplay | null;
  load: (projectId: string) => Promise<void>;
  setTitle: (title: string) => void;
  upsertScene: (scene: Partial<Scene>) => void;
  patch: (partial: Partial<Screenplay>) => void; 
  setSynopsis: (synopsis: string) => void;
  setIdeationRows: (rows: IdeaRow[]) => void;
  setDecidedRow: (id: string | null) => void;
};

export const useScreenplay = create<SPState>((set, get) => ({
  screenplay: null,
  load: async (projectId) => {
    const sp = await mockScreenplays.getOrCreateByProject(projectId);
    // asegúrate de que haya estructura de ideation
    if (!sp.ideation) sp.ideation = { rows: [], decidedRowId: null };
    set({ screenplay: sp });
  },
  setTitle: (title) => {
    const sp = { ...get().screenplay!, title };
    mockScreenplays.update(sp); set({ screenplay: sp });
  },
  upsertScene: (scene) => {
    const sp = get().screenplay!;
    const scenes = [...(sp.scenes||[])];
    const idx = scenes.findIndex(s => s.id === scene.id);
    const merged = {
      id: scene.id || crypto.randomUUID(),
      number: scene.number ?? scenes.length + 1,
      slugline: scene.slugline || 'INT. TBD - DAY',
      characters: scene.characters || [],
      synopsis: scene.synopsis || '',
      isKey: !!scene.isKey
    };
    if (idx >= 0) scenes[idx] = { ...scenes[idx], ...merged }; else scenes.push(merged as any);
    const next = { ...sp, scenes };
    mockScreenplays.update(next); set({ screenplay: next });
  },
  patch: (partial) => {
    const sp = get().screenplay!;
    const next = { ...sp, ...partial };
    mockScreenplays.update(next); set({ screenplay: next });
  },

  // NUEVO:
  setSynopsis: (synopsis) => {
    const sp = { ...get().screenplay!, synopsis };
    mockScreenplays.update(sp); set({ screenplay: sp });
  },
  setIdeationRows: (rows) => {
    const sp = get().screenplay!;
    const next: Screenplay = { ...sp, ideation: { ...(sp.ideation||{ rows:[], decidedRowId: undefined }), rows } };
    mockScreenplays.update(next); set({ screenplay: next });
  },
  setDecidedRow: (id) => {
    const sp = get().screenplay!;
    const rows = (sp.ideation?.rows || []).map(r => ({ ...r, chosen: r.id === id || false }));
    const next: Screenplay = { ...sp, ideation: { rows, decidedRowId: id ?? undefined } };
    mockScreenplays.update(next); set({ screenplay: next });
  }
}));
