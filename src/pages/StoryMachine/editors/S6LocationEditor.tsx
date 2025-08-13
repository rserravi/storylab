// src/pages/StoryMachine/editors/S6LocationsEditor.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Stack, Typography, Button, IconButton, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ImageList, ImageListItem, ImageListItemBar, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadIcon from '@mui/icons-material/Upload';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import Autocomplete from '@mui/material/Autocomplete';

import { useScreenplay } from '../../../state/screenplayStore';
import type { Location as BaseLocation, Scene } from '../../../types';
import { useT } from '../../../i18n';

/** Extensión local de Location para S6 (retro-compatible) */
type LocationImage = { id: string; src: string; name?: string };
type Location = BaseLocation & {
  description?: string;
  images?: LocationImage[];
  tags?: string[];
};

function createEmptyLocation(): Location {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    images: [],
    tags: []
  };
}

function sanitizeLocations(raw?: BaseLocation[]): Location[] {
  return (raw ?? []).map((l) => ({
    id: l.id || crypto.randomUUID(),
    name: (l as any).name || '',
    description: (l as any).description || '',
    images: Array.isArray((l as any).images) ? (l as any).images : [],
    tags: Array.isArray((l as any).tags) ? (l as any).tags : []
  }));
}

// Sugerencias iniciales de etiquetas
const TAG_SUGGESTIONS = [
  'Bar', 'Carretera', 'Casa', 'Calle', 'Oficina', 'Hospital', 'Hotel',
  'Apartamento', 'Restaurante', 'Bosque', 'Playa', 'Montaña', 'Desierto',
  'Iglesia', 'Cementerio', 'Tienda', 'Almacén', 'Estación', 'Aeropuerto',
  'Puerto', 'Coche', 'Metro', 'Autobús', 'Parque', 'Instituto', 'Universidad',
  'Laboratorio', 'Comisaría', 'Prisión', 'Teatro', 'Cine', 'Museo', 'Nave',
];

export default function S6LocationsEditor() {
  const t = useT();
  const { screenplay, patch } = useScreenplay();

  // Normaliza a nuestro shape extendido
  useEffect(() => {
    const current = sanitizeLocations(screenplay?.locations);
    const needPatch =
      (screenplay?.locations?.length ?? 0) !== current.length ||
      (screenplay?.locations as any)?.some?.((x: any, i: number) =>
        (x.description ?? '') !== current[i]?.description ||
        !Array.isArray((x as any).images) ||
        !Array.isArray((x as any).tags)
      );
    if (needPatch) patch({ locations: current as any });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenplay?.id]);

  const locations: Location[] = useMemo(
    () => sanitizeLocations(screenplay?.locations),
    [screenplay?.locations]
  );
  const scenes: Scene[] = (screenplay?.scenes ?? []) as Scene[];

  // ===== Filtro por etiquetas (multi) =====
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const uniqueTags = useMemo(() => {
    const s = new Set<string>();
    locations.forEach(l => (l.tags ?? []).forEach(tag => s.add(tag)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [locations]);

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return locations;
    return locations.filter(l =>
      (l.tags ?? []).length && activeTags.every(tag => l.tags!.includes(tag))
    );
  }, [locations, activeTags]);

  // ===== Estado edición =====
  const [editing, setEditing] = useState<Location | null>(null);

  // ===== Acciones CRUD =====
  const addLocation = () => {
    const next = [...locations, createEmptyLocation()];
    patch({ locations: next as any });
  };
  const updateLocation = (id: string, loc: Location) => {
    const next = locations.map(l => l.id === id ? loc : l);
    patch({ locations: next as any });
  };
  const removeLocation = (id: string) => {
    const next = locations.filter(l => l.id !== id);
    patch({ locations: next as any });
  };

  // ===== Escenas por localización =====
  const sceneIndexesByLocation = useMemo(() => {
    const map = new Map<string, number[]>();
    scenes.forEach((s, idx) => {
      const key = (s.locationName || '').trim();
      if (!key) return;
      const arr = map.get(key) ?? [];
      arr.push(idx + 1); // nº de escena = índice + 1
      map.set(key, arr);
    });
    return map;
  }, [scenes]);

  // Crear una escena ligada a una localización
  const createSceneAt = (locationName: string) => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      locationName: locationName.trim(),
      placeType: 'INT',
      timeOfDay: 'DAY',
      plotPoint: undefined,
      description: '',
      purpose: '',
      subplotId: null,
      characterIds: []
    } as Scene;
    patch({ scenes: [ ...(screenplay?.scenes ?? []), newScene ] });
  };

  return (
    <Box>
      {/* Header */}
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('s6.title')}</Typography>
          <Button startIcon={<AddIcon/>} onClick={addLocation}>{t('s6.add')}</Button>
        </Stack>

        {/* Filtro por etiquetas */}
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={activeTags.length ? t('s6.filter.clear') : t('s6.filter.byTags')}
            onClick={() => setActiveTags([])}
            color={activeTags.length ? 'primary' : 'default'}
            variant={activeTags.length ? 'filled' : 'outlined'}
            size="small"
          />
          {uniqueTags.map(tag => {
            const active = activeTags.includes(tag);
            return (
              <Chip
                key={tag}
                label={tag}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                size="small"
                onClick={() =>
                  setActiveTags(prev =>
                    prev.includes(tag) ? prev.filter(tg => tg !== tag) : [...prev, tag]
                  )
                }
              />
            );
          })}
        </Stack>

        {activeTags.length > 0 && (
          <Typography variant="caption" sx={{ opacity:.7 }}>
            {filtered.length} resultado{filtered.length===1?'':'s'} · {t('s6.filter.active')}
          </Typography>
        )}
      </Stack>

      {/* Grid 1 col mobile, 2 cols desde md */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          alignItems: 'start'
        }}
      >
        {filtered.map((loc) => (
          <LocationCard
            key={loc.id}
            loc={loc}
            sceneNumbers={sceneIndexesByLocation.get((loc.name || '').trim()) ?? []}
            onEdit={() => setEditing(loc)}
            onDelete={() => removeLocation(loc.id)}
            onCreateSceneHere={() => createSceneAt(loc.name || '')}
          />
        ))}
      </Box>

      {/* Modal edición */}
      {editing && (
        <LocationEditDialog
          open
          value={editing}
          allTags={uniqueTags}
          onCancel={() => setEditing(null)}
          onSave={(next) => { updateLocation(editing.id, next); setEditing(null); }}
        />
      )}
    </Box>
  );
}

/* ───────────────────── Card (modo lectura) ───────────────────── */

function LocationCard({
  loc, sceneNumbers, onEdit, onDelete, onCreateSceneHere
}: {
  loc: Location;
  sceneNumbers: number[];
  onEdit: () => void;
  onDelete: () => void;
  onCreateSceneHere: () => void;
}) {
  const cover = loc.images?.[0]?.src;

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: .5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loc.name || '—'}
        </Typography>
        <Tooltip title="Crear escena aquí">
          <IconButton size="small" onClick={onCreateSceneHere}><AddLocationAltIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton size="small" onClick={onDelete} color="error"><DeleteOutlineIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Stack>

      {/* Tags */}
      <Stack direction="row" spacing={.5} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
        {(loc.tags ?? []).length
          ? (loc.tags ?? []).map(tag => <Chip key={tag} size="small" variant="outlined" label={tag} />)
          : <Typography variant="body2" sx={{ opacity:.7 }}>Sin etiquetas</Typography>
        }
      </Stack>

      {/* Mini galería */}
      {cover ? (
        <Box sx={{ mb: 1, borderRadius: 1, overflow: 'hidden', aspectRatio: '16/9', bgcolor: 'action.hover' }}>
          <img src={cover} alt={loc.images?.[0]?.name || 'cover'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </Box>
      ) : (
        <Box sx={{ mb: 1, borderRadius: 1, height: 140, bgcolor: 'action.hover', display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, opacity: .6 }}>
          Sin imagen
        </Box>
      )}

      {/* Descripción (clamp 3) */}
      <Typography
        variant="body2"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', mb: 1
        }}
      >
        {loc.description || '—'}
      </Typography>

      {/* Escenas que usan esta localización */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap:'wrap' }}>
        <Chip size="small" variant="outlined" label={`Escenas: ${sceneNumbers.length}`} />
        {sceneNumbers.slice(0, 6).map(n => (
          <Chip key={n} size="small" label={`#${n}`} />
        ))}
        {sceneNumbers.length > 6 && (
          <Chip size="small" label={`+${sceneNumbers.length - 6}`} />
        )}
      </Stack>
    </Paper>
  );
}

/* ───────────────────── Modal de edición ───────────────────── */

function LocationEditDialog({
  open, value, allTags, onCancel, onSave
}: {
  open: boolean;
  value: Location;
  allTags: string[];
  onCancel: () => void;
  onSave: (next: Location) => void;
}) {
  const [draft, setDraft] = useState<Location>(value);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Estado para “Generar Imagen IA” (mock)
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState<'Cinemático'|'Noir'|'Western'|'Sci-Fi'|'Fantasy'|'Thriller'|'Romance'|'Horror'|'Animación'>('Cinemático');
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => { setDraft(value); setErrors({}); }, [value?.id]);

  const validate = () => {
    const e: { name?: string } = {};
    if (!draft.name.trim()) e.name = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items = await Promise.all(Array.from(files).map(file => fileToImage(file)));
    setDraft(prev => ({ ...prev, images: [ ...(prev.images ?? []), ...items ] }));
  };

  const setCover = (id: string) => {
    setDraft(prev => {
      const arr = [...(prev.images ?? [])];
      const idx = arr.findIndex(i => i.id === id);
      if (idx > 0) {
        const [it] = arr.splice(idx, 1);
        arr.unshift(it);
      }
      return { ...prev, images: arr };
    });
  };

  const removeImage = (id: string) => {
    setDraft(prev => ({ ...prev, images: (prev.images ?? []).filter(i => i.id !== id) }));
  };

  // Sugerencias de tags = existentes + catálogo base
  const tagOptions = useMemo(() => {
    const set = new Set([ ...TAG_SUGGESTIONS, ...(allTags ?? []) ]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allTags]);

  // Generación mock
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const img = await generateMockImageFromPrompt(aiPrompt, aiStyle);
      setDraft(prev => ({ ...prev, images: [ ...(prev.images ?? []), img ] }));
      setAiOpen(false);
      setAiPrompt('');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>Editar localización</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '80vh' }}>
        <Stack spacing={2} sx={{ mt: .5 }}>
          <TextField
            label="Nombre"
            value={draft.name}
            onChange={(e)=>setDraft({ ...draft, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />
          <TextField
            label="Descripción"
            value={draft.description}
            onChange={(e)=>setDraft({ ...draft, description: e.target.value })}
            multiline minRows={3} fullWidth
          />

          {/* Etiquetas */}
          <Autocomplete
            multiple
            freeSolo
            options={tagOptions}
            value={draft.tags ?? []}
            onChange={(_, v)=> setDraft(prev => ({ ...prev, tags: (v as string[]).map(x => x.trim()).filter(Boolean) }))}
            renderInput={(p) => <TextField {...p} label="Etiquetas (chips)" placeholder="Bar, Carretera, Casa…" />}
          />

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            {/* Subir imágenes */}
            <Button component="label" startIcon={<UploadIcon/>} variant="outlined">
              Subir imágenes
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e)=>onFiles(e.target.files)}
              />
            </Button>

            {/* Generar Imagen IA (mock) */}
            <Button
              startIcon={<AutoAwesomeIcon/>}
              variant="outlined"
              onClick={()=> setAiOpen(true)}
            >
              Generar Imagen IA
            </Button>

            <Typography variant="caption" sx={{ opacity:.7 }}>
              PNG/JPG/WebP. (Mock local: se guardan como data URL)
            </Typography>
          </Stack>

          {/* Galería editable */}
          {(draft.images?.length ?? 0) > 0 && (
            <ImageList cols={3} gap={8} sx={{ m:0 }}>
              {draft.images!.map(img => (
                <ImageListItem key={img.id} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                  <img src={img.src} alt={img.name || ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <ImageListItemBar
                    title={img.name || ''}
                    actionIcon={
                      <Stack direction="row" spacing={0.5} sx={{ mr: 0.5 }}>
                        <Tooltip title="Establecer como portada">
                          <IconButton size="small" onClick={()=>setCover(img.id)} sx={{ color: 'white' }}>
                            {draft.images?.[0]?.id === img.id ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={()=>removeImage(img.id)} sx={{ color: 'white' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                    position="top"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => { if (validate()) onSave(normalizeDraft(draft)); }}
        >
          Guardar
        </Button>
      </DialogActions>

      {/* Modal para "Generar Imagen IA" (mock) */}
      <Dialog open={aiOpen} onClose={()=>!aiBusy && setAiOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generar imagen con IA (mock local)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: .5 }}>
            <TextField
              label="Descripción (prompt)"
              value={aiPrompt}
              onChange={(e)=>setAiPrompt(e.target.value)}
              placeholder="Ej.: Fachada art déco iluminada con neones, noche lluviosa, travel de cámara…"
              multiline minRows={3}
              fullWidth
            />
            <TextField
              label="Estilo"
              select
              value={aiStyle}
              onChange={(e)=>setAiStyle(e.target.value as any)}
              SelectProps={{ native: true }}
            >
              {['Cinemático','Noir','Western','Sci-Fi','Fantasy','Thriller','Romance','Horror','Animación'].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </TextField>
            <Typography variant="caption" sx={{ opacity:.7 }}>
              (Sin backend aún) Se generará un **concept** local de 1024×576 con el prompt como referencia.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>!aiBusy && setAiOpen(false)} disabled={aiBusy}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAIGenerate}
            disabled={aiBusy || !aiPrompt.trim()}
            startIcon={aiBusy ? <CircularProgress size={18} /> : <AutoAwesomeIcon/>}
          >
            {aiBusy ? 'Generando…' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

/* ───────────────────── helpers ───────────────────── */

function normalizeDraft(d: Location): Location {
  return {
    ...d,
    name: (d.name || '').trim(),
    description: (d.description || '').trim(),
    images: (d.images ?? []).map(i => ({ ...i, name: (i.name || '').trim() })),
    tags: Array.from(new Set((d.tags ?? []).map(x => x.trim()).filter(Boolean)))
  };
}

function fileToImage(file: File): Promise<LocationImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve({
      id: crypto.randomUUID(),
      src: String(reader.result),
      name: file.name
    });
    reader.readAsDataURL(file);
  });
}

// Mock local: genera una imagen 1024x576 con degradado y texto del prompt
async function generateMockImageFromPrompt(prompt: string, style?: string): Promise<LocationImage> {
  const w = 1024, h = 576;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  // Fondo con degradado dependiente del prompt
  const hue = Math.abs(hashCode(prompt + '|' + (style || ''))) % 360;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `hsl(${hue},70%,55%)`);
  g.addColorStop(1, `hsl(${(hue + 60) % 360},70%,35%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Overlay sutil
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 0, w, h);

  // Título estilo
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  ctx.fillText(style || 'AI Concept', 32, 72);

  // Prompt (envuelto)
  ctx.font = '24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  const lines = wrapText(ctx, prompt, w - 64);
  let y = 120;
  for (const line of lines.slice(0, 7)) { // limita a 7 líneas
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
