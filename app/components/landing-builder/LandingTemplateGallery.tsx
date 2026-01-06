/**
 * Landing Template Gallery Component
 * 
 * Displays 6 pre-designed landing page templates with visual previews.
 * Users can click to preview and select templates.
 */

import { useState } from 'react';
import { Check, Eye, Sparkles } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// Template definitions with metadata
export const LANDING_TEMPLATES = [
  {
    id: 'modern-dark',
    name: 'সেলস ফোকাস',
    nameEn: 'Sales Focus',
    description: 'বোল্ড আর্জেন্সি, কাউন্টডাউন টাইমার',
    descriptionEn: 'Bold urgency, countdown timer',
    category: 'sales',
    emoji: '🔥',
    colors: {
      primary: '#1a1a2e',
      accent: '#e94560',
      bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    preview: '/templates/modern-dark.png',
  },
  {
    id: 'minimal-light',
    name: 'মিনিমাল লাইট',
    nameEn: 'Minimal Light',
    description: 'পরিষ্কার, এলিগ্যান্ট ডিজাইন',
    descriptionEn: 'Clean, elegant design',
    category: 'minimal',
    emoji: '✨',
    colors: {
      primary: '#ffffff',
      accent: '#6366f1',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
    preview: '/templates/minimal-light.png',
  },
  {
    id: 'video-focus',
    name: 'ভিডিও হিরো',
    nameEn: 'Video Hero',
    description: 'ভিডিও হিসেবে মূল এলিমেন্ট',
    descriptionEn: 'Video as main element',
    category: 'video',
    emoji: '🎬',
    colors: {
      primary: '#0f172a',
      accent: '#f59e0b',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
    preview: '/templates/video-focus.png',
  },
  {
    id: 'testimonial',
    name: 'টেস্টিমোনিয়াল হেভি',
    nameEn: 'Testimonial Heavy',
    description: 'সোশ্যাল প্রুফ ফোকাসড',
    descriptionEn: 'Social proof focused',
    category: 'trust',
    emoji: '⭐',
    colors: {
      primary: '#fefce8',
      accent: '#ca8a04',
      bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
    },
    preview: '/templates/testimonial.png',
  },
  {
    id: 'flash-sale',
    name: 'ফ্ল্যাশ সেল',
    nameEn: 'Flash Sale',
    description: 'লাল আর্জেন্সি, লিমিটেড স্টক',
    descriptionEn: 'Red urgency, limited stock',
    category: 'sales',
    emoji: '⚡',
    colors: {
      primary: '#7f1d1d',
      accent: '#fbbf24',
      bg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    },
    preview: '/templates/flash-sale.png',
  },
  {
    id: 'premium',
    name: 'প্রিমিয়াম',
    nameEn: 'Premium',
    description: 'লাক্সারি লুক, গোল্ড অ্যাকসেন্ট',
    descriptionEn: 'Luxury look, gold accents',
    category: 'premium',
    emoji: '👑',
    colors: {
      primary: '#18181b',
      accent: '#d4af37',
      bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    },
    preview: '/templates/premium.png',
  },
];

interface LandingTemplateGalleryProps {
  selectedTemplateId?: string;
  onSelect: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

export function LandingTemplateGallery({
  selectedTemplateId,
  onSelect,
  onPreview,
}: LandingTemplateGalleryProps) {
  const { t, lang: language } = useTranslation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {LANDING_TEMPLATES.map((template) => {
        const isSelected = selectedTemplateId === template.id;
        const isHovered = hoveredId === template.id;
        const name = language === 'bn' ? template.name : template.nameEn;
        const description = language === 'bn' ? template.description : template.descriptionEn;

        return (
          <div
            key={template.id}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
              isSelected
                ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onMouseEnter={() => setHoveredId(template.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(template.id)}
          >
            {/* Template Preview */}
            <div
              className="h-40 relative flex items-center justify-center"
              style={{ background: template.colors.bg }}
            >
              {/* Placeholder preview design */}
              <div className="absolute inset-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">{template.emoji}</span>
                <div 
                  className="w-20 h-2 rounded-full"
                  style={{ backgroundColor: template.colors.accent }}
                />
                <div className="flex gap-1 mt-1">
                  <div className="w-6 h-1 rounded bg-white/40" />
                  <div className="w-6 h-1 rounded bg-white/40" />
                  <div className="w-6 h-1 rounded bg-white/40" />
                </div>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Hover overlay */}
              {isHovered && !isSelected && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview?.(template.id);
                    }}
                    className="px-3 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-gray-100 transition"
                  >
                    <Eye className="w-4 h-4" />
                    {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                  </button>
                  <button
                    className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-emerald-600 transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    {language === 'bn' ? 'সিলেক্ট' : 'Select'}
                  </button>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">{template.emoji}</span>
                <h3 className="font-semibold text-gray-900">{name}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Category filter component
interface TemplateCategoryFilterProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function TemplateCategoryFilter({ selectedCategory, onSelect }: TemplateCategoryFilterProps) {
  const { lang: language } = useTranslation();
  
  const categories = [
    { id: 'all', name: 'সব টেমপ্লেট', nameEn: 'All Templates', emoji: '📋' },
    { id: 'sales', name: 'সেলস', nameEn: 'Sales', emoji: '🔥' },
    { id: 'minimal', name: 'মিনিমাল', nameEn: 'Minimal', emoji: '✨' },
    { id: 'video', name: 'ভিডিও', nameEn: 'Video', emoji: '🎬' },
    { id: 'trust', name: 'ট্রাস্ট', nameEn: 'Trust', emoji: '⭐' },
    { id: 'premium', name: 'প্রিমিয়াম', nameEn: 'Premium', emoji: '👑' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedCategory === cat.id
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
          }`}
        >
          {cat.emoji} {language === 'bn' ? cat.name : cat.nameEn}
        </button>
      ))}
    </div>
  );
}
