import { Box, Paper, Typography, TextField, Button, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useProjects } from '../../state/projectStore';
import { useScreenplay } from '../../state/screenplayStore';

export default function StoryMachineShell() {
  const { activeProjectId } = useProjects();
  const { screenplay, load, setTitle, upsertScene } = useScreenplay();

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

      {/* Tarjetas de escenas */}
      <Paper sx={{ p:2, mt:2, mb:1 }}>
        <Typography variant="subtitle1">Tarjetas de escenas</Typography>
      </Paper>
      <Grid container spacing={2}>
        {(screenplay?.scenes || []).map(s => (
          <Grid key={s.id} size={{ xs:12, md:6, lg:4 }}>
            <Paper sx={{ p:2 }}>
              <Typography variant="subtitle2">{s.slugline}</Typography>
              <Chip size="small" label={s.isKey? 'Clave' : 'Normal'} sx={{ mt:1 }} />
              <TextField
                label="Sinopsis" multiline minRows={3} sx={{ mt:1 }}
                value={s.synopsis} onChange={e=>upsertScene({ id: s.id, synopsis: e.target.value })}
              />
              <Button sx={{ mt:1 }}>Proponer con IA (mock)</Button>
            </Paper>
          </Grid>
        ))}
        <Grid size={12}>
          <Button onClick={()=>upsertScene({ isKey:false, slugline:'INT. APARTMENT - NIGHT', synopsis:'Nueva escena' })}>
            + Añadir escena
          </Button>
          <Button sx={{ ml:1 }} onClick={()=>upsertScene({ isKey:true, slugline:'EXT. ROOFTOP - DAY', synopsis:'Escena clave' })}>
            + Añadir escena clave
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
