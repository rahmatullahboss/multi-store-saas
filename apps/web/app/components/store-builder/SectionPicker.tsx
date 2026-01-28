/**
 * Section Picker - Shopify OS 2.0 Style
 *
 * A modal component for selecting and adding sections to the page.
 * Supports section presets (like Shopify's "Add section" feature).
 */

import { useState, useMemo } from 'react';
import {
  X,
  Search,
  Layout,
  Grid,
  Image,
  ShoppingBag,
  Star,
  Award,
  MessageSquare,
  Truck,
  ChevronRight,
} from 'lucide-react';
import type {
  SectionRegistry,
  SectionSchema,
  SectionPreset,
  SectionInstance,
  BlockInstance,
} from '~/lib/theme-engine/types';

// ============================================================================
// TYPES
// ============================================================================

interface SectionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: SectionInstance) => void;
  sectionRegistry: SectionRegistry;
  existingSections: SectionInstance[];
}

interface SectionCategory {
  id: string;
  name: string;
  nameBn: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_CATEGORIES: SectionCategory[] = [
  { id: 'all', name: 'All sections', nameBn: 'সব সেকশন', icon: Grid },
  { id: 'header-footer', name: 'Header & Footer', nameBn: 'হেডার ও ফুটার', icon: Layout },
  { id: 'hero', name: 'Hero & Banners', nameBn: 'হিরো ও ব্যানার', icon: Image },
  { id: 'products', name: 'Products', nameBn: 'প্রোডাক্ট', icon: ShoppingBag },
  { id: 'content', name: 'Content', nameBn: 'কন্টেন্ট', icon: MessageSquare },
  { id: 'trust', name: 'Trust & Social', nameBn: 'ট্রাস্ট ও সোশ্যাল', icon: Award },
  { id: 'promo', name: 'Promotions', nameBn: 'প্রমোশন', icon: Star },
];

// Map section types to categories
const SECTION_CATEGORY_MAP: Record<string, string> = {
  'announcement-bar': 'header-footer',
  header: 'header-footer',
  footer: 'header-footer',
  'hero-banner': 'hero',
  'sale-banner': 'promo',
  'categories-grid': 'products',
  'featured-collection': 'products',
  'trust-badges': 'trust',
};

// Icon mapping for sections
const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'announcement-bar': MessageSquare,
  header: Layout,
  footer: Layout,
  'hero-banner': Image,
  'sale-banner': Star,
  'categories-grid': Grid,
  'featured-collection': ShoppingBag,
  'trust-badges': Award,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateSectionId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function createSectionInstance(
  type: string,
  schema: SectionSchema,
  preset?: SectionPreset
): SectionInstance {
  // Get default settings from schema
  const defaultSettings: Record<string, unknown> = {};
  for (const setting of schema.settings) {
    if (setting.id && setting.default !== undefined) {
      defaultSettings[setting.id] = setting.default;
    }
  }

  // Apply preset settings on top of defaults
  const settings = preset?.settings ? { ...defaultSettings, ...preset.settings } : defaultSettings;

  // Create blocks from preset or schema defaults
  let blocks: BlockInstance[] = [];
  const blockSource = preset?.blocks || schema.default?.blocks;

  if (blockSource && schema.blocks) {
    blocks = blockSource.map((blockConfig, index) => {
      const blockDef = schema.blocks!.find((b) => b.type === blockConfig.type);
      const blockDefaultSettings: Record<string, unknown> = {};

      if (blockDef) {
        for (const setting of blockDef.settings) {
          if (setting.id && setting.default !== undefined) {
            blockDefaultSettings[setting.id] = setting.default;
          }
        }
      }

      return {
        id: `${blockConfig.type}-${index}-${Date.now()}`,
        type: blockConfig.type,
        settings: { ...blockDefaultSettings, ...blockConfig.settings },
      };
    });
  }

  return {
    id: generateSectionId(type),
    type,
    settings,
    blocks: blocks.length > 0 ? blocks : undefined,
    block_order: blocks.length > 0 ? blocks.map((b) => b.id) : undefined,
  };
}

// ============================================================================
// SECTION CARD COMPONENT
// ============================================================================

function SectionCard({
  type,
  schema,
  onSelect,
  existingCount,
}: {
  type: string;
  schema: SectionSchema;
  onSelect: (preset?: SectionPreset) => void;
  existingCount: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = SECTION_ICONS[type] || Layout;

  const isLimitReached = schema.limit !== undefined && existingCount >= schema.limit;
  const hasPresets = schema.presets && schema.presets.length > 0;

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        isLimitReached
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-sm bg-white'
      }`}
    >
      <button
        onClick={() => {
          if (isLimitReached) return;
          if (hasPresets) {
            setIsExpanded(!isExpanded);
          } else {
            onSelect();
          }
        }}
        disabled={isLimitReached}
        className="w-full p-3 text-left flex items-center gap-3"
      >
        <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-gray-100' : 'bg-purple-50'}`}>
          <Icon className={`w-5 h-5 ${isLimitReached ? 'text-gray-400' : 'text-purple-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-sm truncate ${
              isLimitReached ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            {schema.name}
          </h3>
          {schema.limit && (
            <p className="text-xs text-gray-400">
              {existingCount}/{schema.limit} used
            </p>
          )}
        </div>
        {hasPresets && !isLimitReached && (
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>

      {/* Presets dropdown */}
      {isExpanded && hasPresets && (
        <div className="border-t bg-gray-50 p-2 space-y-1">
          {/* Default (no preset) */}
          <button
            onClick={() => onSelect()}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-purple-100 text-sm text-gray-700"
          >
            Default
          </button>
          {/* Preset options */}
          {schema.presets!.map((preset, index) => (
            <button
              key={index}
              onClick={() => onSelect(preset)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-purple-100 text-sm text-gray-700"
            >
              {preset.name}
              {preset.category && (
                <span className="ml-2 text-xs text-gray-400">({preset.category})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SectionPicker({
  isOpen,
  onClose,
  onAddSection,
  sectionRegistry,
  existingSections,
}: SectionPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Count existing sections by type
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const section of existingSections) {
      counts[section.type] = (counts[section.type] || 0) + 1;
    }
    return counts;
  }, [existingSections]);

  // Filter sections based on search and category
  const filteredSections = useMemo(() => {
    const sections = Object.entries(sectionRegistry);

    return sections.filter(([type, { schema }]) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!schema.name.toLowerCase().includes(query) && !type.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (activeCategory !== 'all') {
        const sectionCategory = SECTION_CATEGORY_MAP[type] || 'content';
        if (sectionCategory !== activeCategory) {
          return false;
        }
      }

      return true;
    });
  }, [sectionRegistry, searchQuery, activeCategory]);

  const handleSelectSection = (type: string, schema: SectionSchema, preset?: SectionPreset) => {
    const section = createSectionInstance(type, schema, preset);
    onAddSection(section);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-picker-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <h2 id="section-picker-title" className="font-bold text-lg text-gray-900">
            Add Section
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-48 border-r bg-gray-50 p-2 overflow-y-auto shrink-0">
            {SECTION_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${
                    activeCategory === category.id
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span className="truncate">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sections Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <Grid className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sections found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredSections.map(([type, { schema }]) => (
                  <SectionCard
                    key={type}
                    type={type}
                    schema={schema}
                    existingCount={sectionCounts[type] || 0}
                    onSelect={(preset) => handleSelectSection(type, schema, preset)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Select a section to add it to your page. Some sections have presets with pre-configured
            content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SectionPicker;
