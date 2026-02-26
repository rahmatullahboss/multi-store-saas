/**
 * AddSectionModal — Section picker modal for the builder
 *
 * Left: category sidebar | Right: 3-col grid of section cards
 */

import { useState, useMemo } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { SectionMeta, SectionType } from '~/lib/page-builder/types';

// ── Category definitions ──────────────────────────────────────────────────────

interface Category {
  id: string;
  label: string;
  types: SectionType[];
}

const CATEGORIES: Category[] = [
  {
    id: 'all',
    label: 'সব',
    types: [],
  },
  {
    id: 'hero',
    label: 'হিরো ও হেডার',
    types: ['hero', 'header', 'countdown'],
  },
  {
    id: 'products',
    label: 'পণ্য',
    types: ['cta', 'order-form', 'order-button', 'product-grid', 'showcase', 'pricing'],
  },
  {
    id: 'social',
    label: 'সোশ্যাল প্রুফ',
    types: ['testimonials', 'social-proof', 'stats', 'gallery'],
  },
  {
    id: 'info',
    label: 'তথ্য',
    types: ['features', 'benefits', 'how-to-order', 'delivery', 'guarantee', 'comparison'],
  },
  {
    id: 'faq',
    label: 'FAQ',
    types: ['faq'],
  },
  {
    id: 'contact',
    label: 'যোগাযোগ',
    types: ['contact', 'newsletter'],
  },
  {
    id: 'media',
    label: 'মিডিয়া',
    types: ['video', 'rich-text', 'custom-html'],
  },
  {
    id: 'footer',
    label: 'ফুটার',
    types: ['footer', 'trust-badges'],
  },
];

// Card color scheme based on category
const CARD_COLORS: Record<string, { bg: string; sketch: string; badge: string }> = {
  hero: { bg: '#1e1b4b', sketch: '#6366f1', badge: 'bg-indigo-500/20 text-indigo-300' },
  header: { bg: '#1e1b4b', sketch: '#6366f1', badge: 'bg-indigo-500/20 text-indigo-300' },
  countdown: { bg: '#450a0a', sketch: '#ef4444', badge: 'bg-red-500/20 text-red-300' },
  cta: { bg: '#14532d', sketch: '#22c55e', badge: 'bg-green-500/20 text-green-300' },
  'order-form': { bg: '#14532d', sketch: '#22c55e', badge: 'bg-green-500/20 text-green-300' },
  'order-button': { bg: '#14532d', sketch: '#22c55e', badge: 'bg-green-500/20 text-green-300' },
  'product-grid': { bg: '#0c4a6e', sketch: '#38bdf8', badge: 'bg-sky-500/20 text-sky-300' },
  showcase: { bg: '#0c4a6e', sketch: '#38bdf8', badge: 'bg-sky-500/20 text-sky-300' },
  pricing: { bg: '#0c4a6e', sketch: '#38bdf8', badge: 'bg-sky-500/20 text-sky-300' },
  testimonials: { bg: '#2e1065', sketch: '#a855f7', badge: 'bg-purple-500/20 text-purple-300' },
  'social-proof': { bg: '#2e1065', sketch: '#a855f7', badge: 'bg-purple-500/20 text-purple-300' },
  stats: { bg: '#2e1065', sketch: '#a855f7', badge: 'bg-purple-500/20 text-purple-300' },
  gallery: { bg: '#2e1065', sketch: '#a855f7', badge: 'bg-purple-500/20 text-purple-300' },
  features: { bg: '#1c1917', sketch: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300' },
  benefits: { bg: '#1c1917', sketch: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300' },
  default: { bg: '#1e293b', sketch: '#64748b', badge: 'bg-slate-500/20 text-slate-300' },
};

function getCardColor(type: string) {
  return CARD_COLORS[type] ?? CARD_COLORS['default'];
}

// ── Mini wireframe preview ────────────────────────────────────────────────────

function SectionPreview({ type }: { type: string }) {
  const { bg, sketch } = getCardColor(type);

  const renderWireframe = () => {
    switch (type) {
      case 'hero':
      case 'header':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="5" y="8" width="70" height="8" rx="2" fill={sketch} opacity="0.8" />
            <rect x="15" y="20" width="50" height="4" rx="1" fill={sketch} opacity="0.4" />
            <rect x="25" y="28" width="30" height="8" rx="2" fill={sketch} opacity="0.9" />
          </svg>
        );
      case 'countdown':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="5" y="5" width="70" height="12" rx="2" fill={sketch} opacity="0.6" />
            {[10, 27, 44, 61].map((x, i) => (
              <rect key={i} x={x} y="22" width="12" height="16" rx="2" fill={sketch} opacity="0.8" />
            ))}
          </svg>
        );
      case 'cta':
      case 'order-form':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="5" y="5" width="45" height="6" rx="1" fill={sketch} opacity="0.5" />
            <rect x="5" y="14" width="70" height="5" rx="1" fill={sketch} opacity="0.3" />
            <rect x="5" y="22" width="70" height="5" rx="1" fill={sketch} opacity="0.3" />
            <rect x="5" y="30" width="70" height="5" rx="1" fill={sketch} opacity="0.3" />
            <rect x="15" y="39" width="50" height="7" rx="2" fill={sketch} opacity="0.9" />
          </svg>
        );
      case 'features':
      case 'benefits':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="20" y="5" width="40" height="5" rx="1" fill={sketch} opacity="0.6" />
            {[0, 26, 52].map((x) => (
              <g key={x}>
                <rect x={x + 3} y="15" width="22" height="22" rx="2" fill={sketch} opacity="0.25" />
                <circle cx={x + 14} cy="22" r="4" fill={sketch} opacity="0.8" />
                <rect x={x + 6} y="28" width="16" height="3" rx="1" fill={sketch} opacity="0.4" />
              </g>
            ))}
          </svg>
        );
      case 'testimonials':
      case 'social-proof':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="20" y="4" width="40" height="5" rx="1" fill={sketch} opacity="0.6" />
            {[2, 28, 54].map((x) => (
              <g key={x}>
                <rect x={x} y="13" width="24" height="18" rx="2" fill={sketch} opacity="0.2" />
                <circle cx={x + 5} cy="18" r="3" fill={sketch} opacity="0.7" />
                <rect x={x + 3} y="23" width="18" height="2" rx="1" fill={sketch} opacity="0.4" />
                <rect x={x + 3} y="27" width="12" height="2" rx="1" fill={sketch} opacity="0.3" />
              </g>
            ))}
          </svg>
        );
      case 'gallery':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            {[2, 22, 42, 62].map((x) => (
              <rect key={x} x={x} y="8" width="16" height="34" rx="2" fill={sketch} opacity="0.5" />
            ))}
          </svg>
        );
      case 'faq':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="20" y="4" width="40" height="5" rx="1" fill={sketch} opacity="0.6" />
            {[14, 22, 30, 38].map((y) => (
              <g key={y}>
                <rect x="5" y={y} width="60" height="5" rx="1" fill={sketch} opacity="0.25" />
                <rect x="5" y={y} width="55" height="3" rx="1" fill={sketch} opacity="0.4" />
              </g>
            ))}
          </svg>
        );
      case 'footer':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="0" y="25" width="80" height="25" fill={sketch} opacity="0.15" />
            <circle cx="15" cy="35" r="5" fill={sketch} opacity="0.5" />
            <rect x="25" y="30" width="30" height="3" rx="1" fill={sketch} opacity="0.4" />
            <rect x="25" y="36" width="20" height="2" rx="1" fill={sketch} opacity="0.3" />
            {[55, 62, 69].map((x) => (
              <circle key={x} cx={x} cy="40" r="4" fill={sketch} opacity="0.5" />
            ))}
          </svg>
        );
      case 'video':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="5" y="8" width="70" height="34" rx="3" fill={sketch} opacity="0.2" />
            <polygon points="35,18 35,32 50,25" fill={sketch} opacity="0.8" />
          </svg>
        );
      case 'stats':
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            {[2, 22, 42, 62].map((x) => (
              <g key={x}>
                <rect x={x} y="20" width="16" height="22" rx="2" fill={sketch} opacity="0.3" />
                <rect x={x + 2} y="12" width="12" height="6" rx="1" fill={sketch} opacity="0.7" />
              </g>
            ))}
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 80 50" className="w-full h-full">
            <rect x="10" y="8" width="60" height="8" rx="2" fill={sketch} opacity="0.5" />
            <rect x="5" y="20" width="70" height="4" rx="1" fill={sketch} opacity="0.3" />
            <rect x="5" y="28" width="50" height="4" rx="1" fill={sketch} opacity="0.3" />
            <rect x="20" y="36" width="40" height="7" rx="2" fill={sketch} opacity="0.7" />
          </svg>
        );
    }
  };

  return (
    <div
      className="w-full h-20 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      {renderWireframe()}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  meta: SectionMeta;
  onClick: () => void;
}

function SectionCard({ meta, onClick }: SectionCardProps) {
  const { badge } = getCardColor(meta.type);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-2 p-2.5 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-[#1a1a2e] hover:bg-[#1e1e35] transition-all text-left"
    >
      <SectionPreview type={meta.type} />
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-200 truncate">{meta.name}</p>
          <p className="text-[10px] text-gray-500 truncate mt-0.5">{meta.nameEn}</p>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${badge}`}>
          v1
        </span>
      </div>
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export interface AddSectionModalProps {
  availableSections: SectionMeta[];
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

export function AddSectionModal({ availableSections, onAdd, onClose }: AddSectionModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    // Remove duplicates (some section types appear twice in registry e.g. 'trust' and 'trust-badges')
    const seen = new Set<string>();
    const deduped = availableSections.filter((s) => {
      if (seen.has(s.type)) return false;
      seen.add(s.type);
      return true;
    });

    // Filter by search first
    const bySearch = search.trim()
      ? deduped.filter(
          (s) =>
            s.name.includes(search) ||
            s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
            s.type.includes(search.toLowerCase())
        )
      : deduped;

    // Then by category
    if (activeCategory === 'all') return bySearch;
    const cat = CATEGORIES.find((c) => c.id === activeCategory);
    if (!cat) return bySearch;
    return bySearch.filter((s) => cat.types.includes(s.type as SectionType));
  }, [availableSections, activeCategory, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">সেকশন যোগ করুন</h2>
            <p className="text-xs text-gray-400 mt-0.5">আপনার পেজে যোগ করতে একটি সেকশন বেছে নিন</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="সার্চ করুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Category sidebar */}
          <div className="w-44 shrink-0 border-r border-white/10 py-3 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'text-white bg-indigo-600/20 border-r-2 border-indigo-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Section grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                কোনো সেকশন পাওয়া যায়নি
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((meta) => (
                  <SectionCard
                    key={meta.type}
                    meta={meta}
                    onClick={() => {
                      onAdd(meta.type as SectionType);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filtered.length} টি সেকশন পাওয়া গেছে
          </p>
          <a
            href="?pro=1"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ExternalLink size={12} />
            GrapesJS Pro Mode →
          </a>
        </div>
      </div>
    </div>
  );
}
