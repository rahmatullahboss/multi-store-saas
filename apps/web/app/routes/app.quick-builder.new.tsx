/**
 * Quick Builder - New Landing Page Wizard
 * 
 * Route: /app/quick-builder/new
 * 
 * 4-step intent-driven wizard for creating landing pages:
 * 1. Select intent (product type, goal, traffic source)
 * 2. Connect product (existing or create new)
 * 3. Style preferences (colors, fonts, button styles)
 * 4. Preview & confirm template
 */

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { IntentWizard } from '~/components/landing-builder/IntentWizard';
import { createLandingConfigFromIntent, type Intent, type QuickProduct } from '~/utils/landing-builder/intentEngine';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

// Zod schemas for input validation
const IntentSchema = z.object({
  productType: z.enum(['single', 'multiple']),
  goal: z.enum(['direct_sales', 'lead_whatsapp']),
  trafficSource: z.enum(['facebook', 'tiktok', 'organic']),
});

const QuickProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  image: z.string().url().optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().optional(),
  })).optional(),
});

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    throw redirect('/app/dashboard');
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch existing products for selection
  const existingProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(50);

  // Get store info including WhatsApp number from socialLinks
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  
  // Use unified settings for WhatsApp number
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });
  const defaultWhatsAppNumber = unifiedSettings.social.whatsapp || '';

  return json({
    storeId,
    storeName: store?.name || 'My Store',
    defaultWhatsAppNumber,
    existingProducts: existingProducts.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      imageUrl: p.imageUrl || undefined,
    })),
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);

  if (!storeId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intentStr = formData.get('intent');
  const productStr = formData.get('product');
  const productIdStr = formData.get('productId');
  const templateId = formData.get('templateId') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string | null;

  if (!intentStr || !templateId) {
    return json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Validate intent with Zod schema
    let parsedIntent;
    try {
      parsedIntent = JSON.parse(intentStr as string);
    } catch {
      return json({ success: false, error: 'Invalid intent JSON format' }, { status: 400 });
    }
    
    const intentResult = IntentSchema.safeParse(parsedIntent);
    if (!intentResult.success) {
      return json({ 
        success: false, 
        error: 'Invalid intent data: ' + intentResult.error.issues.map(i => i.message).join(', ') 
      }, { status: 400 });
    }
    const intent: Intent = intentResult.data;
    
    let product: QuickProduct | null = null;
    let linkedProductId: number | null = null;

    // If existing product selected
    if (productIdStr) {
      linkedProductId = Number(productIdStr);
      
      if (isNaN(linkedProductId) || linkedProductId <= 0) {
        return json({ success: false, error: 'Invalid product ID' }, { status: 400 });
      }
      
      // Fetch product details with storeId validation (security: prevent cross-store access)
      const productResult = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, linkedProductId),
            eq(products.storeId, storeId)  // Critical: ensure product belongs to this store
          )
        )
        .limit(1);

      if (!productResult[0]) {
        return json({ success: false, error: 'Product not found or access denied' }, { status: 404 });
      }
      
      const p = productResult[0];
      product = {
        name: p.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice || undefined,
        image: p.imageUrl || undefined,
      };
    } else if (productStr) {
      // New product from wizard - validate with Zod
      let parsedProduct;
      try {
        parsedProduct = JSON.parse(productStr as string);
      } catch {
        return json({ success: false, error: 'Invalid product JSON format' }, { status: 400 });
      }
      
      const productValidation = QuickProductSchema.safeParse(parsedProduct);
      if (!productValidation.success) {
        return json({ 
          success: false, 
          error: 'Invalid product data: ' + productValidation.error.issues.map(i => i.message).join(', ') 
        }, { status: 400 });
      }
      product = productValidation.data;
      
      // Create the product in database
      if (product) {
        const slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);

        const newProduct = await db
          .insert(products)
          .values({
            storeId: storeId,
            title: product.name,
            price: product.price,
            compareAtPrice: product.compareAtPrice || null,
            imageUrl: product.image || null,
            slug: slug + '-' + Date.now(),
            description: '',
            inventory: 100,
            isPublished: true,
          } as any)
          .returning({ id: products.id });

        linkedProductId = newProduct[0]?.id || null;
      }
    }

    if (!product) {
      return json({ success: false, error: 'Product required' }, { status: 400 });
    }

    // Generate landing config from intent
    const newConfig = createLandingConfigFromIntent(intent, product, templateId);

    // Get existing landing config
    const storeResult = await db
      .select({ landingConfig: stores.landingConfig })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    const existingConfig = parseLandingConfig(storeResult[0]?.landingConfig as string | null) || defaultLandingConfig;

    // Merge with existing config (preserve some settings)
    const mergedConfig = {
      ...existingConfig,
      ...newConfig,
      // Preserve shipping config if exists
      shippingConfig: existingConfig.shippingConfig || newConfig.shippingConfig,
      // Add quick product ID
      quickProductId: linkedProductId,
      // WhatsApp settings for lead_whatsapp goal
      ...(intent.goal === 'lead_whatsapp' && whatsappNumber ? {
        whatsappEnabled: true,
        whatsappNumber: whatsappNumber,
      } : {}),
    };

    // Update store with new landing config
    await db
      .update(stores)
      .set({
        landingConfig: JSON.stringify(mergedConfig),
        featuredProductId: linkedProductId,
        updatedAt: new Date(),
      } as any)
      .where(eq(stores.id, storeId));

    return json({
      success: true,
      data: {
        templateId,
        sectionsGenerated: newConfig.sectionOrder,
        redirectTo: '/app/settings/landing',
      },
    });
  } catch (error) {
    console.error('Quick builder error:', error);
    return json({ success: false, error: 'Failed to create landing page' }, { status: 500 });
  }
}

export default function QuickBuilderNew() {
  const { storeId, storeName, existingProducts, defaultWhatsAppNumber } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; data?: { redirectTo: string }; error?: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (data: {
    intent: Intent;
    product: QuickProduct | null;
    productId: number | null;
    templateId: string;
    whatsappNumber?: string;
  }) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('intent', JSON.stringify(data.intent));
    formData.append('templateId', data.templateId);
    
    if (data.productId) {
      formData.append('productId', String(data.productId));
    } else if (data.product) {
      formData.append('product', JSON.stringify(data.product));
    }
    
    // Include WhatsApp number if provided (for lead_whatsapp goal)
    if (data.whatsappNumber) {
      formData.append('whatsappNumber', data.whatsappNumber);
    }

    fetcher.submit(formData, { method: 'POST' });
  };

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.data?.redirectTo) {
      toast.success('ল্যান্ডিং পেইজ তৈরি হয়েছে!');
      navigate(fetcher.data.data.redirectTo);
      return;
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
      setIsSubmitting(false);
    }
  }, [fetcher.data, navigate]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const format = getOptimalFormat();
    const compressedBlob = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format,
    });
    const formData = new FormData();
    formData.append('file', compressedBlob, `hero-${Date.now()}.${format}`);
    formData.append('folder', 'banners');

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type') || '';
    let result: { success?: boolean; url?: string; error?: string } = {};
    if (contentType.includes('application/json')) {
      result = (await response.json()) as { success?: boolean; url?: string; error?: string };
    } else {
      const text = await response.text();
      throw new Error(`Upload failed (HTTP ${response.status}): ${text.slice(0, 120)}`);
    }

    if (response.ok && result.success && result.url) {
      return result.url;
    }
    throw new Error(result.error || `Upload failed (HTTP ${response.status})`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/app/settings/landing"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">ফিরে যান</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-gray-900">কুইক বিল্ডার</span>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ল্যান্ডিং পেইজ তৈরি করুন
          </h1>
          <p className="text-gray-500">
            ৪টি সহজ ধাপে আপনার প্রোডাক্টের জন্য হাই-কনভার্টিং ল্যান্ডিং পেইজ
          </p>
        </div>

        {/* Wizard */}
        <IntentWizard
          existingProducts={existingProducts}
          defaultWhatsAppNumber={defaultWhatsAppNumber}
          onComplete={handleComplete}
          onImageUpload={handleImageUpload}
          isSubmitting={isSubmitting || fetcher.state === 'submitting'}
        />
      </div>
    </div>
  );
}
