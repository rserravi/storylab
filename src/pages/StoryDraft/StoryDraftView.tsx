import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stack, Tabs, Tab,
  IconButton, Tooltip, Divider, Collapse
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import SegmentIcon from '@mui/icons-material/Segment';
import PersonIcon from '@mui/icons-material/Person';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Paragraph from '@tiptap/extension-paragraph';
import type { CommandProps } from '@tiptap/core';

import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../state/projectStore';
import { useScreenplay } from '../../state/screenplayStore';
import { useT } from '../../i18n';
import FormattedDraft from '../../components/FormattedDraft';

import type { Scene, Character } from '../../types';
import '../../styles/sd-editor.css';

/* ─────────────── Constantes / tipos ─────────────── */

type BlockType = 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition';
type ScriptBlock = { type: BlockType; text: string };

const TAB_ORDER: BlockType[] = ['action', 'character', 'parenthetical', 'dialogue', 'transition'];

const IGNORES_FOR_CHARACTER_DETECTION = new Set([
  'INT', 'EXT', 'DIA', 'DÍA', 'DAY', 'NIGHT', 'NOCHE', 'OTRO', 'OTHER',
  'CUT', 'TO', 'DISSOLVE', 'SMASH', 'MATCH', 'WIPE', 'FADE', 'BLACK', 'IN', 'OUT', 'MONTAGE', 'IRIS',
  'A', 'AN', 'THE', 'AND', 'OR', 'OF', 'DE', 'LA', 'EL', 'LOS', 'LAS', 'UN', 'UNA'
]);

const ParaWithType = Paragraph.extend({
  addAttributes() {
    return {
      'data-type': {
        default: 'action',
        parseHTML: element => element.getAttribute('data-type') || 'action',
        renderHTML: attrs => ({ 'data-type': attrs['data-type'] })
      }
    };
  }
});

/* ─────────────── Utils ─────────────── */

function isAllCapsWord(w: string) {
  const hasLetter = /[A-ZÁÉÍÓÚÜÑ]/.test(w);
  return hasLetter && w === w.toUpperCase() && w.length >= 2;
}

function sceneSlugline(s: Scene, t: ReturnType<typeof useT>) {
  const loc = (s.locationName || '').toUpperCase();
  const tod = s.timeOfDay === 'DAY' ? t('s7.time.day') : s.timeOfDay === 'NIGHT' ? t('s7.time.night') : t('s7.time.other');
  const place = s.placeType || 'INT';
  return `${place}. ${loc}${loc ? ' — ' : ''}${tod}`;
}

function classifyLine(line: string, prevType?: BlockType): BlockType {
  const ln = (line ?? '').trim();
  if (!ln) return 'action';
  const up = ln.toUpperCase();
  // Transiciones comunes
  if (/^(CUT TO:|DISSOLVE TO:|SMASH CUT TO:|MATCH CUT TO:|WIPE TO:|FADE OUT\.|FADE IN:|FADE TO BLACK\.|IRIS OUT:|MONTAGE:)$/.test(up)) {
    return 'transition';
  }
  if (/^\(.+\)$/.test(ln)) return 'parenthetical';
  const letters = ln.replace(/[^A-Za-zÁÉÍÓÚÜÑ]/g, '');
  if (letters && ln === ln.toUpperCase() && ln.length <= 32) return 'character';
  if (prevType === 'character' || prevType === 'parenthetical') return 'dialogue';
  return 'action';
}

function parseBlocksFromText(text: string): ScriptBlock[] {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: ScriptBlock[] = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const prev = blocks[blocks.length - 1]?.type;
    const type = classifyLine(raw, prev);
    const clean = raw.trimEnd();
    if (!clean && type !== 'dialogue') continue;
    blocks.push({ type, text: clean });
  }
  const last = blocks[blocks.length - 1];
  if (!last || last.type !== 'transition') blocks.push({ type: 'transition', text: 'CUT TO:' });
  return blocks;
}

function blocksToEditableHtml(blocks: ScriptBlock[] | undefined): string {
  if (!blocks || !blocks.length) return '<p></p>';
  return blocks.map(b => `<p data-type="${b.type}">${b.text || '<br>'}</p>`).join('');
}

/* TipTap helpers */
function getCurrentParagraphPos(editor: any) {
  const { $from } = editor.state.selection;
  return $from.before();
}
function getCurrentLineText(editor: any): string {
  return editor.state.selection.$from.parent.textContent || '';
}
function getCurrentParagraphType(editor: any): BlockType {
  try {
    const node = editor.state.selection.$from.parent;
    const t = (node?.attrs?.['data-type'] as BlockType) || 'action';
    return t;
  } catch { return 'action'; }
}
function setCurrentParagraphType(editor: any, type: BlockType) {
  const pos = getCurrentParagraphPos(editor);
  editor.commands.command(({ tr, state, dispatch }: CommandProps) => {
    const node = state.doc.nodeAt(pos);
    if (node && node.type.name === 'paragraph') {
      tr.setNodeMarkup(pos, node.type, { ...(node.attrs || {}), 'data-type': type });
      if (dispatch) dispatch(tr);
      return true;
    }
    return false;
  });
}
function replaceCurrentLine(editor: any, newText: string, setType?: BlockType) {
  const { state } = editor;
  const { $from } = state.selection;
  const from = $from.start();
  const to = $from.end();
  editor.commands.command(({ tr, dispatch }: CommandProps) => {
    tr.insertText(newText, from, to);
    if (dispatch) dispatch(tr);
    return true;
  });
  if (setType) setCurrentParagraphType(editor, setType);
}
function cycleType(editor: any, dir: 1 | -1) {
  const { $from } = editor.state.selection;
  let prevType: BlockType | undefined;
  try {
    const idx = $from.index();
    const prevNode = $from.node(-1).child(idx - 1);
    if (prevNode?.isTextblock) {
      prevType = classifyLine(prevNode.textContent || '');
    }
  } catch {}
  const cur = classifyLine(getCurrentLineText(editor), prevType);
  const i = TAB_ORDER.indexOf(cur);
  const next = TAB_ORDER[(i + (dir === 1 ? 1 : TAB_ORDER.length - 1)) % TAB_ORDER.length];
  if (next === 'transition') replaceCurrentLine(editor, 'CUT TO:', 'transition');
  else setCurrentParagraphType(editor, next);
}
function annotateAllParagraphTypes(editor: any) {
  editor.commands.command(({ tr, state, dispatch }: CommandProps) => {
    let lastType: BlockType | undefined;
    state.doc.descendants((node: any, pos: number) => {
      if (node.type?.name === 'paragraph') {
        const type = classifyLine(node.textContent || '', lastType);
        if (node.attrs?.['data-type'] !== type) {
          tr.setNodeMarkup(pos, node.type, { ...(node.attrs || {}), 'data-type': type });
        }
        lastType = type;
      }
    });
    if (dispatch) dispatch(tr);
    return true;
  });
}

function ensureCharactersFromBlocks(blocks: ScriptBlock[], existing: Character[]) {
  const existingSet = new Set(existing.map(c => (c.name || '').toUpperCase()));
  const names = new Set<string>();
  for (const b of blocks) {
    if (b.type !== 'action') continue;
    const tokens = (b.text || '').split(/[\s,.;:!?()\[\]{}"“”'’]+/).filter(Boolean);
    for (const w of tokens) {
      const token = w.replace(/[^\p{L}\-]/gu, '');
      if (isAllCapsWord(token) && !IGNORES_FOR_CHARACTER_DETECTION.has(token)) names.add(token);
    }
  }
  const toCreate = Array.from(names).filter(n => !existingSet.has(n));
  return toCreate.map(n => ({
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
  }) as Character);
}

/* ─────────────── Vista principal ─────────────── */

export default function StoryDraftView() {
  const navigate = useNavigate();
  const { activeProjectId } = useProjects();
  const { screenplay, load, patch } = useScreenplay();

  const [tab, setTab] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0); // fuerza refresco del tab Formato

  useEffect(() => { if (activeProjectId) load(activeProjectId); }, [activeProjectId]);

  const scenes: Scene[] = (screenplay?.scenes ?? []) as Scene[];
  if (!screenplay) return null;

  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Story Draft</Typography>
          <Tooltip title="Ayuda sobre formato Hollywood">
            <IconButton><HelpOutlineIcon /></IconButton>
          </Tooltip>
        </Stack>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mt: 1 }}>
          <Tab label="Editor" />
          <Tab label="Formato" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Stack spacing={2}>
          {scenes.map((scene, idx) => (
            <SceneEditorRow
              key={scene.id}
              index={idx}
              scene={scene}
              allCharacters={(screenplay.characters ?? []) as Character[]}
              onGotoCard={() => navigate('/story-machine/escenas?sceneId=' + scene.id)}
              onSave={(nextBlocks, html, created) => {
                const uniqNew = created.filter(nc =>
                  !(screenplay.characters ?? []).some(c => (c.name || '').toUpperCase() === nc.name.toUpperCase())
                );
                patch({
                  scenes: scenes.map(s => s.id === scene.id ? { ...s, scriptBlocks: nextBlocks, scriptHtml: html } : s),
                  characters: [ ...(screenplay.characters ?? []), ...uniqNew ]
                });
                setRefreshTick(tk => tk + 1); // refresca el Formato
              }}
            />
          ))}
        </Stack>
      )}

      {tab === 1 && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" sx={{ mb:1 }}>Vista Hollywood (CSS)</Typography>
          <FormattedDraft key={refreshTick} screenplay={screenplay}/>
        </Paper>
      )}
    </Box>
  );
}

/* ─────────────── Escena (fila editor) ─────────────── */

function SceneEditorRow({
  index, scene, allCharacters, onGotoCard, onSave
}: {
  index: number;
  scene: Scene;
  allCharacters: Character[];
  onGotoCard: () => void;
  onSave: (blocks: ScriptBlock[], html: string, createdChars: Character[]) => void;
}) {
  const t = useT();
  const number = index + 1;
  const slug = sceneSlugline(scene, t);

  const initialHtml = useMemo(() => {
    const html = (scene as any).scriptHtml as string | undefined;
    if (html && html.trim()) return html;
    const blocks: ScriptBlock[] = (scene as any).scriptBlocks || [];
    return blocksToEditableHtml(blocks.length ? blocks : [{ type:'transition', text:'CUT TO:' }]);
  }, [scene.id]);

  const [collapsed, setCollapsed] = useState(false);
  const [activeType, setActiveType] = useState<BlockType>('action');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      ParaWithType,
      Underline,
      Placeholder.configure({ placeholder: 'Escribe la escena…' })
    ],
    content: initialHtml,
    autofocus: false,
    onCreate: ({ editor }) => {
      annotateAllParagraphTypes(editor);
    },
    onUpdate: ({ editor }) => {
      annotateAllParagraphTypes(editor);
      scheduleSave.current?.();
    },
    onSelectionUpdate: ({ editor }) => {
      setActiveType(getCurrentParagraphType(editor));
    }
  }, [initialHtml]);

  useEffect(() => {
    if (editor) {
      setActiveType(getCurrentParagraphType(editor));
    }
  }, [editor]);

  const scheduleSave = useRef<null | (() => void)>(null);
  useEffect(() => {
    let h: any;
    scheduleSave.current = () => {
      clearTimeout(h);
      h = setTimeout(() => {
        if (!editor) return;
        const plain = editor.getText();
        const blocks = parseBlocksFromText(plain);
        const created = ensureCharactersFromBlocks(blocks, allCharacters);
        onSave(blocks, editor.getHTML(), created);
      }, 350);
    };
    return () => clearTimeout(h);
  }, [editor, allCharacters, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editor) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      cycleType(editor, e.shiftKey ? -1 : 1);
      setActiveType(getCurrentParagraphType(editor));
    }
  }, [editor]);

  const setType = (type: BlockType) => {
    if (!editor) return;
    if (type === 'transition') replaceCurrentLine(editor, 'CUT TO:', 'transition');
    else setCurrentParagraphType(editor, type);
    setActiveType(type);
  };

  return (
    <Paper variant="outlined" sx={{ p:2 }}>
      {/* Header escena */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="overline" sx={{ fontWeight: 700 }}>{`#${number}`}</Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, flexGrow: 1, textAlign: 'center' }}>
          {slug}
        </Typography>

        {/* Colapsar / Expandir */}
        <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'}>
          <IconButton onClick={()=>setCollapsed(v=>!v)}>
            {collapsed ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
          </IconButton>
        </Tooltip>

        <Tooltip title="Ir a tarjeta">
          <IconButton onClick={onGotoCard}><LaunchIcon /></IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        {/* Toolbar */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap:'wrap' }}>
          {/* B / I / U simples */}
          <Tooltip title="Negrita (Ctrl/Cmd+B)">
            <span>
              <Button
                size="small"
                variant={editor?.isActive('bold') ? 'contained' : 'outlined'}
                onClick={()=> editor?.chain().focus().toggleBold().run()}
                sx={{ fontWeight: 700, minWidth: 40 }}
              >
                B
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Cursiva (Ctrl/Cmd+I)">
            <span>
              <Button
                size="small"
                variant={editor?.isActive('italic') ? 'contained' : 'outlined'}
                onClick={()=> editor?.chain().focus().toggleItalic().run()}
                sx={{ fontStyle: 'italic', minWidth: 40 }}
              >
                I
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Subrayado (Ctrl/Cmd+U)">
            <span>
              <Button
                size="small"
                variant={editor?.isActive('underline') ? 'contained' : 'outlined'}
                onClick={()=> editor?.chain().focus().toggleUnderline().run()}
                sx={{ textDecoration: 'underline', minWidth: 40 }}
              >
                U
              </Button>
            </span>
          </Tooltip>

          <Divider flexItem orientation="vertical" sx={{ mx: .5 }} />

          {/* Type buttons (resaltado del activo) */}
          <Tooltip title="Tipo: Description">
            <Button
              size="small"
              variant={activeType==='action' ? 'contained' : 'outlined'}
              startIcon={<SegmentIcon />}
              onClick={()=>setType('action')}
            >
              Description
            </Button>
          </Tooltip>
          <Tooltip title="Tipo: Character">
            <Button
              size="small"
              variant={activeType==='character' ? 'contained' : 'outlined'}
              startIcon={<PersonIcon />}
              onClick={()=>setType('character')}
            >
              Character
            </Button>
          </Tooltip>
          <Tooltip title="Tipo: Parenthetical">
            <Button
              size="small"
              variant={activeType==='parenthetical' ? 'contained' : 'outlined'}
              startIcon={<PanToolAltIcon />}
              onClick={()=>setType('parenthetical')}
            >
              Parenthetical
            </Button>
          </Tooltip>
          <Tooltip title="Tipo: Dialogue">
            <Button
              size="small"
              variant={activeType==='dialogue' ? 'contained' : 'outlined'}
              startIcon={<RecordVoiceOverIcon />}
              onClick={()=>setType('dialogue')}
            >
              Dialogue
            </Button>
          </Tooltip>
          <Tooltip title="Tipo: Transition">
            <Button
              size="small"
              variant={activeType==='transition' ? 'contained' : 'outlined'}
              startIcon={<SubdirectoryArrowLeftIcon />}
              onClick={()=>setType('transition')}
            >
              Transition
            </Button>
          </Tooltip>
        </Stack>

        {/* Editor — Estilo Hollywood */}
        <Paper variant="outlined" sx={{ display:'flex', justifyContent:'center', p:2, bgcolor:'background.paper' }}>
          <Box sx={{ width: '85ch', maxWidth: '100%' }}>
            <div onKeyDown={handleKeyDown} className="sd-editor">
              <EditorContent editor={editor} />
            </div>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ opacity:.7, display:'block', mt: .75 }}>
          Usa <kbd>TAB</kbd> para ciclar tipos y <kbd>Shift</kbd>+<kbd>TAB</kbd> para retroceder.
        </Typography>
      </Collapse>

    </Paper>
  );
}
