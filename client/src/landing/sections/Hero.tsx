import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../lib/gsap';
import { heroAssets } from '../config/assets';
import { duration, ease, heroPin, media, stagger } from '../config/motion';
import { LandingAsset } from '../components/LandingAsset';
import { MaskedLines } from '../components/MaskedLines';
import { HeroCakeSequence, type CakeSequenceHandle } from '../components/HeroCakeSequence';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { useSmoothScroll } from '../lib/SmoothScroll';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const seq = useRef<CakeSequenceHandle>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      const section = root.current!;
      const mm = gsap.matchMedia();

      mm.add({ desktop: media.desktop, tablet: media.tablet, mobile: media.mobile, reduce: media.reduce }, (ctx) => {
        const { desktop, tablet, mobile, reduce } = ctx.conditions as Record<string, boolean>;

        if (reduce) {
          gsap.from('[data-hero-fade], [data-line]', { opacity: 0, duration: 0.5, stagger: 0.04 });
          return;
        }

        // ---- entrance (plays once on load)
        const intro = gsap.timeline({ defaults: { ease: ease.out } });
        intro
          .from('[data-line]', { yPercent: 110, duration: duration.text, ease: ease.text, stagger: stagger.lines }, 0.1)
          .from('[data-hero-fade]', { y: 24, opacity: 0, duration: duration.base, stagger: 0.08 }, 0.4)
          .from('.hero-cake-inner', { scale: 0.9, opacity: 0, duration: 1.4 }, 0.15)
          .from(
            section.querySelectorAll('.l-asset__img'),
            {
              opacity: 0,
              scale: 0.82,
              y: 30,
              duration: duration.base,
              delay: (_i: number, el: HTMLElement) => Number(el.dataset.enterDelay) || 0,
            },
            0
          );

        // ---- scroll: pin the hero and turn the cake through all 360°
        const state = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: desktop ? heroPin.desktop : tablet ? heroPin.tablet : heroPin.mobile,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(state, { p: 1, duration: 1, ease: ease.scrub, onUpdate: () => seq.current?.setProgress(state.p) }, 0)
          .to('.hero-cake-stage', { scale: mobile ? 0.94 : 0.86, yPercent: mobile ? -3 : -6, duration: 1, ease: ease.scrub }, 0)
          .to('.hero-scroll-hint', { opacity: 0, duration: 0.08 }, 0.02)
          .to('[data-hero-scrollfade]', { y: -48, opacity: 0, duration: 0.32, stagger: 0.03, ease: 'power1.in' }, mobile ? 0.62 : 0.56);

        // decor layers drift at different rates: foreground fast, background slow
        section.querySelectorAll<HTMLElement>('.l-asset').forEach((el) => {
          tl.to(el, { yPercent: Number(el.dataset.parallax) || 0, duration: 1, ease: ease.scrub }, 0);
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="hero relative h-[100svh] min-h-[620px] overflow-hidden bg-cream"
    >
      {heroAssets.map((a) => (
        <LandingAsset key={a.id} asset={a} />
      ))}

      <div className="hero-grid relative z-10 mx-auto h-full max-w-[1440px] px-5 md:px-10 lg:px-14">
        <div className="hero-area-eyebrow" data-hero-scrollfade>
          <p className="font-script text-xl text-pink md:text-2xl" data-hero-fade>
            Malika's <span aria-hidden="true">·</span> Cake Boutique
          </p>
        </div>

        <div className="hero-area-title" data-hero-scrollfade>
          <h1
            id="hero-title"
            className="font-display font-medium leading-[0.94] tracking-[-0.025em] text-charcoal text-[clamp(2.75rem,9.4vw,4.5rem)] md:text-[clamp(4rem,8.6vw,6rem)] lg:text-[clamp(4.6rem,6.9vw,7.5rem)]"
          >
            <MaskedLines
              lines={[
                'Cakes made',
                <>
                  for <em className="font-medium italic text-pink">your</em>
                </>,
                'moments',
              ]}
            />
          </h1>
        </div>

        <div className="hero-area-cake hero-cake-stage relative z-[5]">
          <div className="hero-cake-inner">
            <HeroCakeSequence ref={seq} animate={!reduced} />
          </div>
        </div>

        <div className="hero-area-copy" data-hero-scrollfade>
          <p className="text-base leading-relaxed text-charcoal/75 md:max-w-[30ch] md:text-lg" data-hero-fade>
            Custom celebration cakes, hand-finished in Midrand. Pick your size, flavour and toppers. We'll bake the rest.
          </p>
        </div>

        <div className="hero-area-cta" data-hero-scrollfade>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3" data-hero-fade>
            <Link to="/order" className="l-btn-primary">
              Design your cake
            </Link>
            {/* phones already have "Creations" in the tab bar, so this link starts at tablet size */}
            <button
              type="button"
              onClick={() => scrollTo('#creations', { offset: -72 })}
              className="l-link hidden text-base font-semibold text-charcoal md:inline-block"
            >
              See creations
            </button>
          </div>
        </div>
      </div>

      {!reduced && (
        <div className="hero-scroll-hint pointer-events-none absolute inset-x-0 bottom-6 z-20 hidden justify-center lg:flex">
          <span className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-charcoal/50">
            <span className="hero-scroll-line" aria-hidden="true" />
            Scroll to turn the cake
          </span>
        </div>
      )}
    </section>
  );
}
