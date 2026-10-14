export type Category = 'wigs' | 'bundles' | 'closures' | 'frontals' | 'care';

export type Texture = 'straight' | 'body-wave' | 'deep-wave' | 'curly' | 'kinky-straight';

export interface ProductVariant {
  /** Shown to the customer, e.g. `16"` or `250ml`. Must be unique within a product. */
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** Care products have no texture. */
  texture: Texture | null;
  description: string;
  variants: ProductVariant[];
  inStock: boolean;
  badge?: string;
  featured?: boolean;
  /**
   * Real product photos, first one is the main image. Each entry is a base path such as
   * `/products/chestnut-bob-side`; the site loads `<base>-480.webp` and `<base>-960.webp`.
   * When omitted, a styled line-art placeholder is shown instead.
   */
  images?: string[];
}

export interface CartItem {
  /** `${productId}::${variantLabel}` — one line per product + variant. */
  key: string;
  productId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';
