import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/vue';
import FateAvatar from './FateAvatar.vue';

describe('FateAvatar', () => {
  it('renders nothing without a value', () => {
    const { container } = render(FateAvatar);
    expect(container.querySelector('.fate-avatar')).toBeNull();
  });

  it('renders content with size class and background style when present', () => {
    const { container, getByText } = render(FateAvatar, {
      props: { value: '🗺️', size: 'S', background: 'rgb(1, 2, 3)' },
    });
    expect(getByText('🗺️')).toBeTruthy();
    expect(container.querySelector('.fate-avatar--S')).toBeTruthy();
    expect(container.querySelector('.fate-avatar')?.getAttribute('style')).toContain(
      'rgb(1, 2, 3)',
    );
  });
});
