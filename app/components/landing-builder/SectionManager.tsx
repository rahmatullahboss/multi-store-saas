/**
 * Section Manager Component
 * 
 * Allows users to toggle sections on/off and reorder them.
 * Uses simple up/down buttons instead of complex drag-and-drop.
 */

import { useState } from 'react';
import { 
  Eye, EyeOff, ChevronUp, ChevronDown, 
  Type, Star, Video, MessageSquare, HelpCircle, ShoppingCart, ShieldCheck, Truck 
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// Available landing page sections
export const LANDING_SECTIONS = [
  {
    id: 'hero',
    name: 'হিরো',
    nameEn: 'Hero',
    description: 'হেডলাইন ও প্রোডাক্ট',
    descriptionEn: 'Headline & Product',
    icon: Type,
    required: true, // Cannot be hidden
  },
  {
    id: 'trust',
    name: 'ট্রাস্ট ব্যাজ',
    nameEn: 'Trust Badges',
    description: 'গ্যারান্টি ও বিশ্বাসযোগ্যতা',
    descriptionEn: 'Guarantee & trust indicators',
    icon: ShieldCheck,
  },
  {
    id: 'features',
    name: 'ফিচার্স',
    nameEn: 'Features',
    description: 'প্রোডাক্টের বৈশিষ্ট্য',
    descriptionEn: 'Product features',
    icon: Star,
  },
  {
    id: 'video',
    name: 'ভিডিও',
    nameEn: 'Video',
    description: 'প্রোডাক্ট ভিডিও/ডেমো',
    descriptionEn: 'Product video/demo',
    icon: Video,
  },
  {
    id: 'testimonials',
    name: 'টেস্টিমোনিয়াল',
    nameEn: 'Testimonials',
    description: 'কাস্টমার রিভিউ',
    descriptionEn: 'Customer reviews',
    icon: MessageSquare,
  },
  {
    id: 'delivery',
    name: 'ডেলিভারি',
    nameEn: 'Delivery Info',
    description: 'শিপিং ও ডেলিভারি তথ্য',
    descriptionEn: 'Shipping & delivery details',
    icon: Truck,
  },
  {
    id: 'faq',
    name: 'FAQ',
    nameEn: 'FAQ',
    description: 'সচরাচর জিজ্ঞাসা',
    descriptionEn: 'Frequently asked questions',
    icon: HelpCircle,
  },
  {
    id: 'guarantee',
    name: 'গ্যারান্টি',
    nameEn: 'Guarantee',
    description: 'রিটার্ন ও রিফান্ড পলিসি',
    descriptionEn: 'Return & refund policy',
    icon: ShieldCheck,
  },
  {
    id: 'cta',
    name: 'CTA',
    nameEn: 'CTA',
    description: 'অর্ডার ফর্ম',
    descriptionEn: 'Order form',
    icon: ShoppingCart,
    required: true, // Cannot be hidden
  },
];

// Default section order
export const DEFAULT_SECTION_ORDER = ['hero', 'trust', 'features', 'video', 'testimonials', 'delivery', 'faq', 'guarantee', 'cta'];

interface SectionManagerProps {
  sectionOrder: string[];
  hiddenSections: string[];
  onOrderChange: (newOrder: string[]) => void;
  onVisibilityChange: (sectionId: string, visible: boolean) => void;
}

export function SectionManager({
  sectionOrder,
  hiddenSections,
  onOrderChange,
  onVisibilityChange,
}: SectionManagerProps) {
  const { lang: language } = useTranslation();

  // Get ordered sections
  const orderedSections = sectionOrder
    .map((id) => LANDING_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as typeof LANDING_SECTIONS;

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap sections
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onOrderChange(newOrder);
  };

  const toggleVisibility = (sectionId: string) => {
    const section = LANDING_SECTIONS.find((s) => s.id === sectionId);
    if (section?.required) return; // Cannot hide required sections
    
    const isHidden = hiddenSections.includes(sectionId);
    onVisibilityChange(sectionId, isHidden);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          {language === 'bn' ? 'সেকশন ম্যানেজার' : 'Section Manager'}
        </h3>
        <p className="text-sm text-gray-500">
          {language === 'bn' 
            ? 'সেকশন অন/অফ করুন এবং অর্ডার পরিবর্তন করুন' 
            : 'Toggle sections on/off and reorder them'}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {orderedSections.map((section, index) => {
          const isHidden = hiddenSections.includes(section.id);
          const isFirst = index === 0;
          const isLast = index === orderedSections.length - 1;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isHidden ? 'bg-gray-50 opacity-60' : 'bg-white'
              }`}
            >
              {/* Section Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isHidden ? 'bg-gray-200' : 'bg-emerald-100'
              }`}>
                <Icon className={`w-4 h-4 ${isHidden ? 'text-gray-400' : 'text-emerald-600'}`} />
              </div>

              {/* Section Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                  {language === 'bn' ? section.name : section.nameEn}
                  {section.required && (
                    <span className="ml-2 text-xs text-amber-600 font-normal">
                      ({language === 'bn' ? 'আবশ্যক' : 'Required'})
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {language === 'bn' ? section.description : section.descriptionEn}
                </p>
              </div>

              {/* Visibility Toggle */}
              <button
                onClick={() => toggleVisibility(section.id)}
                disabled={section.required}
                className={`p-2 rounded-lg transition-colors ${
                  section.required
                    ? 'text-gray-300 cursor-not-allowed'
                    : isHidden
                    ? 'text-gray-400 hover:bg-gray-100'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
                title={isHidden ? 'Show section' : 'Hide section'}
              >
                {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {/* Move Up/Down Buttons */}
              <div className="flex flex-col">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={isFirst}
                  className={`p-1 rounded transition-colors ${
                    isFirst
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={isLast}
                  className={`p-1 rounded transition-colors ${
                    isLast
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Preview component showing section order
interface SectionPreviewProps {
  sectionOrder: string[];
  hiddenSections: string[];
}

export function SectionPreview({ sectionOrder, hiddenSections }: SectionPreviewProps) {
  const { lang: language } = useTranslation();
  
  const visibleSections = sectionOrder.filter((id) => !hiddenSections.includes(id));

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        {language === 'bn' ? 'পেজ প্রিভিউ' : 'Page Preview'}
      </h4>
      <div className="space-y-2">
        {visibleSections.map((sectionId) => {
          const section = LANDING_SECTIONS.find((s) => s.id === sectionId);
          if (!section) return null;
          
          return (
            <div
              key={sectionId}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
            >
              <section.icon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">
                {language === 'bn' ? section.name : section.nameEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
