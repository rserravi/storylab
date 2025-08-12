import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasLinkedSubplots } from './guards';
import React from 'react';

type Row = { id: string; name: string; ownerId?: string; purpose?: string };

export default function S5SubplotsEditor() {
  const { screenplay, patch } = useScreenplay();
  const chars = (screenplay?.characters as any) || [];
  const [rows, setRows] = React.useState<Row[]>((screenplay?.subplots as any) || []);

  const add = () => setRows(r => [...r, { id: crypto.randomUUID(), name: '' }]);
  const set = (id: string, key: keyof Row, v: any) => setRows(r => r.map(x => x.id===id? {...x, [key]: v} : x));

  const ok = hasLinkedSubplots(rows);

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S5 — Subtramas</Typography>
      <Stack spacing={2} sx={{ mt:2 }}>
        {rows.map(r => (
          <Box key={r.id} sx={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:1 }}>
            <TextField label="Nombre de subtrama" value={r.name} onChange={e=>set(r.id,'name', e.target.value)} />
            <TextField label="Propietario" select value={r.ownerId || ''} onChange={e=>set(r.id,'ownerId', e.target.value)}>
              {chars.map((c:any)=> <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Propósito (opcional)" value={r.purpose || ''} onChange={e=>set(r.id,'purpose', e.target.value)} multiline minRows={2} sx={{ gridColumn:'1 / span 2' }} />
          </Box>
        ))}
        <Box sx={{ display:'flex', gap:1 }}>
          <Button onClick={add}>Añadir subtrama</Button>
          <Button onClick={()=>patch({ subplots: rows as any })} disabled={!ok}>Guardar</Button>
        </Box>
      </Stack>
    </Paper>
  );
}
