import { Box, Button, Paper, TextField, Typography, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../state/authStore';
import { useProjects } from '../../state/projectStore';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n';

export default function ProjectManager() {
  const t = useT();
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
        <Typography variant="h6">{t('projects.title')}</Typography>
        <List dense sx={{ mt:1 }}>
          {projects.map(p => (
            <ListItem
              key={p.id}
              disablePadding
              secondaryAction={
                <Button onClick={() => { setActive(p.id); nav('/machine/s1'); }}>
                  {t('projects.open')}
                </Button>
              }
            >
              <ListItemButton
                selected={p.id === activeProjectId}
                onClick={() => setActive(p.id)}
              >
                <ListItemText
                  primary={p.name}
                  secondary={`${t('projects.createdAt')}: ${new Date(p.createdAt).toLocaleString()}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p:2 }}>
        <Typography variant="h6">{t('projects.create.title')}</Typography>
        <TextField
          label={t('projects.name.label')}
          fullWidth sx={{ mt:1 }}
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <Button onClick={onCreate} sx={{ mt:2 }}>{t('projects.btn.create')}</Button>
      </Paper>
    </Box>
  );
}
