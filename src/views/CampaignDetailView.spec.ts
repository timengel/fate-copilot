import { render, screen } from '@testing-library/vue';
import { createPinia, getActivePinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignDetailView from './CampaignDetailView.vue';
import { useCampaignsStore } from '../stores/campaigns';
import { useGMModeStore } from '../stores/gmMode';
import type { Campaign } from '../types';

const mockPush = vi.fn();
const routeParams = { id: 'camp-1' };

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: routeParams }),
}));

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'Kampagne Eins',
    description: '',
    status: 'active',
    notes: '',
    milestones: [],
    ...overrides,
  };
}

function renderView() {
  const pinia = getActivePinia() ?? createPinia();
  setActivePinia(pinia);

  return render(CampaignDetailView, {
    global: {
      plugins: [pinia],
      stubs: {
        CampaignForm: true,
        MilestoneTimeline: true,
        FateAvatar: true,
        FateDropdown: true,
        ConfirmDialog: true,
        FateButton: { template: '<button><slot /></button>' },
      },
    },
  });
}

describe('CampaignDetailView', () => {
  beforeEach(() => {
    mockPush.mockReset();
    routeParams.id = 'camp-1';
    setActivePinia(createPinia());
  });

  it('renders character and item sections in detail view', () => {
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ gmNotes: 'Intern' }));
    useGMModeStore().isGMMode = true;

    renderView();
    expect(screen.getByText('CHARAKTERE')).toBeTruthy();
    expect(screen.getByText('ITEMS')).toBeTruthy();
  });

  it('renders campaign notes as markdown for GM mode', () => {
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ notes: '**Wichtig**\n\n- Punkt A\n- Punkt B' }));
    useGMModeStore().isGMMode = true;

    const { container, getByText } = renderView();
    expect(getByText('Notizen:')).toBeTruthy();
    const markdownHost = container.querySelector('.campaign-notes-markdown');
    expect(markdownHost?.innerHTML).toContain('<strong>Wichtig</strong>');
    expect(markdownHost?.textContent).toContain('Punkt A');
    expect(markdownHost?.textContent).toContain('Punkt B');
  });
});
