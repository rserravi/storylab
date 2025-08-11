import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProjectManager from './pages/Projects/ProjectManager';
import StoryMachineView from './pages/StoryMachine/StoryMachineView';
import StoryDraftView from './pages/StoryDraft/StoryDraftView';
import { useEffect } from 'react';
import { useAuth } from './state/authStore';
import { useProjects } from './state/projectStore';

export default function App() {
  const { user, hydrate, loading } = useAuth();
  const { load } = useProjects();

  useEffect(() => { (async () => { await hydrate(); })(); }, []);
  useEffect(() => { if (user) load(user.id); }, [user]);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace/>}/>
          <Route path="/projects" element={<ProjectManager/>}/>
          <Route path="/machine" element={<StoryMachineView/>}/>
          <Route path="/draft" element={<StoryDraftView/>}/>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  );
}
