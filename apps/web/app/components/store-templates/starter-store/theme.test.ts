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
});
