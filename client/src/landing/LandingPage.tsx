import { useEffect } from 'react';
import './landing.css';
import { ScrollTrigger } from './lib/gsap';
import { SmoothScroll } from './lib/SmoothScroll';
import { DesktopHeader } from './nav/DesktopHeader';
import { MobileChrome } from './nav/MobileChrome';
import { Hero } from './sections/Hero';
import { Creations } from './sections/Creations';
import { BuildYourCake } from './sections/BuildYourCake';
import { HowItWorks } from './sections/HowItWorks';
import { Proof } from './sections/Proof';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './sections/Footer';

export default function LandingPage() {
  useEffect(() => {
    // Children create their ScrollTriggers first; once everything (and the web
    // fonts that change text heights) is in place, order them by page position
    // and recalculate so triggers after the pinned sections start correctly.
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      // Leaving the landing page (e.g. to /order): start the next page at the top.
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <SmoothScroll>
      <a href="#main" className="l-skip-link">
        Skip to content
      </a>
      <DesktopHeader />
      <MobileChrome />
      <main id="main" className="landing">
        <Hero />
        <Creations />
        <BuildYourCake />
        <HowItWorks />
        <Proof />
        <FinalCta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
