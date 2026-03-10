import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import CharacterForm from './CharacterForm.vue'
import { createDefaultCharacter } from '../../composables/useCharacterDefaults'
import type { Character } from '../../types'

function renderForm(character?: Character, extraProps: Record<string, unknown> = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  return render(CharacterForm, {
    props: { character: character ?? createDefaultCharacter(), ...extraProps },
    global: {
      plugins: [pinia],
      stubs: { SkillPyramid: true },
    },
  })
}

describe('CharacterForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn()
    renderForm(undefined, { onCancel })
    await fireEvent.click(screen.getByText('Abbrechen'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onSave when the save button is clicked', async () => {
    const onSave = vi.fn()
    renderForm(undefined, { onSave })
    await fireEvent.click(screen.getByText('Speichern'))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('saves the current character data', async () => {
    const onSave = vi.fn()
    const char = { ...createDefaultCharacter(), name: 'Test Hero' }
    renderForm(char, { onSave })
    await fireEvent.click(screen.getByText('Speichern'))
    const saved: Character = onSave.mock.calls[0][0]
    expect(saved.name).toBe('Test Hero')
  })

  it('adds a stunt row when "+ Stunt hinzufügen" is clicked', async () => {
    const { container } = renderForm()
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(0)
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'))
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(1)
  })

  it('removes a stunt row when the stunt ✕ button is clicked', async () => {
    const { container } = renderForm()
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'))
    await fireEvent.click(screen.getByText('+ Stunt hinzufügen'))
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(2)
    await fireEvent.click(container.querySelector('.stunt-edit-row button')!)
    expect(container.querySelectorAll('.stunt-edit-row')).toHaveLength(1)
  })

  it('updates the name input when the character prop changes', async () => {
    const char = createDefaultCharacter()
    const { rerender, container } = renderForm(char)
    await rerender({ character: { ...char, name: 'Updated Name' } })
    const nameInput = container.querySelector<HTMLInputElement>('input[placeholder="Charaktername"]')!
    expect(nameInput.value).toBe('Updated Name')
  })
})
