import { render, fireEvent } from '@testing-library/vue';
import { createPinia, setActivePinia } from 'pinia';
import CampaignsView from './CampaignsView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import type { Campaign } from '../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'campaign-1',
    name: 'Test Kampagne',
    description: 'Eine Beschreibung',
    status: 'active',
    notes: '',
    avatar: '🗺️',
    milestones: [],
    ...overrides,
  };
}

describe('CampaignsView – card interactions', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  function setup() {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCampaignsStore();
    const campaign = makeCampaign();
    store.addCampaign(campaign);

    const result = render(CampaignsView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateHeader: { template: '<div><slot /></div>' },
          FateIcon: true,
          ConfirmDialog: true,
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });
    return { ...result, campaignId: campaign.id };
  }

  it('clicking the card navigates to the campaign view page', async () => {
    const { container, campaignId } = setup();
    await fireEvent.click(container.querySelector('.fate-card__main--clickable')!);
    expect(mockPush).toHaveBeenCalledWith(`/campaigns/${campaignId}`);
  });

  it('clicking the edit button navigates to the edit page without triggering card navigation', async () => {
    const { container, campaignId } = setup();
    const [editBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(editBtn!);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(`/campaigns/${campaignId}/edit`);
  });

  it('clicking the delete button does not trigger navigation', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const store = useCampaignsStore();
    store.addCampaign(makeCampaign());
    useGMModeStore().isGMMode = true;

    const { container } = render(CampaignsView, {
      global: {
        plugins: [pinia],
        stubs: {
          FateHeader: { template: '<div><slot /></div>' },
          FateIcon: true,
          ConfirmDialog: true,
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    const [, deleteBtn] = container.querySelectorAll('.fate-card__actions button');
    await fireEvent.click(deleteBtn!);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders the campaign avatar in the card header', () => {
    const { getByText } = setup();
    expect(getByText('🗺️')).toBeTruthy();
  });
});
