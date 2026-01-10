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
  'gadget-pro': {
    id: 'gadget-pro',
    name: 'গ্যাজেট প্রো (Modern)',
    nameEn: 'Gadget Pro',
    description: 'আধুনিক টেক প্রোডাক্ট এবং গ্যাজেট এর জন্য সেরা ডিজাইন',
    descriptionEn: 'Best choice for Tech products and Gadgets',
    category: 'premium',
    emoji: '🎧',
    blocks: ['bd-header', 'bd-hero-modern', 'bd-features-zigzag', 'bd-dual-order', 'bd-testimonials-marquee', 'bd-faq', 'bd-footer-simple'],
    themeColors: {
      primaryColor: '#2563eb', // blue-600
      secondaryColor: '#1e293b', // slate-800
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'beauty-glow': {
    id: 'beauty-glow',
    name: 'বিউটি গ্লো (Minimal)',
    nameEn: 'Beauty Glow',
    description: 'স্কিনকেয়ার এবং কসমেটিকস এর জন্য মার্জিত ডিজাইন',
    descriptionEn: 'Elegant design for Skincare and Cosmetics',
    category: 'minimal',
    emoji: '✨',
    blocks: ['bd-header', 'bd-hero', 'bd-gallery', 'bd-trust', 'bd-features-grid', 'bd-testimonials', 'bd-order-form', 'bd-footer-simple'],
    themeColors: {
      primaryColor: '#db2777', // pink-600
      secondaryColor: '#fce7f3', // pink-100
      fontHeading: 'Hind Siliguri',
      fontBody: 'Inter',
    },
  },
  'digital-course': {
    id: 'digital-course',
    name: 'ডিজিটাল কোর্স (Video)',
    nameEn: 'Digital Course',
    description: 'ভিডিও কোর্স এবং ডিজিটাল প্রোডাক্ট সেলিং এর জন্য',
    descriptionEn: 'Perfect for Video Courses and Digital Products',
    category: 'video',
    emoji: '📹',
    blocks: ['bd-hero-video', 'bd-social-proof', 'bd-why-buy', 'bd-features-grid', 'bd-call-now', 'bd-faq', 'bd-footer-simple'],
    themeColors: {
      primaryColor: '#7c3aed', // violet-600
      secondaryColor: '#000000', // black
      fontHeading: 'Poppins',
      fontBody: 'Hind Siliguri',
    },
  },
  'flash-sale': {
    id: 'flash-sale',
    name: 'ফ্ল্যাশ সেল (Urgency)',
    nameEn: 'Flash Sale',
    description: 'স্টক ক্লিয়ারেন্স এবং ধামাকা অফার এর জন্য',
    descriptionEn: 'Urgency design for Stock Clearance',
    category: 'sales',
    emoji: '🔥',
    blocks: ['bd-social-proof', 'bd-hero', 'bd-comparison', 'bd-order-form', 'bd-sticky-footer'],
    themeColors: {
      primaryColor: '#dc2626', // red-600
      secondaryColor: '#fef08a', // yellow-200
      fontHeading: 'Hind Siliguri',
      fontBody: 'hind Siliguri',
    },
  },
  'organic-food': {
    id: 'organic-food',
    name: 'অর্গানিক ফুড',
    nameEn: 'Organic Food',
    description: 'খাবার এবং ভেষজ পণ্যের জন্য ন্যাচারাল লুক',
    descriptionEn: 'Natural look for Food and Herbal products',
    category: 'minimal',
    emoji: '🍃',
    blocks: ['bd-header', 'bd-hero', 'bd-features-grid', 'bd-trust', 'bd-dual-order', 'bd-footer-simple'],
    themeColors: {
      primaryColor: '#ea580c', // orange-600
      secondaryColor: '#f1f5f9', // slate-100
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
};
