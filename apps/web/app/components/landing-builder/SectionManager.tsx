/**
 * Section Manager Component
 * 
 * Allows users to toggle sections on/off, reorder them via drag & drop, and edit their content inline.
 * Uses expandable panels for inline editing instead of separate accordion sections.
 * Phase 2: Added drag and drop using @dnd-kit/sortable
 */

import { useState, memo, useCallback, useEffect } from 'react';
import { AddSectionModal } from './AddSectionModal';
import { 
  Eye, EyeOff, ChevronUp, ChevronDown, Edit2, ChevronRight, Plus, Trash2, Upload, X,
  Type, Star, Video, MessageSquare, HelpCircle, ShoppingCart, ShieldCheck, Truck,
  Image, CheckCircle, Layers, Users, Loader2, GripVertical, Code, AlertCircle, MessageCircle,
  Tag, Box, ListOrdered, Package, Palette
} from 'lucide-react';
import { VariantSelector, VariantSelectorModal } from './VariantSelector';
import { hasVariants, getVariantsForSection, getDefaultVariant } from '~/utils/landing-builder/variantRegistry';
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
    id: 'problem-solution',
    name: 'সমস্যা ও সমাধান',
    nameEn: 'Problem & Solution',
    description: 'সমস্যা এবং সমাধান দেখান',
    descriptionEn: 'Show problems and solutions',
    icon: AlertCircle,
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
    id: 'pricing',
    name: 'প্রাইসিং',
    nameEn: 'Pricing',
    description: 'প্রাইসিং প্ল্যান এবং ফিচার',
    descriptionEn: 'Pricing plans and features',
    icon: Tag,
    editable: true,
  },
  {
    id: 'how-to-order',
    name: 'অর্ডার প্রক্রিয়া',
    nameEn: 'How to Order',
    description: 'অর্ডার করার নিয়মাবলী',
    descriptionEn: 'Instructions on how to order',
    icon: ListOrdered,
    editable: true,
  },
  {
    id: 'showcase',
    name: 'প্রোডাক্ট ডিটেইলস',
    nameEn: 'Product Details',
    description: 'প্রোডাক্টের বিস্তারিত বর্ণনা',
    descriptionEn: 'Detailed product description',
    icon: Box,
    editable: true,
  },
];


// Default section order
export const DEFAULT_SECTION_ORDER = [
  'hero',
  'video',
  'trust',
  'problem-solution',
  'features',
  'benefits',
  'showcase',
  'comparison',
  'gallery',
  'social',
  'testimonials',
  'delivery',
  'pricing',
  'guarantee',
  'how-to-order',
  'cta', // Order Form
  'faq',
];

/**
 * Merge missing sections from DEFAULT_SECTION_ORDER into existing sectionOrder
 * This ensures existing stores get new sections appended to their order
 */
export function mergeSectionOrder(existingOrder: string[] | undefined): string[] {
  // If no existing order, use default
  if (!existingOrder || existingOrder.length === 0) {
    return [...DEFAULT_SECTION_ORDER];
  }

  // Find sections in DEFAULT_SECTION_ORDER that are not in existingOrder
  const missingSections = DEFAULT_SECTION_ORDER.filter(
    (sectionId) => !existingOrder.includes(sectionId)
  );

  // If no missing sections, return existing order as-is
  if (missingSections.length === 0) {
    return existingOrder;
  }

  // Append missing sections at the end (before 'cta' if present, otherwise at end)
  const result = [...existingOrder];
  const ctaIndex = result.indexOf('cta');
  
  if (ctaIndex !== -1) {
    // Insert missing sections before 'cta'
    result.splice(ctaIndex, 0, ...missingSections);
  } else {
    // Append at end
    result.push(...missingSections);
  }

  return result;
}

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
  title?: string;
  images?: string[];
}

export interface ProblemSolution {
  beforeTitle?: string;
  afterTitle?: string;
  problems: string[];
  solutions: string[];
}

export interface PricingData {
  features: string[];
  title?: string;
  buttonText?: string;
}

export interface ShowcaseData {
  title?: string;
  image?: string;
  features: string[];
}

export interface HowToOrderData {
  title?: string;
  steps: {
    title: string;
    description: string;
  }[];
}

export interface OrderFormText {
  headline?: string;
  subheadline?: string;
  submitButtonText?: string;
  successMessage?: string;
  successHeadline?: string;
  nameLabel?: string;
  phoneLabel?: string;
  addressLabel?: string;
  divisionLabel?: string;
  insideDhakaLabel?: string;
  outsideDhakaLabel?: string;
  quantityLabel?: string;
  variantLabel?: string;
  summaryTitle?: string;
  totalLabel?: string;
  shippingLabel?: string;
  subtotalLabel?: string;
  namePlaceholder?: string;
  phonePlaceholder?: string;
  addressPlaceholder?: string;
  processingButtonText?: string;
  nameError?: string;
  phoneError?: string;
  addressError?: string;
  secureCheckoutLabel?: string;
  codLabel?: string;
  stockText?: string;
  footerTagline?: string;
  footerCopyright?: string;
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
  // Hero specific
  heroBadgeText?: string;
  onHeroBadgeTextChange?: (text: string) => void;
  heroPriceLabel?: string;
  onHeroPriceLabelChange?: (text: string) => void;
  heroFeatures?: { icon: string; text: string }[];
  onHeroFeaturesChange?: (features: { icon: string; text: string }[]) => void;
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
  // Social Proof
  socialProof?: SocialProof;
  onSocialProofChange?: (socialProof: SocialProof) => void;
  socialProofTitle?: string;
  onSocialProofTitleChange?: (text: string) => void;
  // Order Form Layout
  orderFormVariant?: 'full-width' | 'compact';
  onOrderFormVariantChange?: (variant: 'full-width' | 'compact') => void;
  // Section Titles & Subtitles (New)
  featuresTitle?: string;
  onFeaturesTitleChange?: (text: string) => void;
  faqTitle?: string;
  onFaqTitleChange?: (text: string) => void;
  faqSubtitle?: string;
  onFaqSubtitleChange?: (text: string) => void;
  testimonialsTitle?: string; // "What They Say"
  onTestimonialsTitleChange?: (text: string) => void;
  reviewsSubtitle?: string;   // "Patron Reviews"
  onReviewsSubtitleChange?: (text: string) => void;
  guaranteeBadgeLabel?: string;
  onGuaranteeBadgeLabelChange?: (text: string) => void;
  establishedDate?: string;
  onEstablishedDateChange?: (text: string) => void;
  // Video & Gallery Titles
  videoTitle?: string;
  onVideoTitleChange?: (text: string) => void;
  galleryTitle?: string;
  onGalleryTitleChange?: (text: string) => void;
  // Order Form Text
  orderFormText?: OrderFormText;
  onOrderFormTextChange?: (text: OrderFormText) => void;
  // Custom code sections
  customSections?: Array<{ id: string; name: string; html: string; css?: string; position?: string }>;
  onCustomSectionsChange?: (sections: Array<{ id: string; name: string; html: string; css?: string; position?: string }>) => void;
  onAddCustomSection?: () => void;
  // Problem & Solution section
  problemSolution?: ProblemSolution;
  onProblemSolutionChange?: (data: ProblemSolution) => void;
  // New section editors
  pricingData?: PricingData;
  onPricingDataChange?: (data: PricingData) => void;
  showcaseData?: ShowcaseData;
  onShowcaseDataChange?: (data: ShowcaseData) => void;
  howToOrderData?: HowToOrderData;
  onHowToOrderDataChange?: (data: HowToOrderData) => void;
  // Generic Image Upload
  onImageUpload?: (file: File) => Promise<string>;
  // Add Section callback
  onAddSection?: (sectionId: string) => void;
  // Interactive editing - external section selection
  selectedSection?: string | null;
  // Section Variants (Quick Builder v2)
  sectionVariants?: Record<string, string>;
  onSectionVariantChange?: (sectionId: string, variantId: string) => void;
  // Intent for variant suggestions
  intent?: { goal: string; trafficSource: string };
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
  heroBadgeText = '',
  onHeroBadgeTextChange,
  heroPriceLabel = '',
  onHeroPriceLabelChange,
  heroFeatures = [],
  onHeroFeaturesChange,
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
  pricingData = { features: [], title: '', buttonText: '' },
  onPricingDataChange,
  showcaseData,
  onShowcaseDataChange,
  howToOrderData,
  onHowToOrderDataChange,
  // Order form layout
  orderFormVariant = 'full-width',
  onOrderFormVariantChange,
  // Custom code sections
  customSections = [],
  onCustomSectionsChange,
  onAddCustomSection,
  // Problem & Solution
  problemSolution = { problems: [], solutions: [] },
  onProblemSolutionChange,
  // Generic Image Upload
  onImageUpload,
  // Add Section
  onAddSection,
  // Interactive editing
  selectedSection,
  // New Title Props
  featuresTitle, onFeaturesTitleChange,
  faqTitle, onFaqTitleChange,
  faqSubtitle, onFaqSubtitleChange,
  testimonialsTitle, onTestimonialsTitleChange,
  reviewsSubtitle, onReviewsSubtitleChange,
  guaranteeBadgeLabel, onGuaranteeBadgeLabelChange,
  establishedDate, onEstablishedDateChange,
  socialProofTitle, onSocialProofTitleChange,
  // Video & Gallery
  videoTitle, onVideoTitleChange,
  galleryTitle, onGalleryTitleChange,
  // Order Form Text
  orderFormText, onOrderFormTextChange,
  // Section Variants (Quick Builder v2)
  sectionVariants = {},
  onSectionVariantChange,
  intent,
}: SectionManagerProps) {
  const { lang: language } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [variantModalSection, setVariantModalSection] = useState<string | null>(null);

  // Auto-expand selected section when it changes from external source
  useEffect(() => {
    if (selectedSection) {
      setExpandedSection(selectedSection);
    }
  }, [selectedSection]);

  // Generic Image Upload Handler
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const handleGenericUpload = async (file: File, key: string, callback: (url: string) => void) => {
    if (!onImageUpload) return;
    setUploadingKey(key);
    try {
      const url = await onImageUpload(file);
      callback(url);
    } catch (error) {
      console.error('Upload failed', error);
      alert(language === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  };

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

            {/* Hero Additional Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'ব্যাজ টেক্সট' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={heroBadgeText}
                  onChange={(e) => onHeroBadgeTextChange?.(e.target.value)}
                  placeholder="PREMIERE COLLECTION"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'প্রাইস লেবেল' : 'Price Label'}
                </label>
                <input
                  type="text"
                  value={heroPriceLabel}
                  onChange={(e) => onHeroPriceLabelChange?.(e.target.value)}
                  placeholder="PRICE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {language === 'bn' ? 'হিরো ফিচারসমূহ' : 'Hero Features'}
              </label>
              <div className="space-y-2">
                {heroFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature.text}
                      onChange={(e) => {
                        const newFeatures = [...heroFeatures];
                        newFeatures[index] = { ...feature, text: e.target.value };
                        onHeroFeaturesChange?.(newFeatures);
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Feature text"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = heroFeatures.filter((_, i) => i !== index);
                        onHeroFeaturesChange?.(newFeatures);
                      }}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onHeroFeaturesChange?.([...heroFeatures, { icon: 'check', text: '' }])}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1 hover:text-emerald-700"
                >
                  <Plus className="w-3 h-3" />
                  {language === 'bn' ? 'ফিচার যোগ করুন' : 'Add Feature'}
                </button>
              </div>
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
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'সেকশন টাইটেল' : 'Section Title'}
              </label>
              <input
                type="text"
                value={videoTitle || ''}
                onChange={(e) => onVideoTitleChange?.(e.target.value)}
                placeholder="Video Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'ভিডিও লিংক (YouTube Embed)' : 'Video URL (YouTube Embed)'}
              </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange?.(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
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
                ? 'প্রোডাক্ট ফটো URL যোগ করুন অথবা আপলোড করুন' 
                : 'Add product photo URLs or upload'}
            </p>
            {galleryImages.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newImages = [...galleryImages];
                      newImages[index] = e.target.value;
                      onGalleryImagesChange?.(newImages);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                  />
                  {/* Upload Button overlay/inline */}
                  {onImageUpload && (
                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericUpload(file, `gallery-${index}`, (newUrl) => {
                              const newImages = [...galleryImages];
                              newImages[index] = newUrl;
                              onGalleryImagesChange?.(newImages);
                            });
                          }
                          e.target.value = '';
                        }}
                        disabled={uploadingKey === `gallery-${index}`}
                      />
                      {uploadingKey === `gallery-${index}` ? (
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                      )}
                    </label>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onGalleryImagesChange?.(galleryImages.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onGalleryImagesChange?.([...galleryImages, ''])}
                className="py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'URL যোগ করুন' : 'Add URL'}
              </button>
              
              {onImageUpload && (
                <label className="py-2 border-2 border-dashed border-emerald-300 rounded-lg text-sm text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center gap-2 cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Add new empty slot first, then upload
                        const newIndex = galleryImages.length;
                        const newImages = [...galleryImages, ''];
                        onGalleryImagesChange?.(newImages);
                        
                        handleGenericUpload(file, `gallery-${newIndex}`, (newUrl) => {
                          // Re-fetch latest state? No, we need to hope state updates fast enough/we use callback with closure
                          // Better: Update separate state or use functional update if available, but here we depend on prop.
                          // Safe way: Trigger generic upload, and in callback call onChange with PREV + new
                          // But we can't access prev prop easily here without ref.
                          // For now, simpler flow: Upload first, then append.
                        });
                      }
                      // Correct approach for "New Upload":
                      // 1. Set uploading state "gallery-new"
                      // 2. Upload
                      // 3. Append result
                    }}
                    // Actually, simpler to just allow single upload via the "Add URL" row's upload button for now to avoid complexity of "Upload & Append".
                    // But user wants "Upload Photo".
                    // Let's make "Add Image" button trigger a file input that appends.
                  />
                   {/* Re-implementing the onChange above to be correct */}
                  <div className="absolute inset-0 opacity-0 cursor-pointer">
                      <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                              const file = e.target.files?.[0];
                              if(file) {
                                  handleGenericUpload(file, 'gallery-append', (url) => {
                                      onGalleryImagesChange?.([...galleryImages, url]);
                                  });
                              }
                              e.target.value = '';
                          }}
                          disabled={uploadingKey === 'gallery-append'}
                      />
                  </div>
                  {uploadingKey === 'gallery-append' ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                       <Upload className="w-4 h-4" />
                  )}
                  {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
                </label>
              )}
            </div>
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
                {language === 'bn' ? 'আগের ছবি (Before)' : 'Before Image URL'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={comparison.beforeImage || ''}
                  onChange={(e) => onComparisonChange?.({ ...comparison, beforeImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                />
                 {onImageUpload && (
                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericUpload(file, 'comparison-before', (url) => {
                               onComparisonChange?.({ ...comparison, beforeImage: url });
                            });
                          }
                          e.target.value = '';
                        }}
                        disabled={uploadingKey === 'comparison-before'}
                      />
                      {uploadingKey === 'comparison-before' ? (
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                      )}
                    </label>
                  )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'পরের ছবি (After)' : 'After Image URL'}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={comparison.afterImage || ''}
                  onChange={(e) => onComparisonChange?.({ ...comparison, afterImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                />
                {onImageUpload && (
                    <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-gray-100 rounded">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericUpload(file, 'comparison-after', (url) => {
                               onComparisonChange?.({ ...comparison, afterImage: url });
                            });
                          }
                          e.target.value = '';
                        }}
                        disabled={uploadingKey === 'comparison-after'}
                      />
                      {uploadingKey === 'comparison-after' ? (
                        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                      )}
                    </label>
                  )}
              </div>
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
                {language === 'bn' ? 'টাইটেল ({{count}} লিখলে অটোমেটিক সংখ্যা বসবে)' : 'Title (Use {{count}} for dynamic number)'}
              </label>
              <input
                type="text"
                value={socialProof.title || ''}
                onChange={(e) => onSocialProofChange?.({ ...socialProof, title: e.target.value })}
                placeholder={language === 'bn' ? 'The choice of {{count}} connoisseurs.' : 'The choice of {{count}} connoisseurs.'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
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

            {/* Image Management */}
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-2">
                {language === 'bn' ? 'কাস্টমার ছবি' : 'Customer Images'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(socialProof.images || []).map((img, index) => (
                  <div key={index} className="relative group w-12 h-12">
                    <img 
                      src={img} 
                      alt="Social proof" 
                      className="w-full h-full object-cover rounded-full border border-gray-200" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...(socialProof.images || [])];
                        newImages.splice(index, 1);
                        onSocialProofChange?.({ ...socialProof, images: newImages });
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                {onImageUpload && (
                   <label className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-full hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition text-gray-400">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericUpload(file, 'social-proof-upload', (url) => {
                               const newImages = [...(socialProof.images || []), url];
                               onSocialProofChange?.({ ...socialProof, images: newImages });
                            });
                          }
                          e.target.value = '';
                        }}
                        disabled={uploadingKey === 'social-proof-upload'}
                      />
                      {uploadingKey === 'social-proof-upload' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                   </label>
                )}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {language === 'bn' ? 'ছবি না দিলে ডিফল্ট ছবি দেখাবে' : 'Default images will show if empty'}
              </p>
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
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="h-6 bg-gray-200 rounded mb-2 w-full"></div>
                <span className="text-xs font-medium">Full Width</span>
              </button>
              
              <button
                type="button"
                onClick={() => onOrderFormVariantChange?.('compact')}
                className={`p-3 rounded-lg border text-center transition ${
                  orderFormVariant === 'compact'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
                <span className="text-xs font-medium">Compact</span>
              </button>
            </div>
          </div>
        );


      case 'problem-solution':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            {/* Problems Section */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? '❌ সমস্যা (কাস্টমার যা ফেস করে)' : '❌ Problems (What customers face)'}
              </label>
              {problemSolution.problems.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-400">
                    {language === 'bn' ? 'কাস্টমার কী সমস্যার সম্মুখীন হয় তা যোগ করুন' : 'Add problems customers face'}
                  </p>
                </div>
              )}
              {problemSolution.problems.map((problem, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => {
                      const newProblems = [...problemSolution.problems];
                      newProblems[index] = e.target.value;
                      onProblemSolutionChange?.({ ...problemSolution, problems: newProblems });
                    }}
                    placeholder={language === 'bn' ? 'সমস্যা লিখুন' : 'Enter a problem'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newProblems = problemSolution.problems.filter((_, i) => i !== index);
                      onProblemSolutionChange?.({ ...problemSolution, problems: newProblems });
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onProblemSolutionChange?.({ 
                  ...problemSolution, 
                  problems: [...problemSolution.problems, ''] 
                })}
                className="w-full py-2 border-2 border-dashed border-red-200 rounded-lg text-sm text-red-600 hover:border-red-400 hover:text-red-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'সমস্যা যোগ করুন' : 'Add Problem'}
              </button>
            </div>

            {/* Solutions Section */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? '✅ সমাধান (আপনার সমাধান)' : '✅ Solutions (Your solutions)'}
              </label>
              {problemSolution.solutions.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-400">
                    {language === 'bn' ? 'আপনার সমাধান যোগ করুন' : 'Add your solutions'}
                  </p>
                </div>
              )}
              {problemSolution.solutions.map((solution, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={solution}
                    onChange={(e) => {
                      const newSolutions = [...problemSolution.solutions];
                      newSolutions[index] = e.target.value;
                      onProblemSolutionChange?.({ ...problemSolution, solutions: newSolutions });
                    }}
                    placeholder={language === 'bn' ? 'সমাধান লিখুন' : 'Enter a solution'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSolutions = problemSolution.solutions.filter((_, i) => i !== index);
                      onProblemSolutionChange?.({ ...problemSolution, solutions: newSolutions });
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onProblemSolutionChange?.({ 
                  ...problemSolution, 
                  solutions: [...problemSolution.solutions, ''] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'সমাধান যোগ করুন' : 'Add Solution'}
              </button>
            </div>
          </div>
        );

      default:
        return (
           renderNewSectionEditors(sectionId)
        );
    }
  };

  const renderNewSectionEditors = (sectionId: string) => {
    switch (sectionId) {
      case 'pricing':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            {/* Title & Button Text */}
             <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'অফার টাইটেল' : 'Offer Title'}
                </label>
                <input
                  type="text"
                  value={pricingData.title}
                  onChange={(e) => onPricingDataChange?.({ ...pricingData, title: e.target.value })}
                  placeholder="EXCLUSIVE OFFER"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'বাটন টেক্সট' : 'Button Text'}
                </label>
                <input
                  type="text"
                  value={pricingData.buttonText}
                  onChange={(e) => onPricingDataChange?.({ ...pricingData, buttonText: e.target.value })}
                  placeholder="PURCHASE NOW"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'প্রাইসিং ফিচারসমূহ' : 'Pricing Features'}
              </label>
              {pricingData.features.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'ফিচার যোগ করুন' : 'Add features'}
                </div>
              )}
              {pricingData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...pricingData.features];
                      newFeatures[index] = e.target.value;
                      onPricingDataChange?.({ ...pricingData, features: newFeatures });
                    }}
                    placeholder={language === 'bn' ? 'ফিচার লিখুন' : 'Enter feature'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = pricingData.features.filter((_, i) => i !== index);
                      onPricingDataChange?.({ ...pricingData, features: newFeatures });
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onPricingDataChange?.({ 
                  ...pricingData, 
                  features: [...pricingData.features, ''] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ফিচার যোগ করুন' : 'Add Feature'}
              </button>
            </div>
          </div>
        );

      case 'order-form':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Form Controls</h4>
                 
                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full px-4 py-2 bg-gray-50 text-left text-xs font-bold text-gray-700 uppercase flex justify-between items-center" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}>
                       Input Labels (Form) <span>▼</span>
                    </button>
                    <div className="p-4 bg-white space-y-3 hidden">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name Label</label>
                          <input type="text" value={orderFormText?.nameLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, nameLabel: e.target.value })} placeholder="Full Name / আপনার নাম" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Label</label>
                          <input type="text" value={orderFormText?.phoneLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, phoneLabel: e.target.value })} placeholder="Contact Number / ফোন নম্বর" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address Label</label>
                          <input type="text" value={orderFormText?.addressLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, addressLabel: e.target.value })} placeholder="Shipping Address / ঠিকান" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                 </div>

                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full px-4 py-2 bg-gray-50 text-left text-xs font-bold text-gray-700 uppercase flex justify-between items-center" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}>
                       Input Placeholders <span>▼</span>
                    </button>
                    <div className="p-4 bg-white space-y-3 hidden">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name Placeholder</label>
                          <input type="text" value={orderFormText?.namePlaceholder || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, namePlaceholder: e.target.value })} placeholder="Ex: John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Placeholder</label>
                          <input type="text" value={orderFormText?.phonePlaceholder || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, phonePlaceholder: e.target.value })} placeholder="Ex: 017..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address Placeholder</label>
                          <input type="text" value={orderFormText?.addressPlaceholder || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, addressPlaceholder: e.target.value })} placeholder="Ex: House 12, Road 5..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                 </div>

                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full px-4 py-2 bg-gray-50 text-left text-xs font-bold text-gray-700 uppercase flex justify-between items-center" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}>
                       Order Summary Labels <span>▼</span>
                    </button>
                    <div className="p-4 bg-white space-y-3 hidden">
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                              <input type="text" value={orderFormText?.quantityLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, quantityLabel: e.target.value })} placeholder="Quantity" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Variant</label>
                              <input type="text" value={orderFormText?.variantLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, variantLabel: e.target.value })} placeholder="Variant" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Subtotal</label>
                              <input type="text" value={orderFormText?.subtotalLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, subtotalLabel: e.target.value })} placeholder="Price/Value" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Shipping</label>
                              <input type="text" value={orderFormText?.shippingLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, shippingLabel: e.target.value })} placeholder="Delivery Charge" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                           <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Total</label>
                              <input type="text" value={orderFormText?.totalLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, totalLabel: e.target.value })} placeholder="Total" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full px-4 py-2 bg-gray-50 text-left text-xs font-bold text-gray-700 uppercase flex justify-between items-center" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}>
                       Buttons & Messages <span>▼</span>
                    </button>
                    <div className="p-4 bg-white space-y-3 hidden">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Submit Button</label>
                          <input type="text" value={orderFormText?.submitButtonText || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, submitButtonText: e.target.value })} placeholder="Confirm Order" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Processing Text</label>
                          <input type="text" value={orderFormText?.processingButtonText || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, processingButtonText: e.target.value })} placeholder="Processing..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Inside Dhaka</label>
                              <input type="text" value={orderFormText?.insideDhakaLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, insideDhakaLabel: e.target.value })} placeholder="Inside Dhaka" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Outside Dhaka</label>
                              <input type="text" value={orderFormText?.outsideDhakaLabel || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, outsideDhakaLabel: e.target.value })} placeholder="Outside Dhaka" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                           </div>
                        </div>
                    </div>
                 </div>

                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full px-4 py-2 bg-gray-50 text-left text-xs font-bold text-gray-700 uppercase flex justify-between items-center" onClick={(e) => e.currentTarget.nextElementSibling?.classList.toggle('hidden')}>
                       Footer & Copyright <span>▼</span>
                    </button>
                    <div className="p-4 bg-white space-y-3 hidden">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Footer Tagline</label>
                          <input type="text" value={orderFormText?.footerTagline || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, footerTagline: e.target.value })} placeholder="Trusted eCommerce..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Copyright Text</label>
                          <input type="text" value={orderFormText?.footerCopyright || ''} onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, footerCopyright: e.target.value })} placeholder="All rights reserved." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                 </div>

              </div>
              
              <div>
                 <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Validation Messages</h4>
                 <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name Error</label>
                      <input
                        type="text"
                        value={orderFormText?.nameError || ''}
                        onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, nameError: e.target.value })}
                        placeholder="Name required"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Phone Error</label>
                      <input
                        type="text"
                        value={orderFormText?.phoneError || ''}
                        onChange={(e) => onOrderFormTextChange?.({ ...orderFormText!, phoneError: e.target.value })}
                        placeholder="Phone required"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                 </div>
              </div>
          </div>
        );

      case 'showcase':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            {/* Title & Image */}
            <div className="grid gap-3 p-3 bg-white rounded-lg border border-gray-200">
               <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'সেকশন টাইটেল' : 'Section Title'}
                </label>
                <input
                  type="text"
                  value={showcaseData?.title || ''}
                  onChange={(e) => onShowcaseDataChange?.({ features: [], ...showcaseData, title: e.target.value })}
                  placeholder="UNBOXING EXPERIENCE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'প্রোডাক্ট ফটো' : 'Product Image'}
                </label>
                <div className="flex gap-3 items-center">
                  {showcaseData?.image ? (
                    <div className="relative w-16 h-16 rounded-md border border-gray-200 overflow-hidden group">
                      <img src={showcaseData?.image} alt="Showcase" className="w-full h-full object-cover" />
                      <button
                        onClick={() => onShowcaseDataChange?.({ ...showcaseData, image: undefined })}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  
                  {onImageUpload && (
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600 transition">
                         {uploadingKey === 'showcase-image' ? (
                           <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                         ) : (
                           <Upload className="w-4 h-4" />
                         )}
                         <span>{language === 'bn' ? 'ফটো আপলোড' : 'Upload Photo'}</span>
                      </div>
                       <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleGenericUpload(file, 'showcase-image', (url) => {
                              onShowcaseDataChange?.({ features: [], ...showcaseData, image: url });
                            });
                          }
                          e.target.value = ''; // Reset input
                        }}
                        disabled={uploadingKey === 'showcase-image'}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'প্রোডাক্ট হাইলাইট' : 'Product Highlights'}
              </label>
              {showcaseData?.features && showcaseData.features.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'হাইলাইট যোগ করুন' : 'Add highlights'}
                </div>
              )}
              {showcaseData?.features && showcaseData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(showcaseData?.features || [])];
                      newFeatures[index] = e.target.value;
                      onShowcaseDataChange?.({ ...showcaseData, features: newFeatures, title: showcaseData?.title });
                    }}
                    placeholder={language === 'bn' ? 'হাইলাইট লিখুন' : 'Enter highlight'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = (showcaseData?.features || []).filter((_, i) => i !== index);
                      onShowcaseDataChange?.({ ...showcaseData, features: newFeatures, title: showcaseData?.title });
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => onShowcaseDataChange?.({ 
                  features: [...(showcaseData?.features || []), ''],
                  title: showcaseData?.title 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'হাইলাইট যোগ করুন' : 'Add Highlight'}
              </button>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {language === 'bn' ? 'সেকশন টাইটেল' : 'Section Title'}
              </label>
              <input
                type="text"
                value={featuresTitle || 'Exclusive Features'}
                onChange={(e) => onFeaturesTitleChange?.(e.target.value)}
                placeholder="Exclusive Features"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'অর্ডার ধাপসমূহ' : 'Order Steps'}
              </label>
              {howToOrderData?.steps && howToOrderData.steps.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add steps'}
                </div>
              )}
              {howToOrderData?.steps && howToOrderData.steps.map((step, index) => (
                <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>{language === 'bn' ? `ধাপ ${index + 1}` : `Step ${index + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = (howToOrderData?.steps || []).filter((_, i) => i !== index);
                        onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], title: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের শিরোনাম' : 'Step Title'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের বিবরণ' : 'Step Description'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => onHowToOrderDataChange?.({ 
                  title: howToOrderData?.title,
                  steps: [...(howToOrderData?.steps || []), { title: '', description: '' }] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add Step'}
              </button>
            </div>
          </div>
        );

      case 'problem-solution':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'বাম পাশের টাইটেল' : 'Left Title (Before)'}
                </label>
                <input
                  type="text"
                  value={problemSolution?.beforeTitle || 'Before'}
                  onChange={(e) => onProblemSolutionChange?.({ ...problemSolution!, beforeTitle: e.target.value })}
                  placeholder="Before"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'ডান পাশের টাইটেল' : 'Right Title (After)'}
                </label>
                <input
                  type="text"
                  value={problemSolution?.afterTitle || 'After'}
                  onChange={(e) => onProblemSolutionChange?.({ ...problemSolution!, afterTitle: e.target.value })}
                  placeholder="After"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'অর্ডার ধাপসমূহ' : 'Order Steps'}
              </label>
              {howToOrderData?.steps && howToOrderData.steps.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add steps'}
                </div>
              )}
              {howToOrderData?.steps && howToOrderData.steps.map((step, index) => (
                <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>{language === 'bn' ? `ধাপ ${index + 1}` : `Step ${index + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = (howToOrderData?.steps || []).filter((_, i) => i !== index);
                        onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], title: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের শিরোনাম' : 'Step Title'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের বিবরণ' : 'Step Description'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => onHowToOrderDataChange?.({ 
                  title: howToOrderData?.title,
                  steps: [...(howToOrderData?.steps || []), { title: '', description: '' }] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add Step'}
              </button>
            </div>
          </div>
        );

      case 'faq':
        return (
           <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'সেকশন টাইটেল' : 'Section Title'}
                </label>
                <input
                  type="text"
                  value={faqTitle || 'Concierge Service'}
                  onChange={(e) => onFaqTitleChange?.(e.target.value)}
                  placeholder="Concierge Service"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {language === 'bn' ? 'সাব-টাইটেল' : 'Subtitle'}
                </label>
                <input
                  type="text"
                  value={faqSubtitle || 'Frequently Asked Questions'}
                  onChange={(e) => onFaqSubtitleChange?.(e.target.value)}
                  placeholder="Frequently Asked Questions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'অর্ডার ধাপসমূহ' : 'Order Steps'}
              </label>
              {howToOrderData?.steps && howToOrderData.steps.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add steps'}
                </div>
              )}
              {howToOrderData?.steps && howToOrderData.steps.map((step, index) => (
                <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>{language === 'bn' ? `ধাপ ${index + 1}` : `Step ${index + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = (howToOrderData?.steps || []).filter((_, i) => i !== index);
                        onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], title: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের শিরোনাম' : 'Step Title'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের বিবরণ' : 'Step Description'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => onHowToOrderDataChange?.({ 
                  title: howToOrderData?.title,
                  steps: [...(howToOrderData?.steps || []), { title: '', description: '' }] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add Step'}
              </button>
            </div>
          </div>
        );

      case 'how-to-order':
        return (
          <div className="space-y-4 p-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-700">
                {language === 'bn' ? 'অর্ডার ধাপসমূহ' : 'Order Steps'}
              </label>
              {howToOrderData?.steps && howToOrderData.steps.length === 0 && (
                <div className="text-center py-3 text-gray-500 text-sm bg-white rounded-lg border border-dashed border-gray-300">
                   {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add steps'}
                </div>
              )}
              {howToOrderData?.steps && howToOrderData.steps.map((step, index) => (
                <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                    <span>{language === 'bn' ? `ধাপ ${index + 1}` : `Step ${index + 1}`}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = (howToOrderData?.steps || []).filter((_, i) => i !== index);
                        onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], title: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের শিরোনাম' : 'Step Title'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...(howToOrderData?.steps || [])];
                      newSteps[index] = { ...newSteps[index], description: e.target.value };
                      onHowToOrderDataChange?.({ ...howToOrderData, title: howToOrderData?.title, steps: newSteps });
                    }}
                    placeholder={language === 'bn' ? 'ধাপের বিবরণ' : 'Step Description'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => onHowToOrderDataChange?.({ 
                  title: howToOrderData?.title,
                  steps: [...(howToOrderData?.steps || []), { title: '', description: '' }] 
                })}
                className="w-full py-2 border-2 border-dashed border-emerald-200 rounded-lg text-sm text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'bn' ? 'ধাপ যোগ করুন' : 'Add Step'}
              </button>
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
                  currentVariant={sectionVariants[section.id]}
                  hasVariantOptions={hasVariants(section.id)}
                  onVariantClick={() => setVariantModalSection(section.id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Add Section Button */}
      {onAddSection && (
        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsAddSectionModalOpen(true)}
            className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-lg text-sm font-medium text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {language === 'bn' ? 'নতুন সেকশন যোগ করুন' : 'Add New Section'}
          </button>
        </div>
      )}

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={(sectionId) => {
          onAddSection?.(sectionId);
          setIsAddSectionModalOpen(false);
        }}
        existingSections={sectionOrder}
        language={language as 'bn' | 'en'}
      />

      {/* Variant Selector Modal */}
      {variantModalSection && (
        <VariantSelectorModal
          isOpen={!!variantModalSection}
          onClose={() => setVariantModalSection(null)}
          sectionId={variantModalSection}
          sectionName={
            LANDING_SECTIONS.find(s => s.id === variantModalSection)?.[
              language === 'bn' ? 'name' : 'nameEn'
            ] || variantModalSection
          }
          currentVariant={sectionVariants[variantModalSection]}
          intent={intent}
          onSelect={(variantId) => {
            onSectionVariantChange?.(variantModalSection, variantId);
            setVariantModalSection(null);
          }}
        />
      )}
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
  // Variant support
  currentVariant?: string;
  onVariantClick?: () => void;
  hasVariantOptions?: boolean;
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
  currentVariant,
  onVariantClick,
  hasVariantOptions,
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

        {/* Variant Button - Only show if section has variants */}
        {hasVariantOptions && onVariantClick && (
          <button
            onClick={onVariantClick}
            className="p-2 rounded-lg transition-colors text-purple-500 hover:bg-purple-50 hover:text-purple-600"
            title={language === 'bn' ? 'স্টাইল পরিবর্তন' : 'Change variant'}
          >
            <Palette className="w-4 h-4" />
          </button>
        )}

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
