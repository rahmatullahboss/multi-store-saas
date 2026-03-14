/**
 * Theme Selector Component for Settings Page
 *
 * This can be added to app.settings._index.tsx to allow merchants
 * to select their store theme from the available MVP themes.
 */

import { useState } from 'react';
import { Form } from 'react-router';

// Available themes matching the store-registry.ts (18 themes)
const AVAILABLE_THEMES = [
  {
    id: 'starter-store',
    name: 'Starter Store',
    description: 'Clean, minimal design perfect for any business',
    color: '#4F46E5',
  },
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Elegant black and gold for luxury fashion',
    color: '#1a1a1a',
  },
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    description: 'Modern charcoal with rose gold accents',
    color: '#1C1C1E',
  },
  {
    id: 'ozzyl-premium',
    name: 'Ozzyl Premium',
    description: 'Award-winning luxury dark theme with gold accents',
    color: '#C8A961',
  },
  {
    id: 'dc-store',
    name: 'DC Store',
    description: 'Golden gradient theme with warm colors for modern e-commerce',
    color: '#f59e0b',
  },
  {
    id: 'daraz',
    name: 'Daraz Style',
    description: 'Marketplace style design inspired by popular e-commerce platforms',
    color: '#F85606',
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    description: 'Dark mode theme with bold contrast and violet accents',
    color: '#030712',
  },
  {
    id: 'rovo',
    name: 'Rovo',
    description: 'High-fashion luxury store with bold red accents',
    color: '#000000',
  },
  {
    id: 'sokol',
    name: 'Sokol',
    description: 'Modern dark theme with elegant rose accents',
    color: '#0D0D0D',
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description: 'Vibrant marketplace style for grocery and essentials',
    color: '#fc8934',
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Sleek dark theme perfect for electronics and gadgets',
    color: '#0f172a',
  },
  {
    id: 'aurora-minimal',
    name: 'Aurora Minimal',
    description: 'Clean and minimal aesthetic with warm rose gradients',
    color: '#E8C4C4',
  },
  {
    id: 'artisan-market',
    name: 'Artisan Market',
    description: 'Handmade and crafts marketplace design',
    color: '#8B5CF6',
  },
  {
    id: 'freshness',
    name: 'Freshness',
    description: 'Organic and fresh produce store design',
    color: '#10B981',
  },
  {
    id: 'turbo-sale',
    name: 'Turbo Sale',
    description: 'High-conversion flash sale and dropshipping theme',
    color: '#EF4444',
  },
  {
    id: 'zenith-rise',
    name: 'Zenith Rise',
    description: 'SaaS and digital products store design',
    color: '#3B82F6',
  },
  {
    id: 'bdshop',
    name: 'BDShop',
    description: 'Localized design for Bangladeshi e-commerce',
    color: '#1E3A8A',
  },
  {
    id: 'nova-lux-ultra',
    name: 'Nova Lux Ultra',
    description: 'Enhanced version of Nova Lux with more features',
    color: '#1C1C1E',
  },
];

interface ThemeSelectorProps {
  currentTheme: string;
  isSubmitting: boolean;
}

export function ThemeSelector({ currentTheme, isSubmitting }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Store Theme</h2>
          <p className="text-sm text-gray-500">Choose a theme for your storefront</p>
        </div>
      </div>

      <Form method="post" className="space-y-4">
        <input type="hidden" name="theme" value={selectedTheme} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_THEMES.map((theme) => (
            <label
              key={theme.id}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-purple-300 ${
                selectedTheme === theme.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={theme.id}
                checked={selectedTheme === theme.id}
                onChange={() => setSelectedTheme(theme.id)}
                className="sr-only"
              />
              <div className="space-y-3">
                <div className="h-20 rounded-md" style={{ backgroundColor: theme.color }} />
                <div>
                  <p className="font-medium text-gray-900">{theme.name}</p>
                  <p className="text-sm text-gray-600">{theme.description}</p>
                </div>
                {selectedTheme === theme.id && (
                  <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded">
                    Active
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </Form>
    </div>
  );
}

export { AVAILABLE_THEMES };
