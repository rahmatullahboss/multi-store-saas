/**
 * Variant Manager Component
 * 
 * Reusable component for managing product variants (size, color, etc.)
 * Used in both product creation and editing forms.
 * 
 * Features:
 * - Category-based dynamic variant suggestions
 * - All variant options available with Bengali translations
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Sparkles } from 'lucide-react';

export interface Variant {
  id?: number;
  option1Name: string;
  option1Value: string;
  option2Name?: string;
  option2Value?: string;
  price?: number;
  costPrice?: number; // P&L: per-variant cost override
  sku?: string;
  inventory?: number;
}

interface VariantManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  basePrice: number;
  category?: string; // Selected product category
}

// ============================================================================
// CATEGORY-BASED VARIANT OPTIONS MAPPING
// ============================================================================
const CATEGORY_VARIANT_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  'Electronics': {
    primary: ['Model', 'Color', 'Storage', 'Memory'],
    secondary: ['Color', 'Type', 'Size'],
  },
  'Clothing': {
    primary: ['Size', 'Color'],
    secondary: ['Color', 'Material', 'Style', 'Pattern'],
  },
  'Home & Garden': {
    primary: ['Size', 'Color', 'Material'],
    secondary: ['Color', 'Style', 'Pattern'],
  },
  'Sports': {
    primary: ['Size', 'Color'],
    secondary: ['Color', 'Material', 'Type'],
  },
  'Books': {
    primary: ['Type', 'Language'],
    secondary: ['Format'],
  },
  'Toys': {
    primary: ['Size', 'Color', 'Type'],
    secondary: ['Color', 'Type'],
  },
  'Health & Beauty': {
    primary: ['Size', 'Scent', 'Type'],
    secondary: ['Volume', 'Pack Size', 'Scent'],
  },
  'Food & Beverages': {
    primary: ['Weight', 'Flavor', 'Pack Size'],
    secondary: ['Flavor', 'Volume', 'Pack Size'],
  },
  'Automotive': {
    primary: ['Size', 'Model', 'Type'],
    secondary: ['Color', 'Material'],
  },
  'Other': {
    primary: ['Size', 'Color', 'Type'],
    secondary: ['Color', 'Material', 'Weight'],
  },
};

// All available variant options with Bengali translations
const ALL_VARIANT_OPTIONS = [
  { value: 'Size', label: 'Size (সাইজ)' },
  { value: 'Color', label: 'Color (রং)' },
  { value: 'Weight', label: 'Weight (ওজন - গ্রাম/কেজি)' },
  { value: 'Flavor', label: 'Flavor (স্বাদ)' },
  { value: 'Pack Size', label: 'Pack Size (প্যাক সাইজ)' },
  { value: 'Volume', label: 'Volume (পরিমাণ - ml/L)' },
  { value: 'Length', label: 'Length (দৈর্ঘ্য)' },
  { value: 'Material', label: 'Material (উপাদান)' },
  { value: 'Model', label: 'Model (মডেল)' },
  { value: 'Type', label: 'Type (ধরন)' },
  { value: 'Style', label: 'Style (স্টাইল)' },
  { value: 'Scent', label: 'Scent (সুগন্ধ)' },
  { value: 'Pattern', label: 'Pattern (প্যাটার্ন)' },
  { value: 'Storage', label: 'Storage (স্টোরেজ)' },
  { value: 'Memory', label: 'Memory (মেমরি)' },
  { value: 'Language', label: 'Language (ভাষা)' },
  { value: 'Format', label: 'Format (ফরম্যাট)' },
];

// Helper function to get option label
const getOptionLabel = (value: string): string => {
  const option = ALL_VARIANT_OPTIONS.find(opt => opt.value === value);
  return option?.label || value;
};

// Helper function to get suggested options based on category
const getSuggestedOptions = (category: string | undefined, isPrimary: boolean): string[] => {
  if (!category) return [];
  const mapping = CATEGORY_VARIANT_MAP[category];
  if (!mapping) return [];
  return isPrimary ? mapping.primary : mapping.secondary;
};

export function VariantManager({ variants, onChange, basePrice, category }: VariantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState<Variant>({
    option1Name: 'Size',
    option1Value: '',
    option2Name: '',
    option2Value: '',
    price: undefined,
    sku: '',
    inventory: 0,
  });

  // Update default options when category changes
  useEffect(() => {
    if (category && CATEGORY_VARIANT_MAP[category]) {
      const suggested = CATEGORY_VARIANT_MAP[category];
      setNewVariant(prev => ({
        ...prev,
        option1Name: suggested.primary[0] || 'Size',
        option2Name: suggested.secondary[0] || '',
      }));
    }
  }, [category]);

  const addVariant = () => {
    if (!newVariant.option1Value.trim()) return;
    
    onChange([...variants, { ...newVariant }]);
    setNewVariant({
      option1Name: newVariant.option1Name,
      option1Value: '',
      option2Name: newVariant.option2Name,
      option2Value: '',
      price: undefined,
      sku: '',
      inventory: 0,
    });
    setShowAddForm(false);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, updates: Partial<Variant>) => {
    onChange(variants.map((v, i) => i === index ? { ...v, ...updates } : v));
  };

  const getVariantTitle = (variant: Variant): string => {
    let title = variant.option1Value;
    if (variant.option2Value) {
      title += ` / ${variant.option2Value}`;
    }
    return title;
  };

  // Quick Add Sizes - adds S, M, L, XL, XXL at once
  const quickAddSizes = () => {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const existingSizes = variants
      .filter(v => v.option1Name === 'Size')
      .map(v => v.option1Value.toUpperCase());
    
    const newVariants = sizes
      .filter(size => !existingSizes.includes(size))
      .map(size => ({
        option1Name: 'Size',
        option1Value: size,
        option2Name: newVariant.option2Name || '',
        option2Value: '',
        price: undefined,
        sku: '',
        inventory: 10, // Default stock per size
      }));
    
    if (newVariants.length > 0) {
      onChange([...variants, ...newVariants]);
    }
  };

  // Calculate total inventory across all variants
  const totalInventory = variants.reduce((sum, v) => sum + (v.inventory || 0), 0);

  // Get suggested and other options for rendering
  const suggestedPrimary = getSuggestedOptions(category, true);
  const suggestedSecondary = getSuggestedOptions(category, false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Product Variants</h3>
          <p className="text-xs text-gray-500">
            সাইজ, কালার, ওজন ইত্যাদি ভ্যারিয়েন্ট যোগ করুন
            {variants.length > 0 && (
              <span className="ml-2 text-emerald-600 font-medium">
                (মোট স্টক: {totalInventory})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Add Sizes Button */}
          {!showAddForm && (
            <button
              type="button"
              onClick={quickAddSizes}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
              title="S, M, L, XL, XXL সাইজ একসাথে যোগ করুন"
            >
              <Sparkles className="w-3 h-3" />
              Quick Add Sizes
            </button>
          )}
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          )}
        </div>
      </div>

      {/* Category Hint */}
      {category && suggestedPrimary.length > 0 && !showAddForm && variants.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <span className="font-medium">{category}</span> ক্যাটাগরির জন্য সাজেস্টেড: {' '}
            <span className="font-medium">{suggestedPrimary.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Add Variant Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">New Variant</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Option 1 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 1 Name
              </label>
              <select
                value={newVariant.option1Name}
                onChange={(e) => setNewVariant({ ...newVariant, option1Name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {/* Suggested options first (if category selected) */}
                {suggestedPrimary.length > 0 && (
                  <optgroup label="✨ সাজেস্টেড (Suggested)">
                    {suggestedPrimary.map(opt => (
                      <option key={`suggested-${opt}`} value={opt}>{getOptionLabel(opt)}</option>
                    ))}
                  </optgroup>
                )}
                {/* All other options */}
                <optgroup label={suggestedPrimary.length > 0 ? "📋 সব অপশন (All Options)" : ""}>
                  {ALL_VARIANT_OPTIONS
                    .filter(opt => !suggestedPrimary.includes(opt.value))
                    .map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 1 Value
              </label>
              <input
                type="text"
                placeholder={getPlaceholder(newVariant.option1Name)}
                value={newVariant.option1Value}
                onChange={(e) => setNewVariant({ ...newVariant, option1Value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Option 2 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 2 Name
              </label>
              <select
                value={newVariant.option2Name || ''}
                onChange={(e) => setNewVariant({ ...newVariant, option2Name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">None (নেই)</option>
                {/* Suggested options first (if category selected) */}
                {suggestedSecondary.length > 0 && (
                  <optgroup label="✨ সাজেস্টেড (Suggested)">
                    {suggestedSecondary.map(opt => (
                      <option key={`suggested2-${opt}`} value={opt}>{getOptionLabel(opt)}</option>
                    ))}
                  </optgroup>
                )}
                {/* All other options */}
                <optgroup label={suggestedSecondary.length > 0 ? "📋 সব অপশন (All Options)" : ""}>
                  {ALL_VARIANT_OPTIONS
                    .filter(opt => !suggestedSecondary.includes(opt.value))
                    .map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 2 Value
              </label>
              <input
                type="text"
                placeholder={newVariant.option2Name ? getPlaceholder(newVariant.option2Name) : 'Select option first'}
                value={newVariant.option2Value || ''}
                onChange={(e) => setNewVariant({ ...newVariant, option2Value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!newVariant.option2Name}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Price (optional)
              </label>
              <input
                type="number"
                placeholder={`Default: ${basePrice}`}
                value={newVariant.price || ''}
                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                SKU (optional)
              </label>
              <input
                type="text"
                placeholder="SKU-001"
                value={newVariant.sku || ''}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Stock
              </label>
              <input
                type="number"
                placeholder="0"
                value={newVariant.inventory || ''}
                onChange={(e) => setNewVariant({ ...newVariant, inventory: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={addVariant}
              disabled={!newVariant.option1Value.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Variant
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Variant</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">
                  Cost (৳)
                  <span className="block text-xs font-normal text-gray-400">P&L override</span>
                </th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">SKU</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Stock</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {getVariantTitle(variant)}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={variant.price || ''}
                      placeholder={basePrice.toString()}
                      onChange={(e) => updateVariant(index, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  {/* P&L: Per-variant cost override */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.costPrice ?? ''}
                      onChange={(e) =>
                        updateVariant(index, {
                          costPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Inherit"
                      title="Leave empty to use product cost price"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(index, { sku: e.target.value })}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={variant.inventory || 0}
                      onChange={(e) => updateVariant(index, { inventory: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-2">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hidden input to store variants as JSON */}
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(variants)}
      />
    </div>
  );
}

// ============================================================================
// HELPER: Dynamic placeholder based on option type
// ============================================================================
function getPlaceholder(optionName: string): string {
  const placeholders: Record<string, string> = {
    'Size': 'e.g., S, M, L, XL, XXL',
    'Color': 'e.g., Red, Blue, Black',
    'Weight': 'e.g., 250g, 500g, 1kg',
    'Flavor': 'e.g., Chocolate, Vanilla, Mango',
    'Pack Size': 'e.g., 1 Pack, 3 Pack, 6 Pack',
    'Volume': 'e.g., 100ml, 250ml, 1L',
    'Length': 'e.g., 1m, 2m, 5m',
    'Material': 'e.g., Cotton, Polyester, Leather',
    'Model': 'e.g., Pro, Max, Lite',
    'Type': 'e.g., Regular, Premium, Deluxe',
    'Style': 'e.g., Classic, Modern, Vintage',
    'Scent': 'e.g., Lavender, Rose, Jasmine',
    'Pattern': 'e.g., Striped, Solid, Printed',
    'Storage': 'e.g., 64GB, 128GB, 256GB',
    'Memory': 'e.g., 4GB, 8GB, 16GB',
    'Language': 'e.g., Bengali, English, Arabic',
    'Format': 'e.g., Paperback, Hardcover, eBook',
  };
  return placeholders[optionName] || 'Enter value';
}
