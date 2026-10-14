import { useCallback, useEffect, useState } from 'react';
import { categoryLabels, textureLabels } from '../../data/products';
import type { Product, ProductVariant } from '../../types';
import { formatPrice } from '../../utils/format';
import { buildEnquiryUrl } from '../../utils/whatsapp';
import { Button, ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Lightbox } from './Lightbox';
import { ProductImage } from './ProductImage';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, variant: ProductVariant) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0]);
  const [justAdded, setJustAdded] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const closeGallery = useCallback(() => setGalleryOpen(false), []);
  const photoCount = product.images?.length ?? 0;
  const hasOptions = product.variants.length > 1;

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 1600);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const handleAdd = () => {
    onAdd(product, variant);
    setJustAdded(true);
  };

  const meta = [categoryLabels[product.category], product.texture && textureLabels[product.texture]]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className={`product-card ${product.inStock ? '' : 'product-card--sold-out'}`} aria-label={product.name}>
      <div className="product-card__media">
        <ProductImage product={product} />
        {photoCount > 0 && (
          <button
            type="button"
            className="product-card__gallery"
            onClick={() => setGalleryOpen(true)}
            aria-label={`View ${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} of ${product.name}`}
          >
            <span className="product-card__gallery-chip">
              <Icon name="expand" size={14} />
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
            </span>
          </button>
        )}
        {product.badge && product.inStock && <span className="product-card__badge">{product.badge}</span>}
        {!product.inStock && <span className="product-card__badge product-card__badge--muted">Sold out</span>}
      </div>

      <div className="product-card__body">
        <p className="product-card__meta">{meta}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>

        {hasOptions ? (
          <fieldset className="product-card__options">
            <legend className="visually-hidden">Choose length for {product.name}</legend>
            {product.variants.map((v) => (
              <label key={v.label} className={`chip ${v.label === variant.label ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name={`variant-${product.id}`}
                  value={v.label}
                  checked={v.label === variant.label}
                  onChange={() => setVariant(v)}
                  disabled={!product.inStock}
                />
                {v.label}
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="product-card__single">{variant.label}</p>
        )}

        <div className="product-card__footer">
          <p className="product-card__price" aria-live="polite">
            {formatPrice(variant.price)}
          </p>
          {product.inStock ? (
            <Button size="sm" onClick={handleAdd} aria-label={`Add ${product.name} ${variant.label} to bag`}>
              <Icon name={justAdded ? 'check' : 'bag'} size={16} />
              {justAdded ? 'Added' : 'Add'}
            </Button>
          ) : (
            <ButtonLink size="sm" variant="outline" href={buildEnquiryUrl(product.name)} external>
              Enquire
            </ButtonLink>
          )}
        </div>
      </div>
      {galleryOpen && product.images && (
        <Lightbox title={product.name} images={product.images} onClose={closeGallery} />
      )}
    </article>
  );
}
