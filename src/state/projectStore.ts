import { create } from 'zustand';
import { mockProjects } from '../services/mockApi';
import type { Project } from '../types';

type ProjectState = {
  projects: Project[];
  activeProjectId: string | null;
  load: (userId: string) => Promise<void>;
  create: (userId: string, name: string) => Promise<Project>;
  setActive: (id: string) => void;
};

export const useProjects = create<ProjectState>((set, get) => ({
  projects: [], activeProjectId: localStorage.getItem('activeProjectId'),
  load: async (userId) => {
    const items = await mockProjects.list(userId);
    set({ projects: items });
    if (!get().activeProjectId && items[0]) set({ activeProjectId: items[0].id });
  },
  create: async (userId, name) => {
    const p = await mockProjects.create(userId, name);
    set({ projects: [...get().projects, p], activeProjectId: p.id });
    localStorage.setItem('activeProjectId', p.id);
    return p;
  },
  setActive: (id) => { set({ activeProjectId: id }); localStorage.setItem('activeProjectId', id); }
}));
