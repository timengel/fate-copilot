import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import FateIcon from './FateIcon.vue';

describe('FateIcon', () => {
  describe('SVG element', () => {
    it('renders an svg element', () => {
      const { container } = render(FateIcon, { props: { name: 'add' } });
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('defaults width and height to 16', () => {
      const { container } = render(FateIcon, { props: { name: 'add' } });
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('width')).toBe('16');
      expect(svg.getAttribute('height')).toBe('16');
    });

    it('uses given size for width and height', () => {
      const { container } = render(FateIcon, { props: { name: 'add', size: 24 } });
      const svg = container.querySelector('svg')!;
      expect(svg.getAttribute('width')).toBe('24');
      expect(svg.getAttribute('height')).toBe('24');
    });

    it('sets aria-hidden="true"', () => {
      const { container } = render(FateIcon, { props: { name: 'add' } });
      expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('icon rendering', () => {
    it('renders delete icon with a polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'delete' } });
      expect(container.querySelector('polyline')).toBeTruthy();
    });

    it('renders edit icon with two paths', () => {
      const { container } = render(FateIcon, { props: { name: 'edit' } });
      expect(container.querySelectorAll('path').length).toBe(2);
    });

    it('renders archive icon with three paths', () => {
      const { container } = render(FateIcon, { props: { name: 'archive' } });
      expect(container.querySelectorAll('path').length).toBe(3);
    });

    it('renders unarchive icon with three paths', () => {
      const { container } = render(FateIcon, { props: { name: 'unarchive' } });
      expect(container.querySelectorAll('path').length).toBe(3);
    });

    it('renders minus icon with one line', () => {
      const { container } = render(FateIcon, { props: { name: 'minus' } });
      expect(container.querySelectorAll('line').length).toBe(1);
    });

    it('renders plus icon with two lines', () => {
      const { container } = render(FateIcon, { props: { name: 'plus' } });
      expect(container.querySelectorAll('line').length).toBe(2);
    });

    it('renders add icon with two lines', () => {
      const { container } = render(FateIcon, { props: { name: 'add' } });
      expect(container.querySelectorAll('line').length).toBe(2);
    });

    it('renders close icon with two lines', () => {
      const { container } = render(FateIcon, { props: { name: 'close' } });
      expect(container.querySelectorAll('line').length).toBe(2);
    });

    it('renders check icon with a polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'check' } });
      expect(container.querySelector('polyline')).toBeTruthy();
    });

    it('renders info icon with a circle', () => {
      const { container } = render(FateIcon, { props: { name: 'info' } });
      expect(container.querySelector('circle')).toBeTruthy();
    });

    it('renders arrow-left icon with a line and polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'arrow-left' } });
      expect(container.querySelector('line')).toBeTruthy();
      expect(container.querySelector('polyline')).toBeTruthy();
    });

    it('renders arrow-right icon with a line and polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'arrow-right' } });
      expect(container.querySelector('line')).toBeTruthy();
      expect(container.querySelector('polyline')).toBeTruthy();
    });

    it('renders download icon with a path and polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'download' } });
      expect(container.querySelector('path')).toBeTruthy();
      expect(container.querySelector('polyline')).toBeTruthy();
    });

    it('renders upload icon with a path and polyline', () => {
      const { container } = render(FateIcon, { props: { name: 'upload' } });
      expect(container.querySelector('path')).toBeTruthy();
      expect(container.querySelector('polyline')).toBeTruthy();
    });
  });
});
