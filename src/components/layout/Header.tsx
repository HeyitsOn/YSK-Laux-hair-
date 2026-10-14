import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Icon } from '../ui/Icon';
import { Logo } from './Logo';
import './Header.css';

export const NAV_LINKS = [
  { href: '#collection', label: 'Collection' },
  { href: '#about', label: 'Our Story' },
  { href: '#how-to-order', label: 'How to Order' },
  { href: '#care', label: 'Hair Care' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  const { itemCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('is-locked', menuOpen);
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`header ${scrolled || menuOpen ? 'header--solid' : ''}`} id="top">
      <div className="container header__inner">
        <Logo onClick={close} />

        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__cart"
            onClick={() => {
              close();
              openCart();
            }}
            aria-label={`Open shopping bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <Icon name="bag" size={22} />
            {itemCount > 0 && (
              <span className="header__count" data-testid="cart-count" key={itemCount}>
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="header__toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
