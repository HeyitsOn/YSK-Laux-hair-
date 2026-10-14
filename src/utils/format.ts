import { business } from '../config/business';

const priceFormatter = new Intl.NumberFormat(business.currency.locale, {
  style: 'currency',
  currency: business.currency.code,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function lowestPrice(prices: number[]): number {
  return prices.length ? Math.min(...prices) : 0;
}
