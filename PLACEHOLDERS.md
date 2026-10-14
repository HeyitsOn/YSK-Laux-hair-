# Placeholders to replace before launch

Everything below is example content. Replace it with real YSK Luxe Hair information.
Search the code for `PLACEHOLDER` to find every spot.

## 1. Business details: `src/config/business.ts`

| Field | Current placeholder | What to enter |
| --- | --- | --- |
| `whatsappNumber` | `27000000000` | **Most important.** Real WhatsApp Business number, digits only, international format (e.g. `27821234567`). All orders go here. |
| `whatsappDisplay` | `+27 00 000 0000` | The same number, formatted for display |
| `email` | `hello@yskluxehair.co.za` | Real email address |
| `instagramUrl` / `instagramHandle` | `@yskluxehair` | Real Instagram profile |
| `tiktokUrl` | `@yskluxehair` | Real TikTok profile (or remove the icon in `Footer.tsx`) |
| `location` | `Johannesburg, South Africa` | Real city / area |
| `hours` | Mon–Fri 09–18, Sat 09–15, Sun closed | Real trading hours |
| `deliveryNote` | Generic courier and collection text | Real delivery areas, fees and timelines |
| `currency` | ZAR / `en-ZA` | Change only if selling in another currency |

## 2. Products: `src/data/products.ts`

- [ ] Product names, descriptions, textures and categories
- [ ] Lengths / sizes and **prices** for each variant
- [ ] `inStock` status (sold-out items show an "Enquire" WhatsApp button)
- [ ] Badges (`Bestseller`, `New`, `Limited`, `Gift idea`)
- [x] **Real photos added** for the Chestnut Highlight Bob, Burgundy Bob and Natural Black Bob. These are the first three cards, and the chestnut bob also appears in the hero.
- [ ] **Confirm details for the three real bobs:** price, lengths (currently 8"/10"/12" as examples), lace type and hair type in each description. The names are suggestions.
- [ ] **Natural Black Bob** has no front photo yet. Add one when available.
- [ ] **Optional reshoot of the front views** on a clean mannequin head. The pen marks have been retouched out, but a clean head gives the most natural result.
- [ ] **The other products** are sample items shown with gold line art. Add real photos (see README, "Product photos") or delete them from `src/data/products.ts`.

## 3. Website copy: `src/data/content.ts` and the section components

- [ ] **Testimonials:** the three reviews are samples and show a "Sample" tag. Replace them with real reviews (with the customer's permission) and delete `isSample`, or empty the array to hide the section.
- [ ] **FAQ answers:** check that the payment, delivery, lifespan and **returns policy** match how you really work.
- [ ] Hair-care tips (optional review)
- [ ] **Our Story** text and signature in `src/components/sections/About.tsx`: replace with the founder's real story and name.
- [ ] Hero claims in `src/components/sections/Hero.tsx` ("Raw · Virgin · HD Lace", "100% human hair", "Nationwide delivery"): keep only what is true.
- [ ] Trust strip phrases in `src/components/sections/TrustBar.tsx`

## 4. Branding

- [ ] **Logo:** `src/components/layout/Logo.tsx` currently shows a text wordmark. Swap in an `<img>` of the real logo if you have one.
- [ ] **Favicon:** `public/favicon.svg`
- [ ] Page title and meta description: `index.html`
- [ ] Optional: a social share image (`og:image`) in `index.html`

## 5. Legal (recommended before launch)

- [ ] Privacy notice (POPIA). The site stores the cart in the visitor's own browser only and sends no data anywhere, but WhatsApp conversations hold personal information.
- [ ] Returns / exchange policy page or FAQ wording that meets the Consumer Protection Act
