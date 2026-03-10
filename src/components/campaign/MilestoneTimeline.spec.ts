import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { createPinia } from 'pinia'
import MilestoneTimeline from './MilestoneTimeline.vue'
import type { Milestone } from '../../types'

const milestones: Milestone[] = [
  { id: 'm1', type: 'small', description: 'First milestone' },
  { id: 'm2', type: 'major', description: 'Big one' },
]

function renderTimeline(props: { milestones: Milestone[]; readonly?: boolean; onAdd?: () => void; onRemove?: () => void; onUpdate?: () => void }) {
  return render(MilestoneTimeline, {
    props,
    global: { plugins: [createPinia()] },
  })
}

describe('MilestoneTimeline', () => {
  describe('readonly mode', () => {
    it('hides the add form', () => {
      const { container } = renderTimeline({ milestones, readonly: true })
      expect(container.querySelector('.milestone-add-form')).toBeNull()
    })

    it('hides edit and remove buttons', () => {
      const { container } = renderTimeline({ milestones, readonly: true })
      expect(container.querySelector('.milestone-edit')).toBeNull()
      expect(container.querySelector('.milestone-remove')).toBeNull()
    })

    it('renders milestone descriptions', () => {
      renderTimeline({ milestones, readonly: true })
      expect(screen.getByText('First milestone')).toBeTruthy()
      expect(screen.getByText('Big one')).toBeTruthy()
    })
  })

  describe('edit mode (readonly=false)', () => {
    it('shows the add form', () => {
      const { container } = renderTimeline({ milestones: [], readonly: false })
      expect(container.querySelector('.milestone-add-form')).toBeTruthy()
    })

    it('renders existing milestone descriptions', () => {
      renderTimeline({ milestones, readonly: false })
      expect(screen.getByText('First milestone')).toBeTruthy()
    })

    it('calls onAdd with a new milestone when description is entered and submitted', async () => {
      const onAdd = vi.fn()
      const { container } = renderTimeline({ milestones: [], readonly: false, onAdd })
      const input = container.querySelector<HTMLInputElement>('input.milestone-desc-input')!
      await fireEvent.update(input, 'New Milestone')
      await fireEvent.click(screen.getByText('+ Hinzufügen'))
      expect(onAdd).toHaveBeenCalledOnce()
      const added: Milestone = onAdd.mock.calls[0][0]
      expect(added.description).toBe('New Milestone')
      expect(added.id).toBeTruthy()
    })

    it('does not call onAdd when description is empty', async () => {
      const onAdd = vi.fn()
      renderTimeline({ milestones: [], readonly: false, onAdd })
      await fireEvent.click(screen.getByText('+ Hinzufügen'))
      expect(onAdd).not.toHaveBeenCalled()
    })

    it('calls onRemove with the last milestone id when ✕ is clicked', async () => {
      const onRemove = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onRemove })
      const removeBtn = container.querySelector<HTMLButtonElement>('.milestone-remove')!
      await fireEvent.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith('m2')
    })

    it('switches to edit mode when ✎ is clicked', async () => {
      const { container } = renderTimeline({ milestones, readonly: false })
      await fireEvent.click(container.querySelector('.milestone-edit')!)
      expect(container.querySelector('.timeline-content--edit')).toBeTruthy()
    })

    it('calls onUpdate when saving in edit mode', async () => {
      const onUpdate = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onUpdate })
      await fireEvent.click(container.querySelector('.milestone-edit')!)
      await fireEvent.click(screen.getByText('✓'))
      expect(onUpdate).toHaveBeenCalledOnce()
    })

    it('exits edit mode without calling onUpdate when ✕ is clicked in edit mode', async () => {
      const onUpdate = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onUpdate })
      await fireEvent.click(container.querySelector('.milestone-edit')!)
      const editContent = container.querySelector('.timeline-content--edit')!
      await fireEvent.click(editContent.querySelector('.milestone-remove')!)
      expect(onUpdate).not.toHaveBeenCalled()
      expect(container.querySelector('.timeline-content--edit')).toBeNull()
    })

    it('trims whitespace from description before emitting add', async () => {
      const onAdd = vi.fn()
      const { container } = renderTimeline({ milestones: [], readonly: false, onAdd })
      const input = container.querySelector<HTMLInputElement>('input.milestone-desc-input')!
      await fireEvent.update(input, '  trimmed  ')
      await fireEvent.click(screen.getByText('+ Hinzufügen'))
      expect(onAdd.mock.calls[0][0].description).toBe('trimmed')
    })

    it('does not call onAdd when description is whitespace only', async () => {
      const onAdd = vi.fn()
      const { container } = renderTimeline({ milestones: [], readonly: false, onAdd })
      const input = container.querySelector<HTMLInputElement>('input.milestone-desc-input')!
      await fireEvent.update(input, '   ')
      await fireEvent.click(screen.getByText('+ Hinzufügen'))
      expect(onAdd).not.toHaveBeenCalled()
    })

    it('clears the description input after a successful submit', async () => {
      const { container } = renderTimeline({ milestones: [], readonly: false })
      const input = container.querySelector<HTMLInputElement>('input.milestone-desc-input')!
      await fireEvent.update(input, 'A new milestone')
      await fireEvent.click(screen.getByText('+ Hinzufügen'))
      expect(input.value).toBe('')
    })

    it('does not call onUpdate when saving edit with empty description', async () => {
      const onUpdate = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onUpdate })
      await fireEvent.click(container.querySelector('.milestone-edit')!)
      const editInput = container.querySelector<HTMLInputElement>('.timeline-content--edit input')!
      await fireEvent.update(editInput, '')
      await fireEvent.click(screen.getByText('✓'))
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('trims description when saving an edit', async () => {
      const onUpdate = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onUpdate })
      await fireEvent.click(container.querySelector('.milestone-edit')!)
      const editInput = container.querySelector<HTMLInputElement>('.timeline-content--edit input')!
      await fireEvent.update(editInput, '  updated  ')
      await fireEvent.click(screen.getByText('✓'))
      expect(onUpdate.mock.calls[0][0].description).toBe('updated')
    })

    it('remove button is only present on the last milestone', () => {
      const { container } = renderTimeline({ milestones, readonly: false })
      // Only the last milestone's view row should have the danger-outline remove button
      const viewRows = container.querySelectorAll('.timeline-content:not(.timeline-content--edit)')
      const rowsWithRemove = Array.from(viewRows).filter(row => row.querySelector('.milestone-remove'))
      expect(rowsWithRemove).toHaveLength(1)
    })
  })
})
