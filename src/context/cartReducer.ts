import type { CartItem, Product, ProductVariant } from '../types';

export type CartAction =
  | { type: 'add'; product: Product; variant: ProductVariant; quantity?: number }
  | { type: 'remove'; key: string }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'clear' };

export const MAX_QUANTITY = 10;

export function cartKey(productId: string, variantLabel: string): string {
  return `${productId}::${variantLabel}`;
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const { product, variant, quantity = 1 } = action;
      const key = cartKey(product.id, variant.label);
      const existing = state.find((item) => item.key === key);
      if (existing) {
        return state.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) } : item,
        );
      }
      return [
        ...state,
        {
          key,
          productId: product.id,
          name: product.name,
          variantLabel: variant.label,
          unitPrice: variant.price,
          quantity: Math.min(quantity, MAX_QUANTITY),
        },
      ];
    }
    case 'remove':
      return state.filter((item) => item.key !== action.key);
    case 'setQuantity': {
      if (action.quantity <= 0) return state.filter((item) => item.key !== action.key);
      const quantity = Math.min(action.quantity, MAX_QUANTITY);
      return state.map((item) => (item.key === action.key ? { ...item, quantity } : item));
    }
    case 'clear':
      return [];
    default:
      return state;
  }
}
