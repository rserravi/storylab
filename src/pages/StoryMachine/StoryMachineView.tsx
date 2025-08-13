import { Box, Paper, Tabs, Tab, Typography, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useProjects } from '../../state/projectStore';
import { useScreenplay } from '../../state/screenplayStore';

import S1SynopsisEditor from './editors/S1IdeationEditor';
import S2TreatmentEditor from './editors/S2TreatmentEditor';
import S3TurningPointsEditor from './editors/S3TurningPointsEditor';
import S4CharactersEditor from './editors/S4CharactersEditor';
import S5SubplotsEditor from './editors/S5SubplotsEditor';
import S6KeyScenesEditor from './editors/S6LocationEditor';
import S7AllScenesEditor from './editors/S7AllScenesEditor';

const STEPS = ['S1 Sinopsis','S3 Puntos giro','S2 Tratamiento','S4 Personajes','S5 Subtramas','S6 Escenas clave','S7 Todas las escenas'];

export default function StoryMachineView() {
  const [tab, setTab] = useState(0);
  const { activeProjectId } = useProjects();
  const { screenplay, load, setTitle } = useScreenplay();

  useEffect(() => { if (activeProjectId) load(activeProjectId); }, [activeProjectId]);

  return (
    <Box>
      <Paper sx={{ mb:2, p:2 }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto">
          {STEPS.map((s,i)=><Tab key={i} label={s}/>)}
        </Tabs>
      </Paper>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="h6">Proyecto: {screenplay?.title || 'Cargando...'}</Typography>
        <TextField
          label="Título del guion" value={screenplay?.title || ''}
          onChange={(e)=>setTitle(e.target.value)} sx={{ mt:1, maxWidth: 420 }}
        />
      </Paper>

      {/* Editores por paso */}
      {tab===0 && <S1SynopsisEditor/>}
      {tab===1 && <S3TurningPointsEditor/>}
      {tab===2 && <S2TreatmentEditor/>}
      {tab===3 && <S4CharactersEditor/>}
      {tab===4 && <S5SubplotsEditor/>}
      {tab===5 && <S6KeyScenesEditor/>}
      {tab===6 && <S7AllScenesEditor/>}

      
    </Box>
  );
}
