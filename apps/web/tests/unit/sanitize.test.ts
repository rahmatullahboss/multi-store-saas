import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../app/utils/sanitize';

describe('sanitizeHtml', () => {
  it('allows safe tags and attributes', () => {
    const html = '<span class="text-red-500" id="safe">Hello</span> <b>World</b>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes script tags completely', () => {
    const html = '<div>Hello <script>alert("XSS")</script>World</div>';
    expect(sanitizeHtml(html)).toBe('<div>Hello World</div>');
  });

  it('removes style tags completely', () => {
    const html = '<style>body { background: red; }</style><p>Text</p>';
    expect(sanitizeHtml(html)).toBe('<p>Text</p>');
  });

  it('removes unsafe attributes', () => {
    const html = '<div onclick="alert(1)" class="safe">Test</div>';
    expect(sanitizeHtml(html)).toBe('<div class="safe">Test</div>');
  });

  it('removes unsafe tags but keeps inner text', () => {
    const html = '<marquee>Scrolling</marquee>';
    expect(sanitizeHtml(html)).toBe('Scrolling'); // Assuming our regex strips the tag and keeps inner content, actually let's test what it does.
  });

  it('removes iframe tags completely', () => {
    const html = '<iframe src="javascript:alert(1)"></iframe>';
    expect(sanitizeHtml(html)).toBe('');
  });

  it('handles null or undefined gracefully', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
