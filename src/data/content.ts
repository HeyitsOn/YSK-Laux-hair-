import { business } from '../config/business';

export interface Testimonial {
  quote: string;
  author: string;
  detail: string;
  /** Shows a small "Sample" tag so example reviews are never mistaken for real ones. Remove once real. */
  isSample?: boolean;
}

// PLACEHOLDER — replace with real, permission-granted customer reviews and remove `isSample`.
export const testimonials: Testimonial[] = [
  {
    quote: 'The softest hair I have ever installed. Zero shedding after weeks of wear and the lace melted perfectly.',
    author: 'Customer name',
    detail: 'Bone Straight Frontal Wig',
    isSample: true,
  },
  {
    quote: 'Ordering on WhatsApp was so easy — they helped me pick the right length and it arrived beautifully packed.',
    author: 'Customer name',
    detail: 'Body Wave Bundles',
    isSample: true,
  },
  {
    quote: 'My glueless unit is everything. I wear it to work and everyone thinks it is my own hair.',
    author: 'Customer name',
    detail: 'Deep Wave Glueless Wig',
    isSample: true,
  },
];

export const careTips = [
  {
    title: 'Wash gently',
    text: 'Every 7–10 wears, use sulphate-free shampoo in cool water, washing downward — never scrubbing in circles.',
  },
  {
    title: 'Condition deeply',
    text: 'Deep-condition every second wash to keep virgin hair soft, glossy and tangle-free.',
  },
  {
    title: 'Low heat, always',
    text: 'Use a heat protectant and keep tools under 180°C to preserve the cuticle and natural pattern.',
  },
  {
    title: 'Protect overnight',
    text: 'Sleep in a satin bonnet or on a silk pillowcase and loosely braid longer lengths.',
  },
];

// PLACEHOLDER — confirm every answer matches the real business policy.
export const faqs = [
  {
    q: 'How do I place an order?',
    a: `Add your pieces to the bag and tap "Order on WhatsApp". Your full order is sent to ${business.name}, and we reply to confirm stock, delivery and payment.`,
  },
  {
    q: 'Can I pay on the website?',
    a: 'No — this website does not take payments. Once your order is confirmed on WhatsApp we share secure payment options with you directly.',
  },
  {
    q: 'Do you deliver?',
    a: business.deliveryNote,
  },
  {
    q: 'Is the hair 100% human?',
    a: 'Yes. Our wigs, bundles, closures and frontals are made from 100% human hair that can be washed, coloured and heat-styled with care.',
  },
  {
    q: 'How long will my hair last?',
    a: 'With proper care, our hair typically lasts 12 months or longer. Lifespan depends on how often it is worn, styled and coloured.',
  },
  {
    q: 'Do you offer returns or exchanges?',
    a: 'For hygiene reasons hair can only be exchanged if it is unopened and in its original packaging. Please contact us on WhatsApp within 48 hours of delivery.',
  },
];
