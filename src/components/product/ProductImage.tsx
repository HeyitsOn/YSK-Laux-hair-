import { useMemo } from 'react';
import type { Product, Texture } from '../../types';
import { photoSrc, photoSrcSet, photoView } from '../../utils/photos';
import './ProductImage.css';

const CARD_SIZES = '(max-width: 600px) 92vw, (max-width: 1100px) 46vw, 300px';

/** Wave amplitude/frequency per texture, used to draw the placeholder hair art. */
const waveShape: Record<Texture, { amp: number; freq: number }> = {
  straight: { amp: 0.6, freq: 0.01 },
  'kinky-straight': { amp: 1.6, freq: 0.12 },
  'body-wave': { amp: 9, freq: 0.035 },
  'deep-wave': { amp: 7, freq: 0.07 },
  curly: { amp: 6, freq: 0.13 },
};

function strandPath(x: number, amp: number, freq: number, phase: number): string {
  let d = `M ${x} 18`;
  for (let y = 22; y <= 252; y += 4) {
    const spread = (y / 252) * (x - 100) * 0.35;
    d += ` L ${(x + spread + Math.sin(y * freq + phase) * amp * (0.4 + y / 252)).toFixed(1)} ${y}`;
  }
  return d;
}

function HairArt({ texture }: { texture: Texture }) {
  const paths = useMemo(() => {
    const { amp, freq } = waveShape[texture];
    return Array.from({ length: 15 }, (_, i) => strandPath(48 + i * 7.4, amp, freq, i * 0.35));
  }, [texture]);

  return (
    <svg className="product-art__svg" viewBox="0 0 200 260" aria-hidden="true">
      <defs>
        <linearGradient id={`strand-${texture}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dfa2" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#c9a45c" stopOpacity="0.7" />
          <stop offset="1" stopColor="#8f6b2e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={`url(#strand-${texture})`} strokeWidth={i % 3 === 0 ? 1.4 : 0.8} fill="none" />
      ))}
    </svg>
  );
}

function CareArt() {
  return (
    <svg className="product-art__svg" viewBox="0 0 200 260" aria-hidden="true">
      <g fill="none" stroke="#d6b46c" strokeWidth="1.2">
        <rect x="76" y="92" width="48" height="128" rx="14" />
        <rect x="88" y="62" width="24" height="30" rx="3" />
        <path d="M94 62V48h12v14" />
        <path d="M88 140h24M88 150h24" strokeOpacity="0.5" />
      </g>
      <text x="100" y="186" textAnchor="middle" fill="#e9d29b" fontFamily="Cormorant Garamond, serif" fontSize="14" letterSpacing="3">
        YSK
      </text>
    </svg>
  );
}

export function ProductImage({ product }: { product: Product }) {
  const images = product.images ?? [];

  if (images.length > 0) {
    const [main, alt] = images;
    return (
      <div className={`product-art product-art--photo ${alt ? 'has-alt' : ''}`}>
        <img
          className="product-art__img"
          src={photoSrc(main)}
          srcSet={photoSrcSet(main)}
          sizes={CARD_SIZES}
          alt={`${product.name}, ${photoView(main)}`}
          width={960}
          height={1200}
          loading="lazy"
          decoding="async"
        />
        {alt && (
          <img
            className="product-art__img product-art__img--alt"
            src={photoSrc(alt)}
            srcSet={photoSrcSet(alt)}
            sizes={CARD_SIZES}
            alt=""
            aria-hidden="true"
            width={960}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`product-art product-art--${product.category}`} role="img" aria-label={`${product.name}, photo coming soon`}>
      {product.texture ? <HairArt texture={product.texture} /> : <CareArt />}
    </div>
  );
}
