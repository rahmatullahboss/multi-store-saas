/**
 * VariantPicker — Section variant switcher for the right SettingsPanel.
 *
 * Shows a horizontal scrollable row of mini visual preview cards.
 * Clicking a card updates section.variant and triggers auto-save + iframe postMessage.
 *
 * Design:
 *   - Title: "ডিজাইন ভেরিয়েন্ট"
 *   - 100×70px mini preview cards with CSS background
 *   - Selected: ring-2 ring-blue-500 + checkmark icon
 *   - Hover: scale-105
 *   - Horizontal scroll on mobile
 */

import { Check } from 'lucide-react';
import { getVariantsForSection, type SectionVariantMeta } from '~/lib/page-builder/variants';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VariantPickerProps {
  sectionType: string;
  currentVariant: string | null | undefined;
  onVariantChange: (variantId: string) => void;
}

// ── Mini preview card ─────────────────────────────────────────────────────────

interface VariantCardProps {
  variant: SectionVariantMeta;
  isSelected: boolean;
  onClick: () => void;
}

function VariantCard({ variant, isSelected, onClick }: VariantCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={variant.description}
      className={`
        relative shrink-0 flex flex-col gap-1.5 rounded-lg overflow-hidden
        transition-all duration-150 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        hover:scale-105 active:scale-95
        ${isSelected
          ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
          : 'ring-1 ring-white/10 hover:ring-white/20'
        }
      `}
      aria-pressed={isSelected}
      aria-label={`${variant.nameBn} — ${variant.description}`}
    >
      {/* Mini visual preview — 100×70px */}
      <div
        className="w-[100px] h-[70px] relative flex flex-col items-center justify-center gap-1 p-2"
        style={{ background: variant.previewBg }}
      >
        {/* Decorative lines simulating a layout */}
        <div
          className="w-10 h-1.5 rounded-full opacity-90"
          style={{ backgroundColor: variant.previewAccent }}
        />
        <div
          className="w-14 h-1 rounded-full opacity-50"
          style={{ backgroundColor: variant.previewAccent }}
        />
        <div
          className="w-8 h-1 rounded-full opacity-40"
          style={{ backgroundColor: variant.previewAccent }}
        />
        {/* Simulated button */}
        <div
          className="mt-0.5 w-10 h-2.5 rounded opacity-80"
          style={{ backgroundColor: variant.previewAccent }}
        />

        {/* Selected checkmark overlay */}
        {isSelected && (
          <div className="absolute inset-0 flex items-start justify-end p-1">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 shadow">
              <Check size={9} className="text-white" strokeWidth={3} />
            </span>
          </div>
        )}
      </div>

      {/* Variant name label */}
      <span
        className={`
          px-1 pb-1.5 text-[10px] font-medium text-center leading-tight truncate w-full
          ${isSelected ? 'text-blue-400' : 'text-gray-400'}
        `}
      >
        {variant.nameBn}
      </span>
    </button>
  );
}

// ── Main VariantPicker ────────────────────────────────────────────────────────

export function VariantPicker({ sectionType, currentVariant, onVariantChange }: VariantPickerProps) {
  const variants = getVariantsForSection(sectionType);

  // Resolve active variant — default to first if unset or unknown
  const activeId = (() => {
    if (!currentVariant) return variants[0]?.id ?? '';
    return variants.find((v) => v.id === currentVariant)?.id ?? (variants[0]?.id ?? '');
  })();

  // Don't render picker if there's only one variant (no choice to make)
  if (variants.length <= 1) return null;

  return (
    <div className="space-y-2 pb-3 border-b border-white/10">
      {/* Section title */}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1">
        ডিজাইন ভেরিয়েন্ট
      </p>

      {/* Horizontal scrollable row */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="radiogroup"
        aria-label="ডিজাইন ভেরিয়েন্ট নির্বাচন করুন"
      >
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isSelected={variant.id === activeId}
            onClick={() => {
              if (variant.id !== activeId) {
                onVariantChange(variant.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
