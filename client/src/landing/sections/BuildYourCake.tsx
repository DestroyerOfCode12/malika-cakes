import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../lib/gsap';
import { buildAssets } from '../config/assets';
import { buildSteps, sizes } from '../config/content';
import { duration, ease, media } from '../config/motion';

/** Concentric rings comparing the cake sizes (step one's visual). */
function SizeRings({ className = '' }: { className?: string }) {
  const rings = [
    { label: 'Bento', r: 18 },
    { label: '15cm', r: 30 },
    { label: '20cm', r: 42 },
    { label: '2-Tier', r: 54 },
    { label: '3-Tier', r: 66 },
  ];
  return (
    <svg viewBox="0 0 160 160" className={className} role="img" aria-label="Size comparison from a bento cake to three tiers">
      {rings.map((ring, i) => (
        <g key={ring.label} className="size-ring">
          <circle
            cx="80"
            cy="80"
            r={ring.r}
            fill={i === 2 ? 'rgba(247,200,211,0.35)' : 'none'}
            stroke={i === 2 ? '#DB2777' : '#3F3F46'}
            strokeOpacity={i === 2 ? 1 : 0.28}
            strokeWidth={i === 2 ? 1.4 : 0.8}
            pathLength={1}
            strokeDasharray="1"
          />
          <text
            x="80"
            y={80 - ring.r + 6}
            textAnchor="middle"
            fontSize="5"
            fontFamily="Poppins, sans-serif"
            fontWeight={i === 2 ? 700 : 500}
            fill={i === 2 ? '#DB2777' : '#3F3F46'}
            fillOpacity={i === 2 ? 1 : 0.6}
          >
            {ring.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Slice({ className = '', eager = false }: { className?: string; eager?: boolean }) {
  const s = buildAssets.slice;
  return (
    <img
      src={s.src}
      alt={s.alt}
      width={s.intrinsic.w}
      height={s.intrinsic.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}

function Toppers({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {buildAssets.toppers.map((t) => (
        <img
          key={t.id}
          src={t.src}
          alt=""
          width={t.intrinsic.w}
          height={t.intrinsic.h}
          loading="lazy"
          decoding="async"
          className="build-topper absolute"
          style={{ ...t.at, rotate: `${t.rotate}deg` }}
        />
      ))}
    </div>
  );
}

function Annotations() {
  return (
    <div className="build-annotations pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="build-note absolute left-[6%] top-[38%]">
        Your filling <span className="build-note-line" />
      </span>
      <span className="build-note build-note--right absolute right-[4%] top-[58%]">
        <span className="build-note-line" /> Your sponge
      </span>
    </div>
  );
}

function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Options">
      {items.map((o) => (
        <li key={o} className="rounded-full border border-charcoal/15 bg-white/70 px-3.5 py-1.5 text-sm text-charcoal/80">
          {o}
        </li>
      ))}
    </ul>
  );
}

export function BuildYourCake() {
  const root = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const s = root.current!;
      const mm = gsap.matchMedia();

      // ---------------- desktop: one pinned scene, four scroll-driven steps
      mm.add(media.desktop, () => {
        const scene = s.querySelector<HTMLElement>('.build-pinned')!;
        const texts = gsap.utils.toArray<HTMLElement>('.build-step', scene);
        const rings = scene.querySelectorAll('.size-ring circle');
        const slice = scene.querySelector('.build-slice');
        const notes = scene.querySelectorAll('.build-note');
        const toppers = scene.querySelectorAll('.build-topper');

        gsap.set(texts.slice(1), { autoAlpha: 0, y: 28 });
        gsap.set(slice, { autoAlpha: 0, xPercent: 40, rotate: 8 });
        gsap.set(notes, { autoAlpha: 0, x: -12 });
        gsap.set(toppers, { autoAlpha: 0, yPercent: -60, scale: 0.8 });

        // rings draw themselves as the section arrives (before pinning)
        gsap.from(rings, {
          strokeDashoffset: 1,
          duration: 1.4,
          ease: ease.out,
          stagger: 0.12,
          scrollTrigger: { trigger: scene, start: 'top 70%' },
        });
        gsap.from(scene.querySelectorAll('.build-head > *'), {
          y: 24,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: 0.1,
          scrollTrigger: { trigger: scene, start: 'top 70%' },
        });

        const steps = texts.length;
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 0.5 },
          scrollTrigger: {
            trigger: scene,
            start: 'top top',
            end: '+=320%',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => {
              const n = Math.min(steps, Math.floor(self.progress * steps) + 1);
              if (counter.current) counter.current.textContent = String(n).padStart(2, '0');
            },
          },
        });

        const swap = (from: number, to: number, at: number) => {
          tl.to(texts[from], { autoAlpha: 0, y: -28 }, at).to(texts[to], { autoAlpha: 1, y: 0 }, at + 0.15);
        };

        tl.to('.build-progress-fill', { scaleX: 1, ease: 'none', duration: 4 }, 0);
        // 1 → 2: rings make way for the slice
        swap(0, 1, 0.75);
        tl.to('.build-rings', { autoAlpha: 0, scale: 0.85 }, 0.75).to(slice, { autoAlpha: 1, xPercent: 0, rotate: 0 }, 0.85);
        // 2 → 3: lean into the layers
        swap(1, 2, 1.75);
        tl.to(slice, { scale: 1.22, xPercent: -6, yPercent: 4 }, 1.75).to(notes, { autoAlpha: 1, x: 0, stagger: 0.12 }, 2.0);
        // 3 → 4: toppers drop onto the stage
        swap(2, 3, 2.75);
        tl.to(notes, { autoAlpha: 0 }, 2.75)
          .to(slice, { scale: 1, xPercent: 0, yPercent: 0 }, 2.75)
          .to(toppers, { autoAlpha: 1, yPercent: 0, scale: 1, stagger: 0.08, ease: 'back.out(1.4)' }, 2.95)
          .to({}, { duration: 0.6 }); // hold the finished cake before unpinning
      });

      // ---------------- tablet/mobile (and reduced motion): stacked, simple reveals
      mm.add(media.belowDesktop, () => {
        gsap.utils.toArray<HTMLElement>('.build-card', s).forEach((card) => {
          gsap.from(card.querySelectorAll('[data-reveal]'), {
            y: 32,
            opacity: 0,
            duration: duration.base,
            ease: ease.out,
            stagger: 0.1,
            scrollTrigger: { trigger: card, start: 'top 82%' },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="build" aria-labelledby="build-title" className="relative bg-white">
      {/* Desktop pinned story (hidden on touch-size screens and for reduced motion via CSS) */}
      <div className="build-pinned relative h-[100svh] min-h-[680px] overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1440px] grid-cols-12 items-center gap-12 px-14 pt-20">
          <div className="col-span-5">
            <div className="build-head">
              <p className="font-script text-2xl text-pink">Build your cake</p>
              <h2 id="build-title" className="mt-2 font-display text-[clamp(2.6rem,3.8vw,3.75rem)] font-medium leading-[1.02] tracking-[-0.02em]">
                Four choices.
                <br />
                One <em className="italic text-pink">perfect</em> cake.
              </h2>
            </div>

            <div className="mt-10 flex items-center gap-4" aria-hidden="true">
              <span className="font-display text-lg tabular-nums text-charcoal">
                <span ref={counter}>01</span>
                <span className="text-charcoal/35"> / 04</span>
              </span>
              <span className="relative h-px flex-1 bg-charcoal/15">
                <span className="build-progress-fill absolute inset-0 origin-left scale-x-0 bg-pink" />
              </span>
            </div>

            <div className="relative mt-8 min-h-[300px]">
              {buildSteps.map((step) => (
                <article key={step.id} className="build-step absolute inset-x-0 top-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink">{step.kicker}</p>
                  <h3 className="mt-3 font-display text-4xl font-medium">{step.title}</h3>
                  <p className="mt-3 max-w-md text-lg leading-relaxed text-charcoal/70">{step.body}</p>
                  <Chips items={step.options} />
                </article>
              ))}
            </div>

            <Link to="/order" className="l-btn-primary mt-4">
              Design yours
            </Link>
          </div>

          <div className="col-span-7 flex items-center justify-center">
            <div className="build-stage relative aspect-square w-full max-w-[620px]">
              <div className="absolute inset-[6%] rounded-full bg-pink-light" aria-hidden="true" />
              <div className="build-rings absolute inset-[4%]">
                <SizeRings className="h-full w-full" />
              </div>
              <div className="build-slice absolute inset-[10%]">
                <Slice className="h-full w-full object-contain" />
              </div>
              <Annotations />
              <Toppers />
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / mobile / reduced-motion: a calm stacked layout */}
      <div className="build-stacked mx-auto max-w-3xl px-5 py-24 md:px-10 md:py-32">
        <p className="font-script text-2xl text-pink">Build your cake</p>
        <h2 className="mt-2 font-display text-[clamp(2.4rem,8vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em]">
          Four choices. One <em className="italic text-pink">perfect</em> cake.
        </h2>

        <div className="mt-14 space-y-20">
          {buildSteps.map((step, i) => (
            <article key={step.id} className="build-card">
              <div className="relative mx-auto aspect-square w-[78%] max-w-[380px]" data-reveal>
                <div className="absolute inset-[6%] rounded-full bg-pink-light" aria-hidden="true" />
                {i === 0 && <SizeRings className="relative h-full w-full" />}
                {i === 1 && <Slice className="relative h-full w-full object-contain" />}
                {i === 2 && (
                  <>
                    <Slice className="relative h-full w-full scale-110 object-contain" />
                    <Annotations />
                  </>
                )}
                {i === 3 && (
                  <>
                    <Slice className="relative h-full w-full object-contain" />
                    <Toppers />
                  </>
                )}
              </div>
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-pink" data-reveal>
                {step.kicker}
              </p>
              <h3 className="mt-2 font-display text-3xl font-medium" data-reveal>
                {step.title}
              </h3>
              <p className="mt-2 text-lg leading-relaxed text-charcoal/70" data-reveal>
                {step.body}
              </p>
              <div data-reveal>
                <Chips items={i === 0 ? sizes.map((s) => s.name) : step.options} />
              </div>
            </article>
          ))}
        </div>

        <Link to="/order" className="l-btn-primary mt-16">
          Design yours
        </Link>
      </div>
    </section>
  );
}
