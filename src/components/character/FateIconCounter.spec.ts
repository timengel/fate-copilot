import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import FateIconCounter from './FateIconCounter.vue';

describe('FateIconCounter', () => {
  it('renders the label', () => {
    render(FateIconCounter, { props: { count: 0, label: 'PURER SCHADEN' } });
    expect(screen.getByText('PURER SCHADEN')).toBeTruthy();
  });

  it('displays positive count with + prefix in the badge', () => {
    const { container } = render(FateIconCounter, {
      props: { count: 3, label: 'Test' },
    });
    expect(container.querySelector('.icon-count')!.textContent).toBe('+3');
  });

  it('displays negative count with - prefix in the badge', () => {
    const { container } = render(FateIconCounter, {
      props: { count: -2, label: 'Test', min: -8 },
    });
    expect(container.querySelector('.icon-count')!.textContent).toBe('-2');
  });

  it('displays 0 as "0" in the badge', () => {
    const { container } = render(FateIconCounter, {
      props: { count: 0, label: 'Test' },
    });
    expect(container.querySelector('.icon-count')!.textContent).toBe('0');
  });

  it('renders the correct number of icons', () => {
    const { container } = render(FateIconCounter, {
      props: { count: 4, label: 'Test' },
    });
    expect(container.querySelectorAll('.icon-item')).toHaveLength(4);
  });

  it('renders no icons when count is 0', () => {
    const { container } = render(FateIconCounter, {
      props: { count: 0, label: 'Test' },
    });
    expect(container.querySelectorAll('.icon-item')).toHaveLength(0);
  });

  it('renders the correct number of icons for a negative count', () => {
    const { container } = render(FateIconCounter, {
      props: { count: -3, label: 'Test', min: -8 },
    });
    expect(container.querySelectorAll('.icon-item')).toHaveLength(3);
  });

  it('emits update with count+1 when + is clicked', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: 3, label: 'Test', onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Erhöhen' }));
    expect(onUpdate).toHaveBeenCalledWith(4);
  });

  it('emits update with count-1 when − is clicked', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: 3, label: 'Test', onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Verringern' }));
    expect(onUpdate).toHaveBeenCalledWith(2);
  });

  it('does not emit when − is clicked while disabled at minimum', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: 0, label: 'Test', onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Verringern' }));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('minus button is disabled at 0', () => {
    render(FateIconCounter, { props: { count: 0, label: 'Test' } });
    const btn = screen.getByRole('button', { name: 'Verringern' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('does not emit when + is clicked while disabled at max', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: 8, label: 'Test', onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Erhöhen' }));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('plus button is disabled at max', () => {
    render(FateIconCounter, { props: { count: 8, label: 'Test' } });
    const btn = screen.getByRole('button', { name: 'Erhöhen' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('minus button is disabled at custom min', () => {
    render(FateIconCounter, { props: { count: -8, label: 'Test', min: -8 } });
    const btn = screen.getByRole('button', { name: 'Verringern' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('emits correct value when decrementing into negatives', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: 0, label: 'Test', min: -8, onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Verringern' }));
    expect(onUpdate).toHaveBeenCalledWith(-1);
  });

  it('does not emit when − is clicked at custom min', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, { props: { count: -8, label: 'Test', min: -8, onUpdate } });
    await fireEvent.click(screen.getByRole('button', { name: 'Verringern' }));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('respects a custom max prop — plus is disabled and does not emit at that max', async () => {
    const onUpdate = vi.fn();
    render(FateIconCounter, {
      props: { count: 5, label: 'Test', max: 5, onUpdate },
    });
    const btn = screen.getByRole('button', { name: 'Erhöhen' }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await fireEvent.click(btn);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  describe('readonly mode', () => {
    it('hides the increment and decrement buttons', () => {
      render(FateIconCounter, {
        props: { count: 3, label: 'Test', readonly: true },
      });
      expect(screen.queryByRole('button', { name: 'Erhöhen' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Verringern' })).toBeNull();
    });

    it('still shows the count badge with + prefix', () => {
      const { container } = render(FateIconCounter, {
        props: { count: 3, label: 'Test', readonly: true },
      });
      expect(container.querySelector('.icon-count')!.textContent).toBe('+3');
    });

    it('still shows the icons', () => {
      const { container } = render(FateIconCounter, {
        props: { count: 3, label: 'Test', readonly: true },
      });
      expect(container.querySelectorAll('.icon-item')).toHaveLength(3);
    });
  });

  describe('color prop', () => {
    it('applies the blue class for color=blue', () => {
      const { container } = render(FateIconCounter, {
        props: { count: 0, label: 'Test', color: 'blue' },
      });
      expect(container.querySelector('.icon-counter')!.classList.contains('blue')).toBe(true);
    });

    it('applies the red class for color=red', () => {
      const { container } = render(FateIconCounter, {
        props: { count: 0, label: 'Test', color: 'red' },
      });
      expect(container.querySelector('.icon-counter')!.classList.contains('red')).toBe(true);
    });

    it('applies no color class when color is not set', () => {
      const { container } = render(FateIconCounter, {
        props: { count: 0, label: 'Test' },
      });
      const el = container.querySelector('.icon-counter')!;
      expect(el.classList.contains('blue')).toBe(false);
      expect(el.classList.contains('red')).toBe(false);
    });
  });
});
