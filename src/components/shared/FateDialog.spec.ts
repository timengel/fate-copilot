import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import FateDialog from './FateDialog.vue';

describe('FateDialog', () => {
  it('renders only when open=true', async () => {
    const { queryByRole, rerender } = render(FateDialog, {
      props: {
        open: false,
        ariaLabel: 'Test Dialog',
      },
      slots: {
        default: '<div>Dialog Inhalt</div>',
      },
    });

    expect(queryByRole('dialog', { name: 'Test Dialog' })).toBeNull();

    await rerender({ open: true, ariaLabel: 'Test Dialog' });
    expect(screen.getByRole('dialog', { name: 'Test Dialog' })).toBeTruthy();
    expect(screen.getByText('Dialog Inhalt')).toBeTruthy();
  });

  it('emits close on backdrop click', async () => {
    const { emitted, container } = render(FateDialog, {
      props: {
        open: true,
        ariaLabel: 'Test Dialog',
      },
      slots: {
        default: '<button>Inner Button</button>',
      },
    });

    const overlay = container.ownerDocument.body.querySelector(
      '.fate-dialog-overlay',
    ) as HTMLElement;
    await fireEvent.click(overlay);

    expect(emitted('close')).toHaveLength(1);
  });

  it('emits close on Escape key', async () => {
    const { emitted } = render(FateDialog, {
      props: {
        open: true,
        ariaLabel: 'Test Dialog',
      },
      slots: {
        default: '<div>Dialog Inhalt</div>',
      },
    });

    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(emitted('close')).toHaveLength(1);
  });

  it('teleports to document body', () => {
    const { container } = render(FateDialog, {
      props: {
        open: true,
        ariaLabel: 'Test Dialog',
      },
      slots: {
        default: '<div>Dialog Inhalt</div>',
      },
    });

    expect(container.querySelector('.fate-dialog-overlay')).toBeNull();
    expect(container.ownerDocument.body.querySelector('.fate-dialog-overlay')).toBeTruthy();
  });
});
