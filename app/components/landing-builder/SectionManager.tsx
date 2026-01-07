/**
 * Section Manager Component
 * 
 * Allows users to toggle sections on/off, reorder them, and edit their content inline.
 * Uses expandable panels for inline editing instead of separate accordion sections.
 */

import { useState } from 'react';
import { 
  Eye, EyeOff, ChevronUp, ChevronDown, Edit2, ChevronRight, Plus, Trash2, Upload, X,
  Type, Star, Video, MessageSquare, HelpCircle, ShoppingCart, ShieldCheck, Truck,
  Image, CheckCircle, Layers, Users, Loader2
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
    required: true,
    editable: false, // Edited in Content accordion
  },
  {
    id: 'trust',
    name: 'ট্রাস্ট ব্যাজ',
    nameEn: 'Trust Badges',
    description: 'গ্যারান্টি ও বিশ্বাসযোগ্যতা',
    descriptionEn: 'Guarantee & trust indicators',
    icon: ShieldCheck,
    editable: false,
  },
  {
    id: 'features',
    name: 'ফিচার্স',
    nameEn: 'Features',
    description: 'প্রোডাক্টের বৈশিষ্ট্য',
    descriptionEn: 'Product features',
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
    editable: false,
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
    editable: false,
  },
  {
    id: 'comparison',
    name: 'তুলনা',
    nameEn: 'Comparison',
    description: 'আগে/পরে বা প্রতিযোগী তুলনা',
    descriptionEn: 'Before/After or competitor comparison',
    icon: Layers,
    editable: false,
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
    editable: false,
  },
  {
    id: 'delivery',
    name: 'ডেলিভারি',
    nameEn: 'Delivery Info',
    description: 'শিপিং ও ডেলিভারি তথ্য',
    descriptionEn: 'Shipping & delivery details',
    icon: Truck,
    editable: false,
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
    name: 'CTA',
    nameEn: 'CTA',
    description: 'অর্ডার ফর্ম',
    descriptionEn: 'Order form',
    icon: ShoppingCart,
    required: true,
    editable: false,
  },
];

// Default section order
export const DEFAULT_SECTION_ORDER = ['hero', 'trust', 'features', 'gallery', 'video', 'benefits', 'comparison', 'testimonials', 'social', 'delivery', 'faq', 'guarantee', 'cta'];

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
}

export function SectionManager({
  sectionOrder,
  hiddenSections,
  onOrderChange,
  onVisibilityChange,
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
}: SectionManagerProps) {
  const { lang: language } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Get ordered sections
  const orderedSections = sectionOrder
    .map((id) => LANDING_SECTIONS.find((s) => s.id === id))
    .filter(Boolean) as typeof LANDING_SECTIONS;

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
      case 'features':
        return (
          <div className="space-y-3 p-4 bg-gray-50 border-t border-gray-200">
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
            ? 'সেকশন অন/অফ, সাজান এবং এডিট করুন' 
            : 'Toggle, reorder and edit sections'}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {orderedSections.map((section, index) => {
          const isHidden = hiddenSections.includes(section.id);
          const isFirst = index === 0;
          const isLast = index === orderedSections.length - 1;
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          const isEditable = section.editable;

          return (
            <div key={section.id}>
              {/* Section Row */}
              <div
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

                {/* Section Info - Clickable if editable */}
                <div 
                  className={`flex-1 min-w-0 ${isEditable ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditable && toggleExpand(section.id)}
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
                    onClick={() => toggleExpand(section.id)}
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

              {/* Inline Editor - Shown when expanded */}
              {isExpanded && renderSectionEditor(section.id)}
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
