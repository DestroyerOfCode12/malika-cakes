// Art-direction config for every independent visual on the landing page.
// Positions are CSS lengths relative to the asset's section (or stage), per breakpoint.
// Layout code reads from here; never hard-code coordinates in JSX.

export type Placement = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  /** rendered width; height follows the image's aspect ratio */
  width: string;
};

export type AssetConfig = {
  id: string;
  src: string;
  /** empty string = purely decorative (hidden from screen readers) */
  alt: string;
  role: 'primary' | 'secondary' | 'decor';
  /** intrinsic pixel size, so the browser reserves space (no layout shift) */
  intrinsic: { w: number; h: number };
  desktop: Placement | 'hidden';
  /** falls back to desktop when omitted */
  tablet?: Placement | 'hidden';
  mobile: Placement | 'hidden';
  rotate?: number; // degrees, static art-direction tilt
  scale?: number; // static scale
  zIndex: number;
  opacity?: number;
  /** soft focus for background depth layers (px) */
  blur?: number;
  /** scroll parallax in yPercent; negative drifts up faster than the page */
  parallax?: number;
  /** entrance delay (s) relative to the section's entrance */
  enterDelay?: number;
  loading?: 'eager' | 'lazy';
};

const base = '/assets/landing';

export const heroCake = {
  alt: "A two-tier pink and white celebration cake with Malika's piped on the side in rose icing, topped with macarons, raspberries and gold leaf, turning slowly on a white cake stand",
  poster: { desktop: `${base}/hero-cake/poster.webp`, mobile: `${base}/hero-cake/poster-mobile.webp` },
  sequence: {
    desktop: { count: 96, size: 960, frame: (i: number) => `${base}/hero-cake/frame-${String(i + 1).padStart(4, '0')}.webp` },
    mobile: { count: 48, size: 640, frame: (i: number) => `${base}/hero-cake/mobile/frame-${String(i + 1).padStart(4, '0')}.webp` },
  },
  /** frames decoded before first paint; the rest stream in when the browser is idle */
  eagerFrames: 8,
};

export const heroAssets: AssetConfig[] = [
  {
    id: 'hero-macaron',
    src: `${base}/macaron.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 520, h: 520 },
    desktop: { top: '13%', left: '-2.5%', width: 'clamp(90px, 10vw, 170px)' },
    tablet: { top: '9%', left: '-6%', width: '15vw' },
    mobile: 'hidden',
    rotate: -18,
    zIndex: 1,
    blur: 2,
    parallax: -18,
    enterDelay: 0.5,
    loading: 'eager',
  },
  {
    id: 'hero-sprinkles',
    src: `${base}/sprinkles.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 640, h: 640 },
    // tucked between the copy and the cake base so it never sits behind body text
    desktop: { top: '58%', left: '34%', width: 'clamp(200px, 20vw, 360px)' },
    tablet: { top: '50%', left: '30%', width: '34vw' },
    mobile: { top: '14%', right: '-18%', width: '62vw' },
    rotate: 12,
    zIndex: 0,
    opacity: 0.45,
    parallax: -8,
    enterDelay: 0.35,
    loading: 'eager',
  },
  {
    id: 'hero-gold',
    src: `${base}/gold-flakes.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 420, h: 420 },
    desktop: { top: '9%', right: '9%', width: 'clamp(80px, 8vw, 140px)' },
    tablet: { top: '30%', right: '4%', width: '14vw' },
    mobile: { top: '27%', right: '4%', width: '20vw' },
    rotate: 8,
    zIndex: 25,
    parallax: -28,
    enterDelay: 0.75,
    loading: 'eager',
  },
  {
    id: 'hero-raspberries',
    src: `${base}/raspberries.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 560, h: 560 },
    desktop: { bottom: '7%', left: '41%', width: 'clamp(80px, 8vw, 140px)' },
    tablet: 'hidden',
    mobile: 'hidden',
    rotate: -6,
    zIndex: 30,
    parallax: -34,
    enterDelay: 0.65,
    loading: 'eager',
  },
  {
    id: 'hero-strawberries',
    src: `${base}/strawberries.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 700, h: 700 },
    // cropped by the viewport edge on purpose: it reads as the closest layer
    desktop: { bottom: '-9%', right: '-5%', width: 'clamp(200px, 21vw, 360px)' },
    tablet: { bottom: '-6%', right: '-8%', width: '30vw' },
    mobile: { bottom: '-4%', right: '-14%', width: '42vw' },
    rotate: -10,
    zIndex: 30,
    parallax: -45,
    enterDelay: 0.55,
    loading: 'eager',
  },
];

export const creationsAssets: AssetConfig[] = [
  {
    id: 'creations-cupcake',
    src: `${base}/cupcake.webp`,
    alt: 'A pink swirl cupcake with sprinkles and a raspberry on top',
    role: 'secondary',
    intrinsic: { w: 800, h: 800 },
    desktop: { top: '-6%', right: '-8%', width: '118%' },
    mobile: { top: '-4%', right: '-6%', width: '112%' },
    zIndex: 2,
    parallax: -14,
  },
  {
    id: 'creations-macarons',
    src: `${base}/macaron-stack.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 700, h: 700 },
    desktop: { bottom: '-14%', left: '-30%', width: '62%' },
    mobile: { bottom: '-10%', left: '-14%', width: '50%' },
    rotate: -4,
    zIndex: 3,
    parallax: -26,
  },
];

export const buildAssets = {
  slice: {
    id: 'build-slice',
    src: `${base}/cake-slice.webp`,
    alt: 'A slice of layered vanilla sponge with buttercream and ganache filling, topped with berries',
    intrinsic: { w: 900, h: 900 },
  },
  toppers: [
    { id: 'top-strawberries', src: `${base}/strawberries.webp`, intrinsic: { w: 700, h: 700 }, at: { top: '-6%', right: '-4%', width: '42%' }, rotate: 14 },
    { id: 'top-raspberries', src: `${base}/raspberries.webp`, intrinsic: { w: 560, h: 560 }, at: { bottom: '4%', left: '-2%', width: '30%' }, rotate: -8 },
    { id: 'top-macaron', src: `${base}/macaron.webp`, intrinsic: { w: 520, h: 520 }, at: { top: '6%', left: '2%', width: '28%' }, rotate: -16 },
    { id: 'top-gold', src: `${base}/gold-flakes.webp`, intrinsic: { w: 420, h: 420 }, at: { bottom: '12%', right: '6%', width: '24%' }, rotate: 10 },
  ],
} as const;

export const finalCtaAssets: AssetConfig[] = [
  {
    id: 'cta-cupcake',
    src: `${base}/cupcake.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 800, h: 800 },
    desktop: { bottom: '-12%', left: '-3%', width: 'clamp(200px, 20vw, 340px)' },
    tablet: { bottom: '-10%', left: '-8%', width: '30vw' },
    mobile: { bottom: '-6%', left: '-16%', width: '44vw' },
    rotate: -12,
    zIndex: 1,
    parallax: -20,
  },
  {
    id: 'cta-macaron',
    src: `${base}/macaron.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 520, h: 520 },
    desktop: { top: '12%', right: '6%', width: 'clamp(110px, 10vw, 180px)' },
    tablet: { top: '8%', right: '4%', width: '16vw' },
    mobile: { top: '5%', right: '-6%', width: '26vw' },
    rotate: 20,
    zIndex: 1,
    blur: 1,
    parallax: -34,
  },
  {
    id: 'cta-sprinkles',
    src: `${base}/sprinkles.webp`,
    alt: '',
    role: 'decor',
    intrinsic: { w: 640, h: 640 },
    desktop: { top: '-10%', left: '30%', width: 'clamp(240px, 26vw, 440px)' },
    mobile: { top: '-6%', left: '10%', width: '70vw' },
    zIndex: 0,
    opacity: 0.18,
    parallax: -10,
  },
];
