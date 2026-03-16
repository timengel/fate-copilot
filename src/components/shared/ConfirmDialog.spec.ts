import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/vue';
import ConfirmDialog from './ConfirmDialog.vue';

const defaultProps = { title: 'Confirm?', message: 'Are you sure?' };

describe('ConfirmDialog', () => {
  it('renders the title', () => {
    render(ConfirmDialog, { props: defaultProps });
    expect(screen.getByText('Confirm?')).toBeTruthy();
  });

  it('renders the message', () => {
    render(ConfirmDialog, { props: defaultProps });
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(ConfirmDialog, { props: { ...defaultProps, onConfirm } });
    await fireEvent.click(screen.getByText('Bestätigen'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(ConfirmDialog, { props: { ...defaultProps, onCancel } });
    await fireEvent.click(screen.getByText('Abbrechen'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when clicking the overlay background', async () => {
    const onCancel = vi.fn();
    const { container } = render(ConfirmDialog, { props: { ...defaultProps, onCancel } });
    await fireEvent.click(container.querySelector('.dialog-overlay')!);
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
