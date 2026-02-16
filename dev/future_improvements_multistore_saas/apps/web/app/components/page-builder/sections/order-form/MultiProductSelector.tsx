/**
 * Multi-Product Selector Component
 * Shared component for selecting multiple products in order forms
 * Used across all order form variants
 */

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { SelectedProductInfo } from './types';
import { formatPrice } from '~/lib/theme-engine';

interface MultiProductSelectorProps {
  selectedProducts: SelectedProductInfo[];
  // Style customization
  primaryColor?: string;
  textColor?: string;
  mutedColor?: string;
  inputBg?: string;
  inputBorder?: string;
  // Combo discount settings (from editor props)
  enableComboDiscount?: boolean;
  comboDiscount2Products?: number; // Percentage (e.g., 10 = 10%)
  comboDiscount3Products?: number; // Percentage (e.g., 15 = 15%)
  // Callbacks
  onSelectionChange?: (selectedIds: number[], total: number, comboDiscount: number) => void;
}

// Combo discount rates - now accepts configurable rates
const getComboDiscount = (
  count: number,
  discount2: number = 10,
  discount3: number = 15,
  enabled: boolean = true
): { rate: number; label: string } => {
  if (!enabled) return { rate: 0, label: '' };
  if (count >= 3) return { rate: discount3 / 100, label: `${discount3}% কম্বো ছাড়` };
  if (count === 2) return { rate: discount2 / 100, label: `${discount2}% কম্বো ছাড়` };
  return { rate: 0, label: '' };
};

interface UseMultiProductSelectionOptions {
  enableComboDiscount?: boolean;
  comboDiscount2Products?: number;
  comboDiscount3Products?: number;
}

export function useMultiProductSelection(
  selectedProducts: SelectedProductInfo[],
  options: UseMultiProductSelectionOptions = {}
) {
  const {
    enableComboDiscount = true,
    comboDiscount2Products = 10,
    comboDiscount3Products = 15,
  } = options;

  const [selectedIds, setSelectedIds] = useState<number[]>(
    selectedProducts.length > 0 ? [selectedProducts[0].id] : []
  );

  const isMultiProduct = selectedProducts.length > 1;

  const toggleProductSelection = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Don't deselect last one
        return prev.filter((pid) => pid !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectedProductsData = selectedProducts.filter((p) => selectedIds.includes(p.id));
  const regularTotal = selectedProductsData.reduce((sum, p) => sum + p.price, 0);
  const comboDiscount = getComboDiscount(
    selectedIds.length,
    comboDiscount2Products,
    comboDiscount3Products,
    enableComboDiscount
  );
  const comboSavings = Math.round(regularTotal * comboDiscount.rate);
  const comboTotal = regularTotal - comboSavings;
  const finalTotal = isMultiProduct && selectedIds.length > 1 ? comboTotal : regularTotal;
  const primaryProduct = selectedProductsData[0] || null;

  // NOTE: Don't create dynamicVariants here anymore!
  // Variants should come from product settings (useOrderForm handles this via product.variants)
  // We only return the calculated finalTotal which will be used as base price
  // useOrderForm will then use product.variants (from DB/settings) for 1 pis, 2 pis, 3 pis pricing

  return {
    selectedIds,
    setSelectedIds,
    isMultiProduct,
    toggleProductSelection,
    selectedProductsData,
    regularTotal,
    comboDiscount,
    comboSavings,
    comboTotal,
    finalTotal,
    primaryProduct,
  };
}

export function MultiProductSelector({
  selectedProducts,
  primaryColor = '#10B981',
  textColor = '#111827',
  mutedColor = '#6B7280',
  inputBg = '#F9FAFB',
  inputBorder = '#E5E7EB',
  enableComboDiscount = true,
  comboDiscount2Products = 10,
  comboDiscount3Products = 15,
  onSelectionChange,
}: MultiProductSelectorProps) {
  const {
    selectedIds,
    isMultiProduct,
    toggleProductSelection,
    selectedProductsData,
    regularTotal,
    comboDiscount,
    comboSavings,
    comboTotal,
  } = useMultiProductSelection(selectedProducts, {
    enableComboDiscount,
    comboDiscount2Products,
    comboDiscount3Products,
  });

  if (!isMultiProduct) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-3" style={{ color: textColor }}>
        প্রোডাক্ট নির্বাচন করুন
        <span className="font-normal text-xs ml-2" style={{ color: mutedColor }}>
          (একাধিক নির্বাচন করতে পারবেন)
        </span>
      </label>

      <div className="space-y-3">
        {selectedProducts.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProductSelection(p.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
              style={{
                backgroundColor: isSelected ? `${primaryColor}15` : inputBg,
                border: `2px solid ${isSelected ? primaryColor : inputBorder}`,
              }}
            >
              {/* Checkbox indicator */}
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  backgroundColor: isSelected ? primaryColor : 'transparent',
                  border: `2px solid ${isSelected ? primaryColor : inputBorder}`,
                }}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>

              {/* Product image */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: inputBorder }}
                >
                  <span className="text-lg">📦</span>
                </div>
              )}

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: textColor }}>
                  {p.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: primaryColor }}>
                    {formatPrice(p.price)}
                  </span>
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <span className="text-sm line-through" style={{ color: mutedColor }}>
                      {formatPrice(p.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Combo discount summary */}
      {selectedIds.length > 1 && (
        <div
          className="mt-3 p-4 rounded-xl"
          style={{
            backgroundColor: `${primaryColor}10`,
            border: `2px dashed ${primaryColor}40`,
          }}
        >
          {comboDiscount.rate > 0 && (
            <div className="flex justify-center mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                🎁 {comboDiscount.label}
              </span>
            </div>
          )}

          <div className="text-center space-y-1">
            <p style={{ color: textColor }}>
              <span className="font-bold">{selectedIds.length}টি প্রোডাক্ট</span> নির্বাচিত
            </p>

            {comboSavings > 0 ? (
              <div className="flex items-center justify-center gap-2">
                <span className="line-through text-sm" style={{ color: mutedColor }}>
                  {formatPrice(regularTotal)}
                </span>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  {formatPrice(comboTotal)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {formatPrice(regularTotal)}
              </span>
            )}

            {comboSavings > 0 && (
              <p className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                ✨ কম্বোতে সেভ করছেন {formatPrice(comboSavings)}!
              </p>
            )}

            {selectedIds.length === 2 && selectedProducts.length > 2 && enableComboDiscount && (
              <p className="text-xs mt-2" style={{ color: mutedColor }}>
                💡 ৩টি নিলে আরও {Math.max(0, comboDiscount3Products - comboDiscount2Products)}% বেশি
                ছাড়!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { getComboDiscount };
