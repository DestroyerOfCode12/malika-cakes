import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import { contact } from '../config/content';

export function Footer() {
  return (
    <footer className="landing-footer border-t border-white/10 bg-charcoal text-white/80">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-2 md:px-10 lg:grid-cols-12 lg:px-14 lg:py-20">
        <div className="lg:col-span-5">
          <Logo onDark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Custom celebration cakes, baked to order and hand-finished in Midrand.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blush">Visit</h2>
          <p className="mt-4 text-sm leading-relaxed">
            {contact.location}
            <br />
            Pickup 08:00–17:00
            <br />
            <span className="text-white/50">Exact address sent with your order</span>
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blush">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a className="l-footer-link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </li>
            <li>
              <a className="l-footer-link" href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">
                @{contact.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        <nav className="lg:col-span-3" aria-label="Footer">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-blush">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="l-footer-link" to="/order">
                Order a cake
              </Link>
            </li>
            <li>
              <Link className="l-footer-link" to="/order-status">
                Track an order
              </Link>
            </li>
            <li>
              <Link className="l-footer-link" to="/faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link className="l-footer-link text-white/50" to="/admin/login">
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-5 py-6 text-xs text-white/45 md:px-10 lg:px-14">
          © {new Date().getFullYear()} Malika's Cake Boutique. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
