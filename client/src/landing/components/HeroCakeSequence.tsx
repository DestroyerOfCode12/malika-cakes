import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { heroCake } from '../config/assets';

export interface CakeSequenceHandle {
  /** 0 → 1 maps to one full 360° turn of the cake */
  setProgress: (p: number) => void;
}

const MOBILE_QUERY = '(max-width: 767.98px)';
const MAX_DPR = 2;

/**
 * Apple-style image sequence: pre-rendered turntable frames drawn to one <canvas>.
 * - poster image paints instantly (and is all reduced-motion users ever load)
 * - first few frames decode eagerly, the rest stream in while the browser is idle
 * - redraws only when the frame index changes; driven by a ScrollTrigger scrub
 */
export const HeroCakeSequence = forwardRef<CakeSequenceHandle, { animate: boolean }>(function HeroCakeSequence(
  { animate },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const frame = useRef(0);
  const count = useRef(0);
  const [ready, setReady] = useState(false);

  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const list = images.current;
    // nearest decoded frame at or before the target, else the next one after it
    let img: HTMLImageElement | null = null;
    for (let i = index; i >= 0 && !img; i--) img = list[i];
    for (let i = index + 1; i < list.length && !img; i++) img = list[i];
    if (!img) return;
    const { width: w, height: h } = canvas;
    const s = Math.min(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(p: number) {
        const n = count.current;
        if (!n) return;
        const idx = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
        if (idx === frame.current) return;
        frame.current = idx;
        draw(idx);
      },
    }),
    [draw]
  );

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const seq = isMobile ? heroCake.sequence.mobile : heroCake.sequence.desktop;
    count.current = seq.count;
    images.current = new Array(seq.count).fill(null);

    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = seq.frame(i);
        img
          .decode()
          .then(() => {
            if (cancelled) return;
            images.current[i] = img;
            if (i === frame.current) draw(i);
          })
          .catch(() => {})
          .finally(resolve);
      });

    // size the backing store to the element, capped at 2x DPR
    const canvas = canvasRef.current!;
    const ro = new ResizeObserver(([entry]) => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const size = Math.round(entry.contentRect.width * dpr);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
        draw(frame.current);
      }
    });
    ro.observe(wrapRef.current!);

    type Idle = (cb: () => void) => number;
    const idle: Idle =
      'requestIdleCallback' in window
        ? (cb) => (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(cb)
        : (cb) => window.setTimeout(cb, 60);

    (async () => {
      const eager = Array.from({ length: Math.min(heroCake.eagerFrames, seq.count) }, (_, i) => i);
      await Promise.all(eager.map(load));
      if (cancelled) return;
      draw(frame.current);
      setReady(true);
      const rest = Array.from({ length: seq.count - eager.length }, (_, i) => i + eager.length);
      const pump = () => {
        if (cancelled) return;
        const batch = rest.splice(0, 6);
        if (!batch.length) return;
        Promise.all(batch.map(load)).then(() => idle(pump));
      };
      idle(pump);
    })();

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [animate, draw]);

  return (
    <div ref={wrapRef} role="img" aria-label={heroCake.alt} className="relative aspect-square w-full">
      <picture aria-hidden="true" className={`absolute inset-0 transition-opacity duration-300 ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <source media={MOBILE_QUERY} srcSet={heroCake.poster.mobile} type="image/webp" />
        <img
          src={heroCake.poster.desktop}
          alt=""
          width={heroCake.sequence.desktop.size}
          height={heroCake.sequence.desktop.size}
          className="h-full w-full object-contain"
          decoding="async"
          {...{ fetchpriority: 'high' }}
        />
      </picture>
      {animate && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
});
