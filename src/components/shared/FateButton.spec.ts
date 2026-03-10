import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import FateButton from './FateButton.vue'

describe('FateButton', () => {
  it('renders a button element', () => {
    const { container } = render(FateButton)
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('has default type="button"', () => {
    const { container } = render(FateButton)
    expect(container.querySelector('button')!.getAttribute('type')).toBe('button')
  })

  it('has the base fate-btn class', () => {
    const { container } = render(FateButton)
    expect(container.querySelector('button')!.classList.contains('fate-btn')).toBe(true)
  })

  it('applies the primary variant class by default', () => {
    const { container } = render(FateButton)
    expect(container.querySelector('button')!.classList.contains('fate-btn--primary')).toBe(true)
  })

  it('applies the correct variant class', () => {
    const { container } = render(FateButton, { props: { variant: 'danger' } })
    const btn = container.querySelector('button')!
    expect(btn.classList.contains('fate-btn--danger')).toBe(true)
    expect(btn.classList.contains('fate-btn--primary')).toBe(false)
  })

  it('applies fate-btn--sm when size is sm', () => {
    const { container } = render(FateButton, { props: { size: 'sm' } })
    expect(container.querySelector('button')!.classList.contains('fate-btn--sm')).toBe(true)
  })

  it('does not apply fate-btn--sm for default size', () => {
    const { container } = render(FateButton)
    expect(container.querySelector('button')!.classList.contains('fate-btn--sm')).toBe(false)
  })

  it('renders slot content', () => {
    render(FateButton, { slots: { default: 'Click me' } })
    expect(screen.getByText('Click me')).toBeTruthy()
  })

  it('respects type="submit"', () => {
    const { container } = render(FateButton, { props: { type: 'submit' } })
    expect(container.querySelector('button')!.getAttribute('type')).toBe('submit')
  })

  it('calls onClick handler when clicked', async () => {
    const onClick = vi.fn()
    render(FateButton, { props: { onClick }, slots: { default: 'Press' } })
    await fireEvent.click(screen.getByText('Press'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
