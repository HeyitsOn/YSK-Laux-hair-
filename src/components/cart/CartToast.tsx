import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Icon } from '../ui/Icon';
import './CartToast.css';

export function CartToast() {
  const { lastAdded, openCart, dismissToast, isOpen } = useCart();

  useEffect(() => {
    if (!lastAdded) return;
    const t = window.setTimeout(dismissToast, 3500);
    return () => window.clearTimeout(t);
  }, [lastAdded, dismissToast]);

  const show = Boolean(lastAdded) && !isOpen;

  return (
    <div className={`toast ${show ? 'is-visible' : ''}`} role="status" aria-live="polite">
      {lastAdded && (
        <>
          <span className="toast__icon">
            <Icon name="check" size={16} />
          </span>
          <p className="toast__text">
            <span>Added to bag</span>
            {lastAdded.name}
          </p>
          <button type="button" className="toast__action" onClick={openCart} tabIndex={show ? 0 : -1}>
            View bag
          </button>
        </>
      )}
    </div>
  );
}
