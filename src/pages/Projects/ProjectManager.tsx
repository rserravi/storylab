import { Box, Button, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../state/authStore';
import { useProjects } from '../../state/projectStore';
import { useNavigate } from 'react-router-dom';

export default function ProjectManager() {
  const { user } = useAuth();
  const { projects, create, setActive, activeProjectId } = useProjects();
  const [name, setName] = useState('');
  const nav = useNavigate();

  const onCreate = async () => {
    if (!user || !name.trim()) return;
    await create(user.id, name.trim());
    setName('');
  };

  return (
    <Box sx={{ display:'grid', gridTemplateColumns:{ md:'1fr 1fr' }, gap:2 }}>
      <Paper sx={{ p:2 }}>
        <Typography variant="h6">Mis proyectos</Typography>
        <List dense sx={{ mt:1 }}>
          {projects.map(p => (
            <ListItem
              key={p.id}
              disablePadding
              secondaryAction={
                <Button onClick={() => { setActive(p.id); nav('/machine'); }}>
                  Abrir
                </Button>
              }
            >
              <ListItemButton
                selected={p.id === activeProjectId}
                onClick={() => setActive(p.id)}
              >
                <ListItemText
                  primary={p.name}
                  secondary={new Date(p.createdAt).toLocaleString()}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p:2 }}>
        <Typography variant="h6">Crear nuevo</Typography>
        <TextField
          label="Nombre del proyecto"
          fullWidth sx={{ mt:1 }}
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <Button onClick={onCreate} sx={{ mt:2 }}>Crear</Button>
      </Paper>
    </Box>
  );
}
