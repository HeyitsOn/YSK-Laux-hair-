/** Helpers for product photos stored as `<base>-480.webp` / `<base>-960.webp` in /public. */

export const photoSrc = (base: string, width: 480 | 960 = 960) => `${base}-${width}.webp`;

export const photoSrcSet = (base: string) => `${photoSrc(base, 480)} 480w, ${photoSrc(base, 960)} 960w`;

const views: Record<string, string> = {
  front: 'front view',
  back: 'back view',
  side: 'side view',
  profile: 'profile view',
};

/** `/products/burgundy-bob-back` → "back view" (falls back to "photo"). */
export function photoView(base: string): string {
  const last = base.split('-').pop() ?? '';
  return views[last] ?? 'photo';
}
