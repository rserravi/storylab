import { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, IconButton, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Autocomplete from '@mui/material/Autocomplete';

import {
  DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useScreenplay } from '../../../state/screenplayStore';
import { useT } from '../../../i18n';
import type {
  Scene, ScenePlaceType, TimeOfDay, PlotPointKey, Character, Location, Subplot
} from '../../../types';

/* ───────── helpers y constantes ───────── */

function createEmptyScene(): Scene {
  return {
    id: crypto.randomUUID(),
    number: 0,
    slugline: '',
    characters: [],
    synopsis: '',
    isKey: false,
    locationName: '',
    placeType: 'INT',
    timeOfDay: 'DAY',
    plotPoint: undefined,
    description: '',
    purpose: '',
    subplotId: null,
    characterIds: []
  };
}

function ensureLocation(locations: Location[] | undefined, name: string) {
  const n = (name || '').trim();
  if (!n) return { next: locations ?? [], name: n };
  const exists = (locations ?? []).some(l => (l.name || '').toLowerCase() === n.toLowerCase());
  return { next: exists ? (locations ?? []) : [ ...(locations ?? []), { id: crypto.randomUUID(), name: n } ], name: n };
}

function ensureCharacters(characters: Character[] | undefined, names: string[] | undefined) {
  const nextChars = [ ...(characters ?? []) ];
  const ids: string[] = [];
  const source = Array.isArray(names) ? names : [];
  for (const raw of source) {
    const n = (raw ?? '').trim();
    if (!n) continue;
    let found = nextChars.find(c => (c.name || '').toLowerCase() === n.toLowerCase());
    if (!found) {
      found = {
        id: crypto.randomUUID(),
        name: n,
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
      } as Character;
      nextChars.push(found);
    }
    ids.push(found.id);
  }
  return { next: nextChars, ids };
}

const PLACE_TYPES: { value: ScenePlaceType; label: string }[] = [
  { value: 'INT', label: 'INT' },
  { value: 'EXT', label: 'EXT' },
  { value: 'NA',  label: 'N/A' }
];

const cornerColorRight = (tod: TimeOfDay) =>
  tod === 'DAY' ? '#FFD54F' : tod === 'NIGHT' ? '#64B5F6' : '#BDBDBD';
const cornerColorLeft = (pt: ScenePlaceType) =>
  pt === 'INT' ? '#8E24AA' : pt === 'EXT' ? '#2E7D32' : '#757575';

/** Etiqueta localizada para tiempo del día */
function timeLabel(t: ReturnType<typeof useT>, value: TimeOfDay) {
  if (value === 'DAY') return t('s7.time.day');
  if (value === 'NIGHT') return t('s7.time.night');
  return t('s7.time.other');
}

/** Etiqueta localizada para plot points */
function ppLabel(t: ReturnType<typeof useT>, value?: PlotPointKey) {
  if (!value) return '';
  switch (value) {
    case 'incidente': return t('s7.pp.label.incidente');
    case 'momentoCambio': return t('s7.pp.label.momentoCambio');
    case 'puntoMedio': return t('s7.pp.label.puntoMedio');
    case 'crisis': return t('s7.pp.label.crisis');
    case 'climax': return t('s7.pp.label.climax');
    default: return '';
  }
}

/* ───────── Componente principal ───────── */

export default function S7AllScenesEditor() {
  const t = useT();
  const { screenplay, patch } = useScreenplay();

  // Sanitiza escenas antiguas
  useEffect(() => {
    const raw = (screenplay?.scenes ?? []) as any[];
    let changed = false;
    const sanitized = raw.map((s, i) => {
      const fixed: Scene = {
        id: s.id ?? crypto.randomUUID(),
        number: typeof s.number === 'number' ? s.number : i + 1,
        slugline: s.slugline ?? '',
        characters: Array.isArray(s.characters) ? s.characters : [],
        synopsis: s.synopsis ?? '',
        isKey: !!s.isKey,
        locationName: s.locationName ?? '',
        placeType: (s.placeType ?? 'INT') as ScenePlaceType,
        timeOfDay: (s.timeOfDay ?? 'DAY') as TimeOfDay,
        plotPoint: s.plotPoint as PlotPointKey | undefined,
        description: s.description ?? '',
        purpose: s.purpose ?? '',
        subplotId: s.subplotId ?? null,
        characterIds: Array.isArray(s.characterIds) ? s.characterIds : []
      };
      if (
        fixed.locationName !== s.locationName ||
        fixed.placeType !== s.placeType ||
        fixed.timeOfDay !== s.timeOfDay ||
        (Array.isArray(s.characterIds) ? false : true) ||
        typeof s.number !== 'number' ||
        fixed.slugline !== s.slugline ||
        (Array.isArray(s.characters) ? false : true) ||
        fixed.synopsis !== s.synopsis ||
        (!!s.isKey) !== fixed.isKey
      ) changed = true;
      return fixed;
    });
    if (changed) patch({ scenes: sanitized });
  }, [screenplay?.id]);

  const scenes: Scene[] = Array.isArray(screenplay?.scenes) ? (screenplay!.scenes as Scene[]) : [];
  const locations = screenplay?.locations ?? [];
  const subplots = screenplay?.subplots ?? [];
  const characters = screenplay?.characters ?? [];

  const [editing, setEditing] = useState<Scene | null>(null);
  const [q, setQ] = useState(''); // búsqueda

  // Mapa id->char
  const charMap = useMemo(() => {
    const m = new Map<string, Character>();
    for (const c of characters) m.set(c.id, c);
    return m;
  }, [characters]);

  // Filtrado por localización / personaje / plot point
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return scenes;
    const matches = (s?: string) => (s || '').toLowerCase().includes(term);
    return scenes.filter(s => {
      if (matches(s.locationName)) return true;
      if (s.plotPoint && matches(s.plotPoint)) return true;
      const names = (s.characterIds ?? []).map(id => charMap.get(id)?.name || '');
      if (names.some(n => matches(n))) return true;
      return false;
    });
  }, [q, scenes, charMap]);

  // dnd-kit
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = filtered.map(s => s.id); // ids visibles
  const dndDisabled = q.trim().length > 0; // no reordenar si hay búsqueda

  const handleDragEnd = (e: DragEndEvent) => {
    if (dndDisabled) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // Reordenamos en el array global de escenas basándonos en su posición actual
    const allIds = scenes.map(s => s.id);
    const oldIndex = allIds.indexOf(String(active.id));
    const newIndex = allIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(scenes, oldIndex, newIndex);
    patch({ scenes: next });
  };

  const addScene = () => patch({ scenes: [...scenes, createEmptyScene()] });
  const updateScene = (id: string, s: Scene) =>
    patch({ scenes: (screenplay?.scenes ?? []).map(x => x.id === id ? s : x) });
  const removeScene = (id: string) =>
    patch({ scenes: (screenplay?.scenes ?? []).filter(x => x.id !== id) });

  // Opciones localizadas para selects
  const timeOptions = useMemo(() => ([
    { value: 'DAY', label: t('s7.time.day') },
    { value: 'NIGHT', label: t('s7.time.night') },
    { value: 'OTHER', label: t('s7.time.other') }
  ] satisfies { value: TimeOfDay; label: string }[]), [t]);

  const ppOptions = useMemo(() => ([
    { value: 'incidente', label: t('s7.pp.label.incidente') },
    { value: 'momentoCambio', label: t('s7.pp.label.momentoCambio') },
    { value: 'puntoMedio', label: t('s7.pp.label.puntoMedio') },
    { value: 'crisis', label: t('s7.pp.label.crisis') },
    { value: 'climax', label: t('s7.pp.label.climax') }
  ] satisfies { value: PlotPointKey; label: string }[]), [t]);

  return (
    <Box>
      {/* Header: título + acciones + buscador */}
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('s7.title')}</Typography>
          <Button startIcon={<AddIcon />} onClick={addScene}>{t('s7.add')}</Button>
        </Stack>

        <TextField
          size="small"
          label={t('s7.search.label')}
          placeholder={t('s7.search.placeholder')}
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
        {q && (
          <Typography variant="caption" sx={{ opacity:.7 }}>
            {q && (filtered.length === 1
              ? t('s7.search.one')
              : t('s7.search.many', { n: String(filtered.length) })
            )}
          </Typography>
        )}
      </Stack>

      {/* Rejilla: 1 columna en móvil, 2 desde md */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'start'
            }}
          >
            {filtered.map((scene) => {
              const allIndex = scenes.findIndex(s => s.id === scene.id);
              const sceneNumber = allIndex + 1;
              const idsArr = Array.isArray(scene.characterIds) ? scene.characterIds : [];
              const chars = idsArr.map(id => charMap.get(id)).filter(Boolean) as Character[];

              return (
                <SortableSceneCard
                  key={scene.id}
                  id={scene.id}
                  disabled={dndDisabled}
                  sceneNumber={sceneNumber}
                  scene={scene}
                  subplot={subplots.find(s => s.id === scene.subplotId) || null}
                  chars={chars}
                  onEdit={() => setEditing(scene)}
                  onDelete={() => removeScene(scene.id)}
                />
              );
            })}
          </Box>
        </SortableContext>
      </DndContext>

      {/* Modal edición */}
      {editing && (
        <SceneEditDialog
          open
          value={editing}
          allLocations={locations}
          allSubplots={subplots}
          allCharacters={characters}
          onCancel={() => setEditing(null)}
          onSave={(draft) => {
            const { next: nextLocs, name } = ensureLocation(screenplay?.locations, draft.locationName);
            const selectedNames = draft.characterIds as unknown as string[]; // vienen como nombres (freeSolo)
            const { next: nextChars, ids } = ensureCharacters(screenplay?.characters, selectedNames);

            const clean: Scene = { ...draft, locationName: name, characterIds: ids };
            patch({
              locations: nextLocs,
              characters: nextChars,
              scenes: (screenplay?.scenes ?? []).map(s => s.id === draft.id ? clean : s)
            });
            setEditing(null);
          }}
          timeOptions={timeOptions}
          ppOptions={ppOptions}
        />
      )}
    </Box>
  );
}

/* ───────── Card "sortable" con handle ───────── */

function SortableSceneCard(props: {
  id: string;
  disabled?: boolean;
  sceneNumber: number;
  scene: Scene;
  subplot: Subplot | null;
  chars: Character[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const { id, disabled, sceneNumber, scene, subplot, chars, onEdit, onDelete } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1
  } as React.CSSProperties;

  const leftColor = cornerColorLeft(scene.placeType);
  const rightColor = cornerColorRight(scene.timeOfDay);
  const todText = timeLabel(t, scene.timeOfDay);
  const plotPointText = ppLabel(t, scene.plotPoint);

  const handleAiPropose = () => {
    // TODO: implement AI proposal
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper variant="outlined" sx={{ p: 1.5, position: 'relative', overflow: 'hidden', width: '100%' }}>
        {/* Esquinas INT/EXT y DÍA/NOCHE/OTRO */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, width: 0, height: 0,
          borderTop: `46px solid ${leftColor}`, borderRight: '46px solid transparent', zIndex: 1
        }} />
        <Typography variant="caption" sx={{ position: 'absolute', top: 2, left: 4, zIndex: 2, color: '#fff', fontWeight: 700 }}>
          {scene.placeType}
        </Typography>
        <Box sx={{
          position: 'absolute', top: 0, right: 0, width: 0, height: 0,
          borderTop: `46px solid ${rightColor}`, borderLeft: '46px solid transparent', zIndex: 1
        }} />
        <Typography variant="caption" sx={{ position: 'absolute', top: 2, right: 4, zIndex: 2, color: '#fff', fontWeight: 700 }}>
          {todText}
        </Typography>

        {/* Header: Nº de escena + Localización centrada + acciones + handle */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: .5 }}>
          <Chip size="small" label={`#${sceneNumber}`} sx={{ fontWeight: 600 }} />
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.1 }}
              title={scene.locationName}
            >
              {scene.locationName || '—'}
            </Typography>
            {scene.plotPoint && (
              <Typography variant="caption" sx={{ opacity: .8 }}>
                {plotPointText}
              </Typography>
            )}
          </Box>
          <Tooltip title={disabled ? t('s7.tip.reorderDisabled') : t('s7.tip.reorder')}>
            <span>
              <IconButton
                size="small"
                {...attributes}
                {...listeners}
                disabled={!!disabled}
                sx={{ cursor: disabled ? 'not-allowed' : 'grab' }}
              >
                <DragIndicatorIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('s7.tip.aiPropose')}>
            <IconButton size="small" onClick={handleAiPropose}>
              <AutoAwesomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('s7.tip.edit')}>
            <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={t('s7.tip.delete')}>
            <IconButton size="small" onClick={onDelete} color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>

        {/* Body */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, opacity: .75 }}>{t('s7.fields.description')}</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: .75 }}>
            {scene.description || '—'}
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 600, opacity: .75 }}>{t('s7.fields.function')}</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {scene.purpose || '—'}
          </Typography>
        </Box>

        {/* Footer */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Chip size="small" variant="outlined" label={`${t('s7.footer.subplot')}: ${subplot?.name ?? '—'}`} />
          <Stack direction="row" spacing={.5} useFlexGap flexWrap="wrap">
            {chars.length ? (
              chars.map(c => <Chip key={c.id} size="small" label={c.name || '¿?'} />)
            ) : (
              <Typography variant="body2" sx={{ ml: .5, opacity: .7 }}>{t('s7.footer.noCharacters')}</Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </div>
  );
}

/* ───────── Modal de edición ───────── */

function SceneEditDialog({
  open, value, allLocations, allSubplots, allCharacters, onCancel, onSave,
  timeOptions, ppOptions
}: {
  open: boolean;
  value: Scene;
  allLocations: Location[];
  allSubplots: Subplot[];
  allCharacters: Character[];
  onCancel: () => void;
  onSave: (next: Scene) => void;
  timeOptions: { value: TimeOfDay; label: string }[];
  ppOptions: { value: PlotPointKey; label: string }[];
}) {
  const t = useT();
  const [draft, setDraft] = useState<Scene>(value);

  const locationOptions = useMemo(() => (allLocations ?? []).map(l => l.name), [allLocations]);
  const subplotOptions = useMemo(() => (allSubplots ?? []).map(s => ({ id: s.id, label: s.name })), [allSubplots]);
  const characterOptions = useMemo(() => (allCharacters ?? []).map(c => ({ id: c.id, label: c.name || '' })), [allCharacters]);

  const [charNames, setCharNames] = useState<string[]>(
    Array.isArray(value.characterIds)
      ? (value.characterIds.map(id => (allCharacters ?? []).find(c => c.id === id)?.name).filter(Boolean) as string[])
      : []
  );

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{t('s7.dialog.title')}</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh' }}>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Autocomplete
              freeSolo
              options={locationOptions}
              value={draft.locationName || ''}
              onChange={(_, v) => setDraft({ ...draft, locationName: (v as string) || '' })}
              onInputChange={(_, v) => setDraft({ ...draft, locationName: v || '' })}
              renderInput={(p) => <TextField {...p} label={t('s7.dialog.location')} placeholder={t('s7.dialog.locationPh')} fullWidth />}
              sx={{ flex: 1 }}
            />

            <TextField
              select label={t('s7.dialog.placeType')} value={draft.placeType}
              onChange={(e) => setDraft({ ...draft, placeType: e.target.value as ScenePlaceType })}
              sx={{ minWidth: 120 }}
            >
              {PLACE_TYPES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>

            <TextField
              select label={t('s7.dialog.time')} value={draft.timeOfDay}
              onChange={(e) => setDraft({ ...draft, timeOfDay: e.target.value as TimeOfDay })}
              sx={{ minWidth: 130 }}
            >
              {timeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          </Stack>

          <TextField
            select
            label={t('s7.dialog.pp')}
            value={draft.plotPoint ?? ''}
            onChange={(e) => setDraft({ ...draft, plotPoint: (e.target.value || undefined) as PlotPointKey | undefined })}
            helperText={t('s7.dialog.ppHelp')}
          >
            <MenuItem value="">{t('s7.common.none')}</MenuItem>
            {ppOptions.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>

          <TextField
            label={t('s7.dialog.desc')}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            multiline minRows={3} fullWidth
          />
          <TextField
            label={t('s7.dialog.purpose')}
            value={draft.purpose}
            onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
            placeholder={t('s7.dialog.purposePh')}
            fullWidth
          />

          <TextField
            select
            label={t('s7.dialog.subplot')}
            value={draft.subplotId ?? ''}
            onChange={(e) => setDraft({ ...draft, subplotId: (e.target.value || null) as string | null })}
            helperText={t('s7.dialog.subplotHelp')}
          >
            <MenuItem value="">{t('s7.common.none')}</MenuItem>
            {subplotOptions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
          </TextField>

          <Autocomplete
            multiple
            freeSolo
            options={characterOptions.map(o => o.label)}
            value={charNames}
            onChange={(_, v) => setCharNames(v as string[])}
            renderInput={(p) => <TextField {...p} label={t('s7.dialog.characters')} placeholder={t('s7.dialog.charactersPh')} />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={() => onSave({ ...draft, characterIds: charNames as any })}
        >
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
