import { create } from 'zustand';
import { mockAuth } from '../services/mockApi';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true, // spinner al arrancar hasta hydrate
  hydrate: async () => {
    try {
      const me = await mockAuth.me();
      set({ user: me, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const u = await mockAuth.login(email, password);
      set({ user: u, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  register: async (email, password, name) => {
    set({ loading: true });
    try {
      const u = await mockAuth.register(email, password, name);
      set({ user: u, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  logout: async () => {
    try { await mockAuth.logout(); } finally { set({ user: null, loading: false }); }
  }
}));
