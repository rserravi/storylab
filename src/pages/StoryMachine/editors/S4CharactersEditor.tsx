// src/pages/StoryMachine/editors/S4CharactersEditor.tsx
import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, IconButton, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip,
  Grid, Popover, InputAdornment, Avatar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadIcon from '@mui/icons-material/Upload';
import Autocomplete from '@mui/material/Autocomplete';

import { useScreenplay } from '../../../state/screenplayStore';
import type { Character } from '../../../types';
import { ARCHETYPES } from '../../../data/archetypes';
import { AI_STYLES, type AIStyle } from '../../../data/aiStyles';
import { useTraitSuggestions } from '../../../data/traits';
import { useT, useTx } from '../../../i18n';
import {
  createEmpty,
  dedupeStrings,
  filterOptions,
  normalizeDraft,
  summarizeInline,
} from './characterUtils';

/* ───────────────── helpers de etiquetado i18n (guardamos códigos) ───────────────── */

function archLabel(value: string, t:(k:string)=>string) {
  const key = `arch.${value}`;
  const label = t(key);
  return label === key ? value : label;
}

/* ───────────────────── helpers ───────────────────── */

function fileToImage(file: File): Promise<{ id: string; src: string; name?: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve({
      id: crypto.randomUUID(),
      src: String(reader.result),
      name: file.name,
    });
    reader.readAsDataURL(file);
  });
}

async function generateMockImageFromPrompt(prompt: string, style?: string): Promise<{ id: string; src: string; name?: string }> {
  const w = 1024, h = 576;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const hue = Math.abs(hashCode(prompt + '|' + (style || ''))) % 360;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `hsl(${hue},70%,55%)`);
  g.addColorStop(1, `hsl(${(hue + 60) % 360},70%,35%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(style || 'AI Concept', 32, 72);
  ctx.font = '24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const lines = wrapText(ctx, prompt, w - 64);
  let y = 120;
  for (const line of lines.slice(0, 7)) {
    ctx.fillText(line, 32, y);
    y += 34;
  }
  const data = canvas.toDataURL('image/png');
  return { id: crypto.randomUUID(), src: data, name: `ai-${Date.now()}.png` };
}

function hashCode(str: string) {
  let h = 0, i = 0, len = str.length;
  while (i < len) { h = (h << 5) - h + str.charCodeAt(i++) | 0; }
  return h;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;

}

/* ───────────────── componente principal ───────────────── */

export default function S4CharactersEditor() {
  const t = useT();
  const tx = useTx();
  const { screenplay, patch } = useScreenplay();
  const characters = screenplay?.characters ?? [];

  const [editing, setEditing] = useState<Character | null>(null);

  // Popovers (detalle rápido)
  const [bioOpen, setBioOpen] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const [relOpen, setRelOpen] = useState<{ id: string; anchor: HTMLElement } | null>(null);

  // Buscador
  const [q, setQ] = useState('');

  const addCharacter = () => {
    const newChar = createEmpty();
    patch({ characters: [...characters, newChar] });
    setEditing(newChar);
  };
  const updateCharacter = (id: string, ch: Character) => {
    patch({ characters: (screenplay?.characters ?? []).map(c => c.id === id ? ch : c) });
  };
  const removeCharacter = (id: string) => {
    const next = (screenplay?.characters ?? []).filter(c => c.id !== id);
    const cleaned = next.map(c => ({ ...c, relations: c.relations.filter(r => r.targetId !== id) }));
    patch({ characters: cleaned });
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return characters;
    const matches = (s?: string) => (s || '').toLowerCase().includes(term);
    return characters.filter(c => {
      // nombre, arquetipos, rasgos, conflicto, arco, necesidades, bio, voz, relaciones
      if (matches(c.name)) return true;
      if (c.archetypes?.some(a => matches(a))) return true;
      if (c.nature?.some(n => matches(n))) return true;
      if (c.attitude?.some(a => matches(a))) return true;
      if (matches(c.conflictInternal)) return true;
      if (matches(c.conflictPersonal)) return true;
      if (matches(c.conflictExtrapersonal)) return true;

      if (matches(c.arc)) return true;
      if (matches(c.needGlobal) || matches(c.needH1) || matches(c.needH2)) return true;
      if (matches(c.biography) || matches(c.voice) || matches(c.paradoxes)) return true;
      if (c.relations?.some(r => matches(r.description))) return true;
      return false;
    });
  }, [characters, q]);

  return (
    <Box>
      {/* Header con buscador */}
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('s4.title')}</Typography>
          <Button startIcon={<AddIcon/>} onClick={addCharacter}>{t('s4.add')}</Button>
        </Stack>

        <TextField
          variant="outlined"
          size="small"
          label={t('s4.search.label')}
          placeholder={t('s4.search.placeholder')}
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: q ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={()=>setQ('')}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />
        <Typography variant="caption" sx={{ opacity:.7 }}>
          {tx('s4.search.results', { n: filtered.length })}
        </Typography>
      </Stack>

      {/* Resultado: cards en dos columnas */}
      {filtered.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2">{t('s4.search.noResults')}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((c) => (
            <Grid key={c.id} size={{ xs: 12, md: 6, lg: 6 }}>
              <CompactCharacterCard
                c={c}
                t={t}
                onEdit={() => setEditing(c)}
                onDelete={() => removeCharacter(c.id)}
                onOpenBio={(anchor) => setBioOpen({ id: c.id, anchor })}
                onOpenRelations={(anchor) => setRelOpen({ id: c.id, anchor })}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de edición */}
      {editing && (
        <EditCharacterDialog
          open={!!editing}
          value={editing}
          allCharacters={characters}
          onCancel={() => setEditing(null)}
          onSave={(next) => { updateCharacter(editing.id, next); setEditing(null); }}
        />
      )}

      {/* Popover Biografía */}
      <Popover
        open={!!bioOpen}
        anchorEl={bioOpen?.anchor ?? null}
        onClose={() => setBioOpen(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { maxWidth: 420, p: 1, maxHeight: '60vh', overflowY: 'auto' } }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: .5 }}>{t('s4.card.biography')}</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {characters.find(x => x.id === bioOpen?.id)?.biography || '—'}
          </Typography>
        </Box>
      </Popover>

      {/* Popover Relaciones */}
      <Popover
        open={!!relOpen}
        anchorEl={relOpen?.anchor ?? null}
        onClose={() => setRelOpen(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { maxWidth: 420, p: 1, maxHeight: '60vh', overflowY: 'auto' } }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: .5 }}>{t('s4.card.relations')}</Typography>
          <Stack spacing={.5}>
            {(characters.find(x => x.id === relOpen?.id)?.relations ?? []).length
              ? (characters.find(x => x.id === relOpen?.id)?.relations ?? []).map(r => {
                  const other = characters.find(x => x.id === r.targetId);
                  return (
                    <Typography key={r.id} variant="body2">
                      {t('s4.relations.with')} <strong>{other?.name || t('s4.noname')}</strong>: {r.description || '—'}
                    </Typography>
                  );
                })
              : <Typography variant="body2">—</Typography>
            }
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}

/* ───────────────── Card compacta (se mantiene) ───────────────── */

  function CompactCharacterCard({
    c, t,
    onEdit, onDelete,
    onOpenBio, onOpenRelations
  }: {
    c: Character; t: (k:string)=>string;
    onEdit: () => void; onDelete: () => void;
    onOpenBio: (anchor: HTMLElement) => void;
    onOpenRelations: (anchor: HTMLElement) => void;
  }) {
  const arch = c.archetypes || [];
  const nature = summarizeInline(c.nature, 3);
  const attitude = summarizeInline(c.attitude, 3);

  const relationsCount = c.relations?.length ?? 0;
  const voiceShort = (c.voice || '').trim();

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      {/* Header: nombre + acciones */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: .5 }}>
        <Avatar src={c.image} sx={{ width: 24, height: 24 }}>
          <PersonIcon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.name?.trim() || t('s4.noname')}
        </Typography>
        {c.archetypes?.[0] && (
          <Chip size="small" label={archLabel(c.archetypes[0], t)} variant="outlined" />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={t('s4.edit')}>
          <IconButton onClick={onEdit} size="small"><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('s4.delete')}>
          <IconButton onClick={onDelete} size="small" color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Stack>

      {/* Arquetipos — chips con +N */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ display:'block', mb:.25, fontWeight:600, opacity:.8 }}>
          {t('s4.card.archetypes')}
        </Typography>
        <Stack direction="row" spacing={.5} useFlexGap flexWrap="wrap">
          {arch.slice(0, 3).map(a => (
            <Chip key={a} size="small" label={archLabel(a, t)} variant="outlined" />
          ))}
          {arch.length > 3 && (
            <Tooltip title={arch.map(a => archLabel(a, t)).join(' · ')}>
              <Chip size="small" label={`+${arch.length - 3}`} />
            </Tooltip>
          )}
          {arch.length === 0 && <Typography variant="body2">—</Typography>}
        </Stack>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Naturaleza / Actitud */}
      <Box sx={{ mb: .5 }}>
        <LabelLine label={t('s4.card.nature')} summary={nature} />
        <LabelLine label={t('s4.card.attitude')} summary={attitude} />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Necesidades & Arco (resumen denso) */}
      <Box sx={{ mb: .5 }}>
        <Typography variant="caption" sx={{ display:'block', mb:.25, fontWeight:600, opacity:.8 }}>
          {t('s4.card.need.global').split(' — ')[0]} & {t('s4.card.arc').split(' ')[0]}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={[
            `Global: ${c.needGlobal || '—'}`,
            `1ª: ${c.needH1 || '—'}`,
            `2ª: ${c.needH2 || '—'}`,
            `Arco: ${c.arc || '—'}`
          ].join('\n')}
        >
          • Global: {c.needGlobal || '—'} · 1ª: {c.needH1 || '—'} · 2ª: {c.needH2 || '—'}
          {c.arc ? ` — Arco: ${c.arc}` : ''}
        </Typography>
      </Box>

      {/* Conflictos (resumen) */}
      <Box sx={{ mb: .5 }}>
        <Typography variant="caption" sx={{ display:'block', mb:.25, fontWeight:600, opacity:.8 }}>
          {t('s4.card.conflict')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={[
            `${t('s4.card.conflict.internal')}: ${c.conflictInternal || '—'}`,
            `${t('s4.card.conflict.personal')}: ${c.conflictPersonal || '—'}`,
            `${t('s4.card.conflict.extrapersonal')}: ${c.conflictExtrapersonal || '—'}`
          ].join('\n')}
        >
          • {t('s4.card.conflict.internal')}: {c.conflictInternal || '—'} · {t('s4.card.conflict.personal')}: {c.conflictPersonal || '—'} · {t('s4.card.conflict.extrapersonal')}: {c.conflictExtrapersonal || '—'}
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Footer: Relaciones (popover) + Voz + Bio (popover) */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap:'wrap' }}>
        <Chip
          size="small"
          variant="outlined"
          label={`${t('s4.card.conflict')}: ${[
            c.conflictInternal && t('s4.conflict.level.internal'),
            c.conflictPersonal && t('s4.conflict.level.personal'),
            c.conflictExtrapersonal && t('s4.conflict.level.extrapersonal'),
          ].filter(Boolean).join(' · ') || '—'}`}
          sx={{ mr: .5 }}
        />


        {/* Relaciones (conteo + popover) */}
        <Tooltip title={t('s4.card.relations')}>
          <span>
            <Button
              size="small"
              startIcon={<PeopleAltIcon fontSize="small" />}
              onClick={(e) => onOpenRelations(e.currentTarget as HTMLElement)}
              disabled={relationsCount === 0}
              sx={{ textTransform: 'none' }}
            >
              {t('s4.card.relations')}: {relationsCount}
            </Button>
          </span>
        </Tooltip>

        {/* Voz corta */}
        {voiceShort ? (
          <Typography
            variant="body2"
            sx={{
              ml: .5,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexGrow: 0
            }}
            title={`${t('s4.card.voice')}: ${voiceShort}`}
          >
            🔊 {voiceShort}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ ml: .5, opacity:.7, flexGrow: 0 }}>—</Typography>
        )}

        {/* Biografía (popover) */}
        <Tooltip title={t('s4.card.biography')}>
          <IconButton size="small" onClick={(e)=>onOpenBio(e.currentTarget as HTMLElement)}>
            <ArticleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

/* ───────────────── subcomponentes compactos ───────────────── */

function LabelLine({ label, summary }: { label: string; summary: { text: string; rest: number; full: string } }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ my: .25 }}>
      <Typography variant="caption" sx={{ fontWeight:600, opacity:.8, minWidth: 86 }}>{label}</Typography>
      {summary.text ? (
        <Tooltip title={summary.full}>
          <Typography
            variant="body2"
            sx={{
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1
            }}
          >
            {summary.text}{summary.rest > 0 ? `  +${summary.rest}` : ''}
          </Typography>
        </Tooltip>
      ) : (
        <Typography variant="body2">—</Typography>
      )}
    </Stack>
  );
}

/* ───────────────── Modal de edición (igual que antes) ───────────────── */

type EditProps = {
  open: boolean;
  value: Character;
  allCharacters: Character[];
  onCancel: () => void;
  onSave: (next: Character) => void;
};

function EditCharacterDialog({ open, value, allCharacters, onCancel, onSave }: EditProps) {
  const t = useT();
  const traitSuggestions = useTraitSuggestions();
  const [draft, setDraft] = useState<Character>(value);
  useMemo(() => setDraft({ ...createEmpty(), ...value }), [value?.id]); // sync al cambiar personaje
  const set = (patch: Partial<Character>) => setDraft(prev => ({ ...prev, ...patch }));

  const otherCharacters = allCharacters.filter(c => c.id !== draft.id);
  const canRelate = otherCharacters.length > 0;

  // Estado para generación de imagen IA (mock)
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<AIStyle>('cinematic');
  const [aiBusy, setAiBusy] = useState(false);

  const onFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const img = await fileToImage(files[0]);
    set({ image: img });
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const img = await generateMockImageFromPrompt(aiPrompt, t(`s6.aiStyle.${aiStyle}`));
      set({ image: img });
      setAiOpen(false);
      setAiPrompt('');
    } finally {
      setAiBusy(false);
    }
  };

  const handleAiComplete = () => {
    // TODO: implement AI completion for character fields
  };

  return (
    <>
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px:3, py:2 }}>
        <DialogTitle sx={{ flexGrow:1, p:0 }}>{t('s4.modal.title')}</DialogTitle>
        <Button startIcon={<AutoAwesomeIcon/>} onClick={handleAiComplete}>
          {t('s4.modal.aiComplete')}
        </Button>
      </Stack>
      <DialogContent dividers sx={{ maxHeight:'80vh' }}>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={draft.image?.src} sx={{ width: 80, height: 80 }} />
            <TextField label={t('s4.modal.name')} value={draft.name} onChange={(e)=>set({ name: e.target.value })} fullWidth />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button component="label" startIcon={<UploadIcon/>} variant="outlined">
              {t('s4.image.upload')}
              <input type="file" accept="image/*" hidden onChange={(e)=>onFile(e.target.files)} />
            </Button>
            <Button startIcon={<AutoAwesomeIcon/>} variant="outlined" onClick={()=>setAiOpen(true)}>
              {t('s4.image.generate')}
            </Button>
          </Stack>

          <Autocomplete
            multiple
            options={ARCHETYPES as unknown as string[]}
            value={draft.archetypes}
            onChange={(_, v) => set({ archetypes: v as string[] })}
            getOptionLabel={(o)=> archLabel(o as string, t)}
            renderOption={(props, option)=> (<li {...props}>{archLabel(option as string, t)}</li>)}
            renderTags={(value, getTagProps) =>
              value.map((opt, idx) => <Chip {...getTagProps({ index: idx })} label={archLabel(opt as string, t)} size="small" />)
            }
            renderInput={(p)=><TextField {...p} label={t('s4.modal.archetypes')} placeholder={archLabel('hero', t)} />}
          />

          <Autocomplete
            multiple 
            freeSolo
            options={traitSuggestions as unknown as string[]}
            filterOptions={filterOptions}
            value={draft.nature}
            onChange={(_, v) => set({ nature: dedupeStrings(v as string[]) })}
            renderInput={(p) => (
              <TextField
                {...p}
                label={t('s4.modal.nature')}
                placeholder={t('s4.modal.nature.placeholder')}
              />
            )}
          />
          <Autocomplete
            multiple
            freeSolo
            options={traitSuggestions as unknown as string[]}
            filterOptions={filterOptions}
            value={draft.attitude}
            onChange={(_, v) => set({ attitude: dedupeStrings(v as string[]) })}
            renderInput={(p) => (
              <TextField
                {...p}
                label={t('s4.modal.attitude')}
                placeholder={t('s4.modal.attitude.placeholder')}
              />
            )}
          />

          <TextField label={t('s4.card.need.global')} value={draft.needGlobal} onChange={(e)=>set({ needGlobal: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.need.h1')} value={draft.needH1} onChange={(e)=>set({ needH1: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.need.h2')} value={draft.needH2} onChange={(e)=>set({ needH2: e.target.value })} multiline minRows={2} fullWidth />

          <TextField label={t('s4.card.arc')} value={draft.arc} onChange={(e)=>set({ arc: e.target.value })} multiline minRows={3} fullWidth />

          <TextField label={t('s4.card.conflict.internal')} value={draft.conflictInternal} onChange={(e)=>set({ conflictInternal: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.conflict.personal')} value={draft.conflictPersonal} onChange={(e)=>set({ conflictPersonal: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.conflict.extrapersonal')} value={draft.conflictExtrapersonal} onChange={(e)=>set({ conflictExtrapersonal: e.target.value })} multiline minRows={2} fullWidth />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:1 }}>
              <Typography variant="subtitle2">{t('s4.card.relations')}</Typography>
              <Box sx={{ flexGrow:1 }} />
              <Button onClick={()=>{
                if (!canRelate) return;
                const first = otherCharacters[0]?.id;
                set({ relations: [...(draft.relations ?? []), { id: crypto.randomUUID(), targetId: first, description: '' }] });
              }} disabled={!canRelate}>{t('s4.relations.add')}</Button>
            </Stack>

            {(draft.relations ?? []).length === 0 ? (
              <Typography variant="body2" sx={{ opacity:.7 }}>
                {otherCharacters.length ? t('s4.relations.none') : t('s4.relations.needMore')}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {draft.relations!.map((r) => (
                  <Stack key={r.id} direction={{ xs:'column', sm:'row' }} spacing={1} alignItems="stretch">
                    <Autocomplete
                      options={otherCharacters}
                      getOptionLabel={(o)=>o.name || t('s4.noname')}
                      value={otherCharacters.find(o=>o.id === r.targetId) || null}
                      onChange={(_, v)=> set({ relations: (draft.relations ?? []).map(x => x.id === r.id ? { ...x, targetId: v?.id || '' } : x) })}
                      renderInput={(p)=><TextField {...p} label="Personaje" />}
                      sx={{ minWidth: 240 }}
                    />
                    <TextField
                      label="Relación (texto)"
                      value={r.description}
                      onChange={(e)=> set({ relations: (draft.relations ?? []).map(x => x.id === r.id ? { ...x, description: e.target.value } : x) })}
                      fullWidth
                    />
                    <IconButton onClick={()=> set({ relations: (draft.relations ?? []).filter(x => x.id !== r.id) })} color="error"><DeleteOutlineIcon/></IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <TextField label={t('s4.card.paradoxes')} value={draft.paradoxes} onChange={(e)=>set({ paradoxes: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.biography')} value={draft.biography} onChange={(e)=>set({ biography: e.target.value })} multiline minRows={4} fullWidth />
          <TextField label={t('s4.card.voice')} value={draft.voice} onChange={(e)=>set({ voice: e.target.value })} multiline minRows={2} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('s4.modal.cancel')}</Button>
        <Button onClick={()=>onSave(normalizeDraft(draft))} variant="contained">{t('s4.modal.save')}</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={aiOpen} onClose={()=>!aiBusy && setAiOpe(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{t('s6.ai.title')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <TextField
            label={t('s6.ai.prompt')}
            value={aiPrompt}
            onChange={(e)=>setAiPrompt(e.target.value)}
            placeholder={t('s6.ai.promptPh')}
            multiline minRows={3} fullWidth
          />
          <TextField
            label={t('s6.ai.style')}
            select
            value={aiStyle}
            onChange={(e)=>setAiStyle(e.target.value as AIStyle)}
            SelectProps={{ native: true }}
          >
            {AI_STYLES.map(s => (
              <option key={s} value={s}>{t(`s6.aiStyle.${s}`)}</option>
            ))}
          </TextField>
          <Typography variant="caption" sx={{ opacity:.7 }}>
            {t('s6.ai.note')}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>!aiBusy && setAiOpen(false)} disabled={aiBusy}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleAIGenerate}
          disabled={aiBusy || !aiPrompt.trim()}
          startIcon={aiBusy ? <CircularProgress size={18} /> : <AutoAwesomeIcon/>}
        >
          {aiBusy ? t('s6.ai.generating') : t('s6.ai.generate')}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
