import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KonstaProvider, Link as KLink, List, ListItem, Navbar, Sheet, Tabbar, TabbarLink, Toolbar } from 'konsta/react';
import { LogoMark } from '../../components/Logo';
import { ScrollTrigger, useGSAP } from '../lib/gsap';
import { useSmoothScroll } from '../lib/SmoothScroll';
import { detectNativeTheme } from '../lib/platform';
import { contact } from '../config/content';
import { navItems } from './navItems';

const Icon = {
  home: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" />
    </svg>
  ),
  cake: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21h16M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7M5 16c2 1.5 3.5-1.5 5 0s3.5-1.5 5 0 3 1.5 4 0M12 12V8M12 4.5c.8.8.8 2 0 2.5-.8-.5-.8-1.7 0-2.5z" />
    </svg>
  ),
  order: (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink text-white shadow-md shadow-pink/30">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  ),
  menu: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  ),
};

/**
 * Native-feeling chrome for phones and tablets (< 1024px), built with Konsta UI:
 * iOS styling on Apple devices, Material styling on Android.
 * Only the chrome uses Konsta; the editorial content stays custom.
 */
export function MobileChrome() {
  const theme = useMemo(detectNativeTheme, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<'home' | 'creations'>('home');
  const navigate = useNavigate();
  const { scrollTo } = useSmoothScroll();
  const topBar = useRef<HTMLDivElement>(null);
  const bottomBar = useRef<HTMLDivElement>(null);

  // iOS and Material bars differ in height (and change with safe areas), so measure
  // them and expose the real values; the hero uses them to keep its CTA clear of the tab bar.
  useEffect(() => {
    const root = document.documentElement;
    const ro = new ResizeObserver(() => {
      const nav = topBar.current?.offsetHeight ?? 0;
      const tab = bottomBar.current?.offsetHeight ?? 0;
      if (nav) root.style.setProperty('--l-nav-h', `${nav}px`);
      if (tab) root.style.setProperty('--l-tab-h', `${tab}px`);
    });
    if (topBar.current) ro.observe(topBar.current);
    if (bottomBar.current) ro.observe(bottomBar.current);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--l-nav-h');
      root.style.removeProperty('--l-tab-h');
    };
  }, []);

  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: '#creations',
      start: 'top 60%',
      end: 'max',
      onToggle: (self) => setActive(self.isActive ? 'creations' : 'home'),
    });
    return () => st.kill();
  });

  const go = (target: string) => {
    setMenuOpen(false);
    // let the sheet start closing before the page glides
    window.setTimeout(() => scrollTo(target, { offset: -64 }), 120);
  };

  return (
    <KonstaProvider theme={theme}>
      <div className={`landing-mobile-chrome lg:hidden ${theme === 'ios' ? 'k-ios' : 'k-material'}`}>
        <div ref={topBar} className="fixed inset-x-0 top-0 z-50">
          <Navbar
            translucent
            colors={{ bgIos: 'bg-cream', bgMaterial: 'bg-cream', textIos: 'text-charcoal', textMaterial: 'text-charcoal' }}
            left={
              <button type="button" onClick={() => scrollTo(0)} className="flex items-center pl-1" aria-label="Back to top">
                <LogoMark className="h-8 w-8" />
              </button>
            }
            title={<span className="font-script text-[1.6rem] leading-none text-charcoal">Malika's</span>}
            right={
              <KLink navbar onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
                {Icon.menu}
              </KLink>
            }
          />
        </div>

        <div ref={bottomBar} className="fixed inset-x-0 bottom-0 z-50">
          <Tabbar labels icons className="pb-[env(safe-area-inset-bottom)]">
            <TabbarLink active={active === 'home'} onClick={() => scrollTo(0)} icon={Icon.home} label="Home" />
            <TabbarLink active={active === 'creations'} onClick={() => scrollTo('#creations', { offset: -64 })} icon={Icon.cake} label="Creations" />
            <TabbarLink onClick={() => navigate('/order')} icon={Icon.order} label="Order" />
          </Tabbar>
        </div>

        {/* sheet must sit above the fixed tab bar (z-50) */}
        <Sheet opened={menuOpen} onBackdropClick={() => setMenuOpen(false)} className="!z-[60] pb-[env(safe-area-inset-bottom)]" aria-label="Menu">
          <Toolbar top>
            <div className="left pl-2 font-script text-2xl text-charcoal">Malika's</div>
            <div className="right">
              <KLink toolbar onClick={() => setMenuOpen(false)}>
                Done
              </KLink>
            </div>
          </Toolbar>
          <List strong inset className="!my-4">
            {navItems.map((item) => (
              <ListItem
                key={item.label}
                link
                title={item.label}
                onClick={() => (item.kind === 'section' ? go(item.target) : navigate(item.to))}
              />
            ))}
            <ListItem link title={`Instagram @${contact.instagramHandle}`} href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" />
          </List>
          <div className="px-4 pb-6">
            <button type="button" onClick={() => navigate('/order')} className="l-btn-primary w-full">
              Design your cake
            </button>
          </div>
        </Sheet>
      </div>
    </KonstaProvider>
  );
}
