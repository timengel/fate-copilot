import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function useMarkdown() {
  function renderMarkdown(text: string | undefined): string {
    if (!text?.trim()) return '';
    return DOMPurify.sanitize(marked.parse(text) as string);
  }

  return { renderMarkdown };
}
