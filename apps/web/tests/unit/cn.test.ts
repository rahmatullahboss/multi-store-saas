import { describe, it, expect } from 'vitest';
import { cn } from '~/utils/cn';

describe('cn utility function', () => {
  it('should merge basic class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should conditionally apply class names using an object', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn({
      'text-red-500': isActive,
      'bg-gray-200': isDisabled,
    });
    expect(result).toBe('text-red-500');
  });

  it('should filter out falsy values like undefined, null, false', () => {
    const result = cn('text-red-500', undefined, null, false, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should properly merge conflicting tailwind classes', () => {
    const result = cn('px-2 py-1 bg-red-500', 'p-3 bg-[#B91C1C]');
    // twMerge should override padding and bg color
    expect(result).toBe('p-3 bg-[#B91C1C]');
  });

  it('should handle array of class names correctly', () => {
    const classes = ['text-sm', 'font-bold'];
    const result = cn(classes, 'text-gray-900');
    expect(result).toBe('text-sm font-bold text-gray-900');
  });
});
