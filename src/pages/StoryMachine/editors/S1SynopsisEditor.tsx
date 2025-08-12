import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasMinSynopsis } from './guards';
import { useState } from 'react'; // 👈 AÑADE ESTE IMPORT

export default function S1SynopsisEditor() {
  const { screenplay, patch } = useScreenplay();
  const syn = screenplay?.synopsis || '';
  const [value, setValue] = useState(syn);

  const ok = hasMinSynopsis(value);

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S1 — Sinopsis / Tema / Estilo</Typography>
      <Stack spacing={2} sx={{ mt:2 }}>
        <TextField
          label="Tema (opcional)"
          value={(screenplay as any)?.theme || ''}
          onChange={(e)=>patch({ ...(screenplay||{}), theme: e.target.value } as any)}
        />
        <TextField
          label="Referencias de estilo (opcional)"
          value={(screenplay as any)?.styleRefs || ''}
          onChange={(e)=>patch({ ...(screenplay||{}), styleRefs: e.target.value } as any)}
        />
        <TextField
          label="Sinopsis (≥ 120 palabras)"
          multiline minRows={6} value={value}
          onChange={(e)=>setValue(e.target.value)}
          error={!ok} helperText={!ok ? 'Mínimo ~120 palabras' : 'OK'}
        />
        <Box>
          <Button onClick={()=>patch({ synopsis: value })} disabled={!ok}>Guardar</Button>
        </Box>
        {!ok && <Alert severity="info">Añade más detalle hasta alcanzar el mínimo.</Alert>}
      </Stack>
    </Paper>
  );
}
