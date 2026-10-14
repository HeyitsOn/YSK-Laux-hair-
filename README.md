# YSK Luxe Hair: website

A premium single-page website for YSK Luxe Hair, built with **React 18, TypeScript, Vite and plain CSS**.
Customers browse the collection, filter it, build a bag and send the order to the business on **WhatsApp**.
The site takes **no payments**. Payment and delivery are agreed personally on WhatsApp.

> Before going live, work through **[PLACEHOLDERS.md](PLACEHOLDERS.md)**. The WhatsApp number in particular is a placeholder.

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve the production build locally (http://localhost:4173) |
| `npm test` | Run the automated test suite once |
| `npm run test:watch` | Re-run tests on file changes |
| `npm run typecheck` | TypeScript check only |

## Features

- **Sections:** hero, trust strip, collection, our story, how to order, hair-care ritual, testimonials, FAQ, contact, footer. The sticky header has smooth-scroll links and a mobile menu.
- **Collection:** reusable `ProductCard` with a length/size picker whose price updates live, badges, and sold-out state with a WhatsApp "Enquire" link.
- **Filters:** category tabs, texture, search, sort (featured / price / name), in-stock toggle, result count, empty state and "Clear filters".
- **Cart:** slide-out drawer, merges repeat adds, keeps separate lines per length, +/- quantity (max 10), remove, clear, live subtotal, "Added to bag" toast. The cart is saved in `localStorage`, so it survives a page reload.
- **WhatsApp ordering:** the bag becomes a numbered, itemised message with an estimated subtotal, plus the optional name and notes. It opens `wa.me` in a new tab. A floating WhatsApp button and the contact links open a general chat.
- **Responsive and accessible:** mobile-first layouts and no horizontal scroll at 390px. Keyboard support covers Escape to close, focus moved into the drawer, and a closed drawer that is `inert`. Includes ARIA labels, a skip link and `prefers-reduced-motion` support.
- **Design:** black and gold palette, Cormorant Garamond + Jost typography, gold gradient accents, scroll-reveal animation, and gold line-art product placeholders drawn per hair texture.

## Project structure

```
src/
├── App.tsx                  # Page composition
├── main.tsx                 # Entry point
├── types.ts                 # Shared types (Product, CartItem, …)
├── config/business.ts       # ★ Business details (WhatsApp number, socials, hours…)
├── data/
│   ├── products.ts          # ★ Product catalogue + category/texture labels
│   └── content.ts           # ★ Testimonials, care tips, FAQs
├── context/
│   ├── CartContext.tsx      # Cart provider + useCart() hook (persistence, drawer, toast)
│   └── cartReducer.ts       # Pure cart logic (add / remove / quantity / clear)
├── hooks/
│   ├── useProductFilters.ts # Filter + sort state and pure filterProducts()
│   └── useReveal.ts         # Scroll-reveal via IntersectionObserver
├── utils/
│   ├── format.ts            # Currency formatting
│   └── whatsapp.ts          # Order message + wa.me link builders
├── components/
│   ├── ui/                  # Button, ButtonLink, Icon, SectionHeading, Reveal
│   ├── layout/              # Header, Footer, Logo, WhatsAppFloat
│   ├── product/             # ProductCard, ProductImage, FilterBar
│   ├── cart/                # CartDrawer, CartToast
│   └── sections/            # Hero, TrustBar, Collection, About, HowToOrder,
│                            # HairCare, Testimonials, Faq, Contact
├── styles/global.css        # Design tokens, base styles, utilities
└── test/                    # Vitest + Testing Library tests
```

★ = the files you edit to change content. Each component imports its own CSS file next to it.

### Common edits

- **Add a product:** add an object to `products` in `src/data/products.ts`. `id` must be unique, and each variant `label` must be unique within its product.
- **Add photos:** see "Product photos" below.
- **New category or texture:** extend the `Category` / `Texture` types in `src/types.ts` and the label maps in `products.ts`. The filters update automatically.
- **Change colours or fonts:** edit the CSS variables at the top of `src/styles/global.css`.

## Product photos

The three bobs (Chestnut Highlight, Burgundy, Natural Black) use real photos:

- `photos/originals/` holds the untouched originals. They are kept for reference and are not deployed.
- `public/products/` holds the edited versions as WebP, at 960px (desktop) and 480px (mobile).

The edits were cropping to a 4:5 portrait, cutting the wig out of the blue wall, removing the blue tint from the edges, placing it on a smooth white studio backdrop with a soft shadow, a warm colour grade and light sharpening. The mannequin's pen and marker marks are retouched out, and each bob's ends are trimmed to an even blunt line. Per-photo settings (face areas, cut lines, protected neck ring and stand) are in the `RETOUCH` table at the top of the script.

On the site:
- The first photo is the card image, and the second fades in when someone hovers over the card.
- The "N photos" button opens a gallery that works with arrows, the keyboard, a phone swipe and thumbnails.
- The hero uses `hero-bob-600/900.webp`.

**To add a product's photos:**
1. Export each photo as `public/products/<name>-480.webp` and `<name>-960.webp` in a 4:5 portrait shape. Optional: use `scripts/process_photos.py` to get the same look. It needs Python with Pillow, numpy and scipy. Edit the `SHOTS` crop list at the top, then run `python scripts/process_photos.py photos/originals public/products`.
2. List the photos in the product's `images` in `src/data/products.ts`, main photo first: `images: ['/products/<name>-side', '/products/<name>-back']`.
3. End file names with `-front`, `-back`, `-side` or `-profile`, so the site can describe each photo for screen readers ("side view").

`npm test` checks that every photo listed in the products exists in both sizes.

**Photography tips for future shoots:**
- Use a clean, unmarked mannequin head. The marks on the current one had to be retouched out.
- Comb the ends straight and trim stray strands before shooting. It's quicker than retouching.
- Shoot against a plain, evenly lit wall in soft daylight, and keep hands out of the frame. A plain backdrop makes the cut-out cleaner. A white sheet or board behind the head works even better and needs almost no editing.

## Testing

### Automated (`npm test`)

24 tests across two files:

- `src/test/logic.test.ts`: cart reducer (merge, separate variants, quantity cap, remove at 0, clear), filter/sort logic, catalogue integrity, a check that every product photo exists, and WhatsApp message and URL encoding.
- `src/test/App.test.tsx`: full-app interaction tests covering category tabs, texture + search with the empty state, in-stock toggle, sold-out enquiry link, price change on length select, add to bag, cart count, toast, quantity edits, subtotal, WhatsApp link contents, remove and decrement to empty, `localStorage` persistence, Escape to close, the FAQ accordion, the mobile menu, real product photos and the photo gallery (open, next/previous, thumbnails, Escape).

### Manual checklist

Run `npm run dev` (or `npm run build && npm run preview`) and check:

1. **Hero:** both buttons work. "Shop the collection" scrolls down, and "Get styling advice" opens WhatsApp.
2. **Filters:** click each category tab, pick a texture, type in search, change sort and toggle "In stock only". Results update and "Clear filters" resets.
3. **Product card:** pick a different length and the price changes. Click **Add** and the button shows "Added", the bag count bumps and a toast appears.
4. **Cart:** open the bag, then use +/-, remove and Clear bag. The subtotal updates. Reload the page and the bag is still there.
5. **WhatsApp order:** fill in name and notes, then click **Order on WhatsApp**. WhatsApp or WhatsApp Web opens with the itemised order pre-filled.
   *With the placeholder number the chat won't reach anyone. Set the real number first.*
6. **Sold-out item:** "Kinky Curly Bob Wig" shows "Sold out" and an **Enquire** button.
7. **Mobile (DevTools ~390px):** the hamburger menu opens, closes, and closes after tapping a link. There's no sideways scrolling, the filter tabs swipe horizontally, and the bag drawer is full-width and scrolls.
8. **Keyboard:** Tab through the page. Focus rings are visible, Escape closes the bag and the menu, and the FAQ opens with Enter or Space.

## Deployment (Vercel)

The site is a static build. `vercel.json` pins the settings: Vite, `npm ci`, `npm run build`, output `dist/`. No environment variables are needed.

1. Go to https://vercel.com/new and sign in with GitHub.
2. Import the **HeyitsOn/YSK-Laux-hair-** repository. The settings are filled in automatically.
3. Click **Deploy**. You get a live `https://<project>.vercel.app` link.

After that, every push to `main` redeploys automatically, and pull requests get preview links. To use your own domain, go to Project → Settings → Domains.

`dist/` also works on any other static host (Netlify, Cloudflare Pages, cPanel).

## Adding online payments later

The cart is self-contained (`CartContext` + `cartReducer`). A real payment provider (e.g. PayFast, Yoco, Paystack) can be added later as a separate checkout step that reads `items` from `useCart()`. No payment UI is simulated in the meantime.
