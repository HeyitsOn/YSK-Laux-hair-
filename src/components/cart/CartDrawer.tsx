import { useEffect, useRef, useState } from 'react';
import { business } from '../../config/business';
import { useCart } from '../../context/CartContext';
import { MAX_QUANTITY } from '../../context/cartReducer';
import { formatPrice } from '../../utils/format';
import { buildOrderMessage, buildWhatsAppUrl } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import './CartDrawer.css';

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, removeItem, setQuantity, clearCart } = useCart();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Keep the closed drawer out of the tab order and accessibility tree.
    if (panelRef.current) panelRef.current.inert = !isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('is-locked');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, closeCart]);

  const orderUrl = buildWhatsAppUrl(buildOrderMessage(items, { name, notes }));

  return (
    <div className={`cart ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="cart__overlay" onClick={closeCart} />
      <aside
        ref={panelRef}
        className="cart__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="cart__header">
          <h2 id="cart-title">
            Your Bag <span className="cart__header-count">({itemCount})</span>
          </h2>
          <button ref={closeRef} type="button" className="cart__close" onClick={closeCart} aria-label="Close bag">
            <Icon name="close" size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart__empty">
            <Icon name="bag" size={44} />
            <p className="cart__empty-title">Your bag is empty</p>
            <p>Discover our collection of luxury wigs, bundles and more.</p>
            <ButtonLink href="#collection" variant="outline" onClick={closeCart}>
              Shop the collection
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="cart__items">
              {items.map((item) => (
                <li key={item.key} className="cart__item" aria-label={`${item.name} ${item.variantLabel}`}>
                  <div className="cart__item-info">
                    <p className="cart__item-name">{item.name}</p>
                    <p className="cart__item-variant">
                      {item.variantLabel} · {formatPrice(item.unitPrice)} each
                    </p>
                    <div className="cart__qty">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Icon name="minus" size={14} />
                      </button>
                      <span aria-label="Quantity">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.key, item.quantity + 1)}
                        disabled={item.quantity >= MAX_QUANTITY}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart__item-side">
                    <p className="cart__item-total">{formatPrice(item.unitPrice * item.quantity)}</p>
                    <button
                      type="button"
                      className="cart__remove"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Remove ${item.name} from bag`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart__footer">
              <div className="cart__fields">
                <label>
                  <span>Your name (optional)</span>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <label>
                  <span>Notes (optional)</span>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Delivery area, colour, wig install, etc."
                  />
                </label>
              </div>

              <div className="cart__subtotal">
                <span>Estimated subtotal</span>
                <strong data-testid="cart-subtotal">{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart__note">
                No payment is taken on this site. Your order is sent to {business.name} on WhatsApp, where we confirm
                stock, delivery fees and payment details with you.
              </p>

              <ButtonLink href={orderUrl} external block size="lg" data-testid="whatsapp-order">
                <Icon name="whatsapp" size={20} />
                Order on WhatsApp
              </ButtonLink>
              <Button variant="ghost" size="sm" block onClick={clearCart}>
                Clear bag
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
