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

    it('calls onRemove with the milestone id when ✕ is clicked', async () => {
      const onRemove = vi.fn()
      const { container } = renderTimeline({ milestones, readonly: false, onRemove })
      const removeBtn = container.querySelector<HTMLButtonElement>('.milestone-remove')!
      await fireEvent.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith('m1')
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
  })
})
