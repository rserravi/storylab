import { Box, Paper, Typography, Button, TextField, Stack } from '@mui/material';
import { useScreenplay } from '../../state/screenplayStore';
import { useEffect, useMemo, useState } from 'react';
import { useProjects } from '../../state/projectStore';
import FormattedDraft from '../../components/FormattedDraft';

function toFountain(sceneNumber: number, slug: string, synopsis: string) {
  const action = synopsis ? synopsis.replace(/\n/g, ' ') : '';
  return `\n.${slug}\n${action}\n`;
}

export default function StoryDraftView() {
  const { activeProjectId } = useProjects();
  const { screenplay, load } = useScreenplay();
  const [exporting, setExporting] = useState(false);

  useEffect(() => { if (activeProjectId) load(activeProjectId); }, [activeProjectId]);

  const fountain = useMemo(() => {
    if (!screenplay) return '';
    const header = `Title: ${screenplay.title}\n\n`;
    const body = (screenplay.scenes || [])
      .sort((a,b)=>a.number-b.number)
      .map(s => toFountain(s.number, s.slugline, s.synopsis))
      .join('\n');
    return header + body;
  }, [screenplay]);

  if (!screenplay) return null;

  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="h6">Story Draft</Typography>
        <Typography variant="body2" sx={{ opacity:.8 }}>
          Borrador generado desde tarjetas. Vista izquierda: Fountain (mock). Derecha: **formato Hollywood** (CSS).
        </Typography>
      </Paper>

      <Stack direction={{ xs:'column', xl:'row' }} spacing={2} alignItems="flex-start">
        <Paper sx={{ p:2, flex: 1, minWidth: 420 }}>
          <Typography variant="subtitle2" sx={{ mb:1 }}>Fountain (mock)</Typography>
          <TextField multiline minRows={24} fullWidth value={fountain} />
          <Stack direction="row" spacing={1} sx={{ mt:2 }}>
            <Button disabled={exporting} onClick={()=>setExporting(true)}>Exportar PDF (mock)</Button>
            <Button disabled={exporting} onClick={()=>setExporting(true)}>Exportar FDX (mock)</Button>
            <Button disabled={exporting} onClick={()=>setExporting(true)}>Exportar Fountain</Button>
          </Stack>
        </Paper>

        <Paper sx={{ p:2, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb:1 }}>Vista Hollywood (CSS)</Typography>
          <FormattedDraft screenplay={screenplay}/>
        </Paper>
      </Stack>
    </Box>
  );
}
