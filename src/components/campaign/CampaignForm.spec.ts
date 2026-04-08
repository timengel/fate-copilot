import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import { createPinia } from 'pinia';
import CampaignForm from './CampaignForm.vue';
import type { Campaign } from '../../types';

const campaign: Campaign = {
  id: 'c1',
  name: 'Test Campaign',
  description: 'A description',
  status: 'active',
  notes: '',
  avatar: '🗺️',
  milestones: [],
};

function renderForm(
  props: Partial<Campaign & { isNew?: boolean; onSave?: () => void; onCancel?: () => void }> = {},
) {
  return render(CampaignForm, {
    props: { campaign, isNew: true, ...props },
    global: { plugins: [createPinia()] },
  });
}

describe('CampaignForm', () => {
  it('renders the campaign name in the input', () => {
    const { container } = renderForm();
    const input = container.querySelector<HTMLInputElement>('input.form-control')!;
    expect(input.value).toBe('Test Campaign');
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    await fireEvent.click(screen.getByText('Abbrechen'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onSave with the campaign data when save is clicked', async () => {
    const onSave = vi.fn();
    renderForm({ onSave });
    await fireEvent.click(screen.getByText('Speichern'));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave.mock.calls[0][0].name).toBe('Test Campaign');
  });

  it('does not call onSave when campaign name is empty', async () => {
    window.alert = vi.fn();
    const onSave = vi.fn();
    render(CampaignForm, {
      props: { campaign: { ...campaign, name: '' }, isNew: true, onSave },
      global: { plugins: [createPinia()] },
    });
    await fireEvent.click(screen.getByText('Speichern'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('emits the updated name when changed before saving', async () => {
    const onSave = vi.fn();
    const { container } = renderForm({ onSave });
    const input = container.querySelector<HTMLInputElement>('input.form-control')!;
    await fireEvent.update(input, 'Updated Name');
    await fireEvent.click(screen.getByText('Speichern'));
    expect(onSave.mock.calls[0][0].name).toBe('Updated Name');
  });

  it('emits the updated avatar when changed before saving', async () => {
    const onSave = vi.fn();
    const { container } = renderForm({ onSave });
    const avatarInput = container.querySelector<HTMLInputElement>('.avatar-input')!;
    await fireEvent.update(avatarInput, '🐉');
    await fireEvent.click(screen.getByText('Speichern'));
    expect(onSave.mock.calls[0][0].avatar).toBe('🐉');
  });

  it('uses a taller notes textarea for editing campaign notes', () => {
    const { getByPlaceholderText } = renderForm();
    const notesTextarea = getByPlaceholderText('Kampagnennotizen') as HTMLTextAreaElement;
    expect(notesTextarea.getAttribute('rows')).toBe('8');
    expect(notesTextarea.classList.contains('form-control--notes')).toBe(true);
  });
});

describe('CampaignForm dirty-state', () => {
  it('shows cancel and disables save when form is unchanged (existing campaign)', () => {
    const { getByText } = render(CampaignForm, {
      props: { campaign, isNew: false },
      global: { plugins: [createPinia()] },
    });
    expect(getByText('Abbrechen')).toBeTruthy();
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables save after a field is changed', async () => {
    const { container } = render(CampaignForm, {
      props: { campaign, isNew: false },
      global: { plugins: [createPinia()] },
    });
    const input = container.querySelector<HTMLInputElement>('input.form-control')!;
    await fireEvent.update(input, 'Changed Name');
    expect((screen.getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(
      false,
    );
    expect(screen.getByText('Abbrechen')).toBeTruthy();
  });

  it('shows save/cancel buttons immediately when isNew=true', () => {
    const { getByText } = render(CampaignForm, {
      props: { campaign, isNew: true },
      global: { plugins: [createPinia()] },
    });
    expect(getByText('Speichern')).toBeTruthy();
    expect(getByText('Abbrechen')).toBeTruthy();
  });

  it('disables save again after saving', async () => {
    const onSave = vi.fn();
    const { container, getByText } = render(CampaignForm, {
      props: { campaign, isNew: false, onSave },
      global: { plugins: [createPinia()] },
    });
    const input = container.querySelector<HTMLInputElement>('input.form-control')!;
    await fireEvent.update(input, 'Changed Name');
    await fireEvent.click(screen.getByText('Speichern'));
    expect((getByText('Speichern').closest('button') as HTMLButtonElement).disabled).toBe(true);
    expect(getByText('Abbrechen')).toBeTruthy();
  });
});
