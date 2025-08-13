import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Tooltip, MenuItem, FormControl, Select
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LeftDrawer from '../components/LeftDrawer';
import ProjectStatusFooter from '../components/ProjectStatusFooter';
import { useProjects } from '../state/projectStore';
import { useAuth } from '../state/authStore';
import { useUi } from '../state/uiStore';
import { useT } from '../i18n';

export default function AppLayout() {
  const t = useT();
  const [leftOpen, setLeftOpen] = useState(false);

  const { user } = useAuth();
  const { projects, activeProjectId } = useProjects();
  const { darkMode, toggleDark, lang, setLang } = useUi(); // 👈 usamos setLang

  const projectName = useMemo(
    () => projects.find(p => p.id === activeProjectId)?.name || t('project.none'),
    [projects, activeProjectId, t]
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setLeftOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>{projectName}</Typography>

          <Tooltip title={darkMode ? t('ui.light') : t('ui.dark')}>
            <IconButton color="inherit" onClick={toggleDark} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* 👇 Desplegable de idioma */}
          <FormControl
            variant="standard"
            sx={{
              minWidth: 72,
              mr: 2,
              // fuerza color blanco en todo lo interior:
              color: (t) => t.palette.common.white,
              '& .MuiInputBase-root': { color: (t) => t.palette.common.white },
              '& .MuiSelect-select': { color: (t) => t.palette.common.white, py: 0.25 },
              '& .MuiSelect-icon': { color: (t) => t.palette.common.white },
              '& .MuiSvgIcon-root': { color: (t) => t.palette.common.white }
            }}
          >
            <Select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'es' | 'en' | 'ca')}
              variant="standard"
              disableUnderline
              renderValue={(v) => String(v).toUpperCase()} // ES / EN / CA
              MenuProps={{ MenuListProps: { dense: true } }}
            >
              <MenuItem value="es">ES</MenuItem>
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="ca">CA</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2">{user?.email}</Typography>
        </Toolbar>
      </AppBar>

      <LeftDrawer width={260} open={leftOpen} onClose={() => setLeftOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8, pb: 8 }}>
        <Outlet />
      </Box>
      <Box component="footer" sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <ProjectStatusFooter />
      </Box>
    </Box>
  );
}
