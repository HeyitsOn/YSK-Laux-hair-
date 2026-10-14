import { business } from '../../config/business';
import { products } from '../../data/products';
import { formatPrice, lowestPrice } from '../../utils/format';
import { buildWhatsAppUrl } from '../../utils/whatsapp';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import './Hero.css';

const spotlight = products.find((p) => p.id === 'chestnut-highlight-bob') ?? products[0];

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">Raw · Virgin · HD Lace</p>
          <h1 id="hero-title" className="hero__title">
            Luxury hair,
            <br />
            crafted for your <em className="gold-text">crown.</em>
          </h1>
          <p className="hero__lead">
            Premium wigs, bundles, closures and frontals — hand-selected for softness, longevity and a flawless, natural
            finish. Browse, build your bag and order in one tap on WhatsApp.
          </p>
          <div className="hero__ctas">
            <ButtonLink href="#collection" size="lg">
              Shop the collection
              <Icon name="arrow" size={18} />
            </ButtonLink>
            <ButtonLink
              href={buildWhatsAppUrl(`Hi ${business.name}! I'd love some help choosing the right hair.`)}
              variant="outline"
              size="lg"
              external
            >
              <Icon name="whatsapp" size={18} />
              Get styling advice
            </ButtonLink>
          </div>
          <ul className="hero__points">
            <li>
              <Icon name="sparkle" size={16} /> 100% human hair
            </li>
            <li>
              <Icon name="truck" size={16} /> Nationwide delivery
            </li>
            <li>
              <Icon name="whatsapp" size={16} /> Personal service
            </li>
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__arch">
            <img
              className="hero__photo"
              src="/products/hero-bob-900.webp"
              srcSet="/products/hero-bob-600.webp 600w, /products/hero-bob-900.webp 900w"
              sizes="(max-width: 960px) 78vw, 420px"
              alt=""
              width={900}
              height={1350}
              // Lowercase attribute: React 18 does not know the camelCase prop yet.
              {...{ fetchpriority: 'high' }}
            />
          </div>

          <svg className="hero__badge-ring" viewBox="0 0 120 120">
            <defs>
              <path id="ring-path" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
            </defs>
            <text>
              <textPath href="#ring-path" textLength={286} lengthAdjust="spacing">
                YSK LUXE HAIR • CROWN YOURSELF •
              </textPath>
            </text>
          </svg>

          <div className="hero__card">
            <span className="hero__card-label">{spotlight.badge ?? 'Featured'}</span>
            <p className="hero__card-name">{spotlight.name}</p>
            <p className="hero__card-price">
              from {formatPrice(lowestPrice(spotlight.variants.map((v) => v.price)))}
            </p>
          </div>
        </div>
      </div>

      <a href="#collection" className="hero__scroll" aria-label="Scroll to collection">
        <span />
      </a>
    </section>
  );
}
