import { Alert, Paper, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasAllScenes } from './guards';

export default function S7AllScenesEditor() {
  const { screenplay } = useScreenplay();
  const total = screenplay?.scenes?.length || 0;
  const ok = hasAllScenes(screenplay?.scenes);

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S7 — Resto de escenas</Typography>
      <Typography sx={{ mt:1 }}>Total de escenas: <b>{total}</b></Typography>
      {!ok && <Alert severity="info" sx={{ mt:2 }}>
        Este guard pide ≥ 30 escenas (mock). Ajustaremos por duración objetivo en el backend real.
      </Alert>}
    </Paper>
  );
}
