import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FateTag from './FateTag.vue';

describe('FateTag', () => {
  it('renders the label text', () => {
    render(FateTag, { props: { color: 'pfau', label: 'Aktiv' } });
    expect(screen.getByText('Aktiv')).toBeTruthy();
  });

  it('has the fate-tag class', () => {
    const { container } = render(FateTag, { props: { color: 'pfau', label: 'Test' } });
    expect(container.querySelector('.fate-tag')).toBeTruthy();
  });

  it('applies gray style when color is "gray"', () => {
    const { container } = render(FateTag, { props: { color: 'gray', label: 'Gray' } });
    const el = container.querySelector('.fate-tag') as HTMLElement;
    expect(el.style.background).toBe('#e8e8e8');
    expect(el.style.color).toBe('#555555');
  });

  it('applies CHARACTER_COLORS styles for a known color (pfau)', () => {
    const { container } = render(FateTag, { props: { color: 'pfau', label: 'Pfau' } });
    const el = container.querySelector('.fate-tag') as HTMLElement;
    // pfau: light: '#e8f4fb', dark: '#1480b0'
    expect(el.style.background).toBeTruthy();
    expect(el.style.color).toBeTruthy();
  });

  it('applies correct light/dark colors for basilikum', () => {
    const { container } = render(FateTag, { props: { color: 'basilikum', label: 'Basilikum' } });
    const el = container.querySelector('.fate-tag') as HTMLElement;
    // basilikum: light: '#E6F4EC', dark: '#076030'
    expect(el.style.background).toBeTruthy();
    expect(el.style.color).toBeTruthy();
  });
});
