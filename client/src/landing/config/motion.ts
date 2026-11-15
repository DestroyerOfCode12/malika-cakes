// One small motion vocabulary for the whole landing page.
// Change timing here, not inside components.

export const ease = {
  /** masked text reveals */
  text: 'expo.out',
  /** fade + translate, asset entrances */
  out: 'power3.out',
  /** clip-path reveals */
  reveal: 'power4.inOut',
  /** scroll-scrubbed motion must be linear so it tracks the scrollbar */
  scrub: 'none',
} as const;

export const duration = {
  text: 1.1,
  base: 0.9,
  fast: 0.6,
  reveal: 1.2,
} as const;

export const stagger = {
  lines: 0.1,
  items: 0.08,
  assets: 0.12,
} as const;

/** Lenis feel: lower = smoother/longer glide */
export const lenisLerp = 0.1;

/** gsap.matchMedia conditions, shared so every section agrees on breakpoints */
export const media = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  tablet: '(min-width: 768px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
  belowDesktop: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

/** How much scroll the pinned hero consumes while the cake turns */
export const heroPin = {
  desktop: '+=180%',
  tablet: '+=150%',
  mobile: '+=120%',
} as const;
