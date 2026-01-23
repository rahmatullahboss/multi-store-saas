/**
 * Variant Selector Component for Quick Builder v2
 * 
 * Allows users to select different visual variants for sections
 * Shows thumbnail previews and descriptions in Bangla
 */

import { useState } from 'react';
import { Check, ChevronDown, X, Sparkles } from 'lucide-react';
import { cn } from '~/utils/cn';
import {
  getVariantsForSection,
  getDefaultVariant,
  getSuggestedVariants,
  hasVariants,
  type SectionVariantDef,
} from '~/utils/landing-builder/variantRegistry';

interface VariantSelectorProps {
  sectionId: string;
  currentVariant?: string;
  intent?: { goal: string; trafficSource: string };
  onSelect: (variantId: string) => void;
  compact?: boolean;
}

// Variant thumbnail placeholder - can be replaced with actual thumbnails later
function VariantThumbnail({ variant, isSelected }: { variant: SectionVariantDef; isSelected: boolean }) {
  // Generate a unique gradient based on variant id for visual distinction
  const gradients: Record<string, string> = {
    'product-focused': 'from-blue-400 to-blue-600',
    'offer-focused': 'from-orange-400 to-red-500',
    'video-focused': 'from-purple-400 to-purple-600',
    'text-focused': 'from-gray-400 to-gray-600',
    'cards': 'from-emerald-400 to-emerald-600',
    'carousel': 'from-cyan-400 to-cyan-600',
    'avatars': 'from-pink-400 to-pink-600',
    'screenshots': 'from-amber-400 to-amber-600',
    'star-rating': 'from-yellow-400 to-yellow-600',
    'button-only': 'from-slate-400 to-slate-600',
    'with-trust': 'from-green-400 to-green-600',
    'urgency': 'from-red-400 to-red-600',
    'grid-3': 'from-indigo-400 to-indigo-600',
    'grid-4': 'from-violet-400 to-violet-600',
    'list': 'from-teal-400 to-teal-600',
    'counter': 'from-blue-400 to-indigo-600',
    'live-feed': 'from-rose-400 to-rose-600',
    'badges': 'from-emerald-400 to-teal-600',
  };

  const gradient = gradients[variant.id] || 'from-gray-400 to-gray-600';

  return (
    <div
      className={cn(
        'relative w-full aspect-[4/3] rounded-lg overflow-hidden transition-all',
        `bg-gradient-to-br ${gradient}`,
        isSelected && 'ring-2 ring-emerald-500 ring-offset-2'
      )}
    >
      {/* Pattern overlay for visual interest */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-2 w-8 h-2 bg-white rounded" />
        <div className="absolute top-6 left-2 w-12 h-1 bg-white rounded" />
        <div className="absolute bottom-2 right-2 w-6 h-4 bg-white rounded" />
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

// Compact dropdown variant selector
function VariantDropdown({
  sectionId,
  variants,
  currentVariant,
  onSelect,
}: {
  sectionId: string;
  variants: SectionVariantDef[];
  currentVariant: string;
  onSelect: (variantId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = variants.find((v) => v.id === currentVariant) || variants[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-3 py-2 text-sm',
          'bg-white border border-gray-200 rounded-lg',
          'hover:border-emerald-300 transition-colors',
          isOpen && 'border-emerald-400 ring-1 ring-emerald-200'
        )}
      >
        <span className="truncate text-gray-700">{selected?.name || 'ভ্যারিয়েন্ট'}</span>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  onSelect(variant.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 text-left text-sm',
                  'hover:bg-emerald-50 transition-colors',
                  variant.id === currentVariant && 'bg-emerald-50 text-emerald-700'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-6 rounded bg-gradient-to-br flex-shrink-0',
                    variant.id === currentVariant ? 'from-emerald-400 to-emerald-600' : 'from-gray-300 to-gray-400'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{variant.name}</div>
                  <div className="text-xs text-gray-500 truncate">{variant.description}</div>
                </div>
                {variant.id === currentVariant && <Check className="w-4 h-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Grid variant selector with thumbnails
function VariantGrid({
  variants,
  currentVariant,
  suggestedVariants,
  onSelect,
}: {
  variants: SectionVariantDef[];
  currentVariant: string;
  suggestedVariants: SectionVariantDef[];
  onSelect: (variantId: string) => void;
}) {
  const suggestedIds = new Set(suggestedVariants.map((v) => v.id));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {variants.map((variant) => {
        const isSelected = variant.id === currentVariant;
        const isSuggested = suggestedIds.has(variant.id);

        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant.id)}
            className={cn(
              'relative p-2 rounded-xl border-2 text-left transition-all',
              'hover:border-emerald-300 hover:bg-emerald-50/50',
              isSelected
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white'
            )}
          >
            {/* Suggested badge */}
            {isSuggested && !isSelected && (
              <div className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-medium rounded-full">
                <Sparkles className="w-2.5 h-2.5" />
                সাজেস্টেড
              </div>
            )}

            <VariantThumbnail variant={variant} isSelected={isSelected} />

            <div className="mt-2">
              <h4 className={cn('text-sm font-medium', isSelected ? 'text-emerald-700' : 'text-gray-900')}>
                {variant.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-1">{variant.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Main component
export function VariantSelector({
  sectionId,
  currentVariant,
  intent,
  onSelect,
  compact = false,
}: VariantSelectorProps) {
  // Check if section has variants
  if (!hasVariants(sectionId)) {
    return null;
  }

  const variants = getVariantsForSection(sectionId);
  const defaultVariant = getDefaultVariant(sectionId);
  const activeVariant = currentVariant || defaultVariant;
  
  // Get suggested variants based on intent
  const suggestedVariants = intent ? getSuggestedVariants(sectionId, intent) : [];

  if (compact) {
    return (
      <VariantDropdown
        sectionId={sectionId}
        variants={variants}
        currentVariant={activeVariant}
        onSelect={onSelect}
      />
    );
  }

  return (
    <VariantGrid
      variants={variants}
      currentVariant={activeVariant}
      suggestedVariants={suggestedVariants}
      onSelect={onSelect}
    />
  );
}

// Modal version for more space
interface VariantSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionName: string;
  currentVariant?: string;
  intent?: { goal: string; trafficSource: string };
  onSelect: (variantId: string) => void;
}

export function VariantSelectorModal({
  isOpen,
  onClose,
  sectionId,
  sectionName,
  currentVariant,
  intent,
  onSelect,
}: VariantSelectorModalProps) {
  if (!isOpen) return null;

  const variants = getVariantsForSection(sectionId);
  const defaultVariant = getDefaultVariant(sectionId);
  const activeVariant = currentVariant || defaultVariant;
  const suggestedVariants = intent ? getSuggestedVariants(sectionId, intent) : [];

  const handleSelect = (variantId: string) => {
    onSelect(variantId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {sectionName} ভ্যারিয়েন্ট
            </h3>
            <p className="text-sm text-gray-500">
              একটি স্টাইল সিলেক্ট করুন
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <VariantGrid
            variants={variants}
            currentVariant={activeVariant}
            suggestedVariants={suggestedVariants}
            onSelect={handleSelect}
          />
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-500 text-center">
            💡 সাজেস্টেড ভ্যারিয়েন্ট আপনার ইন্টেন্ট অনুযায়ী রেকমেন্ড করা হয়েছে
          </p>
        </div>
      </div>
    </div>
  );
}

export default VariantSelector;
