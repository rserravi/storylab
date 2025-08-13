import { Box, Paper, TextField, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjects } from '../../state/projectStore';
import { useScreenplay } from '../../state/screenplayStore';
import { useAuth } from '../../state/authStore';

export default function StoryMachineShell() {
  const { projects, activeProjectId } = useProjects();
  const { user } = useAuth();
  const { screenplay, load, setTitle, setAuthor } = useScreenplay();

  useEffect(() => {
    if (activeProjectId) {
      const project = projects.find(p => p.id === activeProjectId);
      load(activeProjectId, { title: project?.name, author: user?.name });
    }
  }, [activeProjectId, projects, user?.name]);

  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Título del guion"
            value={screenplay?.title || ''}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Autor"
            value={screenplay?.author || ''}
            onChange={(e) => setAuthor(e.target.value)}
            sx={{ width: 250 }}
          />
        </Stack>
      </Paper>

      {/* Aquí se renderiza el editor de la sección activa (S1…S7) */}
      <Outlet />
    </Box>
  );
}
