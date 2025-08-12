// src/pages/StoryMachine/editors/S4CharactersEditor.tsx
import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, IconButton, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip,
  Grid, Popover, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

import { useScreenplay } from '../../../state/screenplayStore';
import type { Character, CharacterRelation, ConflictLevel } from '../../../types';
import { ARCHETYPES } from '../../../data/archetypes';
import { TRAIT_SUGGESTIONS } from '../../../data/traits';
import { useT, useTx } from '../../../i18n';

/* ───────────────── helpers de etiquetado i18n (guardamos valores en ES) ───────────────── */

const ARCH_CODE: Record<string, 'hero'|'mentor'|'threshold'|'herald'|'trickster'|'shadow'|'shapeshifter'> = {
  'Héroe': 'hero',
  'Mentor': 'mentor',
  'Guardián (del umbral)': 'threshold',
  'Heraldo': 'herald',
  'Pícaro / Embaucador': 'trickster',
  'Sombra': 'shadow',
  'Camaleón / Cambiante': 'shapeshifter'
};
const CONFLICT_CODE: Record<string, 'extrapersonal'|'personal'|'internal'> = {
  'Extrapersonal': 'extrapersonal',
  'Personal': 'personal',
  'Interno': 'internal'
};
function archLabel(value: string, t:(k:string)=>string) {
  const code = ARCH_CODE[value]; return code ? t(`arch.${code}`) : value;
}
function conflictLabel(value: string, t:(k:string)=>string) {
  const code = CONFLICT_CODE[value]; return code ? t(`s4.conflict.level.${code}`) : value;
}
function conflictChipColor(level: string): 'default'|'info'|'warning'|'error' {
  if (level === 'Interno') return 'info';
  if (level === 'Personal') return 'warning';
  if (level === 'Extrapersonal') return 'error';
  return 'default';
}

/* ───────────────── datos y utilidades ───────────────── */

const filterOptions = createFilterOptions<string>({ ignoreAccents: true, ignoreCase: true, matchFrom: 'any', limit: 50 });

function createEmpty(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    archetypes: [],
    nature: [],
    attitude: [],
    needGlobal: '',
    needH1: '',
    needH2: '',
    arc: '',
    conflictLevel: 'Interno',
    conflictDesc: '',
    relations: [],
    paradoxes: '',
    biography: '',
    voice: ''
  };
}

function summarizeInline(list?: string[], max = 3) {
  const safe = (list ?? []).map(s => s.trim()).filter(Boolean);
  const shown = safe.slice(0, max);
  const rest = Math.max(0, safe.length - shown.length);
  return { text: shown.join(' · '), rest, full: safe.join(' · ') };
}

function dedupeStrings(arr: string[]) {
  return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)));
}

function normalizeDraft(d: Character): Character {
  return {
    ...d,
    name: (d.name || '').trim(),
    archetypes: dedupeStrings(d.archetypes),
    nature: dedupeStrings(d.nature),
    attitude: dedupeStrings(d.attitude),
    needGlobal: (d.needGlobal || '').trim(),
    needH1: (d.needH1 || '').trim(),
    needH2: (d.needH2 || '').trim(),
    arc: (d.arc || '').trim(),
    conflictDesc: (d.conflictDesc || '').trim(),
    relations: (d.relations || []).map(r => ({ ...r, description: (r.description || '').trim() })),
    paradoxes: (d.paradoxes || '').trim(),
    biography: (d.biography || '').trim(),
    voice: (d.voice || '').trim()
  };
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
    patch({ characters: [...characters, createEmpty()] });
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
      if (matches(c.conflictLevel)) return true;
      if (matches(c.conflictDesc)) return true;
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
                all={characters}
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
  c, all, t,
  onEdit, onDelete,
  onOpenBio, onOpenRelations
}: {
  c: Character; all: Character[]; t: (k:string)=>string;
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
        <PersonIcon sx={{ opacity: .7 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.name?.trim() || t('s4.noname')}
        </Typography>
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

      <Divider sx={{ my: 1 }} />

      {/* Footer: Conflicto + Relaciones (popover) + Voz + Bio (popover) */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap:'wrap' }}>
        <Chip
          size="small"
          variant="outlined"
          color={conflictChipColor(c.conflictLevel)}
          label={`${t('s4.card.conflict')}: ${c.conflictLevel ? conflictLabel(c.conflictLevel, t) : '—'}`}
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
              flexGrow: 1
            }}
            title={`${t('s4.card.voice')}: ${voiceShort}`}
          >
            🔊 {voiceShort}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ ml: .5, opacity:.7, flexGrow: 1 }}>—</Typography>
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
  const [draft, setDraft] = useState<Character>(value);
  useMemo(() => setDraft(value), [value?.id]); // sync al cambiar personaje
  const set = (patch: Partial<Character>) => setDraft(prev => ({ ...prev, ...patch }));

  const otherCharacters = allCharacters.filter(c => c.id !== draft.id);
  const canRelate = otherCharacters.length > 0;
  const addRelation = () => {
    if (!canRelate) return;
    const first = otherCharacters[0]?.id;
    set({ relations: [...(draft.relations ?? []), { id: crypto.randomUUID(), targetId: first, description: '' }] });
  };
  const updateRelation = (id: string, patch: Partial<CharacterRelation>) => {
    set({ relations: (draft.relations ?? []).map(r => r.id === id ? { ...r, ...patch } : r) });
  };
  const removeRelation = (id: string) => {
    set({ relations: (draft.relations ?? []).filter(r => r.id !== id) });
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{t('s4.modal.title')}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight:'80vh' }}>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <TextField label={t('s4.modal.name')} value={draft.name} onChange={(e)=>set({ name: e.target.value })} fullWidth />

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
            renderInput={(p)=><TextField {...p} label={t('s4.modal.archetypes')} placeholder={archLabel('Héroe', t)} />}
          />

          <Autocomplete
            multiple freeSolo
            options={TRAIT_SUGGESTIONS as unknown as string[]}
            filterOptions={filterOptions}
            value={draft.nature}
            onChange={(_, v)=>set({ nature: dedupeStrings(v as string[]) })}
            renderInput={(p)=><TextField {...p} label={t('s4.modal.nature')} placeholder="parco, generoso, misterioso…" />}
          />
          <Autocomplete
            multiple freeSolo
            options={TRAIT_SUGGESTIONS as unknown as string[]}
            filterOptions={filterOptions}
            value={draft.attitude}
            onChange={(_, v)=>set({ attitude: dedupeStrings(v as string[]) })}
            renderInput={(p)=><TextField {...p} label={t('s4.modal.attitude')} placeholder="fanfarrón, cortés, valiente…" />}
          />

          <TextField label={t('s4.card.need.global')} value={draft.needGlobal} onChange={(e)=>set({ needGlobal: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.need.h1')} value={draft.needH1} onChange={(e)=>set({ needH1: e.target.value })} multiline minRows={2} fullWidth />
          <TextField label={t('s4.card.need.h2')} value={draft.needH2} onChange={(e)=>set({ needH2: e.target.value })} multiline minRows={2} fullWidth />

          <TextField label={t('s4.card.arc')} value={draft.arc} onChange={(e)=>set({ arc: e.target.value })} multiline minRows={3} fullWidth />

          <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
            <TextField
              select
              label={t('s4.card.conflict.level')}
              value={draft.conflictLevel}
              onChange={(e)=>set({ conflictLevel: e.target.value as ConflictLevel })}
              SelectProps={{ native: true }}
              sx={{ minWidth: 260 }}
            >
              <option value="Extrapersonal">{t('s4.conflict.level.extrapersonal')}</option>
              <option value="Personal">{t('s4.conflict.level.personal')}</option>
              <option value="Interno">{t('s4.conflict.level.internal')}</option>
            </TextField>
            <TextField
              label={t('s4.card.conflict.desc')}
              value={draft.conflictDesc}
              onChange={(e)=>set({ conflictDesc: e.target.value })}
              fullWidth
            />
          </Stack>

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
  );
}
