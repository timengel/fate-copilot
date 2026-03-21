import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import DiceTrack from './DiceTrack.vue';

describe('DiceTrack', () => {
  it('clicking a die sets the count', async () => {
    const onUpdate = vi.fn();
    render(DiceTrack, {
      props: { count: 0, label: 'Rot', color: 'red', onUpdate },
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Würfel 3' }));
    expect(onUpdate).toHaveBeenCalledWith(3);
  });

  it('clicking the last active die toggles the count back to 0', async () => {
    const onUpdate = vi.fn();
    render(DiceTrack, {
      props: { count: 2, label: 'Blau', color: 'blue', onUpdate },
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Würfel 2' }));
    expect(onUpdate).toHaveBeenCalledWith(0);
  });

  it('readonly mode blocks updates', async () => {
    const onUpdate = vi.fn();
    render(DiceTrack, {
      props: { count: 1, label: 'Rot', color: 'red', readonly: true, onUpdate },
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Würfel 2' }));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('maxDice limits the rendered buttons', () => {
    render(DiceTrack, {
      props: { count: 0, label: 'Rot', color: 'red', maxDice: 2 },
    });
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
