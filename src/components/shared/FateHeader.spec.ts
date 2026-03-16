import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import FateHeader from './FateHeader.vue';

describe('FateHeader', () => {
  it('renders an h1 with the given title', () => {
    render(FateHeader, { props: { title: 'Kampagnen' } });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Kampagnen');
  });

  it('renders slot content', () => {
    render(FateHeader, {
      props: { title: 'Test' },
      slots: { default: '<button>+ Neu</button>' },
    });
    expect(screen.getByRole('button', { name: '+ Neu' })).toBeTruthy();
  });

  it('renders without slot content', () => {
    const { container } = render(FateHeader, { props: { title: 'Einstellungen' } });
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('has the fate-header wrapper class', () => {
    const { container } = render(FateHeader, { props: { title: 'Test' } });
    expect(container.querySelector('.fate-header')).toBeTruthy();
  });
});
