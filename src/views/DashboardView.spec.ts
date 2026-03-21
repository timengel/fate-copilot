import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import DashboardView from './DashboardView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useItemsStore } from '../stores/items';
import { useGMModeStore } from '../stores/gmMode';
import type { Campaign, Item } from '../types';

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'campaign-1',
    name: 'Testkampagne',
    description: '',
    status: 'active',
    notes: '',
    milestones: [],
    ...overrides,
  };
}

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    type: 'item',
    archived: false,
    name: 'Altes Schwert',
    description: '',
    aspects: [],
    stunts: [],
    extras: '',
    stressPhysical: [],
    stressMental: [],
    hidden: false,
    redDice: 0,
    blueDice: 0,
    ...overrides,
  };
}

describe('DashboardView archived item filter', () => {
  function getItemArchivedFilter(container: HTMLElement) {
    return container.querySelectorAll<HTMLElement>('.sidebar-group .fate-checkbox')[3];
  }

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setup(itemOverrides: Partial<Item> = {}, isGMMode = false) {
    const pinia = createPinia();
    setActivePinia(pinia);

    const campaignsStore = useCampaignsStore();
    const itemsStore = useItemsStore();
    const gmModeStore = useGMModeStore();

    gmModeStore.isGMMode = isGMMode;

    const campaign = makeCampaign();
    const item = makeItem(itemOverrides);

    campaignsStore.addCampaign(campaign);
    itemsStore.addItem(item);
    campaignsStore.assignItem(campaign.id, item.id);

    return render(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateButton: { template: '<button><slot /></button>' },
          FateRadioButtonGroup: { template: '<div />' },
          CharacterSheet: { template: '<div class="character-sheet-stub" />' },
          ItemSheet: {
            props: ['item'],
            template: '<div class="item-sheet-stub">{{ item.name }}</div>',
          },
        },
      },
    });
  }

  it('hides archived items by default and shows them when the archived filter is enabled', async () => {
    const view = setup({ archived: true });

    expect(view.queryByText('Altes Schwert')).toBeNull();

    await fireEvent.click(getItemArchivedFilter(view.container)!);

    expect(view.getByText('Altes Schwert')).toBeTruthy();
  });

  it('still hides hidden archived items for non-GM users even when the archived filter is enabled', async () => {
    const view = setup({ archived: true, hidden: true });

    await fireEvent.click(getItemArchivedFilter(view.container)!);

    expect(view.queryByText('Altes Schwert')).toBeNull();
  });
});
