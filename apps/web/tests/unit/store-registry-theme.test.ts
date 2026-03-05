import { describe, expect, it } from 'vitest';
import { resolveStoreTheme } from '~/templates/store-registry';

describe('resolveStoreTheme', () => {
  it('falls back to template default when primaryColor is null', () => {
    const { theme } = resolveStoreTheme(
      { storeTemplateId: 'starter-store', primaryColor: null },
      null
    );
    // Should use the template default, not null
    expect(theme.primary).toBeTruthy();
    expect(theme.primary).not.toBe('null');
  });

  it('falls back to template default when primaryColor is undefined', () => {
    const { theme } = resolveStoreTheme(
      { storeTemplateId: 'starter-store' },
      null
    );
    expect(theme.primary).toBeTruthy();
  });

  it('falls back to template default when primaryColor is empty string', () => {
    const { theme } = resolveStoreTheme(
      { storeTemplateId: 'starter-store', primaryColor: '' },
      null
    );
    expect(theme.primary).toBeTruthy();
    expect(theme.primary).not.toBe('');
  });

  it('preserves explicit merchant color over template default', () => {
    const { theme } = resolveStoreTheme(
      { storeTemplateId: 'starter-store', primaryColor: '#000000' },
      null
    );
    expect(theme.primary).toBe('#000000');
  });

  it('preserves all explicit merchant colors', () => {
    const { theme } = resolveStoreTheme(
      {
        storeTemplateId: 'starter-store',
        primaryColor: '#111111',
        accentColor: '#222222',
        backgroundColor: '#333333',
        textColor: '#444444',
        borderColor: '#555555',
      },
      null
    );
    expect(theme.primary).toBe('#111111');
    expect(theme.accent).toBe('#222222');
    expect(theme.background).toBe('#333333');
    expect(theme.text).toBe('#444444');
    expect(theme.cardBorder).toBe('#555555');
  });

  it('resolves template id from themeConfig', () => {
    const { storeTemplateId } = resolveStoreTheme(
      { storeTemplateId: 'nova-lux' },
      null
    );
    expect(storeTemplateId).toBe('nova-lux');
  });

  it('ignores legacy theme id fallback and keeps MVP default', () => {
    const { storeTemplateId } = resolveStoreTheme({}, 'luxe-boutique');
    expect(storeTemplateId).toBe('starter-store');
  });

  it('falls back to starter-store when no theme info provided', () => {
    const { storeTemplateId, theme } = resolveStoreTheme({}, null);
    expect(storeTemplateId).toBe('starter-store');
    expect(theme.primary).toBeTruthy();
  });
});
