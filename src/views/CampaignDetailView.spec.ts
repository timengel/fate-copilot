import { fireEvent, render, screen } from '@testing-library/vue';
import { createPinia, getActivePinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('CampaignDetailView GM notes section', () => {
  beforeEach(() => {
    mockPush.mockReset();
    routeParams.id = 'camp-1';
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render the GM Notizen section when GM mode is off', () => {
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ gmNotes: 'Intern' }));
    useGMModeStore().isGMMode = false;

    const { queryByText, queryByPlaceholderText } = renderView();
    expect(queryByText('GM NOTIZEN')).toBeNull();
    expect(queryByPlaceholderText('Nächste Sitzung planen...')).toBeNull();
  });

  it('renders GM Notizen section with textarea even when gmNotes is empty', () => {
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ gmNotes: '' }));
    useGMModeStore().isGMMode = true;

    renderView();
    expect(screen.getByText('GM NOTIZEN')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nächste Sitzung planen...')).toBeTruthy();
  });

  it('autosaves gmNotes after debounce when typing', async () => {
    vi.useFakeTimers();
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ gmNotes: '' }));
    useGMModeStore().isGMMode = true;

    renderView();
    const textarea = screen.getByPlaceholderText('Nächste Sitzung planen...');
    await fireEvent.update(textarea, '# Nächste Session');

    expect(campaignsStore.getById('camp-1')?.gmNotes ?? '').toBe('');
    vi.advanceTimersByTime(399);
    expect(campaignsStore.getById('camp-1')?.gmNotes ?? '').toBe('');

    vi.advanceTimersByTime(1);
    expect(campaignsStore.getById('camp-1')?.gmNotes).toBe('# Nächste Session');
  });

  it('persists only the latest value when typing rapidly', async () => {
    vi.useFakeTimers();
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ gmNotes: '' }));
    useGMModeStore().isGMMode = true;

    renderView();
    const textarea = screen.getByPlaceholderText('Nächste Sitzung planen...');

    await fireEvent.update(textarea, 'A');
    vi.advanceTimersByTime(200);
    await fireEvent.update(textarea, 'AB');
    vi.advanceTimersByTime(200);
    await fireEvent.update(textarea, 'ABC');
    vi.advanceTimersByTime(399);

    expect(campaignsStore.getById('camp-1')?.gmNotes ?? '').toBe('');
    vi.advanceTimersByTime(1);
    expect(campaignsStore.getById('camp-1')?.gmNotes).toBe('ABC');
  });

  it('renders campaign notes as markdown in view mode', () => {
    const campaignsStore = useCampaignsStore();
    campaignsStore.addCampaign(makeCampaign({ notes: '**Wichtig**\n\n- Punkt A\n- Punkt B' }));
    useGMModeStore().isGMMode = false;

    const { container, getByText } = renderView();
    expect(getByText('Notizen:')).toBeTruthy();
    const markdownHost = container.querySelector('.campaign-notes-markdown');
    expect(markdownHost?.innerHTML).toContain('<strong>Wichtig</strong>');
    expect(markdownHost?.textContent).toContain('Punkt A');
    expect(markdownHost?.textContent).toContain('Punkt B');
  });
});
