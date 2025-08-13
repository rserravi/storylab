import { Box, Paper, Typography, TextField } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjects } from '../../state/projectStore';
import { useScreenplay } from '../../state/screenplayStore';

export default function StoryMachineShell() {
  const { activeProjectId } = useProjects();
  const { screenplay, load, setTitle } = useScreenplay();

  useEffect(() => { if (activeProjectId) load(activeProjectId); }, [activeProjectId]);

  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="h6">Proyecto: {screenplay?.title || 'Cargando...'}</Typography>
        <TextField
          label="Título del guion" value={screenplay?.title || ''}
          onChange={(e)=>setTitle(e.target.value)} sx={{ mt:1, maxWidth: 420 }}
        />
      </Paper>

      {/* Aquí se renderiza el editor de la sección activa (S1…S7) */}
      <Outlet />
    </Box>
  );
}
