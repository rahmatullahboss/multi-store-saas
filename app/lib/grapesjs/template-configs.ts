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
    blocks: [
      'bd-urgency-timer',
      'bd-header',
      'bd-hero-modern',
      'bd-trust-glass',
      'bd-features-zigzag',
      'bd-gallery',
      'bd-dual-order',
      'bd-testimonials-marquee',
      'bd-faq',
      'bd-footer-simple'
    ],
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
    blocks: [
      'bd-header',
      'bd-urgency-timer',
      'bd-hero',
      'bd-trust-glass',
      'bd-gallery',
      'bd-features-grid',
      'bd-why-buy',
      'bd-testimonials',
      'bd-order-form',
      'bd-footer-simple'
    ],
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
    blocks: [
      'bd-header',
      'bd-hero-video',
      'bd-social-proof',
      'bd-why-buy',
      'bd-features-grid',
      'bd-testimonials-marquee',
      'bd-guarantee',
      'bd-call-now',
      'bd-faq',
      'bd-footer-simple'
    ],
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
    blocks: [
      'bd-header',
      'bd-urgency-timer',
      'bd-social-proof',
      'bd-hero',
      'bd-trust-glass',
      'bd-video',
      'bd-comparison',
      'bd-order-form',
      'bd-faq',
      'bd-sticky-footer'
    ],
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
    blocks: [
      'bd-header',
      'bd-urgency-timer',
      'bd-hero',
      'bd-gallery',
      'bd-features-grid',
      'bd-trust',
      'bd-testimonials',
      'bd-dual-order',
      'bd-faq',
      'bd-footer-simple'
    ],
    themeColors: {
      primaryColor: '#ea580c', // orange-600
      secondaryColor: '#f1f5f9', // slate-100
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'premium-bd-v2': {
    id: 'premium-bd-v2',
    name: 'প্রিমিয়াম বিডি V2 (Advanced)',
    nameEn: 'Premium BD V2',
    description: 'বাংলাদেশী মার্কেটের জন্য সর্বোচ্চ কনভার্সন গ্যারান্টিযুক্ত ডিজাইন',
    descriptionEn: 'Highest converting design for BD market with advanced sections',
    category: 'premium',
    emoji: '💎',
    blocks: [
      'bd-urgency-timer', 
      'bd-header',
      'bd-hero-modern', 
      'bd-trust-glass', 
      'bd-video', 
      'bd-gallery', 
      'bd-benefits-grid-rich', 
      'bd-comparison-advanced', 
      'bd-social-proof', 
      'bd-why-buy', 
      'bd-testimonials', 
      'bd-faq', 
      'bd-delivery-info', 
      'bd-guarantee', 
      'bd-order-form-premium',
      'bd-footer-simple'
    ],
    themeColors: {
      primaryColor: '#10b981', // emerald-500
      secondaryColor: '#18181b', // zinc-900
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'flash-sale-v2': {
    id: 'flash-sale-v2',
    name: 'ফ্ল্যাশ সেল V2 (Hyper Urgency)',
    nameEn: 'Flash Sale V2',
    description: 'স্টক ক্লিয়ারেন্স এবং আর্জেন্সি ড্রাইভেন সেলস পেজ',
    descriptionEn: 'Urgency driven sales page for stock clearance',
    category: 'sales',
    emoji: '🔥',
    blocks: [
      'bd-header',
      'bd-urgency-timer',
      'bd-hero',
      'bd-gallery',
      'bd-social-proof',
      'bd-comparison-advanced',
      'bd-trust-glass',
      'bd-faq',
      'bd-order-form-premium',
      'bd-sticky-footer'
    ],
    themeColors: {
      primaryColor: '#dc2626', // red-600
      secondaryColor: '#000000', // black
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
  'luxury-gold-v2': {
    id: 'luxury-gold-v2',
    name: 'লাক্সারি গোল্ড (Premium)',
    nameEn: 'Luxury Gold',
    description: 'প্রিমিয়াম ব্র্যান্ডের জন্য মার্জিত ডিজাইন',
    descriptionEn: 'Elegant design for premium brands',
    category: 'premium',
    emoji: '👑',
    blocks: [
      'bd-urgency-timer',
      'bd-header',
      'bd-hero-modern',
      'bd-trust-glass',
      'bd-benefits-grid-rich',
      'bd-video',
      'bd-testimonials-marquee',
      'bd-faq',
      'bd-order-form-premium',
      'bd-footer-simple'
    ],
    themeColors: {
      primaryColor: '#d4af37', // gold
      secondaryColor: '#18181b', // zinc-900
      fontHeading: 'Poppins',
      fontBody: 'Hind Siliguri',
    },
  },
  'turbo-sale': {
    id: 'turbo-sale',
    name: 'টার্বো সেল (High Conversion)',
    nameEn: 'Turbo Sale',
    description: 'ভিডিও এবং আর্জেন্সি ফোকাসড ডিজাইন (BD Special)',
    descriptionEn: 'Video & Urgency focused design (BD Special)',
    category: 'sales',
    emoji: '🚀',
    blocks: [
      'bd-urgency-timer',
      'bd-header',
      'bd-hero-video',
      'bd-social-proof',
      'bd-features-zigzag',
      'bd-comparison-advanced',
      'bd-testimonials-marquee',
      'bd-faq',
      'bd-order-form-premium',
      'bd-sticky-footer'
    ],
    themeColors: {
      primaryColor: '#DC2626', // Red
      secondaryColor: '#FEF08A', // Yellow
      fontHeading: 'Hind Siliguri',
      fontBody: 'Hind Siliguri',
    },
  },
};
