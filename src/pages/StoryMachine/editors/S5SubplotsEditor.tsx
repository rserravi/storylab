import React from 'react';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasLinkedSubplots } from './guards';
import { useT } from '../../../i18n';

type Row = { id: string; name: string; ownerId?: string; purpose?: string };

export default function S5SubplotsEditor() {
  const t = useT();
  const { screenplay, patch } = useScreenplay();
  const chars = (screenplay?.characters as any) || [];
  const [rows, setRows] = React.useState<Row[]>((screenplay?.subplots as any) || []);

  const add = () => setRows(r => [...r, { id: crypto.randomUUID(), name: '' }]);
  const set = (id: string, key: keyof Row, v: any) =>
    setRows(r => r.map(x => (x.id === id ? { ...x, [key]: v } : x)));

  const ok = hasLinkedSubplots(rows);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">{t('s5.title')}</Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {rows.map(r => (
          <Box
            key={r.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 220px' },
              gap: 1,
            }}
          >
            <TextField
              label={t('s5.name.label')}
              placeholder={t('s5.name.placeholder')}
              value={r.name}
              onChange={e => set(r.id, 'name', e.target.value)}
            />

            <TextField
              label={t('s5.owner.label')}
              select
              value={r.ownerId || ''}
              onChange={e => set(r.id, 'ownerId', e.target.value)}
            >
              {chars.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('s5.purpose.label')}
              placeholder={t('s5.purpose.placeholder')}
              value={r.purpose || ''}
              onChange={e => set(r.id, 'purpose', e.target.value)}
              multiline
              minRows={2}
              sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}
            />
          </Box>
        ))}

        {!ok && (
          <Typography variant="caption" color="warning.main">
            {t('s5.validation.linkedRequired')}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={add}>{t('s5.add')}</Button>
          <Button onClick={() => patch({ subplots: rows as any })} disabled={!ok}>
            {t('s5.save')}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
