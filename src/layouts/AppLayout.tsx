import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, IconButton, useMediaQuery, Tooltip, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LeftDrawer from '../components/LeftDrawer';
import RightSidebar from '../components/RightSidebar';
import { useProjects } from '../state/projectStore';
import { useAuth } from '../state/authStore';
import { useUi } from '../state/uiStore';

const LEFT_WIDTH = 260;
const RIGHT_WIDTH = 320;

export default function AppLayout() {
  const isSmall = useMediaQuery('(max-width:900px)');
  const showRight = useMediaQuery('(min-width:1200px)');
  const [leftOpen, setLeftOpen] = useState(!isSmall);

  const { user } = useAuth();
  const { projects, activeProjectId } = useProjects();
  const { darkMode, toggleDark, lang, switchLang } = useUi();

  const projectName = useMemo(
    () => projects.find(p => p.id === activeProjectId)?.name || 'Sin proyecto',
    [projects, activeProjectId]
  );

  // Cuando el drawer es permanente y está abierto, desplazamos el main
  const shouldOffsetLeft = !isSmall && leftOpen;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setLeftOpen(!leftOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{projectName}</Typography>
          <Tooltip title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton color="inherit" onClick={toggleDark} sx={{ mr: 1 }}>
              {/* …iconos omitidos por brevedad… */}
            </IconButton>
          </Tooltip>
          <Button color="inherit" onClick={()=>switchLang()} sx={{ mr:2 }}>{lang.toUpperCase()}</Button>
          <Typography variant="body2">{user?.email}</Typography>
        </Toolbar>
      </AppBar>

      <LeftDrawer width={LEFT_WIDTH} open={leftOpen} onClose={() => setLeftOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
          ml: shouldOffsetLeft ? LEFT_WIDTH : 0, // << desplazamiento por drawer izquierdo
          mr: showRight ? RIGHT_WIDTH : 0       // << espacio para sidebar derecho
        }}
      >
        <Outlet />
      </Box>

      <RightSidebar width={RIGHT_WIDTH} open={showRight} />
    </Box>
  );
}
