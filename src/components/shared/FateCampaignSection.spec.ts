import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import FateCampaignSection from './FateCampaignSection.vue';

describe('FateCampaignSection', () => {
  it('renders the empty assigned state', () => {
    render(FateCampaignSection, {
      props: { assignedCampaigns: [], availableCampaigns: [] },
    });
    expect(screen.getByText('Keiner Kampagne zugeordnet.')).toBeTruthy();
  });

  it('selecting a campaign emits assign and resets the select', async () => {
    const onAssign = vi.fn();
    const { container } = render(FateCampaignSection, {
      props: {
        assignedCampaigns: [],
        availableCampaigns: [{ id: 'c1', name: 'Kampagne 1' }],
        onAssign,
      },
    });

    const select = container.querySelector('select') as HTMLSelectElement;
    await fireEvent.update(select, 'c1');
    expect(onAssign).toHaveBeenCalledWith('c1');
    expect(select.value).toBe('');
  });

  it('clicking an assigned campaign name emits navigate', async () => {
    const onNavigate = vi.fn();
    render(FateCampaignSection, {
      props: {
        assignedCampaigns: [{ id: 'c1', name: 'Kampagne 1' }],
        availableCampaigns: [],
        onNavigate,
      },
    });

    await fireEvent.click(screen.getByText('Kampagne 1'));
    expect(onNavigate).toHaveBeenCalledWith('c1');
  });

  it('clicking remove emits unassign', async () => {
    const onUnassign = vi.fn();
    render(FateCampaignSection, {
      props: {
        assignedCampaigns: [{ id: 'c1', name: 'Kampagne 1' }],
        availableCampaigns: [],
        onUnassign,
      },
    });

    await fireEvent.click(screen.getByText('Entfernen'));
    expect(onUnassign).toHaveBeenCalledWith('c1');
  });
});
