import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { createPinia } from 'pinia'
import CampaignForm from './CampaignForm.vue'
import type { Campaign } from '../../types'

const campaign: Campaign = {
  id: 'c1',
  name: 'Test Campaign',
  description: 'A description',
  status: 'active',
  notes: '',
}

function renderForm(props: Partial<Campaign & { onSave?: () => void; onCancel?: () => void }> = {}) {
  return render(CampaignForm, {
    props: { campaign, ...props },
    global: { plugins: [createPinia()] },
  })
}

describe('CampaignForm', () => {
  it('renders the campaign name in the input', () => {
    const { container } = renderForm()
    const input = container.querySelector<HTMLInputElement>('input.form-control')!
    expect(input.value).toBe('Test Campaign')
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    renderForm({ onCancel })
    await fireEvent.click(screen.getByText('Abbrechen'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onSave with the campaign data when save is clicked', async () => {
    const onSave = vi.fn()
    renderForm({ onSave })
    await fireEvent.click(screen.getByText('Speichern'))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].name).toBe('Test Campaign')
  })

  it('does not call onSave when campaign name is empty', async () => {
    window.alert = vi.fn()
    const onSave = vi.fn()
    render(CampaignForm, {
      props: { campaign: { ...campaign, name: '' }, onSave },
      global: { plugins: [createPinia()] },
    })
    await fireEvent.click(screen.getByText('Speichern'))
    expect(onSave).not.toHaveBeenCalled()
  })

  it('emits the updated name when changed before saving', async () => {
    const onSave = vi.fn()
    const { container } = renderForm({ onSave })
    const input = container.querySelector<HTMLInputElement>('input.form-control')!
    await fireEvent.update(input, 'Updated Name')
    await fireEvent.click(screen.getByText('Speichern'))
    expect(onSave.mock.calls[0][0].name).toBe('Updated Name')
  })
})
