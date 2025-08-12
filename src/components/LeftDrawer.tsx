import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Box,
  useMediaQuery, Collapse, ListSubheader
} from '@mui/material';
import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useProjects } from '../state/projectStore';

const MACHINE_STEPS = [
  { label: 'Sinopsis',        path: '/machine/s1' },
  { label: 'Puntos de Giro',  path: '/machine/s3' },
  { label: 'Tratamiento',     path: '/machine/s2' },
  { label: 'Personajes',      path: '/machine/s4' },
  { label: 'Subtramas',       path: '/machine/s5' },
  { label: 'Escenas clave',   path: '/machine/s6' },
  { label: 'Todas las escenas', path: '/machine/s7' }
];

export default function LeftDrawer({ width, open, onClose }: { width: number; open: boolean; onClose: () => void; }) {
  const nav = useNavigate();
  const loc = useLocation();
  const isSmall = useMediaQuery('(max-width:900px)');
  const { logout, user } = useAuth();
  const { projects, activeProjectId, setActive } = useProjects();

  const inMachine = loc.pathname.startsWith('/machine');
  const [openMachine, setOpenMachine] = React.useState(inMachine);

  const go = (path: string) => { nav(path); if (isSmall) onClose(); };

  return (
    <Drawer
      variant={isSmall ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}
    >
      <Box sx={{ p: 2, fontWeight: 700 }}>StoryLab</Box>
      <Divider />

      <List>
        <ListItemButton selected={loc.pathname.startsWith('/projects')} onClick={() => go('/projects')}>
          <ListItemIcon><FolderIcon /></ListItemIcon>
          <ListItemText primary="Proyectos" />
        </ListItemButton>

        {/* Story Machine padre */}
        <ListItemButton selected={inMachine} onClick={() => { setOpenMachine(!openMachine); if (!inMachine) go('/machine/s1'); }}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Story Machine" />
          {openMachine ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* Submenú de pasos */}
        <Collapse in={openMachine} timeout="auto" unmountOnExit>
          <List component="div" disablePadding
                subheader={<ListSubheader component="div">Pasos</ListSubheader>}>
            {MACHINE_STEPS.map(s => (
              <ListItemButton
                key={s.path}
                sx={{ pl: 4 }}
                selected={loc.pathname === s.path}
                onClick={() => go(s.path)}
              >
                <ListItemText primary={s.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <ListItemButton selected={loc.pathname.startsWith('/draft')} onClick={() => go('/draft')}>
          <ListItemIcon><EditNoteIcon /></ListItemIcon>
          <ListItemText primary="Story Draft" />
        </ListItemButton>
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1, fontSize: 12, opacity: .8 }}>Proyecto activo</Box>
      <List dense>
        {projects.map(p => (
          <ListItemButton key={p.id} selected={p.id === activeProjectId} onClick={() => setActive(p.id)}>
            <ListItemIcon><MovieIcon /></ListItemIcon>
            <ListItemText primary={p.name} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton onClick={async () => { await logout(); nav('/login'); }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={`Salir (${user?.name || user?.email})`} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
