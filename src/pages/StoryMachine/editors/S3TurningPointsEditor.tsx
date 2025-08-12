import { Alert, Box, Button, Grid, Paper, TextField, Typography, Chip } from '@mui/material';
import { useScreenplay } from '../../../state/screenplayStore';
import { hasFiveTurningPoints } from './guards';
import type { TurningPointType } from '../../../types';
import React from 'react';

const TP: { key: TurningPointType; label: string }[] = [
    { key: 'inciting', label: 'Incidente desencadenante' },
    { key: 'lockin', label: 'Punto de no retorno' },
    { key: 'midpoint', label: 'Punto medio' },
    { key: 'crisis', label: 'Crisis' },
    { key: 'climax', label: 'Clímax' }
];

export default function S3TurningPointsEditor() {
    const { screenplay, patch } = useScreenplay();
    const current = screenplay?.turningPoints || [];
    const map = new Map(current.map(t => [t.type, t.summary]));

    const [local, setLocal] = React.useState<Record<string, string>>(
        Object.fromEntries(TP.map(t => [t.key, map.get(t.key) || '']))
    );

    const ok = hasFiveTurningPoints(
        TP.map(t => ({ type: t.key, summary: local[t.key] || '' }))
    );

    const save = () => {
        patch({ turningPoints: TP.map(t => ({ id: crypto.randomUUID(), type: t.key, summary: local[t.key] || '' })) as any });
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6">S3 — 5 Puntos de giro</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {TP.map(tp => (
                    <Grid key={tp.key} size={{ xs: 12, md: 6 }}>
                        <TextField
                            label={tp.label}
                            multiline minRows={3}
                            value={local[tp.key] || ''}
                            onChange={(e) => setLocal(s => ({ ...s, [tp.key]: e.target.value }))}
                        />
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button onClick={save} disabled={!ok}>Guardar</Button>
                <Chip label={ok ? 'Guardable' : 'Incompleto'} color={ok ? 'success' : 'default'} size="small" />
            </Box>
            {!ok && <Alert severity="info" sx={{ mt: 2 }}>Completa los 5 puntos con al menos una o dos frases.</Alert>}
        </Paper>
    );
}
