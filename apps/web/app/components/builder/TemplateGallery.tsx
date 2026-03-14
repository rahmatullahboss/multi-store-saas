/**
 * TemplateGallery — Phase 5 Template Gallery
 *
 * Full-page template picker UI for merchants to choose an industry-specific
 * starting template before entering the page builder editor.
 *
 * Features:
 * - Filter tabs by goal: সব | বিক্রয় | লিড | রেস্তোরাঁ
 * - 3-column responsive grid with CSS-generated gradient previews
 * - Hover overlay with "ব্যবহার করুন" + "প্রিভিউ দেখুন" actions
 * - Conversion score display with star rating
 */

import { useState } from 'react';
import { useFetcher, Link } from 'react-router';
import { Eye, Sparkles, Star, ArrowRight, Layout, X, CheckCircle2 } from 'lucide-react';
import type { BuilderTemplate, TemplateGoal } from '~/lib/page-builder/templates';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateGalleryProps {
  templates: BuilderTemplate[];
  pagesCount: number;
}

type FilterGoal = 'all' | TemplateGoal;

interface FilterTab {
  id: FilterGoal;
  labelBn: string;
  labelEn: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FILTER_TABS: FilterTab[] = [
  { id: 'all',        labelBn: 'সব',         labelEn: 'All' },
  { id: 'sales',      labelBn: 'বিক্রয়',    labelEn: 'Sales' },
  { id: 'leads',      labelBn: 'লিড',        labelEn: 'Leads' },
  { id: 'restaurant', labelBn: 'রেস্তোরাঁ', labelEn: 'Restaurant' },
];

// ============================================================================
// HELPERS
// ============================================================================

/** CSS gradient preview background matching each template's brand colors */
function buildPreviewGradient(primaryColor: string, accentColor: string): string {
  return `linear-gradient(135deg, ${primaryColor}22 0%, ${primaryColor}44 40%, ${accentColor}33 100%)`;
}

/** Render N filled + (5-N) empty stars */
function ConversionStars({ score }: { score: number }) {
  const filled = Math.round(score / 2); // Map 1-10 to 1-5 stars
  return (
    <div className="flex items-center gap-0.5" aria-label={`রূপান্তর স্কোর ${score}/১০`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < filled ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
        />
      ))}
    </div>
  );
}

// ============================================================================
// PREVIEW MODAL
// ============================================================================

const SECTION_LABELS: Record<string, { bn: string; icon: string }> = {
  'hero':          { bn: 'হিরো সেকশন',         icon: '🎯' },
  'trust-badges':  { bn: 'বিশ্বাসযোগ্যতা ব্যাজ', icon: '✅' },
  'features':      { bn: 'ফিচার গ্রিড',          icon: '⭐' },
  'testimonials':  { bn: 'কাস্টমার রিভিউ',       icon: '💬' },
  'faq':           { bn: 'সাধারণ প্রশ্ন',         icon: '❓' },
  'cta':           { bn: 'কল টু অ্যাকশন',        icon: '🚀' },
  'product-grid':  { bn: 'প্রোডাক্ট গ্রিড',      icon: '🛍️' },
  'countdown':     { bn: 'কাউন্টডাউন টাইমার',    icon: '⏰' },
  'video':         { bn: 'ভিডিও সেকশন',          icon: '🎬' },
  'gallery':       { bn: 'ইমেজ গ্যালারি',        icon: '🖼️' },
};

interface PreviewModalProps {
  template: BuilderTemplate;
  onClose: () => void;
  onUse: (templateId: string) => void;
  isSubmitting: boolean;
}

function PreviewModal({ template, onClose, onUse, isSubmitting }: PreviewModalProps) {
  const previewBg = buildPreviewGradient(template.primaryColor, template.accentColor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${template.primaryColor}, ${template.accentColor})` }}
        >
          <div>
            <p className="font-bold text-lg">{template.nameBn}</p>
            <p className="text-sm opacity-80">{template.name} · {template.industry}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Mini visual preview */}
          <div
            className="rounded-xl overflow-hidden border border-gray-100 shadow-inner"
            style={{ background: previewBg, minHeight: '160px' }}
          >
            <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[160px]">
              {/* Mock hero */}
              <div
                className="w-full rounded-lg p-4 flex flex-col items-center gap-2"
                style={{ background: `${template.primaryColor}22` }}
              >
                <div className="w-40 h-3 rounded-full bg-white/60" />
                <div className="w-28 h-2 rounded-full bg-white/40" />
                <div
                  className="mt-1 px-5 py-1.5 rounded-full text-xs font-bold text-white shadow"
                  style={{ background: template.accentColor }}
                >
                  অর্ডার করুন
                </div>
              </div>
              {/* Mock badges */}
              <div className="flex gap-2 flex-wrap justify-center">
                {['🚚 ফ্রি ডেলিভারি', '💯 অরিজিনাল', '↩️ রিটার্ন', '💳 COD'].map((b) => (
                  <span key={b} className="text-[11px] px-2 py-0.5 bg-white/30 rounded-full text-white font-medium">{b}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Section list */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              এই টেমপ্লেটে যা থাকবে ({template.defaultSections.length}টি সেকশন):
            </p>
            <div className="space-y-2">
              {template.defaultSections.map((sec, i) => {
                const label = SECTION_LABELS[sec.type] ?? { bn: sec.type, icon: '📄' };
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xl">{label.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{label.bn}</p>
                      {sec.variant && sec.variant !== 'default' && (
                        <p className="text-xs text-gray-400">{sec.variant}</p>
                      )}
                    </div>
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{template.defaultSections.length}</p>
              <p className="text-xs text-blue-500 mt-1">সেকশন</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-700">{template.conversionScore}/১০</p>
              <p className="text-xs text-amber-500 mt-1">কনভার্সন স্কোর</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <p className="text-lg font-bold text-green-700">{template.goal === 'sales' ? 'বিক্রয়' : template.goal === 'leads' ? 'লিড' : 'রেস্তোরাঁ'}</p>
              <p className="text-xs text-green-500 mt-1">লক্ষ্য</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={() => onUse(template.id)}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow transition-all active:scale-95 disabled:opacity-60"
            style={{ background: template.primaryColor }}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            এই টেমপ্লেট ব্যবহার করুন
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE CARD
// ============================================================================

interface TemplateCardProps {
  template: BuilderTemplate;
  onUse: (templateId: string) => void;
  isSubmitting: boolean;
}

function TemplateCard({ template, onUse, isSubmitting }: TemplateCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const previewBg = buildPreviewGradient(template.primaryColor, template.accentColor);

  // Section skeleton shapes for the mini-preview
  const skeletonSections = template.defaultSections.slice(0, 4);

  return (
    <div
      className="group relative rounded-2xl border border-gray-200 overflow-hidden bg-white hover:border-gray-300 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Thumbnail / Preview area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: '300px', background: previewBg }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at top left, ${template.primaryColor}55 0%, transparent 60%), radial-gradient(ellipse at bottom right, ${template.accentColor}44 0%, transparent 60%)`,
          }}
        />

        {/* Browser chrome mock */}
        <div className="absolute inset-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col overflow-hidden">
          {/* Mock browser bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/15 border-b border-white/10 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            <div className="flex-1 mx-2 h-3 rounded-sm bg-white/20" />
          </div>

          {/* Page skeleton */}
          <div className="flex-1 p-2 space-y-1.5 overflow-hidden">
            {/* Hero skeleton */}
            <div
              className="rounded-lg p-3 flex flex-col items-center justify-center gap-1.5"
              style={{ background: `${template.primaryColor}22`, minHeight: '80px' }}
            >
              <div className="w-28 h-3 rounded bg-white/50" />
              <div className="w-20 h-2 rounded bg-white/35" />
              <div
                className="mt-1 px-4 py-1 rounded-full text-[9px] font-bold text-white"
                style={{ background: template.accentColor }}
              >
                অর্ডার করুন
              </div>
            </div>

            {/* Trust badges skeleton */}
            <div className="flex gap-1 justify-center">
              {['🚚', '💯', '↩️', '💳'].map((icon, i) => (
                <div
                  key={i}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm"
                >
                  <span className="text-[9px]">{icon}</span>
                </div>
              ))}
            </div>

            {/* Section skeletons */}
            {skeletonSections.slice(2).map((sec, i) => (
              <div key={i} className="flex gap-1">
                {[1, 2, 3].slice(0, sec.type === 'features' ? 3 : 2).map((_, j) => (
                  <div
                    key={j}
                    className="flex-1 rounded bg-white/15 border border-white/10"
                    style={{ height: '28px' }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Industry badge — top-left */}
        <div
          className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white backdrop-blur-sm border border-white/20"
          style={{ background: `${template.primaryColor}cc` }}
        >
          {template.industry}
        </div>

        {/* Conversion score badge — top-right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
          <Star size={11} className="text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-bold text-gray-800">{template.conversionScore}/১০</span>
        </div>

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-opacity duration-200">
            <button
              onClick={() => onUse(template.id)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-60"
              style={{ background: template.primaryColor }}
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              এই টেমপ্লেট ব্যবহার করুন
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all"
            >
              <Eye size={16} />
              প্রিভিউ দেখুন
            </button>
          </div>
        )}
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && (
        <PreviewModal
          template={template}
          onClose={() => setShowPreview(false)}
          onUse={(id) => { setShowPreview(false); onUse(id); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Card footer info ── */}
      <div className="p-4">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate text-sm leading-tight">
              {template.nameBn}
            </p>
            <p className="text-xs text-gray-400 truncate">{template.name}</p>
          </div>
          {/* Goal pill */}
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            template.goal === 'sales'      ? 'bg-blue-100 text-blue-700' :
            template.goal === 'leads'      ? 'bg-green-100 text-green-700' :
            template.goal === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                                            'bg-purple-100 text-purple-700'
          }`}>
            {template.goal === 'sales'      ? 'বিক্রয়' :
             template.goal === 'leads'      ? 'লিড' :
             template.goal === 'restaurant' ? 'ফুড' : 'ব্র্যান্ড'}
          </span>
        </div>

        {/* Description */}
        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {template.descriptionBn}
        </p>

        {/* Conversion score */}
        <div className="mt-2.5 flex items-center gap-2">
          <ConversionStars score={template.conversionScore} />
          <span className="text-xs text-gray-400">
            রূপান্তর স্কোর: {template.conversionScore}/১০
          </span>
        </div>

        {/* Section count */}
        <p className="mt-1 text-[11px] text-gray-400">
          {template.defaultSections.length}টি সেকশন সহ
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TemplateGallery({ templates, pagesCount }: TemplateGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterGoal>('all');
  const fetcher = useFetcher<{ error?: string }>();

  const isSubmitting = fetcher.state !== 'idle';

  // Filter templates
  const filtered = activeFilter === 'all'
    ? templates
    : templates.filter(t => t.goal === activeFilter);

  // Group by goal for tab counts
  const countByGoal = (goal: TemplateGoal) => templates.filter(t => t.goal === goal).length;

  const handleUseTemplate = (templateId: string) => {
    fetcher.submit(
      { intent: 'create-from-builder-template', templateId },
      { method: 'POST' }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                টেমপ্লেট বেছে নিন
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                আপনার ব্যবসার ধরন অনুযায়ী শুরু করুন
              </p>
            </div>

            <div className="flex items-center gap-3">
              {pagesCount > 0 && (
                <Link
                  to="/app/new-builder"
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  ← আমার পেজগুলো
                </Link>
              )}
              <fetcher.Form method="POST">
                <input type="hidden" name="intent" value="create-blank" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                >
                  <Layout size={15} />
                  শূন্য থেকে শুরু
                </button>
              </fetcher.Form>
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-0.5 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const count = tab.id === 'all' ? templates.length : countByGoal(tab.id as TemplateGoal);
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.labelBn}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Template Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {fetcher.data?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ⚠️ {fetcher.data.error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Layout size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">এই ক্যাটাগরিতে কোনো টেমপ্লেট নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA — Genie shortcut */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900 text-lg">
              ✨ Genie দিয়ে তৈরি করুন
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              AI আপনার জন্য সেরা লেআউট তৈরি করবে — মাত্র ৩টি প্রশ্নের উত্তরে
            </p>
          </div>
          <Link
            to="/app/new-builder/genie"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles size={17} />
            Genie দিয়ে শুরু করুন
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
