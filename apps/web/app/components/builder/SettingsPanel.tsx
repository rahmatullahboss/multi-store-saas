/**
 * SettingsPanel — Right panel that renders schema-driven form fields
 * for the currently selected section. Bengali labels for all inputs.
 *
 * Includes VariantPicker at the top so merchants can switch visual styles
 * without losing their section content.
 */

import { useCallback, useEffect, useState } from 'react';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';
import { VariantPicker } from '~/components/builder/VariantPicker';

// ── Field renderers ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-300">{label}</label>
      {hint && <p className="text-[10px] text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-colors';

const textareaCls =
  'w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 resize-y min-h-[80px] transition-colors';

// ── Section-specific field configs ───────────────────────────────────────────

type FieldDef =
  | { kind: 'text'; key: string; label: string; placeholder?: string }
  | { kind: 'textarea'; key: string; label: string; placeholder?: string }
  | { kind: 'color'; key: string; label: string }
  | { kind: 'toggle'; key: string; label: string }
  | { kind: 'number'; key: string; label: string; min?: number; max?: number }
  | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[] };

const SECTION_FIELDS: Record<string, FieldDef[]> = {
  hero: [
    { kind: 'text', key: 'headline', label: 'শিরোনাম', placeholder: 'আপনার পণ্যের শিরোনাম' },
    { kind: 'textarea', key: 'subheadline', label: 'সাব-শিরোনাম', placeholder: 'সংক্ষিপ্ত বিবরণ' },
    { kind: 'text', key: 'ctaText', label: 'বাটন টেক্সট', placeholder: 'অর্ডার করুন' },
    { kind: 'text', key: 'badgeText', label: 'ব্যাজ টেক্সট', placeholder: 'বিশেষ অফার' },
    { kind: 'text', key: 'productImage', label: 'পণ্যের ছবি URL' },
    {
      kind: 'select',
      key: 'variant',
      label: 'ভ্যারিয়েন্ট',
      options: [
        { value: 'centered', label: 'সেন্টারড' },
        { value: 'split', label: 'স্প্লিট' },
        { value: 'split-left', label: 'স্প্লিট বাম' },
        { value: 'split-right', label: 'স্প্লিট ডান' },
        { value: 'glow', label: 'গ্লো' },
        { value: 'modern', label: 'মডার্ন' },
        { value: 'immersive', label: 'ইমার্সিভ' },
      ],
    },
  ],
  header: [
    { kind: 'text', key: 'logoText', label: 'লোগো টেক্সট' },
    { kind: 'text', key: 'logoUrl', label: 'লোগো URL' },
    { kind: 'text', key: 'ctaText', label: 'বাটন টেক্সট', placeholder: 'অর্ডার করুন' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
    { kind: 'color', key: 'textColor', label: 'টেক্সট রং' },
    { kind: 'toggle', key: 'isSticky', label: 'স্টিকি হেডার' },
  ],
  features: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'প্রধান বৈশিষ্ট্যসমূহ' },
    {
      kind: 'select',
      key: 'variant',
      label: 'লেআউট',
      options: [
        { value: 'grid', label: 'গ্রিড' },
        { value: 'bento', label: 'বেন্টো' },
        { value: 'cards', label: 'কার্ড' },
      ],
    },
  ],
  testimonials: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'কাস্টমারদের মতামত' },
  ],
  faq: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'সাধারণ জিজ্ঞাসা' },
    { kind: 'text', key: 'subtitle', label: 'সাব-শিরোনাম' },
  ],
  gallery: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'ফটো গ্যালারি' },
  ],
  video: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'ভিডিও দেখুন' },
    { kind: 'text', key: 'videoUrl', label: 'ভিডিও URL', placeholder: 'https://youtube.com/...' },
  ],
  cta: [
    { kind: 'text', key: 'headline', label: 'শিরোনাম', placeholder: 'এখনই অর্ডার করুন' },
    { kind: 'textarea', key: 'subheadline', label: 'সাব-শিরোনাম' },
    { kind: 'text', key: 'buttonText', label: 'বাটন টেক্সট', placeholder: 'অর্ডার কনফার্ম করুন' },
    { kind: 'number', key: 'productPrice', label: 'পণ্যের মূল্য (৳)', min: 0 },
    { kind: 'number', key: 'discountedPrice', label: 'ছাড়ের মূল্য (৳)', min: 0 },
    { kind: 'number', key: 'insideDhakaCharge', label: 'ঢাকার ভেতরে ডেলিভারি (৳)', min: 0 },
    { kind: 'number', key: 'outsideDhakaCharge', label: 'ঢাকার বাইরে ডেলিভারি (৳)', min: 0 },
    { kind: 'toggle', key: 'showTrustBadges', label: 'ট্রাস্ট ব্যাজ দেখান' },
    { kind: 'toggle', key: 'showUrgencyBanner', label: 'জরুরি ব্যানার দেখান' },
    { kind: 'text', key: 'urgencyText', label: 'জরুরি ব্যানার টেক্সট' },
  ],
  'order-button': [
    { kind: 'text', key: 'text', label: 'বাটন টেক্সট', placeholder: 'এখনই অর্ডার করুন' },
    { kind: 'text', key: 'subtext', label: 'সাব-টেক্সট' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
    { kind: 'color', key: 'textColor', label: 'টেক্সট রং' },
    {
      kind: 'select',
      key: 'size',
      label: 'আকার',
      options: [
        { value: 'sm', label: 'ছোট' },
        { value: 'md', label: 'মাঝারি' },
        { value: 'lg', label: 'বড়' },
        { value: 'xl', label: 'অনেক বড়' },
      ],
    },
    {
      kind: 'select',
      key: 'animation',
      label: 'অ্যানিমেশন',
      options: [
        { value: 'none', label: 'কোনো না' },
        { value: 'pulse', label: 'পালস' },
        { value: 'bounce', label: 'বাউন্স' },
        { value: 'shake', label: 'শেক' },
      ],
    },
  ],
  benefits: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'কেন আমাদের থেকে কিনবেন?' },
  ],
  comparison: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'পার্থক্য দেখুন' },
    { kind: 'text', key: 'beforeLabel', label: 'আগে লেবেল' },
    { kind: 'text', key: 'afterLabel', label: 'পরে লেবেল' },
    { kind: 'text', key: 'beforeImage', label: 'আগের ছবি URL' },
    { kind: 'text', key: 'afterImage', label: 'পরের ছবি URL' },
  ],
  delivery: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'ডেলিভারি তথ্য' },
    { kind: 'number', key: 'insideDhakaPrice', label: 'ঢাকার ভেতরে (৳)', min: 0 },
    { kind: 'number', key: 'outsideDhakaPrice', label: 'ঢাকার বাইরে (৳)', min: 0 },
  ],
  guarantee: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'আমাদের গ্যারান্টি' },
    { kind: 'textarea', key: 'text', label: 'গ্যারান্টি টেক্সট' },
    { kind: 'text', key: 'badgeLabel', label: 'ব্যাজ লেবেল' },
  ],
  'problem-solution': [
    { kind: 'text', key: 'beforeTitle', label: 'সমস্যার শিরোনাম' },
    { kind: 'text', key: 'afterTitle', label: 'সমাধানের শিরোনাম' },
  ],
  pricing: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'প্যাকেজ ও মূল্য' },
    { kind: 'text', key: 'buttonText', label: 'বাটন টেক্সট', placeholder: 'অর্ডার করুন' },
  ],
  'how-to-order': [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'কিভাবে অর্ডার করবেন?' },
  ],
  showcase: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'প্রোডাক্ট ডিটেইলস' },
    { kind: 'text', key: 'image', label: 'ছবি URL' },
    {
      kind: 'select',
      key: 'variant',
      label: 'ভ্যারিয়েন্ট',
      options: [
        { value: 'simple', label: 'সাধারণ' },
        { value: 'detailed', label: 'বিস্তারিত' },
        { value: 'highlight', label: 'হাইলাইট' },
      ],
    },
  ],
  'product-grid': [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'আমাদের প্রোডাক্ট' },
    { kind: 'text', key: 'subtitle', label: 'সাব-শিরোনাম' },
    {
      kind: 'select',
      key: 'columns',
      label: 'কলাম সংখ্যা',
      options: [
        { value: '2', label: '২ কলাম' },
        { value: '3', label: '৩ কলাম' },
        { value: '4', label: '৪ কলাম' },
      ],
    },
    { kind: 'text', key: 'buttonText', label: 'বাটন টেক্সট' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
  ],
  'custom-html': [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'কাস্টম HTML' },
    { kind: 'textarea', key: 'htmlContent', label: 'HTML কোড' },
    { kind: 'textarea', key: 'cssContent', label: 'CSS কোড (ঐচ্ছিক)' },
  ],
  countdown: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: '⏰ অফার শেষ হচ্ছে!' },
    { kind: 'text', key: 'endDate', label: 'শেষ তারিখ (YYYY-MM-DD)' },
    { kind: 'text', key: 'endTime', label: 'শেষ সময় (HH:MM)' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
    { kind: 'color', key: 'textColor', label: 'টেক্সট রং' },
    {
      kind: 'select',
      key: 'variant',
      label: 'ভ্যারিয়েন্ট',
      options: [
        { value: 'banner', label: 'ব্যানার' },
        { value: 'card', label: 'কার্ড' },
        { value: 'minimal', label: 'মিনিমাল' },
        { value: 'urgent', label: 'জরুরি' },
      ],
    },
  ],
  stats: [
    { kind: 'text', key: 'title', label: 'শিরোনাম' },
    { kind: 'text', key: 'subtitle', label: 'সাব-শিরোনাম' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
    { kind: 'color', key: 'accentColor', label: 'অ্যাকসেন্ট রং' },
  ],
  contact: [
    { kind: 'text', key: 'title', label: 'শিরোনাম', placeholder: 'যোগাযোগ করুন' },
    { kind: 'text', key: 'subtitle', label: 'সাব-শিরোনাম' },
    { kind: 'text', key: 'phone', label: 'ফোন নম্বর' },
    { kind: 'text', key: 'whatsapp', label: 'হোয়াটসঅ্যাপ নম্বর' },
    { kind: 'text', key: 'email', label: 'ইমেইল' },
    { kind: 'textarea', key: 'address', label: 'ঠিকানা' },
    { kind: 'toggle', key: 'showForm', label: 'ফর্ম দেখান' },
  ],
  footer: [
    { kind: 'text', key: 'storeName', label: 'স্টোর নাম' },
    { kind: 'text', key: 'tagline', label: 'ট্যাগলাইন' },
    { kind: 'text', key: 'phone', label: 'ফোন নম্বর' },
    { kind: 'text', key: 'email', label: 'ইমেইল' },
    { kind: 'color', key: 'bgColor', label: 'ব্যাকগ্রাউন্ড রং' },
    { kind: 'color', key: 'textColor', label: 'টেক্সট রং' },
    { kind: 'toggle', key: 'showPoweredBy', label: 'Powered by দেখান' },
  ],
  'trust-badges': [
    { kind: 'text', key: 'title', label: 'শিরোনাম' },
    {
      kind: 'select',
      key: 'variant',
      label: 'ভ্যারিয়েন্ট',
      options: [
        { value: 'grid', label: 'গ্রিড' },
        { value: 'marquee', label: 'মার্কি' },
      ],
    },
  ],
  'social-proof': [
    { kind: 'text', key: 'socialTitle', label: 'সোশ্যাল শিরোনাম' },
    { kind: 'text', key: 'featuresTitle', label: 'ফিচার শিরোনাম' },
    { kind: 'text', key: 'testimonialsTitle', label: 'টেস্টিমোনিয়াল শিরোনাম' },
    {
      kind: 'select',
      key: 'style',
      label: 'স্টাইল',
      options: [
        { value: 'default', label: 'ডিফল্ট' },
        { value: 'dark', label: 'ডার্ক' },
        { value: 'brand', label: 'ব্র্যান্ড' },
        { value: 'green', label: 'সবুজ' },
        { value: 'red', label: 'লাল' },
      ],
    },
  ],
};

// Fall back to generic fields for unmapped section types
function getFallbackFields(section: BuilderSection): FieldDef[] {
  const fields: FieldDef[] = [];
  const props = section.props;
  for (const key of Object.keys(props)) {
    const val = props[key];
    if (Array.isArray(val) || typeof val === 'object') continue;
    if (typeof val === 'boolean') {
      fields.push({ kind: 'toggle', key, label: key });
    } else if (typeof val === 'number') {
      fields.push({ kind: 'number', key, label: key });
    } else if (typeof val === 'string' && key.toLowerCase().includes('color')) {
      fields.push({ kind: 'color', key, label: key });
    } else if (typeof val === 'string' && val.length > 80) {
      fields.push({ kind: 'textarea', key, label: key });
    } else if (typeof val === 'string') {
      fields.push({ kind: 'text', key, label: key });
    }
  }
  return fields;
}

// ── Main SettingsPanel ────────────────────────────────────────────────────────

export interface SettingsPanelProps {
  section: BuilderSection | null;
  onUpdateProps: (
    sectionId: string,
    type: string,
    props: Record<string, unknown>,
    version: number
  ) => void;
  /** Called when merchant selects a new visual variant for the active section. */
  onVariantChange: (sectionId: string, variantId: string) => void;
}

export function SettingsPanel({ section, onUpdateProps, onVariantChange }: SettingsPanelProps) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({});
  const [collapsed, setCollapsed] = useState(false);

  // Sync local props when section changes
  useEffect(() => {
    if (section) {
      setLocalProps(section.props);
    }
  }, [section?.id, section?.props]);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!section) return;
      const updated = { ...localProps, [key]: value };
      setLocalProps(updated);
      onUpdateProps(section.id, section.type, updated, section.version);
    },
    [section, localProps, onUpdateProps]
  );

  const handleVariantChange = useCallback(
    (variantId: string) => {
      if (!section) return;
      onVariantChange(section.id, variantId);
    },
    [section, onVariantChange]
  );

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
          <Settings size={20} className="text-gray-500" />
        </div>
        <p className="text-sm text-gray-400 font-medium">কোনো সেকশন নির্বাচিত নেই</p>
        <p className="text-xs text-gray-600 mt-1">
          বাম প্যানেল থেকে একটি সেকশনে ক্লিক করুন
        </p>
      </div>
    );
  }

  const meta = getSectionMeta(section.type);
  const fields = SECTION_FIELDS[section.type] ?? getFallbackFields(section);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-white/10">
        <button
          className="w-full flex items-center gap-2 text-left"
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{meta?.name ?? section.type}</p>
            <p className="text-xs text-gray-500 mt-0.5">{meta?.nameEn ?? ''}</p>
          </div>
          {collapsed ? (
            <ChevronRight size={14} className="text-gray-500" />
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* ── Variant Picker — always at the top before fields ── */}
          <VariantPicker
            sectionType={section.type}
            currentVariant={section.variant}
            onVariantChange={handleVariantChange}
          />

          {fields.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              এই সেকশনে কাস্টমাইজযোগ্য ফিল্ড নেই
            </p>
          ) : (
            fields.map((field) => {
              const currentValue = localProps[field.key];

              if (field.kind === 'text') {
                return (
                  <Field key={field.key} label={field.label}>
                    <input
                      type="text"
                      className={inputCls}
                      value={typeof currentValue === 'string' ? currentValue : ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  </Field>
                );
              }

              if (field.kind === 'textarea') {
                return (
                  <Field key={field.key} label={field.label}>
                    <textarea
                      className={textareaCls}
                      value={typeof currentValue === 'string' ? currentValue : ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  </Field>
                );
              }

              if (field.kind === 'color') {
                return (
                  <Field key={field.key} label={field.label}>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                        value={typeof currentValue === 'string' ? currentValue : '#6366f1'}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                      <input
                        type="text"
                        className={`${inputCls} flex-1 font-mono text-xs`}
                        value={typeof currentValue === 'string' ? currentValue : ''}
                        placeholder="#6366f1"
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    </div>
                  </Field>
                );
              }

              if (field.kind === 'toggle') {
                return (
                  <Field key={field.key} label={field.label}>
                    <button
                      type="button"
                      onClick={() => handleChange(field.key, !currentValue)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentValue ? 'bg-indigo-600' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          currentValue ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </Field>
                );
              }

              if (field.kind === 'number') {
                return (
                  <Field key={field.key} label={field.label}>
                    <input
                      type="number"
                      className={inputCls}
                      value={typeof currentValue === 'number' ? currentValue : ''}
                      min={field.min}
                      max={field.max}
                      onChange={(e) => handleChange(field.key, Number(e.target.value))}
                    />
                  </Field>
                );
              }

              if (field.kind === 'select') {
                return (
                  <Field key={field.key} label={field.label}>
                    <select
                      className={`${inputCls} cursor-pointer`}
                      value={typeof currentValue === 'string' ? currentValue : ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                );
              }

              return null;
            })
          )}
        </div>
      )}
    </div>
  );
}
