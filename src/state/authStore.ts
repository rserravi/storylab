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
  user: null, loading: true,
  hydrate: async () => {
    const me = await mockAuth.me();
    set({ user: me, loading: false });
  },
  login: async (email, password) => {
    set({ loading: true });
    const u = await mockAuth.login(email, password);
    set({ user: u, loading: false });
  },
  register: async (email, password, name) => {
    set({ loading: true });
    const u = await mockAuth.register(email, password, name);
    set({ user: u, loading: false });
  },
  logout: async () => {
    await mockAuth.logout();
    set({ user: null });
  }
}));
