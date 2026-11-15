import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../lib/gsap';
import { creationsAssets, heroCake } from '../config/assets';
import { formatRand, sizes } from '../config/content';
import { duration, ease, media, stagger } from '../config/motion';
import { LandingAsset } from '../components/LandingAsset';
import { MaskedLines } from '../components/MaskedLines';

export function Creations() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.belowDesktop}`, () => {
        const s = root.current!;

        // header: masked lines + supporting copy
        gsap.from(s.querySelectorAll('.creations-head [data-line]'), {
          yPercent: 110,
          duration: duration.text,
          ease: ease.text,
          stagger: stagger.lines,
          scrollTrigger: { trigger: s.querySelector('.creations-head'), start: 'top 80%' },
        });
        gsap.from(s.querySelectorAll('.creations-head [data-fade]'), {
          y: 20,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: 0.1,
          delay: 0.2,
          scrollTrigger: { trigger: s.querySelector('.creations-head'), start: 'top 80%' },
        });

        // feature: clip-path wipe up, image settles from a slight zoom
        const feature = s.querySelector('.creations-feature');
        gsap
          .timeline({ scrollTrigger: { trigger: feature, start: 'top 78%' } })
          .fromTo(
            feature,
            { clipPath: 'inset(100% 0% 0% 0% round 1rem)' },
            { clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: duration.reveal, ease: ease.reveal }
          )
          .from(s.querySelector('.creations-feature img'), { scale: 1.18, duration: 1.6, ease: ease.out }, 0)
          .from(s.querySelector('.creations-feature-caption'), { y: 16, opacity: 0, duration: duration.fast, ease: ease.out }, 0.7);

        // menu rows: slide in from the left, leaders draw across
        const rows = s.querySelectorAll('.menu-row');
        gsap.from(rows, {
          x: -28,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: stagger.items,
          scrollTrigger: { trigger: s.querySelector('.menu'), start: 'top 78%' },
        });
        gsap.from(s.querySelectorAll('.menu-leader'), {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1,
          ease: ease.out,
          stagger: stagger.items,
          delay: 0.25,
          scrollTrigger: { trigger: s.querySelector('.menu'), start: 'top 78%' },
        });

        // cupcake stage: scale in, then gentle parallax on scroll
        const stage = s.querySelector('.cupcake-stage');
        gsap.from(stage!.querySelectorAll('.l-asset__img'), {
          scale: 0.86,
          opacity: 0,
          duration: 1.1,
          ease: ease.out,
          stagger: 0.15,
          scrollTrigger: { trigger: stage, start: 'top 80%' },
        });
        stage!.querySelectorAll<HTMLElement>('.l-asset').forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax) || 0,
            ease: ease.scrub,
            scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="creations" aria-labelledby="creations-title" className="relative overflow-hidden bg-cream py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          <header className="creations-head lg:col-span-5 lg:pt-12">
            <p className="font-script text-2xl text-pink" data-fade>
              Signature creations
            </p>
            <h2
              id="creations-title"
              className="mt-3 font-display text-[clamp(2.5rem,7vw,3.5rem)] font-medium leading-[1] tracking-[-0.02em] lg:text-[clamp(3.25rem,4.6vw,4.75rem)]"
            >
              <MaskedLines
                lines={[
                  'Every cake,',
                  <>
                    made <em className="italic text-pink">to order</em>
                  </>,
                ]}
              />
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/75" data-fade>
              Start with a size. Fillings, toppers and VAT are added as you design, and you'll see the full total before you pay.
            </p>
          </header>

          <figure className="relative lg:col-span-7">
            <div className="creations-feature relative aspect-[5/4] overflow-hidden rounded-2xl bg-pink-light md:aspect-[16/11]">
              <div className="absolute inset-x-[12%] -bottom-[4%] top-[4%] md:inset-x-[20%]">
                <img
                  src={heroCake.poster.desktop}
                  alt="Our most-loved two-tier style celebration cake with Malika's piped in rose icing"
                  width={960}
                  height={960}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <figcaption className="creations-feature-caption absolute left-4 top-4 rounded-xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur md:left-6 md:top-6">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-pink">Most loved</span>
              <span className="mt-1 block font-display text-xl text-charcoal">20cm Round · {formatRand(550)}</span>
              <span className="block text-sm text-charcoal/60">Serves 12–15</span>
            </figcaption>
          </figure>
        </div>

        <div className="mt-20 grid items-start gap-16 lg:mt-28 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ol className="menu" aria-label="Cake sizes and base prices">
              {sizes.map((s) => (
                <li key={s.name} className="menu-row flex items-baseline gap-4 border-b border-charcoal/10 py-5 md:py-6">
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-medium leading-tight md:text-[1.9rem]">
                      {s.name}
                      {'featured' in s && s.featured && (
                        <span className="ml-3 inline-block translate-y-[-3px] rounded-full bg-pink-light px-2.5 py-1 align-middle font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                          Most loved
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-charcoal/60">
                      {s.serves} · {s.note}
                    </p>
                  </div>
                  <span className="menu-leader hidden flex-1 border-b-2 border-dotted border-charcoal/20 md:block" aria-hidden="true" />
                  <p className="ml-auto shrink-0 font-display text-2xl tabular-nums text-charcoal md:ml-0 md:text-[1.9rem]">
                    <span className="sr-only">from </span>
                    {formatRand(s.price)}
                  </p>
                </li>
              ))}
            </ol>
            <Link to="/order" className="l-btn-outline mt-10">
              Start designing
            </Link>
          </div>

          <div className="relative lg:col-span-5">
            <div className="cupcake-stage relative mx-auto aspect-square w-full max-w-[440px] lg:mt-16">
              <div className="absolute inset-[8%] rounded-full bg-blush/40" aria-hidden="true" />
              {creationsAssets.map((a) => (
                <LandingAsset key={a.id} asset={a} />
              ))}
            </div>
            <p className="relative z-10 mx-auto -mt-4 max-w-[440px] text-right font-display text-xl italic text-charcoal/80">
              Cupcakes by the dozen, <span className="not-italic text-charcoal">{formatRand(200)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
