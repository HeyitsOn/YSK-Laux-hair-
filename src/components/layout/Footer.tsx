import { business } from '../../config/business';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { Icon } from '../ui/Icon';
import { NAV_LINKS } from './Header';
import { Logo } from './Logo';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>{business.tagline}</p>
          <div className="footer__social">
            <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Icon name="instagram" />
            </a>
            <a href={business.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <Icon name="tiktok" />
            </a>
            <a
              href={buildWhatsAppUrl(`Hi ${business.name}!`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <Icon name="whatsapp" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer">
          <h3 className="footer__title">Explore</h3>
          <ul className="footer__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="footer__title">Visit &amp; Hours</h3>
          <ul className="footer__links">
            <li>{business.location}</li>
            {business.hours.map((h) => (
              <li key={h.days}>
                {h.days}: {h.time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>
          © {year} {business.name}. All rights reserved.
        </p>
        <p>Orders are confirmed and paid directly with us on WhatsApp — no payments are taken on this website.</p>
      </div>
    </footer>
  );
}
