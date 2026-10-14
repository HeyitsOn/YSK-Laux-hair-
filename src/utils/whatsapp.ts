import { business } from '../config/business';
import type { CartItem } from '../types';
import { formatPrice } from './format';

export interface OrderDetails {
  name?: string;
  notes?: string;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

/** Builds the plain-text order message sent to the business on WhatsApp. */
export function buildOrderMessage(items: CartItem[], details: OrderDetails = {}): string {
  const lines: string[] = [`Hi ${business.name}! I'd like to place an order:`, ''];

  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} (${item.variantLabel}) × ${item.quantity} — ${formatPrice(item.unitPrice * item.quantity)}`,
    );
  });

  lines.push('', `Estimated subtotal: ${formatPrice(cartSubtotal(items))}`);

  const name = details.name?.trim();
  const notes = details.notes?.trim();
  if (name) lines.push(`Name: ${name}`);
  if (notes) lines.push(`Notes: ${notes}`);

  lines.push('', 'Please confirm availability, delivery and payment details. Thank you!');
  return lines.join('\n');
}

export function buildWhatsAppUrl(message: string, phone: string = business.whatsappNumber): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryUrl(productName: string): string {
  return buildWhatsAppUrl(`Hi ${business.name}! Is the ${productName} available or coming back in stock?`);
}
