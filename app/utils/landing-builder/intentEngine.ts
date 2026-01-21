/**
 * Intent Engine for Quick Builder v2
 * 
 * Maps user intent to optimal landing page configuration
 * - generateOptimalSections(): Returns best section order based on intent
 * - selectOptimalTemplate(): Returns best template ID based on intent
 * - generateDefaultContent(): Creates default content for sections
 */

// Intent Types
export interface Intent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
}

export interface IntentWithProduct extends Intent {
  productId?: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  compareAtPrice?: number;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  createdAt: string;
}

// Quick Product for inline creation
export interface QuickProduct {
  name: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
}

// Style Tokens for page styling (from Style Preferences step)
export interface StyleTokens {
  primaryColor: string;        // Brand color (hex)
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  fontFamily: 'default' | 'bengali' | 'modern' | 'classic';
  darkMode?: boolean;
}

// Default style tokens
export const DEFAULT_STYLE_TOKENS: StyleTokens = {
  primaryColor: '#10B981', // Emerald
  buttonStyle: 'rounded',
  fontFamily: 'default',
  darkMode: false,
};

/**
 * Generate optimal section order based on intent
 * Different intents require different section priorities
 */
export function generateOptimalSections(intent: Intent): string[] {
  const { productType, goal, trafficSource } = intent;
  let sections: string[] = [];

  // Facebook Ads - Short attention span, urgency & trust focused
  if (trafficSource === 'facebook' && goal === 'direct_sales') {
    sections = [
      'hero',
      'trust',
      'social',        // Social proof early
      'benefits',
      'testimonials',
      'gallery',
      'guarantee',
      'cta',
      'faq',
    ];
  }

  // TikTok - Video-first, quick engagement, urgency
  else if (trafficSource === 'tiktok' && goal === 'direct_sales') {
    sections = [
      'hero',
      'video',         // Video prominent for TikTok users
      'trust',
      'social',
      'testimonials',
      'benefits',
      'cta',
      'faq',
    ];
  }

  // Organic/Search - More time to read, detailed info, SEO focused
  else if (trafficSource === 'organic') {
    sections = [
      'hero',
      'problem-solution',  // Detailed problem/solution
      'features',
      'video',
      'benefits',
      'comparison',
      'testimonials',
      'guarantee',
      'pricing',
      'cta',
      'faq',
    ];
  }

  // Lead Generation + WhatsApp - WhatsApp CTA prominent
  else if (goal === 'lead_whatsapp') {
    sections = [
      'hero',
      'trust',
      'benefits',
      'social',
      'testimonials',
      'faq',
      'cta',           // WhatsApp CTA
    ];
  }

  // Default fallback (single product, direct sales)
  else {
    sections = [
      'hero',
      'trust',
      'features',
      'benefits',
      'testimonials',
      'social',
      'guarantee',
      'cta',
      'faq',
    ];
  }

  // For multiple products, use product-grid section instead of showcase
  if (productType === 'multiple') {
    // Remove 'showcase' if present (since we'll use product-grid)
    const showcaseIndex = sections.indexOf('showcase');
    if (showcaseIndex > -1) {
      sections.splice(showcaseIndex, 1);
    }
    
    // Add product-grid after hero/trust for multi-product display
    if (!sections.includes('product-grid')) {
      const insertIndex = sections.includes('trust') 
        ? sections.indexOf('trust') + 1 
        : sections.includes('hero') 
          ? sections.indexOf('hero') + 1 
          : 1;
      sections.splice(insertIndex, 0, 'product-grid');
    }
  }

  return sections;
}

/**
 * Select optimal template based on intent
 */
export function selectOptimalTemplate(intent: Intent): string {
  const { goal, trafficSource } = intent;

  // Template mapping based on intent
  const templateMap: Record<string, Record<string, string>> = {
    facebook: {
      direct_sales: 'flash-sale',      // Urgency focused
      lead_whatsapp: 'mobile-first',   // Clean, WhatsApp prominent
    },
    tiktok: {
      direct_sales: 'video-focus',     // Video-first design
      lead_whatsapp: 'mobile-first',
    },
    organic: {
      direct_sales: 'premium-bd',      // Professional, detailed
      lead_whatsapp: 'trust-first',    // Trust building
    },
  };

  return templateMap[trafficSource]?.[goal] || 'premium-bd';
}

/**
 * Get template suggestions (top 3) based on intent
 */
export function getTemplateSuggestions(intent: Intent): string[] {
  const primary = selectOptimalTemplate(intent);
  
  const allTemplates = [
    'premium-bd',
    'flash-sale',
    'mobile-first',
    'luxe',
    'organic',
    'modern-dark',
    'minimal-light',
    'video-focus',
    'showcase',
    'minimal-clean',
    'story-driven',
    'trust-first',
  ];

  // Remove primary and get 2 more suggestions
  const others = allTemplates.filter(t => t !== primary);
  
  // Pick based on intent characteristics
  let suggestions = [primary];
  
  if (intent.trafficSource === 'facebook') {
    suggestions.push('premium-bd', 'modern-dark');
  } else if (intent.trafficSource === 'tiktok') {
    suggestions.push('flash-sale', 'modern-dark');
  } else {
    suggestions.push('minimal-light', 'trust-first');
  }

  // Ensure unique and max 3
  return Array.from(new Set(suggestions)).slice(0, 3);
}

/**
 * Generate default content based on intent and product
 */
export function generateDefaultContent(
  intent: Intent,
  product: QuickProduct
): Record<string, any> {
  const { goal, trafficSource } = intent;

  // Base headline variations
  const headlines: Record<string, string> = {
    facebook: `🔥 ${product.name} - সীমিত সময়ের অফার!`,
    tiktok: `${product.name} ✨ ভাইরাল প্রোডাক্ট`,
    organic: `${product.name} - প্রিমিয়াম কোয়ালিটি`,
  };

  // Subheadline variations
  const subheadlines: Record<string, string> = {
    direct_sales: 'এখনই অর্ডার করুন, ক্যাশ অন ডেলিভারি সুবিধা',
    lead_whatsapp: 'আরও জানতে WhatsApp এ মেসেজ করুন',
  };

  // CTA text variations
  const ctaTexts: Record<string, string> = {
    direct_sales: 'এখনই অর্ডার করুন',
    lead_whatsapp: 'WhatsApp এ যোগাযোগ করুন',
  };

  // Urgency text for ads
  const urgencyTexts: Record<string, string> = {
    facebook: '⏰ শুধুমাত্র আজকের জন্য এই দাম!',
    tiktok: '🔥 স্টক সীমিত! দ্রুত অর্ডার করুন',
    organic: '',
  };

  // Default trust badges
  const trustBadges = [
    { icon: '✅', text: '১০০% অরিজিনাল প্রোডাক্ট' },
    { icon: '🚚', text: 'দ্রুত ডেলিভারি' },
    { icon: '💳', text: 'ক্যাশ অন ডেলিভারি' },
    { icon: '🔒', text: 'নিরাপদ পেমেন্ট' },
  ];

  // Default benefits
  const benefits = [
    { icon: '💎', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের নিশ্চয়তা' },
    { icon: '💰', title: 'সাশ্রয়ী মূল্য', description: 'বাজারের সেরা দাম' },
    { icon: '⭐', title: 'কাস্টমার সন্তুষ্টি', description: '১০০০+ সন্তুষ্ট কাস্টমার' },
  ];

  // Default FAQs
  const faqs = [
    {
      question: 'ডেলিভারি কত দিনে পাবো?',
      answer: 'ঢাকায় ১-২ দিন এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে ডেলিভারি দেওয়া হয়।',
    },
    {
      question: 'পেমেন্ট কিভাবে করবো?',
      answer: 'ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে পেমেন্ট করুন। bKash/Nagad এও পেমেন্ট করতে পারবেন।',
    },
    {
      question: 'প্রোডাক্ট অরিজিনাল কিনা?',
      answer: '১০০% অরিজিনাল প্রোডাক্টের গ্যারান্টি। নকল হলে টাকা ফেরত।',
    },
  ];

  // Discount calculation
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return {
    headline: headlines[trafficSource] || `${product.name}`,
    subheadline: subheadlines[goal] || 'এখনই অর্ডার করুন',
    ctaText: ctaTexts[goal] || 'অর্ডার করুন',
    urgencyText: urgencyTexts[trafficSource] || '',
    trustBadges,
    benefits,
    faq: faqs,
    guaranteeText: '১০০% অরিজিনাল প্রোডাক্ট। পণ্য হাতে পেয়ে চেক করে পেমেন্ট করুন।',
    socialProof: {
      count: 500,
      text: 'জন কাস্টমার ইতিমধ্যে কিনেছেন',
    },
    // WhatsApp config for lead gen
    whatsappEnabled: goal === 'lead_whatsapp',
    whatsappMessage: `হ্যালো, আমি ${product.name} সম্পর্কে জানতে চাই।`,
    // Show countdown for ad traffic
    countdownEnabled: trafficSource === 'facebook' || trafficSource === 'tiktok',
    // Show stock counter for urgency
    showStockCounter: trafficSource !== 'organic',
    // Discount badge
    heroBadgeText: hasDiscount ? `${discountPercent}% ছাড়!` : 'সীমিত অফার',
  };
}

/**
 * Create complete landing config from intent
 */
export function createLandingConfigFromIntent(
  intent: Intent,
  product: QuickProduct,
  templateId?: string
): Record<string, any> {
  const sections = generateOptimalSections(intent);
  const template = templateId || selectOptimalTemplate(intent);
  const content = generateDefaultContent(intent, product);

  return {
    templateId: template,
    sectionOrder: sections,
    hiddenSections: [],
    intent: {
      ...intent,
      createdAt: new Date().toISOString(),
    },
    // Product info
    productName: product.name,
    productPrice: product.price,
    productCompareAtPrice: product.compareAtPrice,
    productImage: product.image,
    productVariants: product.variants || [],
    // Content
    ...content,
    // Default shipping
    shippingConfig: {
      insideDhaka: 60,
      outsideDhaka: 120,
      freeShippingAbove: 0,
      enabled: true,
    },
  };
}
