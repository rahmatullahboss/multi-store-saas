import { describe, expect, it } from 'vitest';
import {
  deserializeMVPSettings,
  isValidMVPTheme,
  serializeMVPSettings,
  validateMVPSettings,
} from '~/config/mvp-theme-settings';

describe('mvp-theme-settings', () => {
  it('persists announcement fields through serialize/deserialize', () => {
    const serialized = serializeMVPSettings({
      themeId: 'starter-store',
      storeName: 'Demo',
      logo: null,
      favicon: null,
      primaryColor: '#111111',
      accentColor: '#222222',
      showAnnouncement: true,
      announcementText: 'Free delivery today',
    });

    const parsed = deserializeMVPSettings(serialized);

    expect(parsed).toBeTruthy();
    expect(parsed?.showAnnouncement).toBe(true);
    expect(parsed?.announcementText).toBe('Free delivery today');
  });

  it('validates the three active theme ids', () => {
    expect(isValidMVPTheme('starter-store')).toBe(true);
    expect(isValidMVPTheme('nova-lux')).toBe(true);
    expect(isValidMVPTheme('luxe-boutique')).toBe(true);
    expect(isValidMVPTheme('ghorer-bazar')).toBe(false);
    expect(isValidMVPTheme('tech-modern')).toBe(false);
  });

  it('falls back to theme defaults for invalid colors', () => {
    const validated = validateMVPSettings(
      {
        storeName: 'Store',
        primaryColor: 'invalid',
        accentColor: 'bad',
      },
      'nova-lux'
    );

    expect(validated.primaryColor).toBe('#1C1C1E');
    expect(validated.accentColor).toBe('#C4A35A');
  });
});
