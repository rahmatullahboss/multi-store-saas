/**
 * Section Manager Component
 * 
 * Allows users to toggle sections on/off, reorder them via drag & drop, and edit their content inline.
 * Uses expandable panels for inline editing instead of separate accordion sections.
 * Phase 2: Added drag and drop using @dnd-kit/sortable
 */

import { useState, memo, useCallback } from 'react';
import { 
  Eye, EyeOff, ChevronUp, ChevronDown, Edit2, ChevronRight, Plus, Trash2, Upload, X,
  Type, Star, Video, MessageSquare, HelpCircle, ShoppingCart, ShieldCheck, Truck,
  Image, CheckCircle, Layers, Users, Loader2, GripVertical, Code
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Available landing page sections (Phase 3: More beginner-friendly labels)
export const LANDING_SECTIONS = [
  {
    id: 'hero',
    name: 'হেডার',
    nameEn: 'Header',
    description: 'প্রথমে যা দেখা যাবে',
    descriptionEn: 'What visitors see first',
    icon: Type,
    required: true,
    editable: true,
  },
  {
    id: 'trust',
    name: 'বিশ্বাসযোগ্যতা',
    nameEn: 'Trust Badges',
    description: 'গ্যারান্টি ও নিরাপত্তা',
    descriptionEn: 'Guarantee & safety indicators',
    icon: ShieldCheck,
    editable: true,
  },
  {
    id: 'features',
    name: 'বৈশিষ্ট্য',
    nameEn: 'Features',
    description: 'প্রোডাক্টের সুবিধাসমূহ',
    descriptionEn: 'Product benefits', 
    icon: Star,
    editable: true,
  },
  {
    id: 'gallery',
    name: 'ফটো গ্যালারি',
    nameEn: 'Photo Gallery',
    description: 'প্রোডাক্ট ইমেজ গ্যালারি',
    descriptionEn: 'Product image gallery',
    icon: Image,
    editable: true,
  },
  {
    id: 'video',
    name: 'ভিডিও',
    nameEn: 'Video',
    description: 'প্রোডাক্ট ভিডিও/ডেমো',
    descriptionEn: 'Product video/demo',
    icon: Video,
    editable: true,
  },
  {
    id: 'benefits',
    name: 'কেন কিনবেন',
    nameEn: 'Why Buy Us',
    description: 'কেন আমাদের থেকে কিনবেন',
    descriptionEn: 'Why buy from us',
    icon: CheckCircle,
    editable: true,
  },
  {
    id: 'comparison',
    name: 'তুলনা',
    nameEn: 'Comparison',
    description: 'আগে/পরে বা প্রতিযোগী তুলনা',
    descriptionEn: 'Before/After or competitor comparison',
    icon: Layers,
    editable: true,
  },
  {
    id: 'testimonials',
    name: 'টেস্টিমোনিয়াল',
    nameEn: 'Testimonials',
    description: 'কাস্টমার রিভিউ',
    descriptionEn: 'Customer reviews',
    icon: MessageSquare,
    editable: true,
  },
  {
    id: 'social',
    name: 'সোশ্যাল প্রুফ',
    nameEn: 'Social Proof',
    description: 'অর্ডার/ভিজিটর সংখ্যা',
    descriptionEn: 'Orders/visitors count',
    icon: Users,
    editable: true,
  },
  {
    id: 'delivery',
    name: 'ডেলিভারি',
    nameEn: 'Delivery Info',
    description: 'শিপিং ও ডেলিভারি তথ্য',
    descriptionEn: 'Shipping & delivery details',
    icon: Truck,
    editable: true,
  },
  {
    id: 'faq',
    name: 'FAQ',
    nameEn: 'FAQ',
    description: 'সচরাচর জিজ্ঞাসা',
    descriptionEn: 'Frequently asked questions',
    icon: HelpCircle,
    editable: true,
  },
  {
    id: 'guarantee',
    name: 'গ্যারান্টি',
    nameEn: 'Guarantee',
    description: 'রিটার্ন ও রিফান্ড পলিসি',
    descriptionEn: 'Return & refund policy',
    icon: ShieldCheck,
    editable: true,
  },
  {
    id: 'cta',
    name: 'অর্ডার ফর্ম',
    nameEn: 'Order Form',
    description: 'যেখানে কাস্টমার অর্ডার করবে',
    descriptionEn: 'Where customers place orders',
    icon: ShoppingCart,
    required: true,
    editable: true,
  },
  {
    id: 'custom',
    name: 'কাস্টম কোড',
    nameEn: 'Custom Code',
    description: 'HTML/CSS কোড ইমপোর্ট করুন',
    descriptionEn: 'Import custom HTML/CSS code',
    icon: Code,
    editable: true,
  },
];

// Default section order
export const DEFAULT_SECTION_ORDER = ['hero', 'trust', 'features', 'gallery', 'video', 'benefits', 'comparison', 'testimonials', 'social', 'delivery', 'faq', 'guarantee', 'cta', 'custom'];

// Types for section content
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  text?: string;
  imageUrl?: string;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface Comparison {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  description?: string;
}

export interface SocialProof {
  count: number;
  text: string;
}

interface SectionManagerProps {
  sectionOrder: string[];
  hiddenSections: string[];
  onOrderChange: (newOrder: string[]) => void;
  onVisibilityChange: (sectionId: string, visible: boolean) => void;
  // Hero section
  headline?: string;
  onHeadlineChange?: (headline: string) => void;
  subheadline?: string;
  onSubheadlineChange?: (subheadline: string) => void;
  ctaText?: string;
  onCtaTextChange?: (ctaText: string) => void;
  // Trust badges
  trustBadges?: Array<{ icon: string; text: string }>;
  onTrustBadgesChange?: (badges: Array<{ icon: string; text: string }>) => void;
  // Delivery info
  deliveryInfo?: { title: string; description: string; areas?: string[] };
  onDeliveryInfoChange?: (info: { title: string; description: string; areas?: string[] }) => void;
  // Content editing props
  features?: Feature[];
  onFeaturesChange?: (features: Feature[]) => void;
  faq?: FAQ[];
  onFaqChange?: (faq: FAQ[]) => void;
  testimonials?: Testimonial[];
  onTestimonialsChange?: (testimonials: Testimonial[]) => void;
  videoUrl?: string;
  onVideoUrlChange?: (url: string) => void;
  guaranteeText?: string;
  onGuaranteeTextChange?: (text: string) => void;
  // Image upload
  onTestimonialImageUpload?: (file: File, index: number) => void;
  onTestimonialImageRemove?: (index: number) => void;
  uploadingIndex?: number | null;
  // New sections
  galleryImages?: string[];
  onGalleryImagesChange?: (images: string[]) => void;
  benefits?: Benefit[];
  onBenefitsChange?: (benefits: Benefit[]) => void;
  comparison?: Comparison;
  onComparisonChange?: (comparison: Comparison) => void;
  socialProof?: SocialProof;
  onSocialProofChange?: (socialProof: SocialProof) => void;
  // Order Form Layout
  orderFormVariant?: 'full-width' | 'compact';
  onOrderFormVariantChange?: (variant: 'full-width' | 'compact') => void;
  // Custom code sections
  customSections?: Array<{ id: string; name: string; html: string; css?: string }>;
  onCustomSectionsChange?: (sections: Array<{ id: string; name: string; html: string; css?: string }>) => void;
  onAddCustomSection?: () => void;
}

function SectionManagerBase({
  sectionOrder,
  hiddenSections,
  onOrderChange,
  onVisibilityChange,
  // Hero section
  headline = '',
  onHeadlineChange,
  subheadline = '',
  onSubheadlineChange,
  ctaText = '',
  onCtaTextChange,
  // Trust badges
  trustBadges = [],
  onTrustBadgesChange,
  // Delivery info
  deliveryInfo = { title: '', description: '', areas: [] },
  onDeliveryInfoChange,
  // Features
  features = [],
  onFeaturesChange,
  faq = [],
  onFaqChange,
  testimonials = [],
  onTestimonialsChange,
  videoUrl = '',
  onVideoUrlChange,
  guaranteeText = '',
  onGuaranteeTextChange,
  onTestimonialImageUpload,
  onTestimonialImageRemove,
  uploadingIndex,
  // New sections
  galleryImages = [],
  onGalleryImagesChange,
  benefits = [],
  onBenefitsChange,
  comparison = {},
  onComparisonChange,
  socialProof = { count: 0, text: '' },
  onSocialProofChange,
  // Order form layout
  orderFormVariant = 'full-width',
  onOrderFormVariantChange,
  // Custom code sections
  customSections = [],
  onCustomSectionsChange,
  onAddCustomSection,
}: SectionManagerProps) {
  const { lang: language } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Get ordered sections - include any missing sections from LANDING_SECTIONS
  const orderedSections = (() => {
    const ordered = sectionOrder
      .map((id) => LANDING_SECTIONS.find((s) => s.id === id))
      .filter(Boolean) as typeof LANDING_SECTIONS;
    
    // Add any sections not in the current order (for backwards compatibility)
    const missingSection = LANDING_SECTIONS.filter(
      (section) => !sectionOrder.includes(section.id)
    );
    
    return [...ordered, ...missingSection];
  })();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Build full order including missing sections
      const fullOrder = orderedSections.map(s => s.id);
      const oldIndex = fullOrder.indexOf(active.id as string);
      const newIndex = fullOrder.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(fullOrder, oldIndex, newIndex);
        onOrderChange(newOrder);
      }
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onOrderChange(newOrder);
  };

  const toggleVisibility = (sectionId: string) => {
    const section = LANDING_SECTIONS.find((s) => s.id === sectionId);
    if (section?.required) return;
    
    const isHidden = hiddenSections.includes(sectionId);
    onVisibilityChange(sectionId, isHidden);
  };

  const toggleExpand = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Render inline editor for each section type
  const renderSectionEditor = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'হেডলাইন' : 'Headline'}
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => onHeadlineChange?.(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার প্রোডাক্টের নাম' : 'Your product name'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'সাবহেডলাইন' : 'Subheadline'}
              </label>
              <textarea
                value={subheadline}
                onChange={(e) => onSubheadlineChange?.(e.target.value)}
                placeholder={language === 'bn' ? 'প্রোডাক্টের সংক্ষিপ্ত বর্ণনা' : 'Short product description'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'বাটন টেক্সট' : 'Button Text'}
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => onCtaTextChange?.(e.target.value)}
                placeholder={language === 'bn' ? 'এখনই অর্ডার করুন' : 'Order Now'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'trust':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {language === 'bn' ? 'কাস্টমারদের বিশ্বাস অর্জনের জন্য ব্যাজ যোগ করুন' : 'Add badges to build customer trust'}
            </p>
            {trustBadges.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                <p className="mb-1">
                  {language === 'bn' ? '🛡️ ট্রাস্ট ব্যাজ যোগ করুন' : '🛡️ Add trust badges'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'bn' ? 'যেমন: ✅ ফ্রি ডেলিভারি, 🔒 সিকিউর পেমেন্ট' : 'e.g., ✅ Free Delivery, 🔒 Secure Payment'}
                </p>
              </div>
            )}
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-white rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={badge.icon}
                  onChange={(e) => {
                    const newBadges = [...trustBadges];
                    newBadges[index].icon = e.target.value;
                    onTrustBadgesChange?.(newBadges);
                  }}
                  placeholder="✅"
                  className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                />
                <input
                  type="text"
                  value={badge.text}
                  onChange={(e) => {
                    const newBadges = [...trustBadges];
                    newBadges[index].text = e.target.value;
                    onTrustBadgesChange?.(newBadges);
                  }}
                  placeholder={language === 'bn' ? 'ব্যাজ টেক্সট' : 'Badge text'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onTrustBadgesChange?.(trustBadges.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onTrustBadgesChange?.([...trustBadges, { icon: '✅', text: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'ব্যাজ যোগ করুন' : 'Add Badge'}
            </button>
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'ডেলিভারি শিরোনাম' : 'Delivery Title'}
              </label>
              <input
                type="text"
                value={deliveryInfo.title}
                onChange={(e) => onDeliveryInfoChange?.({ ...deliveryInfo, title: e.target.value })}
                placeholder={language === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Cash on Delivery Nationwide'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'ডেলিভারি বিবরণ' : 'Delivery Description'}
              </label>
              <textarea
                value={deliveryInfo.description}
                onChange={(e) => onDeliveryInfoChange?.({ ...deliveryInfo, description: e.target.value })}
                placeholder={language === 'bn' ? 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৩ দিন' : 'Dhaka 1-2 days, Outside Dhaka 2-3 days'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'ডেলিভারি এরিয়া (প্রতিটি লাইনে একটি)' : 'Delivery Areas (one per line)'}
              </label>
              <textarea
                value={deliveryInfo.areas?.join('\n') || ''}
                onChange={(e) => onDeliveryInfoChange?.({ 
                  ...deliveryInfo, 
                  areas: e.target.value.split('\n').filter(a => a.trim()) 
                })}
                placeholder={language === 'bn' ? 'ঢাকা\nচট্টগ্রাম\nসিলেট' : 'Dhaka\nChittagong\nSylhet'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            {/* Helpful empty state */}
            {features.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                <p className="mb-1">
                  {language === 'bn' ? '🎯 প্রোডাক্টের সুবিধাগুলো যোগ করুন' : '🎯 Add your product benefits'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'bn' ? 'নিচের বাটনে ক্লিক করুন' : 'Click the button below'}
                </p>
              </div>
            )}
            {features.map((feature, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].icon = e.target.value;
                      onFeaturesChange?.(newFeatures);
                    }}
                    placeholder="✅"
                    className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                  />
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].title = e.target.value;
                      onFeaturesChange?.(newFeatures);
                    }}
                    placeholder={language === 'bn' ? 'টাইটেল' : 'Title'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) => {
                    const newFeatures = [...features];
                    newFeatures[index].description = e.target.value;
                    onFeaturesChange?.(newFeatures);
                  }}
                  placeholder={language === 'bn' ? 'বর্ণনা' : 'Description'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onFeaturesChange?.(features.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onFeaturesChange?.([...features, { icon: '✅', title: '', description: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'ফিচার যোগ করুন' : 'Add Feature'}
            </button>
          </div>
        );

      case 'video':
        return (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {language === 'bn' ? 'ভিডিও URL (YouTube/Vimeo)' : 'Video URL (YouTube/Vimeo)'}
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange?.(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {language === 'bn' 
                ? 'স্ক্রিনশট আপলোড করুন (প্রস্তাবিত সাইজ: 400x300px)'
                : 'Upload screenshots (Recommended: 400x300px)'}
            </p>
            {/* Helpful empty state */}
            {testimonials.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                <p className="mb-1">
                  {language === 'bn' ? '⭐ কাস্টমার রিভিউ যোগ করুন' : '⭐ Add customer reviews'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'bn' ? 'Facebook/WhatsApp থেকে স্ক্রিনশট আপলোড করুন' : 'Upload screenshots from Facebook/WhatsApp'}
                </p>
              </div>
            )}
            {testimonials.map((item, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                {item.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt="Review screenshot" 
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => onTestimonialImageRemove?.(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-sm"
                      title={language === 'bn' ? 'ছবি মুছুন' : 'Remove image'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onTestimonialImageUpload?.(file, index);
                        }
                        e.target.value = '';
                      }}
                      disabled={uploadingIndex === index}
                    />
                    <div className={`border-2 border-dashed rounded-lg p-3 text-center transition ${
                      uploadingIndex === index 
                        ? 'border-emerald-400 bg-emerald-50' 
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
                    }`}>
                      {uploadingIndex === index ? (
                        <>
                          <Loader2 className="w-5 h-5 text-emerald-500 mx-auto mb-1 animate-spin" />
                          <p className="text-xs text-emerald-600">
                            {language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">
                            {language === 'bn' ? 'ক্লিক করে আপলোড করুন' : 'Click to upload'}
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => onTestimonialsChange?.(testimonials.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onTestimonialsChange?.([...testimonials, { name: '', imageUrl: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'রিভিউ যোগ করুন' : 'Add Review'}
            </button>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            {/* Helpful empty state */}
            {faq.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                <p className="mb-1">
                  {language === 'bn' ? '❓ সচরাচর প্রশ্ন যোগ করুন' : '❓ Add common questions'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'bn' ? 'কাস্টমারদের সাধারণ প্রশ্নের উত্তর দিন' : 'Answer common customer questions'}
                </p>
              </div>
            )}
            {faq.map((item, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const newFaq = [...faq];
                    newFaq[index].question = e.target.value;
                    onFaqChange?.(newFaq);
                  }}
                  placeholder={language === 'bn' ? 'প্রশ্ন' : 'Question'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <textarea
                  value={item.answer}
                  onChange={(e) => {
                    const newFaq = [...faq];
                    newFaq[index].answer = e.target.value;
                    onFaqChange?.(newFaq);
                  }}
                  placeholder={language === 'bn' ? 'উত্তর' : 'Answer'}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onFaqChange?.(faq.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onFaqChange?.([...faq, { question: '', answer: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'FAQ যোগ করুন' : 'Add FAQ'}
            </button>
          </div>
        );

      case 'guarantee':
        return (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {language === 'bn' ? 'গ্যারান্টি টেক্সট' : 'Guarantee Text'}
            </label>
            <textarea
              value={guaranteeText}
              onChange={(e) => onGuaranteeTextChange?.(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder={language === 'bn' ? '১০০% গ্যারান্টি...' : '100% Guarantee...'}
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {language === 'bn' 
                ? 'প্রোডাক্ট ফটো URL যোগ করুন' 
                : 'Add product photo URLs'}
            </p>
            {galleryImages.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newImages = [...galleryImages];
                    newImages[index] = e.target.value;
                    onGalleryImagesChange?.(newImages);
                  }}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onGalleryImagesChange?.(galleryImages.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onGalleryImagesChange?.([...galleryImages, ''])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'ফটো যোগ করুন' : 'Add Photo'}
            </button>
          </div>
        );

      case 'benefits':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefit.icon}
                    onChange={(e) => {
                      const newBenefits = [...benefits];
                      newBenefits[index].icon = e.target.value;
                      onBenefitsChange?.(newBenefits);
                    }}
                    placeholder="✅"
                    className="w-14 px-2 py-2 border border-gray-300 rounded-lg text-sm text-center"
                  />
                  <input
                    type="text"
                    value={benefit.title}
                    onChange={(e) => {
                      const newBenefits = [...benefits];
                      newBenefits[index].title = e.target.value;
                      onBenefitsChange?.(newBenefits);
                    }}
                    placeholder={language === 'bn' ? 'টাইটেল' : 'Title'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="text"
                  value={benefit.description}
                  onChange={(e) => {
                    const newBenefits = [...benefits];
                    newBenefits[index].description = e.target.value;
                    onBenefitsChange?.(newBenefits);
                  }}
                  placeholder={language === 'bn' ? 'বর্ণনা' : 'Description'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onBenefitsChange?.(benefits.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onBenefitsChange?.([...benefits, { icon: '✅', title: '', description: '' }])}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'বেনিফিট যোগ করুন' : 'Add Benefit'}
            </button>
          </div>
        );

      case 'comparison':
        return (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'আগের ছবি URL' : 'Before Image URL'}
              </label>
              <input
                type="url"
                value={comparison.beforeImage || ''}
                onChange={(e) => onComparisonChange?.({ ...comparison, beforeImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'পরের ছবি URL' : 'After Image URL'}
              </label>
              <input
                type="url"
                value={comparison.afterImage || ''}
                onChange={(e) => onComparisonChange?.({ ...comparison, afterImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'আগের লেবেল' : 'Before Label'}
                </label>
                <input
                  type="text"
                  value={comparison.beforeLabel || ''}
                  onChange={(e) => onComparisonChange?.({ ...comparison, beforeLabel: e.target.value })}
                  placeholder={language === 'bn' ? 'আগে' : 'Before'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'পরের লেবেল' : 'After Label'}
                </label>
                <input
                  type="text"
                  value={comparison.afterLabel || ''}
                  onChange={(e) => onComparisonChange?.({ ...comparison, afterLabel: e.target.value })}
                  placeholder={language === 'bn' ? 'পরে' : 'After'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'বর্ণনা' : 'Description'}
              </label>
              <textarea
                value={comparison.description || ''}
                onChange={(e) => onComparisonChange?.({ ...comparison, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder={language === 'bn' ? 'তুলনা সম্পর্কে লিখুন...' : 'Write about the comparison...'}
              />
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'সংখ্যা' : 'Count'}
              </label>
              <input
                type="number"
                value={socialProof.count || 0}
                onChange={(e) => onSocialProofChange?.({ ...socialProof, count: parseInt(e.target.value) || 0 })}
                placeholder="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'টেক্সট' : 'Text'}
              </label>
              <input
                type="text"
                value={socialProof.text || ''}
                onChange={(e) => onSocialProofChange?.({ ...socialProof, text: e.target.value })}
                placeholder={language === 'bn' ? 'জন অর্ডার করেছেন' : 'orders placed'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <label className="block text-xs font-medium text-gray-700 mb-3">
              {language === 'bn' ? 'অর্ডার ফর্ম লেআউট' : 'Order Form Layout'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onOrderFormVariantChange?.('full-width')}
                className={`p-3 rounded-lg border text-center transition ${
                  orderFormVariant === 'full-width'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-8 h-6 mx-auto mb-2 border-2 border-current rounded flex">
                  <div className="w-1/2 bg-current opacity-30"></div>
                  <div className="w-1/2 bg-current opacity-60"></div>
                </div>
                <div className="font-medium text-sm">
                  {language === 'bn' ? 'ফুল উইডথ' : 'Full Width'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {language === 'bn' ? '২ কলাম' : '2 Columns'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onOrderFormVariantChange?.('compact')}
                className={`p-3 rounded-lg border text-center transition ${
                  orderFormVariant === 'compact'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-5 h-6 mx-auto mb-2 border-2 border-current rounded bg-current opacity-40"></div>
                <div className="font-medium text-sm">
                  {language === 'bn' ? 'কম্প্যাক্ট' : 'Compact'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {language === 'bn' ? '১ কলাম' : '1 Column'}
                </div>
              </button>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {language === 'bn' 
                ? 'কাস্টম HTML/CSS কোড পেস্ট করুন। এটি একটি আলাদা সেকশন হিসেবে দেখাবে।' 
                : 'Paste custom HTML/CSS code. It will render as a separate section.'}
            </p>
            
            {customSections.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                <Code className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="mb-1">
                  {language === 'bn' ? 'কোনো কাস্টম সেকশন নেই' : 'No custom sections yet'}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'bn' ? 'নিচের বাটনে ক্লিক করে কাস্টম HTML যোগ করুন' : 'Click the button below to add custom HTML'}
                </p>
              </div>
            )}

            {customSections.map((section, index) => (
              <div key={section.id} className="p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => {
                      const newSections = [...customSections];
                      newSections[index].name = e.target.value;
                      onCustomSectionsChange?.(newSections);
                    }}
                    placeholder={language === 'bn' ? 'সেকশনের নাম' : 'Section name'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => onCustomSectionsChange?.(customSections.filter((_, i) => i !== index))}
                    className="ml-2 p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    HTML
                  </label>
                  <textarea
                    value={section.html}
                    onChange={(e) => {
                      const newSections = [...customSections];
                      newSections[index].html = e.target.value;
                      onCustomSectionsChange?.(newSections);
                    }}
                    placeholder={language === 'bn' ? '<div>আপনার HTML কোড এখানে</div>' : '<div>Your HTML code here</div>'}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CSS ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                  </label>
                  <textarea
                    value={section.css || ''}
                    onChange={(e) => {
                      const newSections = [...customSections];
                      newSections[index].css = e.target.value;
                      onCustomSectionsChange?.(newSections);
                    }}
                    placeholder=".my-class { color: red; }"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                const newSection = {
                  id: `custom-${Date.now()}`,
                  name: language === 'bn' ? 'নতুন কাস্টম সেকশন' : 'New Custom Section',
                  html: '',
                  css: '',
                };
                onCustomSectionsChange?.([...customSections, newSection]);
              }}
              className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-lg text-sm text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'কাস্টম সেকশন যোগ করুন' : 'Add Custom Section'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          {language === 'bn' ? 'সেকশন ম্যানেজার' : 'Section Manager'}
        </h3>
        <p className="text-sm text-gray-500">
          {language === 'bn' 
            ? 'ড্র্যাগ করে সাজান, অন/অফ এবং এডিট করুন' 
            : 'Drag to reorder, toggle and edit sections'}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y divide-gray-100">
            {orderedSections.map((section) => {
              const isHidden = hiddenSections.includes(section.id);
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              const isEditable = section.editable;

              return (
                <SortableSectionItem
                  key={section.id}
                  id={section.id}
                  section={section}
                  isHidden={isHidden}
                  isExpanded={isExpanded}
                  isEditable={isEditable}
                  language={language}
                  onToggleExpand={() => toggleExpand(section.id)}
                  onToggleVisibility={() => toggleVisibility(section.id)}
                  renderEditor={() => renderSectionEditor(section.id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Memoized export to prevent flickering from parent re-renders
export const SectionManager = memo(SectionManagerBase);

interface SortableSectionItemProps {
  id: string;
  section: typeof LANDING_SECTIONS[0];
  isHidden: boolean;
  isExpanded: boolean;
  isEditable: boolean;
  language: string;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  renderEditor: () => React.ReactNode;
}
// Sortable Section Item Component (memoized to prevent flickering)
const SortableSectionItem = memo(function SortableSectionItem({
  id,
  section,
  isHidden,
  isExpanded,
  isEditable,
  language,
  onToggleExpand,
  onToggleVisibility,
  renderEditor,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative' as const,
  };

  const Icon = section.icon;

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
          isHidden ? 'bg-gray-50 opacity-60' : 'bg-white'
        } ${isDragging ? 'shadow-lg ring-2 ring-emerald-500/20 bg-emerald-50/50 rounded-lg' : ''}`}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors touch-none"
          title={language === 'bn' ? 'ড্র্যাগ করে সাজান' : 'Drag to reorder'}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Section Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isHidden ? 'bg-gray-200' : 'bg-emerald-100'
        }`}>
          <Icon className={`w-4 h-4 ${isHidden ? 'text-gray-400' : 'text-emerald-600'}`} />
        </div>

        {/* Section Info - Clickable if editable */}
        <div 
          className={`flex-1 min-w-0 ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={() => isEditable && onToggleExpand()}
        >
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

        {/* Edit/Expand Button */}
        {isEditable && (
          <button
            onClick={onToggleExpand}
            className={`p-2 rounded-lg transition-colors ${
              isExpanded 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title={language === 'bn' ? 'এডিট করুন' : 'Edit section'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Edit2 className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Visibility Toggle */}
        <button
          onClick={onToggleVisibility}
          disabled={section.required}
          className={`p-2 rounded-lg transition-colors ${
            section.required
              ? 'text-gray-300 cursor-not-allowed'
              : isHidden
              ? 'text-gray-400 hover:bg-gray-100'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
          title={isHidden 
            ? (language === 'bn' ? 'দেখান' : 'Show section') 
            : (language === 'bn' ? 'লুকান' : 'Hide section')}
        >
          {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Inline Editor - Shown when expanded */}
      {isExpanded && renderEditor()}
    </div>
  );
});

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
