import { describe, expect, it } from 'vitest';
import {
  MVP_STORE_TEMPLATES,
  getStoreTemplate,
  getStoreTemplateTheme,
} from '~/templates/store-registry';

describe('store-registry active themes', () => {
  const activeThemeIds = ['starter-store', 'nova-lux', 'luxe-boutique'] as const;

  it('contains all active themes in MVP templates list', () => {
    const ids = new Set(MVP_STORE_TEMPLATES.map((t) => t.id));
    for (const themeId of activeThemeIds) {
      expect(ids.has(themeId)).toBe(true);
    }
  });

  it('resolves template and colors for each active theme', () => {
    for (const themeId of activeThemeIds) {
      const template = getStoreTemplate(themeId);
      const colors = getStoreTemplateTheme(themeId);

      expect(template.id).toBe(themeId);
      expect(template.component).toBeTruthy();
      expect(template.Header).toBeTruthy();
      expect(template.Footer).toBeTruthy();

      expect(colors.primary).toBeTruthy();
      expect(colors.accent).toBeTruthy();
      expect(colors.background).toBeTruthy();
      expect(colors.text).toBeTruthy();
    }
  });
});

