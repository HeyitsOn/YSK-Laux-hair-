import { useMemo, useState } from 'react';
import type { Category, Product, SortOption, Texture } from '../types';
import { lowestPrice } from '../utils/format';

export type CategoryFilter = Category | 'all';
export type TextureFilter = Texture | 'all';

export interface ProductFilters {
  category: CategoryFilter;
  texture: TextureFilter;
  sort: SortOption;
  search: string;
  inStockOnly: boolean;
}

export const defaultFilters: ProductFilters = {
  category: 'all',
  texture: 'all',
  sort: 'featured',
  search: '',
  inStockOnly: false,
};

const fromPrice = (p: Product) => lowestPrice(p.variants.map((v) => v.price));

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.search.trim().toLowerCase();

  const result = products.filter((p) => {
    if (filters.category !== 'all' && p.category !== filters.category) return false;
    if (filters.texture !== 'all' && p.texture !== filters.texture) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (query && !`${p.name} ${p.description}`.toLowerCase().includes(query)) return false;
    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      return result.sort((a, b) => fromPrice(a) - fromPrice(b));
    case 'price-desc':
      return result.sort((a, b) => fromPrice(b) - fromPrice(a));
    case 'name':
      return result.sort((a, b) => a.name.localeCompare(b.name));
    default:
      // Featured first, otherwise keep catalogue order (Array.prototype.sort is stable).
      return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  const update = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(defaultFilters);

  const isFiltered =
    filters.category !== 'all' || filters.texture !== 'all' || filters.search.trim() !== '' || filters.inStockOnly;

  return { filters, filtered, update, reset, isFiltered };
}
