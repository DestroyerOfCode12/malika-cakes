import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { howItWorks } from '../config/content';
import { duration, ease, media } from '../config/motion';

const badges = ['Secure checkout with PayFast', 'Delivery with Uber available', 'Order 14 days ahead'];

export function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const s = root.current!;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.belowDesktop}`, () => {
        gsap.from(s.querySelectorAll('.how-head > *'), {
          y: 24,
          opacity: 0,
          duration: duration.base,
          ease: ease.out,
          stagger: 0.1,
          scrollTrigger: { trigger: s, start: 'top 75%' },
        });
        // the timeline rule draws across with the scroll
        gsap.fromTo(
          s.querySelector('.how-rule'),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: ease.scrub,
            scrollTrigger: { trigger: s.querySelector('.how-steps'), start: 'top 80%', end: 'center 55%', scrub: true },
          }
        );
        // each step wipes in from the left: a different entrance from the rest of the page
        gsap.fromTo(
          s.querySelectorAll('.how-step'),
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: duration.reveal,
            ease: ease.reveal,
            stagger: 0.18,
            scrollTrigger: { trigger: s.querySelector('.how-steps'), start: 'top 78%' },
          }
        );
        gsap.from(s.querySelectorAll('.how-badge'), {
          y: 12,
          opacity: 0,
          duration: duration.fast,
          ease: ease.out,
          stagger: 0.08,
          scrollTrigger: { trigger: s.querySelector('.how-badges'), start: 'top 90%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="how" aria-labelledby="how-title" className="relative bg-pink-light py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-14">
        <div className="how-head grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-script text-2xl text-pink">How it works</p>
            <h2 id="how-title" className="mt-2 font-display text-[clamp(2.4rem,6.5vw,4.5rem)] font-medium leading-[1] tracking-[-0.02em]">
              From your idea
              <br className="hidden md:block" /> to your <em className="italic text-pink">table</em>
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-charcoal/70 lg:col-span-5 lg:justify-self-end">
            No more back-and-forth on WhatsApp. Design it, pay for it and track it in one place.
          </p>
        </div>

        <div className="how-steps relative mt-16 lg:mt-24">
          <span className="how-rule absolute left-0 right-0 top-0 hidden h-px origin-left bg-pink/40 md:block" aria-hidden="true" />
          <ol className="grid gap-12 md:grid-cols-3 md:gap-10 md:pt-12">
            {howItWorks.map((step) => (
              <li key={step.n} className="how-step">
                <span className="block font-display text-[clamp(4rem,9vw,7rem)] font-medium leading-none text-pink" aria-hidden="true">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-3xl font-medium">{step.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-relaxed text-charcoal/75 md:text-lg">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <ul className="how-badges mt-16 flex flex-wrap gap-3">
          {badges.map((b) => (
            <li key={b} className="how-badge inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-charcoal shadow-sm">
              <svg viewBox="0 0 16 16" className="h-4 w-4 text-pink" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
