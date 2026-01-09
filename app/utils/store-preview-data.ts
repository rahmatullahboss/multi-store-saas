/**
 * Store Preview Demo Data
 * 
 * Comprehensive mock data for store template previews.
 * Includes Bengali product names, descriptions, and diverse categories.
 */

import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';
import type { SerializedProduct } from '~/templates/store-registry';

// ============================================================================
// DEMO PRODUCTS - Diverse categories with Bengali content
// ============================================================================
export const DEMO_PRODUCTS: SerializedProduct[] = [
  // Electronics
  {
    id: 1,
    storeId: 1,
    title: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
    description: 'ক্রিস্টাল ক্লিয়ার অডিও সহ ওয়্যারলেস হেডফোন। ANC, ৪০ ঘন্টা ব্যাটারি লাইফ, প্রিমিয়াম বিল্ড কোয়ালিটি।',
    price: 4999,
    compareAtPrice: 7999,
    imageUrl: 'https://picsum.photos/seed/headphones1/600/800',
    category: 'Electronics',
  },
  {
    id: 2,
    storeId: 1,
    title: 'স্মার্ট ওয়াচ প্রো',
    description: 'হার্ট রেট মনিটর, স্লিপ ট্র্যাকিং, ফিটনেস ট্র্যাকার সহ স্মার্ট ওয়াচ। ৭ দিন ব্যাটারি লাইফ।',
    price: 3499,
    compareAtPrice: 5499,
    imageUrl: 'https://picsum.photos/seed/watch1/600/800',
    category: 'Electronics',
  },
  {
    id: 3,
    storeId: 1,
    title: 'ব্লুটুথ স্পিকার',
    description: 'পোর্টেবল ওয়াটারপ্রুফ ব্লুটুথ স্পিকার। ৩৬০° সাউন্ড, ২০ ঘন্টা প্লেব্যাক।',
    price: 1999,
    compareAtPrice: 2999,
    imageUrl: 'https://picsum.photos/seed/speaker1/600/800',
    category: 'Electronics',
  },
  // Fashion
  {
    id: 4,
    storeId: 1,
    title: 'লেদার ক্রসবডি ব্যাগ',
    description: 'প্রিমিয়াম জেনুইন লেদার দিয়ে তৈরি স্টাইলিশ ক্রসবডি ব্যাগ। মাল্টিপল কম্পার্টমেন্ট।',
    price: 2499,
    compareAtPrice: 3999,
    imageUrl: 'https://picsum.photos/seed/bag1/600/800',
    category: 'Fashion',
  },
  {
    id: 5,
    storeId: 1,
    title: 'কটন কম্ফোর্ট টি-শার্ট',
    description: '১০০% প্রিমিয়াম কটন দিয়ে তৈরি আরামদায়ক টি-শার্ট। সব সাইজে পাওয়া যায়।',
    price: 699,
    compareAtPrice: 999,
    imageUrl: 'https://picsum.photos/seed/tshirt1/600/800',
    category: 'Fashion',
  },
  {
    id: 6,
    storeId: 1,
    title: 'ডেনিম জ্যাকেট',
    description: 'ক্লাসিক ডেনিম জ্যাকেট। হাই কোয়ালিটি ফ্যাব্রিক, স্টাইলিশ ডিজাইন।',
    price: 1899,
    compareAtPrice: 2499,
    imageUrl: 'https://picsum.photos/seed/jacket1/600/800',
    category: 'Fashion',
  },
  // Home & Living
  {
    id: 7,
    storeId: 1,
    title: 'মিনিমালিস্ট ল্যাম্প',
    description: 'মডার্ন ডিজাইনের LED টেবিল ল্যাম্প। টাচ সেন্সর, ৩টি ব্রাইটনেস লেভেল।',
    price: 1499,
    compareAtPrice: null,
    imageUrl: 'https://picsum.photos/seed/lamp1/600/800',
    category: 'Home',
  },
  {
    id: 8,
    storeId: 1,
    title: 'হ্যান্ডমেড ক্যান্ডেল সেট',
    description: 'ন্যাচারাল সয় ওয়াক্স ক্যান্ডেল সেট। লাভেন্ডার, রোজ, ভ্যানিলা ফ্রেগ্রেন্স।',
    price: 599,
    compareAtPrice: null,
    imageUrl: 'https://picsum.photos/seed/candle1/600/800',
    category: 'Home',
  },
  {
    id: 9,
    storeId: 1,
    title: 'সিরামিক ভাস',
    description: 'হ্যান্ডক্রাফটেড সিরামিক ফ্লাওয়ার ভাস। ইউনিক ডিজাইন, যেকোনো ডেকোরে মানানসই।',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://picsum.photos/seed/vase1/600/800',
    category: 'Home',
  },
  // Beauty
  {
    id: 10,
    storeId: 1,
    title: 'অর্গানিক ফেস সিরাম',
    description: '১০০% অর্গানিক উপাদান দিয়ে তৈরি ফেস সিরাম। ভিটামিন সি, হায়ালুরোনিক এসিড।',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://picsum.photos/seed/serum1/600/800',
    category: 'Beauty',
  },
  {
    id: 11,
    storeId: 1,
    title: 'ন্যাচারাল লিপ বাম সেট',
    description: 'অর্গানিক লিপ বাম ৪ পিস সেট। চেরি, স্ট্রবেরি, হানি, মিন্ট।',
    price: 399,
    compareAtPrice: null,
    imageUrl: 'https://picsum.photos/seed/lipbalm1/600/800',
    category: 'Beauty',
  },
  {
    id: 12,
    storeId: 1,
    title: 'হেয়ার কেয়ার কিট',
    description: 'কমপ্লিট হেয়ার কেয়ার কিট। শ্যাম্পু, কন্ডিশনার, হেয়ার অয়েল, সিরাম।',
    price: 1499,
    compareAtPrice: 1999,
    imageUrl: 'https://picsum.photos/seed/haircare1/600/800',
    category: 'Beauty',
  },
];

// ============================================================================
// DEMO CATEGORIES
// ============================================================================
export const DEMO_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty'];

// ============================================================================
// DEMO SOCIAL LINKS
// ============================================================================
export const DEMO_SOCIAL_LINKS: SocialLinks = {
  facebook: 'https://facebook.com/demostore',
  instagram: 'https://instagram.com/demostore',
  whatsapp: '+8801700000000',
};

// ============================================================================
// DEMO BUSINESS INFO
// ============================================================================
export const DEMO_BUSINESS_INFO = {
  phone: '+880 1700-000000',
  email: 'support@demostore.com',
  address: 'গুলশান-২, ঢাকা-১২১২, বাংলাদেশ',
};

// ============================================================================
// DEMO FOOTER CONFIG
// ============================================================================
export const DEMO_FOOTER_CONFIG: FooterConfig = {
  description: 'আমাদের প্রিমিয়াম কালেকশন থেকে সেরা পণ্য বেছে নিন। ১০০% অরিজিনাল প্রোডাক্ট, দ্রুত ডেলিভারি, ইজি রিটার্ন পলিসি।',
};

// ============================================================================
// DEMO THEME CONFIG
// ============================================================================
export const DEMO_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#6366f1',
  accentColor: '#f59e0b',
  announcement: {
    text: '🎉 ফ্রি ডেলিভারি ১০০০ টাকার উপরে! সীমিত সময়ের অফার।',
    link: '#',
  },
  bannerText: 'আমাদের নতুন কালেকশন',
  bannerUrl: 'https://picsum.photos/seed/banner1/1920/600',
};

// ============================================================================
// DEMO CART ITEMS
// ============================================================================
export const DEMO_CART_ITEMS = [
  { ...DEMO_PRODUCTS[0], quantity: 1 },
  { ...DEMO_PRODUCTS[4], quantity: 2 },
  { ...DEMO_PRODUCTS[9], quantity: 1 },
];

// ============================================================================
// DEMO STORE NAME
// ============================================================================
export const DEMO_STORE_NAME = 'ডেমো স্টোর';

// ============================================================================
// GET PRODUCT BY ID
// ============================================================================
export function getDemoProductById(id: number): SerializedProduct | undefined {
  return DEMO_PRODUCTS.find(p => p.id === id);
}

// ============================================================================
// GET PRODUCTS BY CATEGORY
// ============================================================================
export function getDemoProductsByCategory(category: string | null): SerializedProduct[] {
  if (!category) return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter(p => p.category === category);
}
