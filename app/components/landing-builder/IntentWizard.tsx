/**
 * Intent Wizard Component for Quick Builder v2
 * 
 * 3-step wizard for creating landing pages:
 * Step 1: Select intent (product type, goal, traffic source)
 * Step 2: Connect product (select existing or create new)
 * Step 3: Preview & confirm template
 */

import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  ShoppingBag,
  Package,
  Target,
  MessageCircle,
  Facebook,
  Play,
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '~/utils/cn';
import type { Intent, QuickProduct, StyleTokens } from '~/utils/landing-builder/intentEngine';
import { getTemplateSuggestions, DEFAULT_STYLE_TOKENS } from '~/utils/landing-builder/intentEngine';

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              step === currentStep
                ? 'bg-emerald-500 text-white scale-110'
                : step < currentStep
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                'w-12 h-1 mx-1 rounded transition-all',
                step < currentStep ? 'bg-emerald-300' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Option card for selections
interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  badge?: string;
}

function OptionCard({ icon, title, description, selected, onClick, badge }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all w-full',
        'hover:border-emerald-300 hover:bg-emerald-50/50',
        selected
          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
          : 'border-gray-200 bg-white'
      )}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-medium rounded-full">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            selected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={cn('font-semibold', selected ? 'text-emerald-700' : 'text-gray-900')}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        {selected && (
          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        )}
      </div>
    </button>
  );
}

// Step 1: Intent Selection
interface Step1Props {
  intent: Partial<Intent>;
  onUpdate: (updates: Partial<Intent>) => void;
}

function Step1IntentSelection({ intent, onUpdate }: Step1Props) {
  return (
    <div className="space-y-8">
      {/* Product Type */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          আপনি কী বিক্রি করতে চান?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            icon={<ShoppingBag className="w-5 h-5" />}
            title="একটি প্রোডাক্ট"
            description="সিঙ্গেল প্রোডাক্ট ল্যান্ডিং পেইজ"
            selected={intent.productType === 'single'}
            onClick={() => onUpdate({ productType: 'single' })}
            badge="জনপ্রিয়"
          />
          <OptionCard
            icon={<Package className="w-5 h-5" />}
            title="একাধিক প্রোডাক্ট"
            description="২-৩টি প্রোডাক্ট একসাথে"
            selected={intent.productType === 'multiple'}
            onClick={() => onUpdate({ productType: 'multiple' })}
          />
        </div>
      </div>

      {/* Goal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          আপনার লক্ষ্য কী?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            icon={<Target className="w-5 h-5" />}
            title="সরাসরি বিক্রি"
            description="ক্যাশ অন ডেলিভারিতে অর্ডার নিন"
            selected={intent.goal === 'direct_sales'}
            onClick={() => onUpdate({ goal: 'direct_sales' })}
            badge="সবচেয়ে বেশি"
          />
          <OptionCard
            icon={<MessageCircle className="w-5 h-5" />}
            title="লিড + WhatsApp"
            description="WhatsApp এ কাস্টমার পাঠান"
            selected={intent.goal === 'lead_whatsapp'}
            onClick={() => onUpdate({ goal: 'lead_whatsapp' })}
          />
        </div>
      </div>

      {/* Traffic Source */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          ট্রাফিক কোথা থেকে আসবে?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OptionCard
            icon={<Facebook className="w-5 h-5" />}
            title="Facebook Ads"
            description="ফেসবুক/ইন্সটাগ্রাম"
            selected={intent.trafficSource === 'facebook'}
            onClick={() => onUpdate({ trafficSource: 'facebook' })}
            badge="জনপ্রিয়"
          />
          <OptionCard
            icon={<Play className="w-5 h-5" />}
            title="TikTok"
            description="TikTok/Reels"
            selected={intent.trafficSource === 'tiktok'}
            onClick={() => onUpdate({ trafficSource: 'tiktok' })}
          />
          <OptionCard
            icon={<Search className="w-5 h-5" />}
            title="Organic/Search"
            description="গুগল/অর্গানিক"
            selected={intent.trafficSource === 'organic'}
            onClick={() => onUpdate({ trafficSource: 'organic' })}
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Product Selection/Creation
interface Step2Props {
  intent: Intent;
  product: Partial<QuickProduct> | null;
  existingProducts: Array<{ id: number; title: string; price: number; imageUrl?: string }>;
  selectedProductId: number | null;
  onSelectProduct: (id: number | null) => void;
  onUpdateProduct: (product: Partial<QuickProduct>) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

function Step2ProductConnection({
  product,
  existingProducts,
  selectedProductId,
  onSelectProduct,
  onUpdateProduct,
  onImageUpload,
}: Step2Props) {
  const [mode, setMode] = useState<'select' | 'create'>(
    existingProducts.length > 0 ? 'select' : 'create'
  );
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    
    setUploading(true);
    try {
      const url = await onImageUpload(file);
      onUpdateProduct({ image: url });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      {existingProducts.length > 0 && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => { setMode('select'); onSelectProduct(null); }}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              mode === 'select'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            বিদ্যমান প্রোডাক্ট
          </button>
          <button
            type="button"
            onClick={() => { setMode('create'); onSelectProduct(null); }}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              mode === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            নতুন তৈরি করুন
          </button>
        </div>
      )}

      {/* Select Existing Product */}
      {mode === 'select' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">একটি প্রোডাক্ট সিলেক্ট করুন:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {existingProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProduct(p.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                  selectedProductId === p.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                )}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-sm text-emerald-600">৳{p.price}</p>
                </div>
                {selectedProductId === p.id && (
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create New Product */}
      {mode === 'create' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">দ্রুত প্রোডাক্ট তৈরি করুন:</p>
          
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              প্রোডাক্টের নাম *
            </label>
            <input
              type="text"
              value={product?.name || ''}
              onChange={(e) => onUpdateProduct({ name: e.target.value })}
              placeholder="যেমন: প্রিমিয়াম গ্রিন টি"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                বিক্রয় মূল্য (৳) *
              </label>
              <input
                type="number"
                value={product?.price || ''}
                onChange={(e) => onUpdateProduct({ price: Number(e.target.value) })}
                placeholder="৫৫০"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                আগের মূল্য (৳)
              </label>
              <input
                type="number"
                value={product?.compareAtPrice || ''}
                onChange={(e) => onUpdateProduct({ compareAtPrice: Number(e.target.value) || undefined })}
                placeholder="৭৫০"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              প্রোডাক্ট ছবি
            </label>
            {product?.image ? (
              <div className="relative w-32 h-32">
                <img
                  src={product.image}
                  alt="Product"
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => onUpdateProduct({ image: undefined })}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                ) : (
                  <>
                    <Package className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">ছবি আপলোড করুন</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 3: Style Preferences
interface Step3StyleProps {
  styleTokens: StyleTokens;
  onUpdate: (updates: Partial<StyleTokens>) => void;
}

const COLOR_PRESETS = [
  { color: '#10B981', name: 'সবুজ' },      // Emerald
  { color: '#6366F1', name: 'নীল' },       // Indigo
  { color: '#EC4899', name: 'গোলাপি' },    // Pink
  { color: '#F59E0B', name: 'কমলা' },      // Amber
  { color: '#EF4444', name: 'লাল' },       // Red
  { color: '#8B5CF6', name: 'বেগুনি' },    // Purple
];

function Step3StylePreferences({ styleTokens, onUpdate }: Step3StyleProps) {
  return (
    <div className="space-y-8">
      {/* Brand Color */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          ব্র্যান্ড কালার
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          আপনার বাটন এবং গুরুত্বপূর্ণ এলিমেন্টের জন্য রং বেছে নিন
        </p>
        <div className="flex flex-wrap gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => onUpdate({ primaryColor: preset.color })}
              className={cn(
                'w-12 h-12 rounded-xl transition-all flex items-center justify-center',
                styleTokens.primaryColor === preset.color
                  ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                  : 'hover:scale-105'
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            >
              {styleTokens.primaryColor === preset.color && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
          {/* Custom color input */}
          <label className="relative w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="color"
              value={styleTokens.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-xs text-gray-400">+</span>
          </label>
        </div>
      </div>

      {/* Button Style */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          বাটন স্টাইল
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'rounded', label: 'রাউন্ডেড', preview: 'rounded-lg' },
            { value: 'sharp', label: 'শার্প', preview: 'rounded-none' },
            { value: 'pill', label: 'পিল', preview: 'rounded-full' },
          ].map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onUpdate({ buttonStyle: style.value as StyleTokens['buttonStyle'] })}
              className={cn(
                'p-4 border-2 rounded-xl transition-all text-center',
                styleTokens.buttonStyle === style.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              )}
            >
              <div
                className={cn('w-full py-2 mb-2 text-white text-sm font-medium', style.preview)}
                style={{ backgroundColor: styleTokens.primaryColor }}
              >
                অর্ডার করুন
              </div>
              <span className="text-sm text-gray-700">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Style */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          ফন্ট স্টাইল
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'default', label: 'ডিফল্ট', sample: 'Aa বাংলা', className: 'font-sans' },
            { value: 'bengali', label: 'বাংলা', sample: 'Aa বাংলা', className: 'font-bengali' },
            { value: 'modern', label: 'মডার্ন', sample: 'Aa বাংলা', className: 'font-sans tracking-tight' },
            { value: 'classic', label: 'ক্লাসিক', sample: 'Aa বাংলা', className: 'font-serif' },
          ].map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => onUpdate({ fontFamily: font.value as StyleTokens['fontFamily'] })}
              className={cn(
                'p-4 border-2 rounded-xl transition-all text-center',
                styleTokens.fontFamily === font.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              )}
            >
              <div className={cn('text-2xl mb-1', font.className)}>{font.sample}</div>
              <span className="text-sm text-gray-700">{font.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4: Template Preview
interface Step4Props {
  intent: Intent;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

function Step4TemplatePreview({ intent, selectedTemplate, onSelectTemplate }: Step4Props) {
  const suggestions = getTemplateSuggestions(intent);

  const templateInfo: Record<string, { name: string; description: string; gradient: string; emoji: string }> = {
    'premium-bd': { name: 'প্রিমিয়াম BD', description: 'প্রফেশনাল, বিস্তারিত', gradient: 'from-emerald-600 to-emerald-800', emoji: '🇧🇩' },
    'flash-sale': { name: 'ফ্ল্যাশ সেল', description: 'আর্জেন্সি, অফার ফোকাস', gradient: 'from-red-500 to-orange-500', emoji: '⚡' },
    'mobile-first': { name: 'মোবাইল ফার্স্ট', description: 'ক্লিন, মোবাইল অপ্টিমাইজড', gradient: 'from-blue-500 to-cyan-500', emoji: '📱' },
    'luxe': { name: 'লাক্স', description: 'প্রিমিয়াম, এলিগ্যান্ট', gradient: 'from-amber-600 to-yellow-500', emoji: '✨' },
    'organic': { name: 'অর্গানিক', description: 'ন্যাচারাল, সফট', gradient: 'from-green-500 to-lime-500', emoji: '🌿' },
    'modern-dark': { name: 'মডার্ন ডার্ক', description: 'ডার্ক থিম, মডার্ন', gradient: 'from-slate-700 to-slate-900', emoji: '🖤' },
    'minimal-light': { name: 'মিনিমাল লাইট', description: 'সিম্পল, ক্লিন', gradient: 'from-gray-100 to-gray-300', emoji: '⚪' },
    'video-focus': { name: 'ভিডিও ফোকাস', description: 'ভিডিও প্রমিনেন্ট', gradient: 'from-purple-500 to-pink-500', emoji: '🎬' },
    'showcase': { name: 'শোকেস', description: 'প্রোডাক্ট হাইলাইট', gradient: 'from-indigo-500 to-purple-500', emoji: '🎯' },
    'trust-first': { name: 'ট্রাস্ট ফার্স্ট', description: 'বিশ্বাসযোগ্যতা ফোকাস', gradient: 'from-teal-500 to-emerald-500', emoji: '🛡️' },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          আপনার জন্য সেরা টেমপ্লেট
        </h3>
        <p className="text-sm text-gray-500">
          আপনার ইন্টেন্ট অনুযায়ী আমরা এই টেমপ্লেটগুলো সাজেস্ট করছি
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {suggestions.map((templateId, index) => {
          const info = templateInfo[templateId] || { name: templateId, description: '', gradient: 'from-gray-400 to-gray-600', emoji: '🎨' };
          return (
            <button
              key={templateId}
              type="button"
              onClick={() => onSelectTemplate(templateId)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-center transition-all',
                selectedTemplate === templateId
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-emerald-300'
              )}
            >
              {index === 0 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  সাজেস্টেড
                </span>
              )}
              <div className={cn(
                'w-full h-24 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br',
                info.gradient
              )}>
                <span className="text-3xl drop-shadow-lg">{info.emoji}</span>
              </div>
              <h4 className="font-semibold text-gray-900">{info.name}</h4>
              <p className="text-xs text-gray-500">{info.description}</p>
              {selectedTemplate === templateId && (
                <Check className="absolute top-2 right-2 w-5 h-5 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mt-6">
        <h4 className="font-medium text-gray-900 mb-2">সারসংক্ষেপ</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✓ প্রোডাক্ট টাইপ: {intent.productType === 'single' ? 'সিঙ্গেল' : 'মাল্টিপল'}</li>
          <li>✓ লক্ষ্য: {intent.goal === 'direct_sales' ? 'সরাসরি বিক্রি' : 'লিড জেনারেশন'}</li>
          <li>✓ ট্রাফিক: {intent.trafficSource === 'facebook' ? 'Facebook' : intent.trafficSource === 'tiktok' ? 'TikTok' : 'Organic'}</li>
          <li>✓ টেমপ্লেট: {templateInfo[selectedTemplate]?.name || selectedTemplate}</li>
        </ul>
      </div>
    </div>
  );
}

// Main Intent Wizard Component
interface IntentWizardProps {
  existingProducts?: Array<{ id: number; title: string; price: number; imageUrl?: string }>;
  onComplete: (data: { 
    intent: Intent; 
    product: QuickProduct | null; 
    productId: number | null; 
    templateId: string;
    styleTokens: StyleTokens;
  }) => void;
  onImageUpload?: (file: File) => Promise<string>;
  isSubmitting?: boolean;
}

export function IntentWizard({
  existingProducts = [],
  onComplete,
  onImageUpload,
  isSubmitting = false,
}: IntentWizardProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<Partial<Intent>>({
    productType: 'single',
    goal: 'direct_sales',
    trafficSource: 'facebook',
  });
  const [product, setProduct] = useState<Partial<QuickProduct> | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [styleTokens, setStyleTokens] = useState<StyleTokens>(DEFAULT_STYLE_TOKENS);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Set default template when intent is complete
  const handleIntentUpdate = (updates: Partial<Intent>) => {
    const newIntent = { ...intent, ...updates };
    setIntent(newIntent);
    
    // Auto-select template when all intent fields are set
    if (newIntent.productType && newIntent.goal && newIntent.trafficSource) {
      const suggestions = getTemplateSuggestions(newIntent as Intent);
      if (!selectedTemplate || !suggestions.includes(selectedTemplate)) {
        setSelectedTemplate(suggestions[0]);
      }
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return intent.productType && intent.goal && intent.trafficSource;
    }
    if (step === 2) {
      return selectedProductId || (product?.name && product?.price && product.price > 0);
    }
    if (step === 3) {
      // Style preferences - always valid since we have defaults
      return styleTokens.primaryColor && styleTokens.buttonStyle && styleTokens.fontFamily;
    }
    if (step === 4) {
      return selectedTemplate;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Complete wizard
      onComplete({
        intent: intent as Intent,
        product: selectedProductId ? null : (product as QuickProduct),
        productId: selectedProductId,
        templateId: selectedTemplate,
        styleTokens,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator currentStep={step} totalSteps={4} />

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {step === 1 && (
          <Step1IntentSelection intent={intent} onUpdate={handleIntentUpdate} />
        )}

        {step === 2 && (
          <Step2ProductConnection
            intent={intent as Intent}
            product={product}
            existingProducts={existingProducts}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
            onUpdateProduct={(updates) => setProduct((prev) => ({ ...prev, ...updates }))}
            onImageUpload={onImageUpload}
          />
        )}

        {step === 3 && (
          <Step3StylePreferences
            styleTokens={styleTokens}
            onUpdate={(updates) => setStyleTokens((prev) => ({ ...prev, ...updates }))}
          />
        )}

        {step === 4 && (
          <Step4TemplatePreview
            intent={intent as Intent}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        )}
        
        {/* Genie Branding */}
        <div className="text-center pt-4 border-t border-gray-100 mt-6">
          <p className="text-xs text-gray-400">
            ✨ Powered by <span className="font-semibold text-purple-500">Genie</span>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            step === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          পিছনে
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className={cn(
            'flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all',
            canProceed() && !isSubmitting
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              তৈরি হচ্ছে...
            </>
          ) : step === 4 ? (
            <>
              ল্যান্ডিং পেইজ তৈরি করুন
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              পরবর্তী
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default IntentWizard;
