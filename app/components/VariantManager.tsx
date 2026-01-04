/**
 * Variant Manager Component
 * 
 * Reusable component for managing product variants (size, color, etc.)
 * Used in both product creation and editing forms.
 */

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export interface Variant {
  id?: number;
  option1Name: string;
  option1Value: string;
  option2Name?: string;
  option2Value?: string;
  price?: number;
  sku?: string;
  inventory?: number;
}

interface VariantManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  basePrice: number;
}

const defaultOptionNames = ['সাইজ (Size)', 'কালার (Color)'];

export function VariantManager({ variants, onChange, basePrice }: VariantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState<Variant>({
    option1Name: 'Size',
    option1Value: '',
    option2Name: 'Color',
    option2Value: '',
    price: undefined,
    sku: '',
    inventory: 0,
  });

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Product Variants</h3>
          <p className="text-xs text-gray-500">Add size, color, or other options</p>
        </div>
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
                <option value="Size">Size</option>
                <option value="Color">Color</option>
                <option value="Material">Material</option>
                <option value="Style">Style</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 1 Value
              </label>
              <input
                type="text"
                placeholder="e.g., Large, XL"
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
                <option value="">None</option>
                <option value="Size">Size</option>
                <option value="Color">Color</option>
                <option value="Material">Material</option>
                <option value="Style">Style</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Option 2 Value
              </label>
              <input
                type="text"
                placeholder="e.g., Red, Blue"
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
