import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../lib/gsap';
import { finalCtaAssets } from '../config/assets';
import { contact, whatsappUrl } from '../config/content';
import { duration, ease, media, stagger } from '../config/motion';
import { LandingAsset } from '../components/LandingAsset';
import { MaskedLines } from '../components/MaskedLines';

export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const s = root.current!;
      const mm = gsap.matchMedia();
      mm.add(`${media.desktop}, ${media.belowDesktop}`, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: s, start: 'top 70%' } });
        tl.from(s.querySelectorAll('[data-line]'), { yPercent: 110, duration: duration.text, ease: ease.text, stagger: stagger.lines })
          .from(s.querySelectorAll('[data-fade]'), { y: 20, opacity: 0, duration: duration.base, ease: ease.out, stagger: 0.1 }, 0.35)
          .from(s.querySelectorAll('.l-asset__img'), { scale: 0.8, opacity: 0, duration: 1.2, ease: ease.out, stagger: stagger.assets }, 0.1);

        s.querySelectorAll<HTMLElement>('.l-asset').forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.parallax) || 0,
            ease: ease.scrub,
            scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="order-cta" aria-labelledby="cta-title" className="relative overflow-hidden bg-charcoal py-28 text-white md:py-36 lg:py-48">
      {finalCtaAssets.map((a) => (
        <LandingAsset key={a.id} asset={a} />
      ))}

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 text-center md:px-10">
        <p className="font-script text-2xl text-blush" data-fade>
          Your celebration starts here
        </p>
        <h2
          id="cta-title"
          className="mx-auto mt-4 max-w-[14ch] font-display text-[clamp(2.75rem,8vw,6.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-white"
        >
          <MaskedLines
            lines={[
              "Let's bake something",
              <em key="u" className="italic text-blush">
                unforgettable.
              </em>,
            ]}
          />
        </h2>
        <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-white/75" data-fade>
          Order at least 14 days ahead. We'll confirm everything and send a reminder before payment is due.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4" data-fade>
          <Link to="/order" className="l-btn-primary">
            Design your cake
          </Link>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="l-btn-ghost">
              Chat on WhatsApp
            </a>
          ) : (
            <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="l-btn-ghost">
              Message us on Instagram
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
