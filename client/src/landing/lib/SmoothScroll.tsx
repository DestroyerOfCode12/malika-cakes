import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { lenisLerp } from '../config/motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type ScrollTarget = string | HTMLElement | number;

interface SmoothScrollApi {
  scrollTo: (target: ScrollTarget, opts?: { offset?: number }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi>({
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * One Lenis instance for the landing page, driven by GSAP's ticker so there is a
 * single requestAnimationFrame loop:  Lenis → gsap.ticker → ScrollTrigger.
 * Disabled entirely for prefers-reduced-motion (native scrolling instead).
 * Destroyed on unmount, so /order and other routes scroll natively.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ lerp: lenisLerp, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    force((n) => n + 1);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  const scrollTo = useCallback(
    (target: ScrollTarget, opts: { offset?: number } = {}) => {
      const offset = opts.offset ?? 0;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.4 });
        return;
      }
      // reduced motion / no Lenis: jump instantly
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (typeof el === 'number') {
        window.scrollTo({ top: el + offset, behavior: 'auto' });
      } else if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: 'auto' });
      }
    },
    []
  );

  return <SmoothScrollContext.Provider value={{ scrollTo }}>{children}</SmoothScrollContext.Provider>;
}
