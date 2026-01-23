/**
 * Template Selector Page - Merchant Dashboard
 * Route: /app/design
 * 
 * World-class template selection experience with beautiful cards and preview modal.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllTemplates, DEFAULT_TEMPLATE_ID } from '~/templates/registry';
import { Check, ExternalLink, Palette, Eye, Sparkles, Zap, Leaf, Crown, Smartphone, X, Monitor, Tablet, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTemplateComponent } from '~/templates/registry';
import type { LandingConfig as LandingConfigType } from '@db/types';

export const meta: MetaFunction = () => [{ title: 'Store Design - Ozzyl' }];

// ============================================================================
// TEMPLATE METADATA (For beautiful cards)
// ============================================================================
const TEMPLATE_META: Record<string, { 
  gradient: string; 
  icon: React.ReactNode; 
  tags: string[]; 
  isNew?: boolean;
  isPremium?: boolean;
}> = {
  'premium-bd': {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: <Zap className="w-8 h-8" />,
    tags: ['High Conversion', 'Bangla Ready'],
    isNew: true,
  },
  'flash-sale': {
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    icon: <Sparkles className="w-8 h-8" />,
    tags: ['Urgency', 'Countdown Timer'],
    isNew: true,
  },
  'mobile-first': {
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    icon: <Smartphone className="w-8 h-8" />,
    tags: ['Single Column', 'Easy Checkout'],
  },
  'luxury': {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    icon: <Crown className="w-8 h-8" />,
    tags: ['Premium Feel', 'Gold Accents'],
    isPremium: true,
  },
  'organic': {
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    icon: <Leaf className="w-8 h-8" />,
    tags: ['Natural', 'Eco-friendly'],
  },
  'modern-dark': {
    gradient: 'from-gray-700 via-gray-800 to-black',
    icon: <Sparkles className="w-8 h-8" />,
    tags: ['Dark Theme', 'Bold'],
  },
  'minimal-light': {
    gradient: 'from-gray-100 via-white to-gray-200',
    icon: <Sparkles className="w-8 h-8 text-gray-600" />,
    tags: ['Clean', 'Minimal'],
  },
  'video-focus': {
    gradient: 'from-purple-600 via-pink-600 to-red-500',
    icon: <Sparkles className="w-8 h-8" />,
    tags: ['Video Hero', 'Engaging'],
  },
};

// Mock data for preview
const MOCK_PRODUCT = {
  id: 1, storeId: 1, title: 'Premium Product', 
  description: 'High quality product description.', 
  price: 2999, compareAtPrice: 4999, imageUrl: null,
};
const MOCK_TESTIMONIALS = [
  { name: 'রহিম', text: 'অসাধারণ!', rating: 5 },
];

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const landingConfig = parseLandingConfig(store[0].landingConfig as string | null) || defaultLandingConfig;
  const currentTemplateId = landingConfig.templateId || DEFAULT_TEMPLATE_ID;
  const templates = getAllTemplates();
  
  return json({
    currentTemplateId,
    templates: templates.map(t => ({ id: t.id, name: t.name, description: t.description, thumbnail: t.thumbnail })),
    storeSubdomain: store[0].subdomain,
    storeName: store[0].name,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const formData = await request.formData();
  const templateId = formData.get('templateId') as string;
  
  if (!templateId) return json({ success: false, error: 'Template ID required' }, { status: 400 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const currentConfig = parseLandingConfig(store[0].landingConfig as string | null) || defaultLandingConfig;
  const updatedConfig: LandingConfig = { ...currentConfig, templateId };
  
  await db.update(stores).set({ landingConfig: JSON.stringify(updatedConfig), updatedAt: new Date() }).where(eq(stores.id, storeId));
  
  return json({ success: true, templateId });
}

// ============================================================================
// WORLD-CLASS TEMPLATE PREVIEW MODAL
// ============================================================================
function TemplatePreviewModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  storeName,
  onSelect,
  isSelecting,
}: {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  storeName: string;
  onSelect: () => void;
  isSelecting: boolean;
}) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const landingConfig: LandingConfigType = {
    templateId,
    headline: 'Amazing Product That Changes Lives',
    subheadline: 'Experience premium quality with our flagship product.',
    urgencyText: '🔥 Limited Time Offer!',
    ctaText: 'Order Now',
    ctaSubtext: 'Free Delivery',
    videoUrl: '',
    testimonials: MOCK_TESTIMONIALS,
  };

  const TemplateComponent = getTemplateComponent(templateId);
  const meta = TEMPLATE_META[templateId] || { gradient: 'from-gray-500 to-gray-700', icon: <Sparkles />, tags: [] };

  const deviceWidths = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-7xl h-[95vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Browser Chrome Style */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            {/* Left: Window Controls (Fake) */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-400" onClick={onClose} />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>

            {/* Center: URL Bar */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-1.5">
                <div className="w-4 h-4 text-green-400">🔒</div>
                <span className="text-sm text-gray-300 truncate">
                  yourstore.ozzyl.com
                </span>
              </div>
            </div>

            {/* Right: Device Toggle */}
            <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
              {[
                { id: 'desktop', icon: <Monitor className="w-4 h-4" />, label: 'Desktop' },
                { id: 'tablet', icon: <Tablet className="w-4 h-4" />, label: 'Tablet' },
                { id: 'mobile', icon: <Smartphone className="w-4 h-4" />, label: 'Mobile' },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setDeviceView(device.id as 'desktop' | 'tablet' | 'mobile')}
                  className={`p-2 rounded-md transition-all ${
                    deviceView === device.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                  title={device.label}
                >
                  {device.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 bg-gray-950 overflow-auto flex items-start justify-center py-6 px-4">
            {/* Device Frame */}
            <div className={`transition-all duration-500 ease-out ${deviceWidths[deviceView]}`}>
              {/* Phone Notch (Mobile Only) */}
              {deviceView === 'mobile' && (
                <div className="w-full h-7 bg-black rounded-t-[2rem] flex items-center justify-center">
                  <div className="w-20 h-5 bg-gray-900 rounded-full" />
                </div>
              )}
              
              {/* Screen */}
              <div className={`bg-white overflow-hidden shadow-2xl ${
                deviceView === 'mobile' ? 'rounded-b-[2rem] border-x-4 border-b-4 border-gray-800' :
                deviceView === 'tablet' ? 'rounded-xl border-4 border-gray-700' :
                'rounded-lg'
              }`}>
                <div className={`overflow-auto ${
                  deviceView === 'mobile' ? 'max-h-[70vh]' : 'max-h-[75vh]'
                }`}>
                  <TemplateComponent
                    storeName={storeName}
                    storeId={1}
                    product={MOCK_PRODUCT}
                    config={landingConfig}
                    currency="BDT"
                    isPreview={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Action Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white`}>
                {meta.icon}
              </div>
              <div>
                <h3 className="font-semibold text-white">{templateName}</h3>
                <div className="flex gap-2 mt-0.5">
                  {meta.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-300 hover:text-white font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={onSelect}
                disabled={isSelecting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSelecting ? 'Applying...' : (
                  <>
                    Use This Template
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function DesignPage() {
  const { currentTemplateId, templates, storeSubdomain, storeName } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fetcher = useFetcher<{ success: boolean }>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  const isSubmitting = navigation.state === 'submitting' || fetcher.state === 'submitting';

  // Handle template selection from preview modal
  const handleSelectFromPreview = useCallback(() => {
    if (!previewTemplate) return;
    fetcher.submit(
      { templateId: previewTemplate },
      { method: 'POST' }
    );
  }, [previewTemplate, fetcher]);

  // Show success toast
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      setPreviewTemplate(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (navigation.state === 'idle' && navigation.formData) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [navigation.state, navigation.formData]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Palette className="w-6 h-6" />
            </div>
            Choose Your Template
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Select a beautiful landing page design for your store
          </p>
        </div>
        <Link
          to={`https://${storeSubdomain}.ozzyl.com`}
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition shadow-lg"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Store
        </Link>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Template applied successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Grid - World Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => {
          const isActive = template.id === currentTemplateId;
          const meta = TEMPLATE_META[template.id] || { gradient: 'from-gray-500 to-gray-700', icon: <Sparkles />, tags: [] };

          return (
            <motion.div
              key={template.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="group"
            >
              <div className={`rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl ${
                isActive ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300'
              }`}>
                {/* Gradient Thumbnail */}
                <div className={`aspect-video bg-gradient-to-br ${meta.gradient} relative overflow-hidden`}>
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 group-hover:text-white/50 transition-colors">
                    <div className="transform scale-[3] group-hover:scale-[3.5] transition-transform duration-500">
                      {meta.icon}
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {meta.isNew && (
                      <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        NEW
                      </span>
                    )}
                    {meta.isPremium && (
                      <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Crown className="w-3 h-3" /> PREMIUM
                      </span>
                    )}
                  </div>
                  
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  )}

                  {/* Preview Button on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewTemplate(template.id)}
                      className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0"
                    >
                      <Eye className="w-5 h-5" />
                      Preview
                    </button>
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {meta.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <Form method="post">
                      <input type="hidden" name="templateId" value={template.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting || isActive}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700 cursor-default'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        } disabled:opacity-50`}
                      >
                        {isActive ? 'Currently Active' : 'Use Template'}
                      </button>
                    </Form>
                    <button
                      onClick={() => setPreviewTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          templateId={previewTemplate}
          templateName={templates.find(t => t.id === previewTemplate)?.name || 'Template'}
          storeName={storeName}
          onSelect={handleSelectFromPreview}
          isSelecting={fetcher.state === 'submitting'}
        />
      )}
    </div>
  );
}
