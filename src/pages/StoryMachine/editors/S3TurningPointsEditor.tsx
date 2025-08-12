// src/pages/StoryMachine/editors/S3TurningPointsEditor.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../../styles/markdown.css';

import { useScreenplay } from '../../../state/screenplayStore';
import type { Screenplay } from '../../../types';
import { useT } from '../../../i18n';
import { useUi } from '../../../state/uiStore';

// ===== HELP DOCS =====

// General (localized)
import generalES from '../../../content/s3-structure.md?raw';
import generalEN from '../../../content/s3-structure.en.md?raw';
import generalCA from '../../../content/s3-structure.ca.md?raw';

// Point-specific (de momento solo ES; mapeamos a ES para EN/CA hasta tener traducciones)
import hIncES from '../../../content/s3-help-incidente.md?raw';
import hMCES from '../../../content/s3-help-momento-cambio.md?raw';
import hMidES from '../../../content/s3-help-ordalia.md?raw';
import hCriES from '../../../content/s3-help-crisis.md?raw';
import hCliES from '../../../content/s3-help-climax.md?raw';

const helpDocs = {
  general: { es: generalES, en: generalEN, ca: generalCA },
  incidente: { es: hIncES, en: hIncES, ca: hIncES },
  momentoCambio: { es: hMCES, en: hMCES, ca: hMCES },
  puntoMedio: { es: hMidES, en: hMidES, ca: hMidES },
  crisis: { es: hCriES, en: hCriES, ca: hCriES },
  climax: { es: hCliES, en: hCliES, ca: hCliES }
} as const;

type Key = 'incidente' | 'momentoCambio' | 'puntoMedio' | 'crisis' | 'climax';

// Etiquetas visibles (renombradas)
const LABELS: Record<Key, (t: (k: string) => string) => string> = {
  incidente: (t) => t('s3.incidente'),
  momentoCambio: (t) => t('s3.momentoCambio'),
  puntoMedio: (t) => t('s3.puntoMedio'),
  crisis: (t) => t('s3.crisis'),
  climax: (t) => t('s3.climax')
};

// Mapeo legacy -> claves nuevas (retrocompatibilidad con datos guardados)
const LEGACY_MAP: Record<string, Key> = {
  incidente: 'incidente',
  punto_no_retorno: 'momentoCambio',
  momento_cambio: 'momentoCambio',
  punto_medio: 'puntoMedio',
  crisis: 'crisis',
  climax: 'climax'
};

// Propuestas IA (mock) localizadas
const AI_TEMPLATES: Record<'es' | 'en' | 'ca', Record<Key, (ctx: string) => string>> = {
  es: {
    incidente: (c) => `Borrador — Incidente: Un suceso irrumpe en la rutina y anuncia el conflicto central.${c}`,
    momentoCambio: (c) => `Borrador — Momento de Cambio: El protagonista toma su primera gran decisión y cruza el umbral hacia el Acto II.${c}`,
    puntoMedio: (c) => `Borrador — Punto Medio / Ordalía: Una prueba máxima o giro central redefine la necesidad dramática; no hay vuelta atrás.${c}`,
    crisis: (c) => `Borrador — Crisis: Un giro/derrota encamina la historia al desenlace y fuerza una decisión final.${c}`,
    climax: (c) => `Borrador — Clímax: Confrontación definitiva que resuelve la pregunta dramática principal y cierra subtramas.${c}`
  },
  en: {
    incidente: (c) => `Draft — Inciting Incident: An event disrupts routine and signals the core conflict.${c}`,
    momentoCambio: (c) => `Draft — Break into Act II: The protagonist makes the first major choice and crosses the threshold.${c}`,
    puntoMedio: (c) => `Draft — Midpoint / Ordeal: A maximum test or central turn redefines the dramatic need; no way back.${c}`,
    crisis: (c) => `Draft — Crisis: A turn/defeat propels the story toward resolution, forcing a final decision.${c}`,
    climax: (c) => `Draft — Climax: Final confrontation answers the main dramatic question and closes subplots.${c}`
  },
  ca: {
    incidente: (c) => `Esborrany — Incident: Un esdeveniment trenca la rutina i anuncia el conflicte central.${c}`,
    momentoCambio: (c) => `Esborrany — Moment de Canvi: El protagonista pren la primera gran decisió i creua el llindar cap a l’Acte II.${c}`,
    puntoMedio: (c) => `Esborrany — Punt Mig / Ordalía: Una prova màxima o gir central redefineix la necessitat dramàtica; no hi ha retorn.${c}`,
    crisis: (c) => `Esborrany — Crisi: Un gir/derrota empeny la història cap al desenllaç i força una decisió final.${c}`,
    climax: (c) => `Esborrany — Clímax: Confrontació definitiva que respon la pregunta dramàtica principal i tanca subtrames.${c}`
  }
};

function upsertTurningPoint(sp: Screenplay, key: Key, summary: string) {
  const arr = [...(sp.turningPoints || [])];
  const idx = arr.findIndex((tp) => LEGACY_MAP[tp.type as string] === key);
  if (idx >= 0) arr[idx] = { ...arr[idx], type: key as any, summary };
  else arr.push({ id: crypto.randomUUID(), type: key as any, summary });
  return arr;
}

export default function S3TurningPointsEditor() {
  const t = useT();
  const { lang } = useUi();
  const { screenplay, patch } = useScreenplay();
  const [helpOpen, setHelpOpen] = useState<null | { title: string; body: string }>(null);

  useEffect(() => {
    // si necesitas cargar datos, hazlo aquí; este editor es controlado por store
  }, [screenplay?.id]);

  const getSummary = (key: Key) => {
    const tp = (screenplay?.turningPoints || []).find((tp) => LEGACY_MAP[tp.type as string] === key);
    return tp?.summary || '';
  };

  const setSummary = (key: Key, summary: string) => {
    if (!screenplay) return;
    const turningPoints = upsertTurningPoint(screenplay, key, summary);
    patch({ turningPoints });
  };

  const openHelp = (key: 'general' | Key) => {
    const title =
      key === 'general'
        ? t('s3.help.general.title')
        : key === 'incidente'
        ? t('s3.incidente')
        : key === 'momentoCambio'
        ? t('s3.momentoCambio')
        : key === 'puntoMedio'
        ? t('s3.puntoMedio')
        : key === 'crisis'
        ? t('s3.crisis')
        : t('s3.climax');

    const langKey = (lang as 'es' | 'en' | 'ca') || 'es';
    const body = helpDocs[key][langKey] || helpDocs[key].es;
    setHelpOpen({ title, body });
  };

  const aiPropose = (k: Key) => {
    const base = (screenplay?.synopsis || '').trim();
    const ctx = base ? `\n\n${lang === 'en' ? 'Context:' : lang === 'ca' ? 'Context:' : 'Contexto:'} ${base.slice(0, 400)}${base.length > 400 ? '…' : ''}` : '';
    const langKey = (lang as 'es' | 'en' | 'ca') || 'es';
    const text = AI_TEMPLATES[langKey][k](ctx);
    setSummary(k, text);
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header con ayuda general */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('s3.title')}
        </Typography>
        <Tooltip title={t('s3.help.general.tooltip')}>
          <IconButton onClick={() => openHelp('general')}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
        {t('s3.subtitle')}
      </Typography>

      {/* Layout vertical — cards apiladas y anchas */}
      <Stack spacing={2}>
        {(['incidente', 'momentoCambio', 'puntoMedio', 'crisis', 'climax'] as Key[]).map((k) => (
          <Paper key={k} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {LABELS[k](t)}
              </Typography>

              {/* Botones a la derecha */}
              <Box sx={{ flexGrow: 1 }} />

              <Tooltip title={t('s3.btn.ai.tooltip')}>
                <span>
                  <Button
                    size="small"
                    startIcon={<PsychologyIcon />}
                    onClick={() => aiPropose(k)}
                    sx={{ mr: 0.5 }}
                  >
                    {t('s3.btn.ai')}
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={LABELS[k](t)}>
                <IconButton size="small" onClick={() => openHelp(k)}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <TextField
              label={t('s3.summary.label')}
              value={getSummary(k)}
              onChange={(e) => setSummary(k, e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
          </Paper>
        ))}
      </Stack>

      {/* Modal de ayuda (general o por punto) */}
      <Dialog open={!!helpOpen} onClose={() => setHelpOpen(null)} maxWidth="md" fullWidth>
        <DialogTitle>{helpOpen?.title}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box className="markdown-body">
            {helpOpen?.body && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src = '', alt, ...props }) => {
                    // Compat con BASE_URL y ajuste responsive/contain en modal
                    const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
                    const fixedSrc = src.startsWith('/assets/') ? `${base}${src}` : src;
                    return (
                      <img
                        src={fixedSrc}
                        alt={typeof alt === 'string' ? alt : ''}
                        loading="lazy"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          maxHeight: '65vh',
                          display: 'block',
                          margin: '0.5rem auto'
                        }}
                        {...props}
                      />
                    );
                  }
                }}
              >
                {helpOpen.body}
              </ReactMarkdown>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(null)}>{t('action.close')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
