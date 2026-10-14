import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { products } from '../data/products';

function setup() {
  window.localStorage.clear();
  const user = userEvent.setup();
  render(<App />);
  const grid = screen.getByTestId('product-grid');
  const cards = () => within(grid).getAllByRole('article');
  return { user, grid, cards };
}

const openBag = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /open shopping bag/i }));

describe('Collection filters', () => {
  it('shows every product by default', () => {
    const { cards } = setup();
    expect(cards()).toHaveLength(products.length);
  });

  it('filters by category tab and resets', async () => {
    const { user, cards } = setup();
    const tabs = screen.getByRole('group', { name: /filter by category/i });

    await user.click(within(tabs).getByRole('button', { name: 'Wigs' }));
    const wigCount = products.filter((p) => p.category === 'wigs').length;
    expect(cards()).toHaveLength(wigCount);
    expect(within(tabs).getByRole('button', { name: 'Wigs' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(cards()).toHaveLength(products.length);
  });

  it('combines texture + search and shows an empty state', async () => {
    const { user, cards } = setup();
    await user.selectOptions(screen.getByLabelText(/filter by texture/i), 'deep-wave');
    expect(cards().length).toBe(products.filter((p) => p.texture === 'deep-wave').length);

    await user.type(screen.getByLabelText(/search products/i), 'serum');
    expect(screen.getByText(/no pieces match your selection/i)).toBeInTheDocument();

    // Empty state + status bar both offer "Clear filters".
    await user.click(screen.getAllByRole('button', { name: /clear filters/i })[0]);
    expect(within(screen.getByTestId('product-grid')).getAllByRole('article')).toHaveLength(products.length);
  });

  it('hides sold-out items with the in-stock toggle and offers WhatsApp enquiry for them', async () => {
    const { user, cards } = setup();
    const soldOut = products.find((p) => !p.inStock)!;
    const card = screen.getByRole('article', { name: soldOut.name });
    expect(within(card).getByRole('link', { name: /enquire/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    );

    await user.click(screen.getByLabelText(/in stock only/i));
    expect(cards()).toHaveLength(products.filter((p) => p.inStock).length);
    expect(screen.queryByRole('article', { name: soldOut.name })).not.toBeInTheDocument();
  });
});

describe('Product card + cart', () => {
  it('updates price when a different length is selected', async () => {
    const { user } = setup();
    const card = screen.getByRole('article', { name: 'Bone Straight Frontal Wig' });
    expect(within(card).getByText(/2\s?950/)).toBeInTheDocument();
    await user.click(within(card).getByLabelText('24"'));
    expect(within(card).getByText(/4\s?400/)).toBeInTheDocument();
  });

  it('adds items, edits quantity, and builds the WhatsApp order link', async () => {
    const { user } = setup();
    const card = screen.getByRole('article', { name: 'Bone Straight Frontal Wig' });

    await user.click(within(card).getByLabelText('20"'));
    await user.click(within(card).getByRole('button', { name: /add bone straight frontal wig 20" to bag/i }));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByRole('status')).toHaveTextContent(/added to bag/i);

    // Same variant merges; a different variant gets its own line.
    await user.click(within(card).getByRole('button', { name: /add .* to bag/i }));
    await user.click(within(card).getByLabelText('16"'));
    await user.click(within(card).getByRole('button', { name: /add .* to bag/i }));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('3');

    await openBag(user);
    const dialog = screen.getByRole('dialog', { name: /your bag/i });
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(2);

    const line20 = within(dialog).getByRole('listitem', { name: 'Bone Straight Frontal Wig 20"' });
    await user.click(within(line20).getByRole('button', { name: /increase quantity/i }));
    expect(within(line20).getByLabelText('Quantity')).toHaveTextContent('3');
    // 3 × 3650 + 1 × 2950 = 13 900
    expect(within(dialog).getByTestId('cart-subtotal')).toHaveTextContent(/13\s?900/);

    await user.type(within(dialog).getByLabelText(/your name/i), 'Thandi');
    const link = within(dialog).getByTestId('whatsapp-order');
    const href = link.getAttribute('href')!;
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const message = decodeURIComponent(href.split('?text=')[1]);
    expect(message).toContain('Bone Straight Frontal Wig (20") × 3');
    expect(message).toContain('Bone Straight Frontal Wig (16") × 1');
    expect(message).toContain('Name: Thandi');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('removes items, decrements to zero, persists, and closes with Escape', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /add silk shine serum 100ml to bag/i }));
    await user.click(screen.getByRole('button', { name: /add raw straight bundles 14" to bag/i }));
    expect(JSON.parse(window.localStorage.getItem('ysk-cart-v1')!)).toHaveLength(2);

    await openBag(user);
    const dialog = screen.getByRole('dialog', { name: /your bag/i });
    await user.click(within(dialog).getByRole('button', { name: /remove silk shine serum/i }));
    await user.click(within(dialog).getByRole('button', { name: /decrease quantity of raw straight bundles/i }));
    expect(within(dialog).getByText(/your bag is empty/i)).toBeInTheDocument();
    expect(screen.queryByTestId('cart-count')).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('ysk-cart-v1')!)).toEqual([]);

    await user.keyboard('{Escape}');
    expect(document.querySelector('.cart')).not.toHaveClass('is-open');
  });
});

describe('Product photos + gallery', () => {
  it('shows real photos and opens a navigable gallery', async () => {
    const { user } = setup();
    const card = screen.getByRole('article', { name: 'Burgundy Bob' });
    expect(within(card).getByRole('img', { name: 'Burgundy Bob, side view' })).toHaveAttribute(
      'src',
      '/products/burgundy-bob-side-960.webp',
    );

    await user.click(within(card).getByRole('button', { name: /view 4 photos of burgundy bob/i }));
    const gallery = screen.getByRole('dialog', { name: /burgundy bob photos/i });
    expect(within(gallery).getByText('1 / 4')).toBeInTheDocument();
    expect(within(gallery).getByRole('button', { name: /close photos/i })).toHaveFocus();

    await user.click(within(gallery).getByRole('button', { name: /next photo/i }));
    expect(within(gallery).getByRole('img', { name: 'Burgundy Bob, back view' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(within(gallery).getByText('4 / 4')).toBeInTheDocument();
    await user.click(within(gallery).getByRole('button', { name: /show side view/i }));
    expect(within(gallery).getByText('1 / 4')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /burgundy bob photos/i })).not.toBeInTheDocument();
  });

  it('lists the photographed wigs first', () => {
    const { cards } = setup();
    expect(cards().slice(0, 3).map((c) => c.getAttribute('aria-label'))).toEqual([
      'Chestnut Highlight Bob',
      'Burgundy Bob',
      'Natural Black Bob',
    ]);
  });
});

describe('Page sections', () => {
  it('renders the key sections and navigation', () => {
    setup();
    for (const name of [/luxury hair/i, /signature pieces/i, /beautifully/i, /questions, answered/i, /perfect/i]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Collection' })).toHaveAttribute('href', '#collection');
  });

  it('toggles FAQ answers', async () => {
    const { user } = setup();
    const q = screen.getByRole('button', { name: /can i pay on the website/i });
    expect(q).toHaveAttribute('aria-expanded', 'false');
    await user.click(q);
    expect(q).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/this website does not take payments/i)).toBeVisible();
  });

  it('opens and closes the mobile menu', async () => {
    const { user } = setup();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'FAQ' }));
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false');
  });
});
