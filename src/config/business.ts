/**
 * Central business details.
 *
 * Every value marked PLACEHOLDER must be replaced with real YSK Luxe Hair
 * information before the site goes live. See PLACEHOLDERS.md for the full list.
 */
export const business = {
  name: 'YSK Luxe Hair',
  shortName: 'YSK',
  tagline: 'Luxury hair, crafted for your crown.',

  // PLACEHOLDER — international format, digits only, no "+" or spaces (e.g. 27821234567).
  whatsappNumber: '27000000000',
  // PLACEHOLDER — shown on the site as the readable version of the number above.
  whatsappDisplay: '+27 00 000 0000',

  email: 'hello@yskluxehair.co.za', // PLACEHOLDER
  instagramUrl: 'https://www.instagram.com/yskluxehair', // PLACEHOLDER
  instagramHandle: '@yskluxehair', // PLACEHOLDER
  tiktokUrl: 'https://www.tiktok.com/@yskluxehair', // PLACEHOLDER

  location: 'Johannesburg, South Africa', // PLACEHOLDER
  hours: [
    { days: 'Mon – Fri', time: '09:00 – 18:00' }, // PLACEHOLDER
    { days: 'Saturday', time: '09:00 – 15:00' }, // PLACEHOLDER
    { days: 'Sunday', time: 'Closed' }, // PLACEHOLDER
  ],

  // PLACEHOLDER — delivery / collection policy wording.
  deliveryNote: 'Nationwide courier delivery and local collection available. Delivery fees are confirmed on WhatsApp.',

  currency: { code: 'ZAR', locale: 'en-ZA' },
} as const;
