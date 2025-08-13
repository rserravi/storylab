const LS = {
  users: 'mock_users',
  auth: 'mock_auth',
  projects: 'mock_projects',
  screenplays: 'mock_screenplays',
};

const read = <T,>(k: string, d: T) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d)) as T;
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

export const mockAuth = {
  register: async (email: string, password: string, name: string) => {
    const users = read<any[]>(LS.users, []);
    if (users.find(u => u.email === email)) throw new Error('Email ya registrado');
    const user = { id: uuid(), email, password, name };
    users.push(user); write(LS.users, users);
    write(LS.auth, { userId: user.id });
    return { id: user.id, email: user.email, name: user.name };
  },
  login: async (email: string, password: string) => {
    const users = read<any[]>(LS.users, []);
    const u = users.find(x => x.email === email && x.password === password);
    if (!u) throw new Error('Credenciales inválidas');
    write(LS.auth, { userId: u.id });
    return { id: u.id, email: u.email, name: u.name };
  },
  me: async () => {
    const session = read<any | null>(LS.auth, null);
    if (!session) return null;
    const users = read<any[]>(LS.users, []);
    const u = users.find(x => x.id === session.userId);
    return u ? { id: u.id, email: u.email, name: u.name } : null;
  },
  logout: async () => write(LS.auth, null)
};

export const mockProjects = {
  list: async (userId: string) => read<any[]>(LS.projects, []).filter(p => p.userId === userId),
  create: async (userId: string, name: string) => {
    const projects = read<any[]>(LS.projects, []);
    const project = { id: uuid(), userId, name, createdAt: new Date().toISOString() };
    projects.push(project); write(LS.projects, projects);
    return project;
  }
};

export const mockScreenplays = {
  getOrCreateByProject: async (projectId: string) => {
    const all = read<any[]>(LS.screenplays, []);
    let s = all.find(x => x.projectId === projectId);
    if (!s) {
      s = { id: uuid(), projectId, title: 'Nuevo Guion', author: '', scenes: [] };
      all.push(s); write(LS.screenplays, all);
    } else if (!('author' in s)) {
      s.author = '';
      write(LS.screenplays, all);
    }
    return s;
  },
  update: async (sp: any) => {
    const all = read<any[]>(LS.screenplays, []);
    const i = all.findIndex(x => x.id === sp.id);
    if (i >= 0) all[i] = sp; else all.push(sp);
    write(LS.screenplays, all);
    return sp;
  }
};
