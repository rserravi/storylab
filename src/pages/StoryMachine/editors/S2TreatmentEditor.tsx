import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import TitleIcon from '@mui/icons-material/Title';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';

import TurndownService from 'turndown';
import { marked } from 'marked';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../../styles/markdown.css';

import { useScreenplay } from '../../../state/screenplayStore';
import { useT } from '../../../i18n';
import { useUi } from '../../../state/uiStore';

// Ayuda (localized)
import helpES from '../../../content/s2-treatment-help.es.md?raw';
import helpEN from '../../../content/s2-treatment-help.en.md?raw';
import helpCA from '../../../content/s2-treatment-help.ca.md?raw';

// Estilos mínimos para el contenido TipTap dentro de MUI
const editorStyles = {
  '& .ProseMirror': {
    outline: 'none',
    minHeight: '50vh',
    padding: '12px',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  '& .ProseMirror h1': {
    fontSize: '1.6rem',
    lineHeight: 1.3,
    margin: '1.2rem 0 .5rem'
  },
  '& .ProseMirror h2': {
    fontSize: '1.3rem',
    lineHeight: 1.35,
    margin: '1rem 0 .5rem'
  },
  '& .ProseMirror p': {
    margin: '.5rem 0'
  },
  '& .is-empty::before': {
    content: 'attr(data-placeholder)',
    pointerEvents: 'none',
    opacity: 0.5
  }
} as const;

export default function S2TreatmentEditor() {
  const t = useT();
  const { lang } = useUi();
  const { screenplay, patch } = useScreenplay();

  const [helpOpen, setHelpOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const helpText = useMemo(() => (lang === 'en' ? helpEN : lang === 'ca' ? helpCA : helpES), [lang]);

  // Cargar contenido inicial: si hay HTML lo usamos; si solo hay MD, lo convertimos a HTML
  const initialHtml = useMemo(() => {
    const html = (screenplay as any)?.treatmentHtml as string | undefined;
    const md = (screenplay as any)?.treatmentMd as string | undefined;
    if (html && html.trim()) return html;
    if (md && md.trim()) return marked.parse(md);
    return '';
  }, [screenplay?.id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2] }),
      Underline,
      Placeholder.configure({
        placeholder: t('s2.placeholder')
      })
    ],
    content: initialHtml || '<p></p>',
    autofocus: false,
    editable: true
  }, [initialHtml, lang]);

  useEffect(() => {
    // si cambia el proyecto, podríamos recargar el html/md
  }, [screenplay?.id]);

  const toggle = (cmd: () => void) => { cmd(); };

  const saveMarkdown = async () => {
    if (!editor || !screenplay) return;
    setSaving(true);
    try {
      const html = editor.getHTML();
      const turndown = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });
      turndown.addRule('underline', {
        filter: ['u'],
        replacement: function (content) {
          return `<u>${content}</u>`;
        }
      });
      const markdown = turndown.turndown(html);
      patch({ treatmentMd: markdown, treatmentHtml: html });
    } finally {
      setSaving(false);
    }
  };

  const aiProposal = () => {
    if (!editor) return;
    const synopsis = (screenplay?.synopsis || '').trim();
    const ctx = synopsis ? `\n\n${t('s2.ai.contextLabel')} ${synopsis}` : '';

    const textES = `# Logline y premisa
Un protagonista con una necesidad clara se enfrenta a un obstáculo creciente. Lo que está en juego obliga a decidir.

## Acto I — Preparación
Presentamos el mundo ordinario y el incidente que altera la rutina. El **Momento de Cambio** empuja hacia el Acto II.

## Acto II — Confrontación
Obstáculos crecientes, alianzas y sacrificios. En el **Punto Medio / Ordalía**, una prueba máxima redefine objetivos.

## Acto III — Resolución
La **Crisis** precipita el **Clímax**. El final muestra la nueva normalidad y el cambio interno.${ctx}`;

    const textEN = `# Logline & premise
A protagonist with a clear need confronts mounting obstacles. Stakes force a choice.

## Act I — Setup
We establish the ordinary world and the inciting incident. The **Break into Act II** pushes the story forward.

## Act II — Confrontation
Escalating obstacles, alliances and sacrifices. At the **Midpoint / Ordeal**, a maximum test reframes objectives.

## Act III — Resolution
The **Crisis** leads to the **Climax**. The ending shows a new normal and inner change.${ctx}`;

    const textCA = `# Logline i premissa
Un protagonista amb una necessitat clara afronta obstacles creixents. El que està en joc força una decisió.

## Acte I — Preparació
Presentem el món ordinari i l’incident que altera la rutina. El **Moment de Canvi** empeny cap a l’Acte II.

## Acte II — Confrontació
Obstacles creixents, aliances i sacrificis. Al **Punt Mig / Ordalía**, una prova màxima redefineix objectius.

## Acte III — Resolució
La **Crisi** condueix al **Clímax**. El final mostra la nova normalitat i el canvi intern.${ctx}`;

    const md = lang === 'en' ? textEN : lang === 'ca' ? textCA : textES;
    const html = marked.parse(md);
    editor.commands.setContent(html, false);
  };

  return (
    <Paper sx={{ p:2 }}>
      {/* Header con acciones a la derecha */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('s2.title')}
        </Typography>

        <Tooltip title={t('s2.ai.tooltip')}>
          <span>
            <Button size="small" startIcon={<PsychologyIcon />} onClick={aiProposal} sx={{ mr: .5 }}>
              {t('s2.ai.button')}
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={t('s2.help.tooltip')}>
          <IconButton onClick={() => setHelpOpen(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Toolbar WYSIWYG */}
      <Stack direction="row" spacing={1} sx={{ mb:1, flexWrap:'wrap' }}>
        <Tooltip title={t('s2.toolbar.h1Tip')}><span>
          <Button
            size="small"
            startIcon={<LooksOneIcon />}
            variant={editor?.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          >{t('s2.toolbar.h1')}</Button>
        </span></Tooltip>

        <Tooltip title={t('s2.toolbar.h2Tip')}><span>
          <Button
            size="small"
            startIcon={<LooksTwoIcon />}
            variant={editor?.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          >{t('s2.toolbar.h2')}</Button>
        </span></Tooltip>

        <Tooltip title={t('s2.toolbar.bodyTip')}><span>
          <Button
            size="small"
            startIcon={<TitleIcon />}
            variant={editor?.isActive('paragraph') ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().setParagraph().run())}
          >{t('s2.toolbar.body')}</Button>
        </span></Tooltip>

        <Box sx={{ width: 8 }} />

        <Tooltip title={t('s2.toolbar.boldTip')}><span>
          <Button
            size="small"
            startIcon={<FormatBoldIcon />}
            variant={editor?.isActive('bold') ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().toggleBold().run())}
          >{t('s2.toolbar.bold')}</Button>
        </span></Tooltip>

        <Tooltip title={t('s2.toolbar.italicTip')}><span>
          <Button
            size="small"
            startIcon={<FormatItalicIcon />}
            variant={editor?.isActive('italic') ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().toggleItalic().run())}
          ><i>{t('s2.toolbar.italic')}</i></Button>
        </span></Tooltip>

        <Tooltip title={t('s2.toolbar.underlineTip')}><span>
          <Button
            size="small"
            startIcon={<FormatUnderlinedIcon />}
            variant={editor?.isActive('underline') ? 'contained' : 'outlined'}
            onClick={() => editor && toggle(() => editor.chain().focus().toggleUnderline().run())}
          ><u>{t('s2.toolbar.underline')}</u></Button>
        </span></Tooltip>

        <Box sx={{ flexGrow: 1 }} />

        <Button onClick={saveMarkdown} disabled={!editor || saving}>
          {saving ? t('s2.saving') : t('s2.saveMarkdown')}
        </Button>
      </Stack>

      {/* Área de edición */}
      <Paper variant="outlined" sx={editorStyles}>
        <EditorContent editor={editor} />
      </Paper>

      {/* Modal de ayuda */}
      <Dialog open={helpOpen} onClose={()=>setHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('s2.help.title')}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Box className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {helpText}
            </ReactMarkdown>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setHelpOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
