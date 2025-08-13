import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useScreenplay } from '../state/screenplayStore';
import { useT } from '../i18n';
import { estimateDraftPages } from '../services/screenplayUtils';

export default function ProjectStatusFooter() {
  const { screenplay } = useScreenplay();
  const t = useT();

  const stats = useMemo(() => {
    if (!screenplay) return null;
    const prewritingDone = Boolean(
      screenplay.ideation?.decidedRowId &&
      (screenplay.turningPoints?.length || 0) > 0 &&
      (screenplay.treatment || screenplay.treatmentHtml || screenplay.treatmentMd)
    );

    const scenes = screenplay.scenes || [];
    const scriptedScenes = scenes.filter((s: any) => {
      const blocks = s.scriptBlocks as any[] | undefined;
      const hasBlocks = blocks && blocks.some(b => String(b.text || '').trim());
      const hasHtml = typeof s.scriptHtml === 'string' && s.scriptHtml.trim();
      return Boolean(hasBlocks || hasHtml);
    }).length;

    return {
      prewritingDone,
      characters: screenplay.characters?.length || 0,
      locations: screenplay.locations?.length || 0,
      totalScenes: scenes.length,
      scriptedScenes,
      pages: estimateDraftPages(screenplay)
    };
  }, [screenplay]);

  if (!screenplay || !stats) return null;
  const { prewritingDone, characters, locations, totalScenes, scriptedScenes, pages } = stats;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Typography variant="caption">
        {t('footer.prewriting')}: {t(prewritingDone ? 'footer.prewriting.completed' : 'footer.prewriting.pending')}
      </Typography>
      <Typography variant="caption">{t('footer.characters')}: {characters}</Typography>
      <Typography variant="caption">{t('footer.locations')}: {locations}</Typography>
      <Typography variant="caption">{t('footer.scenes')}: {totalScenes}</Typography>
      <Typography variant="caption">{t('footer.scenesWithScript')}: {scriptedScenes}</Typography>
      <Typography variant="caption">{t('footer.pages')}: {pages}</Typography>
    </Box>
  );
}
