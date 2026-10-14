import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import { useProductFilters } from '../../hooks/useProductFilters';
import { FilterBar } from '../product/FilterBar';
import { ProductCard } from '../product/ProductCard';
import { Button } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';
import './Collection.css';

export function Collection() {
  const { addItem } = useCart();
  const { filters, filtered, update, reset, isFiltered } = useProductFilters(products);

  return (
    <section id="collection" className="section" aria-labelledby="collection-title">
      <div className="container">
        <SectionHeading
          id="collection-title"
          eyebrow="The Collection"
          title={
            <>
              Signature <em>pieces</em>
            </>
          }
          subtitle="Choose your texture and length, add to your bag, and send your order straight to us on WhatsApp."
        />

        <FilterBar
          filters={filters}
          onChange={update}
          onReset={reset}
          isFiltered={isFiltered}
          resultCount={filtered.length}
        />

        {filtered.length > 0 ? (
          <ul className="collection__grid" data-testid="product-grid">
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} onAdd={addItem} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="collection__empty">
            <p className="collection__empty-title">No pieces match your selection</p>
            <p>Try a different texture or category — or ask us on WhatsApp for something special.</p>
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
