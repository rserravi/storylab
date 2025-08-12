import { Box, Button, Checkbox, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasProtagonist } from './guards';
import React from 'react';

type Row = { id: string; name: string; goal?: string; isProtagonist?: boolean };

export default function S4CharactersEditor() {
  const { screenplay, patch } = useScreenplay();
  const [rows, setRows] = React.useState<Row[]>(
    (screenplay?.characters as any) || []
  );

  const add = () => setRows(r => [...r, { id: crypto.randomUUID(), name: '' }]);
  const del = (id: string) => setRows(r => r.filter(x => x.id !== id));
  const set = (id: string, key: keyof Row, v: any) => setRows(r => r.map(x => x.id===id? {...x, [key]: v} : x));
  const ok = hasProtagonist(rows);

  const save = () => patch({ characters: rows as any });

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6">S4 — Personajes</Typography>
      <Box sx={{ overflowX:'auto', mt:2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Protagonista</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Objetivo</TableCell>
              <TableCell width={64}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox checked={!!r.isProtagonist}
                    onChange={(e)=>set(r.id,'isProtagonist', e.target.checked)} />
                </TableCell>
                <TableCell>
                  <TextField value={r.name} onChange={e=>set(r.id,'name', e.target.value)} />
                </TableCell>
                <TableCell>
                  <TextField value={r.goal || ''} onChange={e=>set(r.id,'goal', e.target.value)} />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={()=>del(r.id)}><DeleteIcon/></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ mt:2, display:'flex', gap:1 }}>
        <Button onClick={add}>Añadir</Button>
        <Button onClick={save} disabled={!ok}>Guardar</Button>
      </Box>
    </Paper>
  );
}
