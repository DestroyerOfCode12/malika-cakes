import type { ReactNode } from 'react';

/**
 * Headline split into explicit lines, each inside an overflow mask.
 * Animate `[data-line]` from yPercent 110 → 0 for a masked reveal.
 * Lines are authored by hand (not measured) so breaks are art-directed and stable.
 */
export function MaskedLines({ lines, lineClassName = '' }: { lines: ReactNode[]; lineClassName?: string }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span data-line className={`block will-change-transform ${lineClassName}`}>
            {line}
          </span>
        </span>
      ))}
    </>
  );
}
