import { Icon } from '../ui/Icon';
import './TrustBar.css';

const items = ['Raw & Virgin Hair', 'HD Lace', 'Pre-Plucked Hairlines', 'Nationwide Delivery', 'Order on WhatsApp', 'Hand-Selected Quality'];

export function TrustBar() {
  // The list is rendered twice so the marquee loops seamlessly.
  return (
    <div className="trust" aria-label="Why customers choose YSK">
      <div className="trust__track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="trust__list" aria-hidden={copy === 1}>
            {items.map((item) => (
              <li key={item}>
                <Icon name="sparkle" size={14} />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
