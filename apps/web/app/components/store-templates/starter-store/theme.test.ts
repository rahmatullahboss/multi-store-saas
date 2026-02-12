import { describe, expect, it } from 'vitest';
import { resolveStarterStoreTheme, STARTER_STORE_THEME } from './theme';

describe('resolveStarterStoreTheme', () => {
  it('does not throw when config is undefined', () => {
    expect(() => resolveStarterStoreTheme(undefined, undefined)).not.toThrow();
  });

  it('falls back to derived secondary color when config/theme secondary is missing', () => {
    const resolved = resolveStarterStoreTheme(undefined, undefined);
    expect(resolved.secondary).toBeTruthy();
    expect(resolved.secondary).not.toBe(STARTER_STORE_THEME.primary);
  });

  it('prefers merchant config colors over template theme colors', () => {
    const resolved = resolveStarterStoreTheme(
      {
        primaryColor: '#4f46e5',
        accentColor: '#ec4899',
        textColor: '#1f2937',
      } as any,
      {
        ...STARTER_STORE_THEME,
        primary: '#111827',
        accent: '#111827',
        text: '#111827',
      }
    );

    expect(resolved.primary).toBe('#4f46e5');
    expect(resolved.accent).toBe('#ec4899');
    expect(resolved.text).toBe('#1f2937');
  });
});
