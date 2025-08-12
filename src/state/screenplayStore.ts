import { create } from 'zustand';
import { mockScreenplays } from '../services/mockApi';
import type { Screenplay, Scene } from '../types';

type SPState = {
  screenplay: Screenplay | null;
  load: (projectId: string) => Promise<void>;
  setTitle: (title: string) => void;
  upsertScene: (scene: Partial<Scene>) => void;
  patch: (partial: Partial<Screenplay>) => void; // <- NUEVO
};

export const useScreenplay = create<SPState>((set, get) => ({
  screenplay: null,
  load: async (projectId) => {
    const sp = await mockScreenplays.getOrCreateByProject(projectId);
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
  }
}));
