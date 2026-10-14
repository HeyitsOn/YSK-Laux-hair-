import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cartKey, cartReducer, MAX_QUANTITY } from '../context/cartReducer';
import { products } from '../data/products';
import { defaultFilters, filterProducts } from '../hooks/useProductFilters';
import type { CartItem } from '../types';
import { formatPrice } from '../utils/format';
import { buildOrderMessage, buildWhatsAppUrl, cartSubtotal } from '../utils/whatsapp';

const wig = products.find((p) => p.id === 'bone-straight-frontal-wig')!;
const serum = products.find((p) => p.id === 'silk-shine-serum')!;

describe('catalogue data', () => {
  it('has unique product ids and unique variant labels per product', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of products) {
      const labels = p.variants.map((v) => v.label);
      expect(new Set(labels).size).toBe(labels.length);
      expect(p.variants.length).toBeGreaterThan(0);
    }
  });
});

describe('product photos', () => {
  it('every referenced photo exists in both sizes', () => {
    const bases = products.flatMap((p) => p.images ?? []);
    expect(bases.length).toBeGreaterThan(0);
    for (const base of bases) {
      for (const w of [480, 960]) {
        expect(existsSync(resolve(__dirname, '../../public', `.${base}-${w}.webp`)), `${base}-${w}.webp`).toBe(true);
      }
    }
    for (const w of [600, 900]) {
      expect(existsSync(resolve(__dirname, `../../public/products/hero-bob-${w}.webp`))).toBe(true);
    }
  });
});

describe('cartReducer', () => {
  it('adds a new line and merges repeat adds of the same variant', () => {
    let state = cartReducer([], { type: 'add', product: wig, variant: wig.variants[0] });
    state = cartReducer(state, { type: 'add', product: wig, variant: wig.variants[0] });
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({ key: cartKey(wig.id, '16"'), quantity: 2, unitPrice: 2950 });
  });

  it('keeps different lengths of the same product as separate lines', () => {
    let state = cartReducer([], { type: 'add', product: wig, variant: wig.variants[0] });
    state = cartReducer(state, { type: 'add', product: wig, variant: wig.variants[2] });
    expect(state.map((i) => i.variantLabel)).toEqual(['16"', '24"']);
  });

  it('caps quantity and removes a line when quantity drops to 0', () => {
    let state = cartReducer([], { type: 'add', product: serum, variant: serum.variants[0] });
    const key = state[0].key;
    state = cartReducer(state, { type: 'setQuantity', key, quantity: 99 });
    expect(state[0].quantity).toBe(MAX_QUANTITY);
    state = cartReducer(state, { type: 'setQuantity', key, quantity: 0 });
    expect(state).toEqual([]);
  });

  it('removes and clears', () => {
    let state = cartReducer([], { type: 'add', product: wig, variant: wig.variants[0] });
    state = cartReducer(state, { type: 'add', product: serum, variant: serum.variants[0] });
    state = cartReducer(state, { type: 'remove', key: state[0].key });
    expect(state.map((i) => i.productId)).toEqual([serum.id]);
    expect(cartReducer(state, { type: 'clear' })).toEqual([]);
  });
});

describe('filterProducts', () => {
  it('filters by category, texture, stock and search', () => {
    const wigs = filterProducts(products, { ...defaultFilters, category: 'wigs' });
    expect(wigs.length).toBeGreaterThan(0);
    expect(wigs.every((p) => p.category === 'wigs')).toBe(true);

    const bodyWave = filterProducts(products, { ...defaultFilters, texture: 'body-wave' });
    expect(bodyWave.every((p) => p.texture === 'body-wave')).toBe(true);

    const inStock = filterProducts(products, { ...defaultFilters, inStockOnly: true });
    expect(inStock.every((p) => p.inStock)).toBe(true);
    expect(inStock.length).toBeLessThan(products.length);

    const search = filterProducts(products, { ...defaultFilters, search: '  GLUELESS ' });
    expect(search.map((p) => p.id)).toEqual(['deep-wave-glueless-wig']);
  });

  it('sorts by lowest variant price', () => {
    const asc = filterProducts(products, { ...defaultFilters, sort: 'price-asc' });
    const prices = asc.map((p) => Math.min(...p.variants.map((v) => v.price)));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    const desc = filterProducts(products, { ...defaultFilters, sort: 'price-desc' });
    expect(desc[0].id).toBe(asc[asc.length - 1].id);
  });

  it('does not mutate the source catalogue', () => {
    const before = products.map((p) => p.id);
    filterProducts(products, { ...defaultFilters, sort: 'name' });
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe('WhatsApp order', () => {
  const items: CartItem[] = [
    { key: 'a', productId: 'a', name: 'Bone Straight Frontal Wig', variantLabel: '20"', unitPrice: 3650, quantity: 2 },
    { key: 'b', productId: 'b', name: 'Silk Shine Serum', variantLabel: '100ml', unitPrice: 280, quantity: 1 },
  ];

  it('builds a readable order message with line totals and subtotal', () => {
    const msg = buildOrderMessage(items, { name: ' Thandi ', notes: 'Deliver to Sandton' });
    expect(cartSubtotal(items)).toBe(7580);
    expect(msg).toContain(`1. Bone Straight Frontal Wig (20") × 2 — ${formatPrice(7300)}`);
    expect(msg).toContain(`2. Silk Shine Serum (100ml) × 1 — ${formatPrice(280)}`);
    expect(msg).toContain(`Estimated subtotal: ${formatPrice(7580)}`);
    expect(msg).toContain('Name: Thandi');
    expect(msg).toContain('Notes: Deliver to Sandton');
  });

  it('omits empty optional fields', () => {
    const msg = buildOrderMessage(items, { name: '   ' });
    expect(msg).not.toContain('Name:');
    expect(msg).not.toContain('Notes:');
  });

  it('builds an encoded wa.me link with a digits-only number', () => {
    const url = buildWhatsAppUrl('Hi & hello\nline 2', '+27 82 123 4567');
    expect(url).toBe('https://wa.me/27821234567?text=Hi%20%26%20hello%0Aline%202');
  });
});
