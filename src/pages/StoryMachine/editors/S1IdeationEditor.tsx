import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, Paper, Stack, TextField, Tooltip, Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../../styles/markdown.css';

import type { IdeaRow, UniversalTheme } from '../../../types';
import { useScreenplay } from '../../../state/screenplayStore';
import { isValidIdea, isValidPremise, isValidIdeaRow } from './guards';
import { useT, themeLabel } from '../../../i18n';

import egriEs from '../../../content/s1-egri.md?raw';
import egriEn from '../../../content/s1-egri.en.md?raw';
import egriCa from '../../../content/s1-egri.ca.md?raw';
import themesEs from '../../../content/s1-themes.md?raw';
import themesEn from '../../../content/s1-themes.en.md?raw';
import themesCa from '../../../content/s1-themes.ca.md?raw';

import { useUi } from '../../../state/uiStore';

import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { GENRES } from '../../../data/genres';

const THEME_PAIRS: [UniversalTheme, UniversalTheme][] = [
  ['Amor', 'Odio'],
  ['Mesías', 'Malvado'],
  ['Búsqueda', 'Secreto'],
  ['Condena', 'Libertad'],
  ['Engaño', 'Verdad']
];

function createEmptyRow(): IdeaRow {
  return { id: crypto.randomUUID(), idea: '', premise: '', mainTheme: 'Amor', genre: '' };
}

function mockSynopsis({ idea, premise, mainTheme, genre }: IdeaRow) {
  const lead = `En ${genre || 'un mundo por definir'}, una chispa prende: ${idea.trim().replace(/\.$/, '')}.`;
  const egri = `Según la premisa, ${premise.trim().replace(/\.$/, '')}.`;
  const act1 = `Un protagonista común sale de su zona de confort cuando un evento inesperado compromete lo que más valora.`;
  const act2 = `La presión crece y revela fisuras; el tema de **${mainTheme}** guía sus dilemas.`;
  const act3 = `La decisión final pondrá a prueba la hipótesis y definirá el desenlace.`;
  return [lead, egri, act1, act2, act3].join(' ');
}

const filterOptions = createFilterOptions<string>({
  ignoreAccents: true, ignoreCase: true, matchFrom: 'any', limit: 50
});

export default function S1IdeationEditor() {
  const t = useT();
  const { screenplay, setIdeationRows, setDecidedRow, setSynopsis } = useScreenplay();
  const rows = screenplay?.ideation?.rows || [];

  const { lang } = useUi();

  const egriDocByLang = lang === 'en' ? egriEn : lang === 'ca' ? egriCa : egriEs;
  const themesDocByLang = lang === 'en' ? themesEn : lang === 'ca' ? themesCa : themesEs;

  const [helpOpen, setHelpOpen] = useState(false);
  const [themesHelpOpen, setThemesHelpOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!screenplay) return;
    if (!screenplay.ideation || !screenplay.ideation.rows?.length) {
      const r = createEmptyRow();
      setIdeationRows([r]);
      setExpandedId(r.id);
      setActiveId(r.id);
    } else {
      const decided = screenplay.ideation.decidedRowId || screenplay.ideation.rows[0].id;
      setActiveId(decided);
      setExpandedId(decided);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenplay?.id]);

  const addRow = () => {
    if (rows.length >= 5) return;
    const r = createEmptyRow();
    setIdeationRows([...rows, r]);
    setExpandedId(r.id);
    setActiveId(r.id);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    const next = rows.filter(r => r.id !== id);
    setIdeationRows(next);
    if (screenplay?.ideation?.decidedRowId === id) setDecidedRow(null);
    if (activeId === id) setActiveId(next[0]?.id || null);
    if (expandedId === id) setExpandedId(next[0]?.id || null);
  };

  const updateRow = (id: string, patch: Partial<IdeaRow>) => {
    const next = rows.map(r => r.id === id ? { ...r, ...patch } : r);
    setIdeationRows(next);
  };

  const chooseRow = (id: string) => { setDecidedRow(id); setActiveId(id); };
  const generateMock = (id: string) => { const r = rows.find(x => x.id === id); if (!r) return; updateRow(id, { synopsisDraft: mockSynopsis(r) }); setActiveId(id); };
  const useAsSynopsis = (id: string) => {
    const r = rows.find(x => x.id === id); if (!r) return;
    const text = r.synopsisDraft && r.synopsisDraft.trim() ? r.synopsisDraft : mockSynopsis(r);
    setSynopsis(text); chooseRow(id); updateRow(id, { synopsisDraft: text });
  };

  const anyValid = rows.some(isValidIdeaRow);
  const activeRow = rows.find(r => r.id === activeId) || null;

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('s1.title')}
        </Typography>
        <Tooltip title={t('s1.help.egri.tooltip')}>
          <IconButton onClick={() => setHelpOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography variant="body2" sx={{ opacity: .8 }}>
        {t('s1.subtitle')}
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {rows.map((r, idx) => {
          const validIdea = isValidIdea(r.idea);
          const validPremise = isValidPremise(r.premise);
          const validRow = validIdea && validPremise && !!r.mainTheme;
          const expanded = expandedId === r.id;

          return (
            <Paper key={r.id} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  onClick={() => { setExpandedId(expanded ? null : r.id); setActiveId(r.id); }}
                  sx={{ cursor: 'pointer' }}
                >
                  {t('s1.idea')} #{idx + 1}
                </Typography>
                {r.chosen && <Chip size="small" color="success" label={t('s1.chosen')} icon={<CheckCircleIcon />} />}
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title={expanded ? t('s1.tooltip.collapse') : t('s1.tooltip.expand')}>
                  <IconButton onClick={() => { setExpandedId(expanded ? null : r.id); setActiveId(r.id); }}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={rows.length <= 1 ? t('s1.tooltip.keepOne') : t('s1.tooltip.delete')}>
                  <span>
                    <IconButton onClick={() => removeRow(r.id)} disabled={rows.length <= 1}><DeleteOutlineIcon /></IconButton>
                  </span>
                </Tooltip>
              </Stack>

              <Collapse in={expanded} unmountOnExit>
                <Stack spacing={1.5}>
                  <TextField
                    label={t('s1.idea.label')}
                    value={r.idea}
                    onChange={(e) => updateRow(r.id, { idea: e.target.value })}
                    error={!validIdea && !!r.idea}
                    helperText={!validIdea && !!r.idea ? t('s1.idea.helper.invalid') : ' '}
                  />

                  <TextField
                    label={t('s1.premise.label')}
                    placeholder={t('s1.premise.placeholder')}
                    value={r.premise}
                    onChange={(e) => updateRow(r.id, { premise: e.target.value })}
                    error={!validPremise && !!r.premise}
                    helperText={!validPremise && !!r.premise ? t('s1.premise.helper.invalid') : ' '}
                  />

                  {/* Temas en parejas + ayuda */}
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>{t('s1.theme.title')}</Typography>
                    <Stack direction="row" useFlexGap flexWrap="wrap" alignItems="center" spacing={1.5}>
                      {THEME_PAIRS.map(([a, b]) => (
                        <Box key={`${a}-${b}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, mb: 1 }}>
                          <Chip
                            label={themeLabel(a, t)}
                            color={r.mainTheme === a ? 'primary' : 'default'}
                            variant={r.mainTheme === a ? 'filled' : 'outlined'}
                            onClick={() => updateRow(r.id, { mainTheme: a })}
                          />
                          <Typography component="span" sx={{ opacity: .6 }}>|</Typography>
                          <Chip
                            label={themeLabel(b, t)}
                            color={r.mainTheme === b ? 'primary' : 'default'}
                            variant={r.mainTheme === b ? 'filled' : 'outlined'}
                            onClick={() => updateRow(r.id, { mainTheme: b })}
                          />
                        </Box>
                      ))}
                      <Tooltip title={t('s1.theme.help.tooltip')}>
                        <IconButton size="small" onClick={() => setThemesHelpOpen(true)}>
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Género principal */}
                  <Autocomplete
                    freeSolo
                    options={GENRES as unknown as string[]}
                    filterOptions={filterOptions}
                    value={r.genre || ''}
                    inputValue={r.genre || ''}
                    onInputChange={(_, newInput) => updateRow(r.id, { genre: newInput })}
                    onChange={(_, newValue) => updateRow(r.id, { genre: (newValue as string) || '' })}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                      <TextField {...params} label={t('s1.genre.label')} placeholder={t('s1.genre.placeholder')} />
                    )}
                  />

                  {/* Subgéneros múltiples */}
                  <Autocomplete
                    multiple
                    freeSolo
                    options={GENRES as unknown as string[]}
                    filterOptions={filterOptions}
                    value={r.subgenres || []}
                    onChange={(_, newValue) => {
                      const base = (r.genre || '').trim().toLowerCase();
                      const unique = Array.from(new Set((newValue as string[])
                        .map(v => (v || '').trim())
                        .filter(Boolean)
                        .filter(v => v.toLowerCase() !== base)
                      ));
                      updateRow(r.id, { subgenres: unique });
                    }}
                    limitTags={4}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                      <TextField {...params} label={t('s1.subgenres.label')} placeholder={t('s1.subgenres.placeholder')} />
                    )}
                  />

                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<PsychologyIcon />} onClick={() => generateMock(r.id)}>
                      {t('s1.btn.ia')}
                    </Button>
                    <Button variant="text" onClick={() => { setActiveId(r.id); }}>
                      {t('s1.btn.viewBelow')}
                    </Button>
                    <Button variant="outlined" onClick={() => useAsSynopsis(r.id)}>
                      {t('s1.btn.useAsSynopsis')}
                    </Button>
                    <Button variant="text" onClick={() => chooseRow(r.id)}>
                      {t('s1.btn.markChosen')}
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 0.5 }}>
                    {validRow
                      ? <Chip size="small" color="success" label={t('s1.status.valid')} />
                      : <Chip size="small" label={t('s1.status.incomplete')} />}
                  </Box>
                </Stack>
              </Collapse>
            </Paper>
          );
        })}

        <Stack direction="row" spacing={1}>
          <Button onClick={addRow} disabled={rows.length >= 5}>{t('s1.btn.addIdea')}</Button>
          {!anyValid && <Alert severity="info" sx={{ ml: 1, py: 0 }}>{t('s1.needOneValid')}</Alert>}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">{t('s1.synopsis.title')}</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
          {rows.map((r, i) => (
            <Chip
              key={r.id}
              label={`${t('s1.idea')} #${i + 1}`}
              color={activeId === r.id ? 'primary' : 'default'}
              onClick={() => setActiveId(r.id)}
            />
          ))}
        </Stack>

        {activeRow ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button startIcon={<PsychologyIcon />} onClick={() => generateMock(activeRow.id)}>
                {t('s1.synopsis.regen')}
              </Button>
              <Button variant="outlined" onClick={() => useAsSynopsis(activeRow.id)}>
                {t('s1.btn.useAsSynopsis')}
              </Button>
            </Stack>
            <TextField
              multiline minRows={8} fullWidth
              value={activeRow.synopsisDraft || ''}
              onChange={(e) => updateRow(activeRow.id, { synopsisDraft: e.target.value })}
              placeholder=""
            />
          </Paper>
        ) : (
          <Alert severity="info">{t('s1.synopsis.selectPrompt')}</Alert>
        )}
      </Stack>

      {/* MODAL — Egri */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('s1.help.egri.title')}</DialogTitle>
        <DialogContent dividers>
          <Box className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{egriDocByLang}</ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>{t('action.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL — Temas */}
      <Dialog open={themesHelpOpen} onClose={() => setThemesHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('s1.help.themes.title')}</DialogTitle>
        <DialogContent dividers>
          <Box className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{themesDocByLang}</ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThemesHelpOpen(false)}>{t('action.close')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
