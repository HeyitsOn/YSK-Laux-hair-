import { business } from '../../config/business';
import './Logo.css';

/** Text wordmark. Swap for an <img> once the real logo file is available (see PLACEHOLDERS.md). */
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a href="#top" className="logo" aria-label={`${business.name} — back to top`} onClick={onClick}>
      <span className="logo__mark gold-text">{business.shortName}</span>
      <span className="logo__sub">Luxe Hair</span>
    </a>
  );
}
