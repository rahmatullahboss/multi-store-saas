/**
 * Template Configurations for Page Builder
 * Maps template IDs to their block structure and theme colors
 */

export interface TemplateConfig {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: 'premium' | 'sales' | 'minimal' | 'video';
  emoji: string;
  blocks: string[]; // Array of block IDs from bd-blocks.ts
  themeColors: {
    primaryColor: string;
    secondaryColor: string;
    fontHeading: string;
    fontBody: string;
  };
}

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'premium-bd': {
    id: 'premium-bd',
    name: 'প্রিমিয়াম বিডি',
    nameEn: 'Premium BD',
    description: 'বাংলাদেশী মার্কেটের জন্য অপ্টিমাইজড হাই-কনভার্টিং ডিজাইন',
    descriptionEn: 'World-class, high-converting design for BD market',
    category: 'premium',
    emoji: '🇧🇩',
    blocks: ['bd-hero', 'bd-trust', 'bd-features-grid', 'bd-dual-order', 'bd-testimonials', 'bd-faq', 'bd-guarantee'],
    themeColors: {
      primaryColor: '#10b981', // emerald-500
      secondaryColor: '#18181b', // zinc-900
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'flash-sale': {
    id: 'flash-sale',
    name: 'ফ্ল্যাশ সেল',
    nameEn: 'Flash Sale',
    description: 'কাউন্টডাউন ও স্টক সতর্কতা সহ আর্জেন্সি ডিজাইন',
    descriptionEn: 'Urgency design with countdown and stock warnings',
    category: 'sales',
    emoji: '🔥',
    blocks: ['bd-social-proof', 'bd-hero', 'bd-trust', 'bd-comparison', 'bd-order-form', 'bd-guarantee', 'bd-sticky-footer'],
    themeColors: {
      primaryColor: '#991b1b', // red-800
      secondaryColor: '#fbbf24', // yellow-400
      fontHeading: 'Poppins',
      fontBody: 'Inter',
    },
  },
  'mobile-first': {
    id: 'mobile-first',
    name: 'সিম্পল মোবাইল',
    nameEn: 'Simple Mobile',
    description: 'মোবাইলে সহজ চেকআউটের জন্য সিঙ্গেল কলাম লেআউট',
    descriptionEn: 'Clean, single-column for easy mobile checkout',
    category: 'minimal',
    emoji: '📱',
    blocks: ['bd-hero', 'bd-features-grid', 'bd-order-form', 'bd-faq', 'bd-delivery-info'],
    themeColors: {
      primaryColor: '#10b981', // emerald-500
      secondaryColor: '#0ea5e9', // sky-500
      fontHeading: 'Inter',
      fontBody: 'Inter',
    },
  },
  'luxury': {
    id: 'luxury',
    name: 'লাক্সারি ব্ল্যাক',
    nameEn: 'Luxury Black',
    description: 'প্রিমিয়াম ব্ল্যাক ও গোল্ড এস্থেটিক',
    descriptionEn: 'Premium black and gold aesthetic',
    category: 'premium',
    emoji: '👑',
    blocks: ['bd-hero', 'bd-gallery', 'bd-features-grid', 'bd-testimonials', 'bd-dual-order', 'bd-guarantee'],
    themeColors: {
      primaryColor: '#d4af37', // gold
      secondaryColor: '#18181b', // zinc-900
      fontHeading: 'Poppins',
      fontBody: 'Roboto',
    },
  },
  'organic': {
    id: 'organic',
    name: 'অর্গানিক গ্রীন',
    nameEn: 'Organic Green',
    description: 'হেলথ ও ইকো-ফ্রেন্ডলি প্রোডাক্টের জন্য',
    descriptionEn: 'For health and eco-friendly products',
    category: 'minimal',
    emoji: '🌿',
    blocks: ['bd-hero', 'bd-trust', 'bd-why-buy', 'bd-features-grid', 'bd-order-form', 'bd-guarantee'],
    themeColors: {
      primaryColor: '#16a34a', // green-600
      secondaryColor: '#a3e635', // lime-400
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'modern-dark': {
    id: 'modern-dark',
    name: 'মডার্ন ডার্ক',
    nameEn: 'Modern Dark',
    description: 'বোল্ড গ্রেডিয়েন্ট, আর্জেন্সি কালার',
    descriptionEn: 'Bold gradients, urgency colors',
    category: 'sales',
    emoji: '🖤',
    blocks: ['bd-hero', 'bd-call-now', 'bd-features-grid', 'bd-comparison', 'bd-dual-order', 'bd-testimonials', 'bd-faq'],
    themeColors: {
      primaryColor: '#e94560', // rose-red
      secondaryColor: '#6366f1', // indigo-500
      fontHeading: 'Poppins',
      fontBody: 'Inter',
    },
  },
  'minimal-light': {
    id: 'minimal-light',
    name: 'মিনিমাল লাইট',
    nameEn: 'Minimal Light',
    description: 'পরিষ্কার সাদা ব্যাকগ্রাউন্ড, এলিগ্যান্ট সিম্পলিসিটি',
    descriptionEn: 'Clean white background, elegant simplicity',
    category: 'minimal',
    emoji: '✨',
    blocks: ['bd-hero', 'bd-trust', 'bd-features-grid', 'bd-order-form', 'bd-faq'],
    themeColors: {
      primaryColor: '#6366f1', // indigo-500
      secondaryColor: '#8b5cf6', // violet-500
      fontHeading: 'Inter',
      fontBody: 'Inter',
    },
  },
  'video-focus': {
    id: 'video-focus',
    name: 'ভিডিও ফোকাস',
    nameEn: 'Video Focus',
    description: 'ফুল-উইড্থ হিরো ভিডিও ও ওভারলে CTA',
    descriptionEn: 'Full-width hero video and overlay CTA',
    category: 'video',
    emoji: '🎬',
    blocks: ['bd-video', 'bd-trust', 'bd-why-buy', 'bd-dual-order', 'bd-testimonials', 'bd-faq'],
    themeColors: {
      primaryColor: '#f59e0b', // amber-500
      secondaryColor: '#0f172a', // slate-900
      fontHeading: 'Poppins',
      fontBody: 'Roboto',
    },
  },
  'showcase': {
    id: 'showcase',
    name: 'শোকেস গ্যালারি',
    nameEn: 'Showcase Gallery',
    description: 'প্রোডাক্ট ডিটেইলস গ্যালারি গ্রিড সহ',
    descriptionEn: 'Product details with gallery grid',
    category: 'premium',
    emoji: '🖼️',
    blocks: ['bd-hero', 'bd-gallery', 'bd-features-grid', 'bd-testimonials', 'bd-dual-order', 'bd-social-proof', 'bd-faq'],
    themeColors: {
      primaryColor: '#a855f7', // purple-500
      secondaryColor: '#18181b', // zinc-900
      fontHeading: 'Poppins',
      fontBody: 'Inter',
    },
  },
};
