import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import StressTrack from './StressTrack.vue';
import type { StressBox } from '../../types';

const boxes: StressBox[] = [
  { value: 1, checked: false },
  { value: 2, checked: true },
  { value: 3, checked: false },
];

describe('StressTrack', () => {
  it('renders the label', () => {
    render(StressTrack, { props: { boxes, label: 'Körperlich', readonly: false } });
    expect(screen.getByText('Körperlich')).toBeTruthy();
  });

  it('renders the correct number of checkboxes', () => {
    const { container } = render(StressTrack, { props: { boxes, label: 'Test', readonly: false } });
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(3);
  });

  it('reflects checked state in the DOM', () => {
    const { container } = render(StressTrack, { props: { boxes, label: 'Test', readonly: false } });
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });

  it('calls onUpdate with toggled box when a checkbox changes', async () => {
    const onUpdate = vi.fn();
    const { container } = render(StressTrack, {
      props: { boxes, label: 'Test', readonly: false, onUpdate },
    });
    await fireEvent.change(container.querySelectorAll('input[type="checkbox"]')[0]);
    expect(onUpdate).toHaveBeenCalledOnce();
    const updatedBoxes: StressBox[] = onUpdate.mock.calls[0][0];
    expect(updatedBoxes[0].checked).toBe(true); // was false → toggled to true
  });

  it('does not call onUpdate when readonly', async () => {
    const onUpdate = vi.fn();
    const { container } = render(StressTrack, {
      props: { boxes, label: 'Test', readonly: true, onUpdate },
    });
    await fireEvent.change(container.querySelectorAll('input[type="checkbox"]')[0]);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('emits full updated array with only the toggled box changed', async () => {
    const onUpdate = vi.fn();
    const { container } = render(StressTrack, {
      props: { boxes, label: 'Test', readonly: false, onUpdate },
    });
    await fireEvent.change(container.querySelectorAll('input[type="checkbox"]')[0]);
    const updated: StressBox[] = onUpdate.mock.calls[0][0];
    expect(updated[0].checked).toBe(true); // was false → toggled
    expect(updated[1].checked).toBe(true); // unchanged
    expect(updated[2].checked).toBe(false); // unchanged
    expect(updated.map((b) => b.value)).toEqual([1, 2, 3]); // values preserved
  });
});
