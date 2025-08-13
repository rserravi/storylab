import type { Screenplay } from '../types';

// Estimate draft pages based on 55 lines per page
export function estimateDraftPages(screenplay: Screenplay): number {
  const totalLines = (screenplay.scenes || []).reduce((sum, scene: any) => {
    if (scene.scriptBlocks && Array.isArray(scene.scriptBlocks)) {
      return (
        sum + scene.scriptBlocks.reduce((acc: number, b: any) => acc + String(b.text || '').split(/\n/).filter(Boolean).length, 0)
      );
    }
    if (scene.scriptHtml) {
      const text = String(scene.scriptHtml)
        .replace(/<[^>]+>/g, '\n')
        .split(/\n/)
        .filter((l) => l.trim()).length;
      return sum + text;
    }
    return sum;
  }, 0);
  return Math.ceil(totalLines / 55);
}
