import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge basic tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should merge conditional tailwind classes', () => {
    expect(cn('p-2', false && 'p-4', undefined, null, true && 'p-6')).toBe('p-6');
  });

  it('should merge array of classes', () => {
    expect(cn(['p-2', 'm-2'], ['p-4', 'm-4'])).toBe('p-4 m-4');
  });

  it('should handle object classes', () => {
    expect(cn('p-2', { 'p-4': true, 'm-4': false })).toBe('p-4');
  });

  it('should handle clsx compatible inputs properly', () => {
    expect(cn('text-red-500', { 'bg-blue-500': true }, ['text-lg', 'font-bold'])).toBe('text-red-500 bg-blue-500 text-lg font-bold');
  });
});
