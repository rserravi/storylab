import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProjectManager from './pages/Projects/ProjectManager';
import StoryDraftView from './pages/StoryDraft/StoryDraftView';

// Nuevo shell y editores
import StoryMachineShell from './pages/StoryMachine/StoryMachineShell';
import S1SynopsisEditor from './pages/StoryMachine/editors/S1SynopsisEditor';
import S2TreatmentEditor from './pages/StoryMachine/editors/S2TreatmentEditor';
import S3TurningPointsEditor from './pages/StoryMachine/editors/S3TurningPointsEditor';
import S4CharactersEditor from './pages/StoryMachine/editors/S4CharactersEditor';
import S5SubplotsEditor from './pages/StoryMachine/editors/S5SubplotsEditor';
import S6KeyScenesEditor from './pages/StoryMachine/editors/S6KeyScenesEditor';
import S7AllScenesEditor from './pages/StoryMachine/editors/S7AllScenesEditor';

import { useEffect } from 'react';
import { useAuth } from './state/authStore';
import { useProjects } from './state/projectStore';

export default function App() {
  const { user, hydrate } = useAuth();
  const { load } = useProjects();

  useEffect(() => { hydrate(); }, []);
  useEffect(() => { if (user) load(user.id); }, [user]);

  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace/>}/>
          <Route path="/projects" element={<ProjectManager/>}/>

          {/* STORY MACHINE con subrutas */}
          <Route path="/machine" element={<StoryMachineShell />}>
            <Route index element={<Navigate to="/machine/s1" replace/>}/>
            <Route path="s1" element={<S1SynopsisEditor/>}/>
            <Route path="s2" element={<S2TreatmentEditor/>}/>
            <Route path="s3" element={<S3TurningPointsEditor/>}/>
            <Route path="s4" element={<S4CharactersEditor/>}/>
            <Route path="s5" element={<S5SubplotsEditor/>}/>
            <Route path="s6" element={<S6KeyScenesEditor/>}/>
            <Route path="s7" element={<S7AllScenesEditor/>}/>
          </Route>

          <Route path="/draft" element={<StoryDraftView/>}/>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  );
}
