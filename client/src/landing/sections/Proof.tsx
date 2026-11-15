import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { proofPoints, testimonials } from '../config/content';
import { duration, ease, media } from '../config/motion';

function SampleBadge({ show }: { show: boolean }) {
  // Dev-only reminder that a review is placeholder copy. Never renders in production.
  if (!show || !import.meta.env.DEV) return null;
  return (
    <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wider text-yellow-800">
      sample, replace before launch
    </span>
  );
}

const icons = [
  // whisk
  <path key="w" d="M12 3c2.5 2 3 6 0 10-3-4-2.5-8 0-10zm0 10v8" />,
  // heart
  <path key="h" d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />,
  // pin
  <path key="p" d="M12 21s6-5.6 6-11a6 6 0 10-12 0c0 5.4 6 11 6 11zm0-8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />,
];

export function Proof() {
  const root = useRef<HTMLElement>(null);
  const [featured, ...rest] = testimonials;

  useGSAP(
    () => {
      const s = root.current!;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.belowDesktop}`, () => {
        gsap.from(s.querySelector('.proof-featured'), {
          scale: 0.96,
          opacity: 0,
          duration: 1.2,
          ease: ease.out,
          scrollTrigger: { trigger: s.querySelector('.proof-featured'), start: 'top 80%' },
        });
        gsap.from(s.querySelectorAll('.proof-quote'), {
          x: 40,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: 0.15,
          scrollTrigger: { trigger: s.querySelector('.proof-quotes'), start: 'top 82%' },
        });
        gsap.from(s.querySelectorAll('.proof-point'), {
          y: 28,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: 0.12,
          scrollTrigger: { trigger: s.querySelector('.proof-points'), start: 'top 85%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="love" aria-labelledby="proof-title" className="relative bg-cream py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
        <h2 id="proof-title" className="font-script text-2xl text-pink">
          Kind words
        </h2>

        <div className="mt-8 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <figure className="proof-featured lg:col-span-7">
            <blockquote className="font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-medium italic leading-[1.15] tracking-[-0.01em] text-charcoal">
              <span className="text-pink" aria-hidden="true">“</span>
              {featured.quote}
              <span className="text-pink" aria-hidden="true">”</span>
            </blockquote>
            <figcaption className="mt-6 text-sm text-charcoal/60">
              <span className="font-semibold text-charcoal">{featured.name}</span> · {featured.occasion}
              <SampleBadge show={featured.placeholder} />
            </figcaption>
          </figure>

          <div className="proof-quotes space-y-10 lg:col-span-5 lg:mt-24">
            {rest.map((t, i) => (
              <figure key={i} className={`proof-quote border-l-2 border-blush pl-6 ${i === 1 ? 'lg:ml-12' : ''}`}>
                <blockquote className="font-display text-xl italic leading-snug text-charcoal md:text-2xl">“{t.quote}”</blockquote>
                <figcaption className="mt-3 text-sm text-charcoal/60">
                  <span className="font-semibold text-charcoal">{t.name}</span> · {t.occasion}
                  <SampleBadge show={t.placeholder} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <ul className="proof-points mt-20 grid gap-10 border-t border-charcoal/10 pt-12 md:grid-cols-3 lg:mt-28">
          {proofPoints.map((p, i) => (
            <li key={p.title} className="proof-point">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-pink" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {icons[i]}
              </svg>
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-charcoal/70">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
