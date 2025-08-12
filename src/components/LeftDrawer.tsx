import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Collapse, ListSubheader } from '@mui/material';
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
import { useEffect, useState } from 'react';
import { useT } from '../i18n';

const STEP_KEYS = [
  'nav.machine.s1',
  'nav.machine.s3',
  'nav.machine.s2',
  'nav.machine.s4',
  'nav.machine.s5',
  'nav.machine.s6',
  'nav.machine.s7'
] as const;

const STEP_PATHS = [
  '/machine/s1',
  '/machine/s3',
  '/machine/s2',
  '/machine/s4',
  '/machine/s5',
  '/machine/s6',
  '/machine/s7'
] as const;

export default function LeftDrawer({ width, open, onClose }: { width: number; open: boolean; onClose: () => void; }) {
  const t = useT();
  const nav = useNavigate();
  const loc = useLocation();
  const { logout, user } = useAuth();
  const { projects, activeProjectId, setActive } = useProjects();

  const inMachine = loc.pathname.startsWith('/machine');
  const [openMachine, setOpenMachine] = useState(inMachine);

  useEffect(() => { setOpenMachine(inMachine); }, [inMachine]);

  const go = (path: string) => { nav(path); onClose(); };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}
    >
      <Box sx={{ p: 2, fontWeight: 700 }}>{t('brand')}</Box>
      <Divider />

      <List>
        <ListItemButton selected={loc.pathname.startsWith('/projects')} onClick={() => go('/projects')}>
          <ListItemIcon><FolderIcon /></ListItemIcon>
          <ListItemText primary={t('nav.projects')} />
        </ListItemButton>

        <ListItemButton selected={inMachine} onClick={() => { setOpenMachine(!openMachine); if (!inMachine) go('/machine/s1'); }}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary={t('nav.storyMachine')} />
          {openMachine ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openMachine} timeout="auto" unmountOnExit>
          <List component="div" disablePadding subheader={<ListSubheader component="div">{t('nav.steps')}</ListSubheader>}>
            {STEP_KEYS.map((key, i) => (
              <ListItemButton
                key={key}
                sx={{ pl: 4 }}
                selected={loc.pathname === STEP_PATHS[i]}
                onClick={() => go(STEP_PATHS[i])}
              >
                <ListItemText primary={t(key)} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <ListItemButton selected={loc.pathname.startsWith('/draft')} onClick={() => go('/draft')}>
          <ListItemIcon><EditNoteIcon /></ListItemIcon>
          <ListItemText primary={t('nav.storyDraft')} />
        </ListItemButton>
      </List>

      <Divider />
      <Box sx={{ px: 2, py: 1, fontSize: 12, opacity: .8 }}>{t('nav.activeProject')}</Box>
      <List dense>
        {projects.map(p => (
          <ListItemButton key={p.id} selected={p.id === activeProjectId} onClick={() => { setActive(p.id); onClose(); }}>
            <ListItemIcon><MovieIcon /></ListItemIcon>
            <ListItemText primary={p.name} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton onClick={async () => { await logout(); go('/login'); }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={`${t('action.logout')} (${user?.name || user?.email})`} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
