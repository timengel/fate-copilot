import { describe, it, expect } from 'vitest';
import { useMarkdown } from './useMarkdown';

describe('useMarkdown', () => {
  const { renderMarkdown } = useMarkdown();

  describe('empty/falsy inputs', () => {
    it('returns empty string for undefined', () => {
      expect(renderMarkdown(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(renderMarkdown('')).toBe('');
    });

    it('returns empty string for whitespace-only string', () => {
      expect(renderMarkdown('   ')).toBe('');
    });
  });

  describe('markdown rendering', () => {
    it('renders bold text', () => {
      const result = renderMarkdown('**bold**');
      expect(result).toContain('<strong>bold</strong>');
    });

    it('renders italic text', () => {
      const result = renderMarkdown('*italic*');
      expect(result).toContain('<em>italic</em>');
    });

    it('renders unordered list', () => {
      const result = renderMarkdown('- item one\n- item two');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>item one</li>');
      expect(result).toContain('<li>item two</li>');
    });

    it('renders ordered list', () => {
      const result = renderMarkdown('1. first\n2. second');
      expect(result).toContain('<ol>');
      expect(result).toContain('<li>first</li>');
      expect(result).toContain('<li>second</li>');
    });

    it('renders heading', () => {
      const result = renderMarkdown('## Heading');
      expect(result).toContain('<h2>Heading</h2>');
    });

    it('renders inline code', () => {
      const result = renderMarkdown('use `code` here');
      expect(result).toContain('<code>code</code>');
    });

    it('renders paragraph text', () => {
      const result = renderMarkdown('Hello world');
      expect(result).toContain('Hello world');
    });
  });

  describe('XSS sanitization', () => {
    it('strips script tags', () => {
      const result = renderMarkdown('<script>alert("xss")</script>text');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('strips javascript: hrefs', () => {
      const result = renderMarkdown('[click](javascript:alert(1))');
      expect(result).not.toContain('javascript:');
    });

    it('strips onerror attributes', () => {
      const result = renderMarkdown('<img src="x" onerror="alert(1)">');
      expect(result).not.toContain('onerror');
    });
  });
});
