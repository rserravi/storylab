import React from 'react';
import '../styles/hollywood.css';
import type { Screenplay } from '../types';

type Props = { screenplay: Screenplay };

type El =
  | { type: 'heading'; text: string }
  | { type: 'action'; text: string }
  | { type: 'character'; text: string }
  | { type: 'parenthetical'; text: string }
  | { type: 'dialogue'; text: string }
  | { type: 'transition'; text: string };

function parseSynopsisToBlocks(s: string): El[] {
  if (!s?.trim()) return [];
  const lines = s.split(/\r?\n/);
  const out: El[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i].trim();
    i++;

    if (!raw) { continue; }

    // Transitions (simple)
    if (/^(CUT TO:|FADE (IN|OUT):|DISSOLVE TO:)/i.test(raw)) {
      out.push({ type: 'transition', text: raw.toUpperCase() });
      continue;
    }

    // Parenthetical
    if (/^\(.*\)$/.test(raw)) {
      out.push({ type: 'parenthetical', text: raw });
      continue;
    }

    // Character (simple heuristic: SHORT ALL CAPS)
    if (/^[A-Z0-9 .'\-()]{2,30}$/.test(raw) && raw === raw.toUpperCase()) {
      // gather dialogue until blank line
      let dial: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const l = lines[i].trim();
        if (/^\(.*\)$/.test(l)) {
          if (dial.length) out.push({ type: 'dialogue', text: dial.join(' ') });
          out.push({ type: 'parenthetical', text: l });
          dial = [];
        } else {
          dial.push(l);
        }
        i++;
      }
      out.push({ type: 'character', text: raw });
      if (dial.length) out.push({ type: 'dialogue', text: dial.join(' ') });
      continue;
    }

    // Default: action
    out.push({ type: 'action', text: raw });
  }
  return out;
}

export default function FormattedDraft({ screenplay }: Props) {
  // (Paginación real vendrá después; ahora es una única “sheet” larga)
  return (
    <div className="script-sheet">
      <div className="script-content">
        {(screenplay.scenes || [])
          .sort((a,b)=>a.number-b.number)
          .map((sc) => (
            <div key={sc.id}>
              <div className="scene-heading">{sc.slugline || 'INT./EXT. TBD - DAY'}</div>
              {parseSynopsisToBlocks(sc.synopsis || '').map((b, idx) => {
                if (b.type === 'heading') return <div key={idx} className="scene-heading">{b.text}</div>;
                if (b.type === 'action') return <div key={idx} className="action">{b.text}</div>;
                if (b.type === 'character') return <div key={idx} className="character">{b.text}</div>;
                if (b.type === 'parenthetical') return <div key={idx} className="parenthetical">{b.text}</div>;
                if (b.type === 'dialogue') return <div key={idx} className="dialogue">{b.text}</div>;
                if (b.type === 'transition') return <div key={idx} className="transition">{b.text}</div>;
                return null;
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
