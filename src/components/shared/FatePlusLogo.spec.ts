import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FatePlusLogo from './FatePlusLogo.vue';

describe('FatePlusLogo', () => {
  it('renders a span with the fate-plus-logo class', () => {
    const { container } = render(FatePlusLogo);
    expect(container.querySelector('.fate-plus-logo')).toBeTruthy();
  });

  it('renders the FATE text', () => {
    render(FatePlusLogo);
    expect(screen.getByText(/FATE/)).toBeTruthy();
  });

  it('renders the + symbol', () => {
    const { container } = render(FatePlusLogo);
    expect(container.querySelector('.fate-plus-logo__plus')?.textContent).toBe('+');
  });
});
