import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import { ScrollTrigger, useGSAP } from '../lib/gsap';
import { useSmoothScroll } from '../lib/SmoothScroll';
import { HEADER_OFFSET, navItems } from './navItems';

/** Editorial header for ≥1024px. Transparent over the hero, frosted cream once you scroll. */
export function DesktopHeader() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();

  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 40,
      end: 'max',
      onToggle: (self) => ref.current?.classList.toggle('is-scrolled', self.isActive),
    });
    return () => st.kill();
  });

  return (
    <header ref={ref} className="landing-header fixed inset-x-0 top-0 z-50 hidden lg:block">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-14">
        <Link to="/" className="group-logo" aria-label="Malika's Cake Boutique, home">
          <Logo />
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-8 text-[15px] font-medium text-charcoal">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.kind === 'section' ? (
                  <a
                    href={item.target}
                    className="l-link"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(item.target, { offset: HEADER_OFFSET });
                    }}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link to={item.to} className="l-link">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link to="/order" className="l-btn-primary l-btn-sm">
                Order now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
