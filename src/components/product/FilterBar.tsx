import { categoryLabels, textureLabels } from '../../data/products';
import type { CategoryFilter, ProductFilters, TextureFilter } from '../../hooks/useProductFilters';
import type { Category, SortOption, Texture } from '../../types';
import { Icon } from '../ui/Icon';
import './FilterBar.css';

interface FilterBarProps {
  filters: ProductFilters;
  onChange: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  onReset: () => void;
  isFiltered: boolean;
  resultCount: number;
}

const categories: CategoryFilter[] = ['all', ...(Object.keys(categoryLabels) as Category[])];
const textures = Object.keys(textureLabels) as Texture[];

const sortLabels: Record<SortOption, string> = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  name: 'Name: A – Z',
};

export function FilterBar({ filters, onChange, onReset, isFiltered, resultCount }: FilterBarProps) {
  return (
    <div className="filters">
      <div className="filters__tabs" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`filters__tab ${filters.category === c ? 'is-active' : ''}`}
            aria-pressed={filters.category === c}
            onClick={() => onChange('category', c)}
          >
            {c === 'all' ? 'All' : categoryLabels[c]}
          </button>
        ))}
      </div>

      <div className="filters__row">
        <label className="filters__search">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search products</span>
          <input
            type="search"
            placeholder="Search wigs, bundles, textures…"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </label>

        <label className="filters__select">
          <span className="visually-hidden">Filter by texture</span>
          <select value={filters.texture} onChange={(e) => onChange('texture', e.target.value as TextureFilter)}>
            <option value="all">All textures</option>
            {textures.map((t) => (
              <option key={t} value={t}>
                {textureLabels[t]}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </label>

        <label className="filters__select">
          <span className="visually-hidden">Sort products</span>
          <select value={filters.sort} onChange={(e) => onChange('sort', e.target.value as SortOption)}>
            {(Object.keys(sortLabels) as SortOption[]).map((s) => (
              <option key={s} value={s}>
                {sortLabels[s]}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </label>

        <label className="filters__toggle">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange('inStockOnly', e.target.checked)}
          />
          <span className="filters__switch" aria-hidden="true" />
          In stock only
        </label>
      </div>

      <div className="filters__status">
        <p aria-live="polite">
          Showing <strong>{resultCount}</strong> {resultCount === 1 ? 'piece' : 'pieces'}
        </p>
        {isFiltered && (
          <button type="button" className="filters__reset" onClick={onReset}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
