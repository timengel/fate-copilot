import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import FateCard from './FateCard.vue';

describe('FateCard', () => {
  it('renders title, avatar, body, meta, and actions', () => {
    render(FateCard, {
      props: {
        title: 'Mittelerde',
        avatar: '🗺️',
        color: 'pfau',
      },
      slots: {
        default: 'Epische Reise',
        meta: '<span>3 SC</span>',
        actions: '<button>Bearbeiten</button>',
      },
    });

    expect(screen.getByText('Mittelerde')).toBeTruthy();
    expect(screen.getByText('🗺️')).toBeTruthy();
    expect(screen.getByText('Epische Reise')).toBeTruthy();
    expect(screen.getByText('3 SC')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bearbeiten' })).toBeTruthy();
  });

  it('emits click when the main card area is clicked', async () => {
    const onClick = vi.fn();

    const { container } = render(FateCard, {
      props: {
        title: 'Card',
        clickable: true,
        onClick,
      },
    });

    await fireEvent.click(container.querySelector('.fate-card__main')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not emit click when an actions button is clicked', async () => {
    const onClick = vi.fn();
    const onAction = vi.fn();

    render(FateCard, {
      props: {
        title: 'Card',
        clickable: true,
        onClick,
      },
      slots: {
        actions: '<button data-testid="action">Aktion</button>',
      },
    });

    const actionButton = screen.getByTestId('action');
    actionButton.addEventListener('click', onAction);
    await fireEvent.click(actionButton);

    expect(onAction).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the built-in badge when badgeLabel is provided', () => {
    render(FateCard, {
      props: {
        title: 'Gegenstand',
        badgeLabel: 'GM',
        badgeVariant: 'gm',
      },
    });

    expect(screen.getByText('GM')).toBeTruthy();
  });
});
