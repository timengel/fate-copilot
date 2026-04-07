import { render, fireEvent, screen } from '@testing-library/vue';
import type { Item } from '@fate/types';
import ItemCardsGrid from './ItemCardsGrid.vue';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    name: 'Test Gegenstand',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

describe('ItemCardsGrid', () => {
  it('renders one card per item', () => {
    const items = [
      makeItem({ id: 'item-1', name: 'Eins' }),
      makeItem({ id: 'item-2', name: 'Zwei' }),
    ];
    const { container } = render(ItemCardsGrid, { props: { items, gmMode: true } });
    expect(container.querySelectorAll('.fate-card')).toHaveLength(2);
    expect(screen.getByText('Eins')).toBeTruthy();
    expect(screen.getByText('Zwei')).toBeTruthy();
  });

  it('falls back to "Unbenannt" when item name is empty', () => {
    render(ItemCardsGrid, { props: { items: [makeItem({ name: '' })], gmMode: true } });
    expect(screen.getByText('Unbenannt')).toBeTruthy();
  });

  it('emits "open" with the item id when a card is clicked', async () => {
    const { container, emitted } = render(ItemCardsGrid, {
      props: { items: [makeItem({ id: 'item-open' })], gmMode: true },
    });
    await fireEvent.click(container.querySelector('.fate-card__main--clickable')!);
    expect(emitted('open')?.[0]).toEqual(['item-open']);
  });

  it('emits copy/edit/toggle-archived/delete with expected payloads in GM mode', async () => {
    const item = makeItem({ id: 'item-actions', archived: false });
    const { container, emitted } = render(ItemCardsGrid, {
      props: { items: [item], gmMode: true },
    });

    const actionButtons = container.querySelectorAll<HTMLButtonElement>('.fate-card__actions button');
    expect(actionButtons).toHaveLength(4);

    await fireEvent.click(actionButtons[0]!); // copy
    await fireEvent.click(actionButtons[1]!); // edit
    await fireEvent.click(actionButtons[2]!); // archive toggle
    await fireEvent.click(actionButtons[3]!); // delete

    expect(emitted('copy')?.[0]).toEqual([item]);
    expect(emitted('edit')?.[0]).toEqual(['item-actions']);
    expect(emitted('toggle-archived')?.[0]).toEqual([item]);
    expect(emitted('delete')?.[0]).toEqual([item]);
  });

  it('hides delete action when gmMode is false', () => {
    const { container } = render(ItemCardsGrid, {
      props: { items: [makeItem()], gmMode: false },
    });
    const actionButtons = container.querySelectorAll<HTMLButtonElement>('.fate-card__actions button');
    expect(actionButtons).toHaveLength(3);
  });

  it('shows ARCHIV badge for archived items', () => {
    render(ItemCardsGrid, {
      props: { items: [makeItem({ archived: true })], gmMode: true },
    });
    expect(screen.getByText('ARCHIV')).toBeTruthy();
  });

  it('renders meta only for non-zero dice/modifier values', () => {
    const noMetaView = render(ItemCardsGrid, {
      props: {
        items: [makeItem({ redDice: 0, blueDice: 0, modifiers: [{ label: 'Purer Schaden', value: 0 }] })],
        gmMode: true,
      },
    });
    expect(noMetaView.container.querySelector('.fate-card__meta')).toBeNull();
    noMetaView.unmount();

    const withMetaView = render(ItemCardsGrid, {
      props: {
        items: [
          makeItem({
            redDice: 2,
            blueDice: 1,
            modifiers: [
              { label: 'Purer Schaden', value: 3 },
              { label: 'Deflektion', value: -1 },
            ],
          }),
        ],
        gmMode: true,
      },
    });

    const meta = withMetaView.container.querySelector('.fate-card__meta');
    expect(meta?.textContent).toContain('2 🟥');
    expect(meta?.textContent).toContain('1 🟦');
    expect(meta?.textContent).toContain('+3 Purer Schaden');
    expect(meta?.textContent).toContain('-1 Deflektion');
  });
});
