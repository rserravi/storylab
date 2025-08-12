import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasTreatmentLength } from './guards';
import React from 'react';

export default function S2TreatmentEditor() {
  const { screenplay, patch } = useScreenplay();
  const [text, setText] = React.useState(screenplay?.treatment || '');
  const ok = hasTreatmentLength(text);

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S2 — Tratamiento (2–5 páginas)</Typography>
      <Stack spacing={2} sx={{ mt:2 }}>
        <TextField multiline minRows={12} value={text} onChange={e=>setText(e.target.value)}
          label="Tratamiento" error={!ok} helperText={ok ? 'OK' : 'Aproximadamente 600–1500 palabras.'}/>
        <Button onClick={()=>patch({ treatment: text })} disabled={!ok}>Guardar</Button>
        {!ok && <Alert severity="info">Amplía o reduce para entrar en el rango.</Alert>}
      </Stack>
    </Paper>
  );
}
