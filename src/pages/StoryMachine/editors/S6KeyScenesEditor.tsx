import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasMinKeyScenes } from './guards';

export default function S6KeyScenesEditor() {
  const { screenplay, upsertScene } = useScreenplay();
  const scenes = screenplay?.scenes || [];
  const ok = hasMinKeyScenes(scenes);

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S6 — Escenas clave</Typography>
      <Typography variant="body2" sx={{ mb:2 }}>
        Necesitas al menos <b>5</b> escenas marcadas como clave. Usa la sección de tarjetas para crearlas.
      </Typography>
      <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
        {scenes.filter(s=>s.isKey).map(s => (
          <Button key={s.id} size="small" variant="outlined">{s.slugline}</Button>
        ))}
      </Box>
      {!ok && <Alert severity="warning" sx={{ mt:2 }}>Aún faltan escenas clave.</Alert>}
      <Box sx={{ mt:2 }}>
        <Button onClick={()=>upsertScene({ isKey:true, slugline:'EXT. NEW KEY - DAY', synopsis:'Sinopsis...' })}>
          + Añadir escena clave
        </Button>
      </Box>
    </Paper>
  );
}
