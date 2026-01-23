/**
 * Store Preview Demo Data
 * 
 * Comprehensive mock data for store template previews.
 * Includes Bengali product names, descriptions, and diverse categories.
 * 30+ realistic products for immersive preview experience.
 */

import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';

// ============================================================================
// EXTENDED PRODUCT TYPE FOR PREVIEW
// ============================================================================
export interface DemoProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images?: string[];
  category: string | null;
  variants?: { name: string; options: string[] }[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
  sku?: string;
  tags?: string[];
}

// ============================================================================
// DEMO PRODUCTS - 30+ Diverse products with Bengali content
// ============================================================================
export const DEMO_PRODUCTS: DemoProduct[] = [
  // ==================== ELECTRONICS (8 products) ====================
  {
    id: 1,
    storeId: 1,
    title: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
    description: 'ক্রিস্টাল ক্লিয়ার অডিও সহ ওয়্যারলেস হেডফোন। ANC, ৪০ ঘন্টা ব্যাটারি লাইফ, প্রিমিয়াম বিল্ড কোয়ালিটি। ব্লুটুথ ৫.০, মাল্টি-ডিভাইস কানেক্টিভিটি।',
    price: 4999,
    compareAtPrice: 7999,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=800&fit=crop',
    ],
    category: 'Electronics',
    variants: [{ name: 'Color', options: ['Black', 'White', 'Navy'] }],
    rating: 4.8,
    reviewCount: 156,
    stock: 45,
    sku: 'ELEC-HP-001',
    tags: ['bestseller', 'featured'],
  },
  {
    id: 2,
    storeId: 1,
    title: 'স্মার্ট ওয়াচ প্রো এডিশন',
    description: 'হার্ট রেট মনিটর, স্লিপ ট্র্যাকিং, ফিটনেস ট্র্যাকার সহ স্মার্ট ওয়াচ। ৭ দিন ব্যাটারি লাইফ, IP68 ওয়াটারপ্রুফ, AMOLED ডিসপ্লে।',
    price: 3499,
    compareAtPrice: 5499,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=800&fit=crop',
    ],
    category: 'Electronics',
    variants: [{ name: 'Color', options: ['Black', 'Silver', 'Rose Gold'] }],
    rating: 4.6,
    reviewCount: 89,
    stock: 32,
    sku: 'ELEC-SW-002',
    tags: ['new', 'featured'],
  },
  {
    id: 3,
    storeId: 1,
    title: 'পোর্টেবল ব্লুটুথ স্পিকার',
    description: 'পোর্টেবল ওয়াটারপ্রুফ ব্লুটুথ স্পিকার। ৩৬০° সারাউন্ড সাউন্ড, ২০ ঘন্টা প্লেব্যাক, TWS পেয়ারিং সাপোর্ট।',
    price: 1999,
    compareAtPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop',
    category: 'Electronics',
    variants: [{ name: 'Color', options: ['Black', 'Blue', 'Red'] }],
    rating: 4.5,
    reviewCount: 234,
    stock: 78,
    sku: 'ELEC-SP-003',
    tags: ['sale'],
  },
  {
    id: 4,
    storeId: 1,
    title: 'ওয়্যারলেস ইয়ারবাডস',
    description: 'টাচ কন্ট্রোল সহ ওয়্যারলেস ইয়ারবাডস। এক্টিভ নয়েজ ক্যান্সেলেশন, ৩০ ঘন্টা টোটাল প্লেটাইম, ফাস্ট চার্জিং।',
    price: 2499,
    compareAtPrice: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=800&fit=crop',
    category: 'Electronics',
    rating: 4.7,
    reviewCount: 312,
    stock: 54,
    sku: 'ELEC-EB-004',
    tags: ['bestseller'],
  },
  {
    id: 5,
    storeId: 1,
    title: 'পাওয়ার ব্যাংক ২০০০০mAh',
    description: 'হাই-ক্যাপাসিটি পাওয়ার ব্যাংক। ফাস্ট চার্জিং ২২.৫W, ডুয়াল USB পোর্ট, LED ইন্ডিকেটর, স্লিম ডিজাইন।',
    price: 1599,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=800&fit=crop',
    category: 'Electronics',
    rating: 4.4,
    reviewCount: 178,
    stock: 120,
    sku: 'ELEC-PB-005',
  },
  {
    id: 6,
    storeId: 1,
    title: 'মেকানিক্যাল গেমিং কীবোর্ড',
    description: 'RGB ব্যাকলিট মেকানিক্যাল কীবোর্ড। ব্লু সুইচ, N-কী রোলওভার, ডিটাচেবল কেবল, মিডিয়া কন্ট্রোল।',
    price: 3299,
    compareAtPrice: 4499,
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=800&fit=crop',
    category: 'Electronics',
    rating: 4.9,
    reviewCount: 67,
    stock: 23,
    sku: 'ELEC-KB-006',
    tags: ['new'],
  },
  {
    id: 7,
    storeId: 1,
    title: 'ওয়্যারলেস চার্জিং প্যাড',
    description: '১৫W ফাস্ট ওয়্যারলেস চার্জার। Qi সার্টিফাইড, LED ইন্ডিকেটর, অ্যান্টি-স্লিপ বেস, ওভারহিট প্রোটেকশন।',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=800&fit=crop',
    category: 'Electronics',
    rating: 4.3,
    reviewCount: 145,
    stock: 89,
    sku: 'ELEC-WC-007',
    tags: ['sale'],
  },
  {
    id: 8,
    storeId: 1,
    title: 'HD ওয়েবক্যাম',
    description: '১০৮০p ফুল HD ওয়েবক্যাম। অটোফোকাস, বিল্ট-ইন মাইক্রোফোন, প্রাইভেসি কভার, প্লাগ অ্যান্ড প্লে।',
    price: 1899,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=800&fit=crop',
    category: 'Electronics',
    rating: 4.2,
    reviewCount: 56,
    stock: 41,
    sku: 'ELEC-WEB-008',
  },

  // ==================== FASHION (8 products) ====================
  {
    id: 9,
    storeId: 1,
    title: 'প্রিমিয়াম লেদার ক্রসবডি ব্যাগ',
    description: 'প্রিমিয়াম জেনুইন লেদার দিয়ে তৈরি স্টাইলিশ ক্রসবডি ব্যাগ। মাল্টিপল কম্পার্টমেন্ট, অ্যাডজাস্টেবল স্ট্র্যাপ।',
    price: 2499,
    compareAtPrice: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
    ],
    category: 'Fashion',
    variants: [{ name: 'Color', options: ['Brown', 'Black', 'Tan'] }],
    rating: 4.7,
    reviewCount: 203,
    stock: 34,
    sku: 'FASH-BAG-009',
    tags: ['bestseller', 'featured'],
  },
  {
    id: 10,
    storeId: 1,
    title: 'কটন কম্ফোর্ট টি-শার্ট',
    description: '১০০% প্রিমিয়াম কটন দিয়ে তৈরি আরামদায়ক টি-শার্ট। ব্রেথেবল ফ্যাব্রিক, প্রি-শ্রাংক, সফট ফিনিশ।',
    price: 699,
    compareAtPrice: 999,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', options: ['White', 'Black', 'Navy', 'Gray'] },
    ],
    rating: 4.5,
    reviewCount: 456,
    stock: 234,
    sku: 'FASH-TS-010',
    tags: ['bestseller'],
  },
  {
    id: 11,
    storeId: 1,
    title: 'ক্লাসিক ডেনিম জ্যাকেট',
    description: 'ক্লাসিক ডেনিম জ্যাকেট। হাই কোয়ালিটি ফ্যাব্রিক, মেটাল বাটন, মাল্টিপল পকেট, ট্রেন্ডি ডিজাইন।',
    price: 1899,
    compareAtPrice: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
    ],
    rating: 4.6,
    reviewCount: 134,
    stock: 45,
    sku: 'FASH-JK-011',
    tags: ['new'],
  },
  {
    id: 12,
    storeId: 1,
    title: 'স্টাইলিশ সানগ্লাস',
    description: 'UV400 প্রোটেকশন সহ স্টাইলিশ সানগ্লাস। পোলারাইজড লেন্স, লাইটওয়েট ফ্রেম, ক্লাসিক ডিজাইন।',
    price: 799,
    compareAtPrice: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [{ name: 'Style', options: ['Aviator', 'Wayfarer', 'Round'] }],
    rating: 4.4,
    reviewCount: 289,
    stock: 156,
    sku: 'FASH-SG-012',
    tags: ['sale'],
  },
  {
    id: 13,
    storeId: 1,
    title: 'লেদার ওয়ালেট',
    description: 'জেনুইন লেদার ওয়ালেট। RFID ব্লকিং, মাল্টিপল কার্ড স্লট, কয়েন পকেট, গিফট বক্স প্যাকেজিং।',
    price: 1299,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [{ name: 'Color', options: ['Black', 'Brown'] }],
    rating: 4.8,
    reviewCount: 178,
    stock: 67,
    sku: 'FASH-WL-013',
    tags: ['featured'],
  },
  {
    id: 14,
    storeId: 1,
    title: 'ক্যাজুয়াল স্নিকার্স',
    description: 'কম্ফোর্টেবল ক্যাজুয়াল স্নিকার্স। মেমোরি ফোম ইনসোল, ব্রেথেবল মেশ আপার, ফ্লেক্সিবল সোল।',
    price: 2299,
    compareAtPrice: 2999,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [
      { name: 'Size', options: ['40', '41', '42', '43', '44'] },
      { name: 'Color', options: ['White', 'Black', 'Red'] },
    ],
    rating: 4.6,
    reviewCount: 321,
    stock: 89,
    sku: 'FASH-SN-014',
    tags: ['bestseller'],
  },
  {
    id: 15,
    storeId: 1,
    title: 'ফর্মাল শার্ট',
    description: 'প্রিমিয়াম কটন ফর্মাল শার্ট। রিংকেল-ফ্রি ফ্যাব্রিক, স্লিম ফিট, বাটন-ডাউন কলার।',
    price: 1199,
    compareAtPrice: 1599,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop',
    category: 'Fashion',
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['White', 'Light Blue', 'Pink'] },
    ],
    rating: 4.5,
    reviewCount: 198,
    stock: 112,
    sku: 'FASH-SH-015',
  },
  {
    id: 16,
    storeId: 1,
    title: 'ক্যানভাস ব্যাকপ্যাক',
    description: 'ডিউরেবল ক্যানভাস ব্যাকপ্যাক। ল্যাপটপ কম্পার্টমেন্ট, মাল্টিপল পকেট, ওয়াটার-রেসিস্ট্যান্ট।',
    price: 1699,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
    category: 'Fashion',
    rating: 4.7,
    reviewCount: 145,
    stock: 56,
    sku: 'FASH-BP-016',
    tags: ['new'],
  },

  // ==================== HOME & LIVING (8 products) ====================
  {
    id: 17,
    storeId: 1,
    title: 'মিনিমালিস্ট LED টেবিল ল্যাম্প',
    description: 'মডার্ন ডিজাইনের LED টেবিল ল্যাম্প। টাচ সেন্সর, ৩টি ব্রাইটনেস লেভেল, আই-কেয়ার টেকনোলজি।',
    price: 1499,
    compareAtPrice: 1999,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=800&fit=crop',
    category: 'Home',
    variants: [{ name: 'Color', options: ['White', 'Black', 'Wood'] }],
    rating: 4.6,
    reviewCount: 123,
    stock: 67,
    sku: 'HOME-LMP-017',
    tags: ['featured'],
  },
  {
    id: 18,
    storeId: 1,
    title: 'হ্যান্ডমেড সয় ক্যান্ডেল সেট',
    description: 'ন্যাচারাল সয় ওয়াক্স ক্যান্ডেল ৩ পিস সেট। লাভেন্ডার, রোজ, ভ্যানিলা ফ্রেগ্রেন্স। ৪০+ ঘন্টা বার্ন টাইম।',
    price: 799,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=800&fit=crop',
    category: 'Home',
    rating: 4.8,
    reviewCount: 234,
    stock: 89,
    sku: 'HOME-CND-018',
    tags: ['bestseller'],
  },
  {
    id: 19,
    storeId: 1,
    title: 'সিরামিক ফ্লাওয়ার ভাস',
    description: 'হ্যান্ডক্রাফটেড সিরামিক ফ্লাওয়ার ভাস। ইউনিক ডিজাইন, যেকোনো ডেকোরে মানানসই।',
    price: 999,
    compareAtPrice: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=800&fit=crop',
    category: 'Home',
    variants: [{ name: 'Style', options: ['Matte White', 'Glossy Black', 'Terracotta'] }],
    rating: 4.5,
    reviewCount: 167,
    stock: 45,
    sku: 'HOME-VAS-019',
    tags: ['sale'],
  },
  {
    id: 20,
    storeId: 1,
    title: 'বাম্বু কাটিং বোর্ড সেট',
    description: 'প্রিমিয়াম বাম্বু কাটিং বোর্ড ৩ পিস সেট। অ্যান্টি-ব্যাকটেরিয়াল, ইজি ক্লিন, জুস গ্রুভ।',
    price: 1299,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=800&fit=crop',
    category: 'Home',
    rating: 4.7,
    reviewCount: 98,
    stock: 78,
    sku: 'HOME-CB-020',
  },
  {
    id: 21,
    storeId: 1,
    title: 'কটন থ্রো ব্ল্যাংকেট',
    description: '১০০% কটন থ্রো ব্ল্যাংকেট। সফট টেক্সচার, মেশিন ওয়াশেবল, মাল্টিপল কালার।',
    price: 1899,
    compareAtPrice: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop',
    category: 'Home',
    variants: [{ name: 'Color', options: ['Beige', 'Gray', 'Navy', 'Mustard'] }],
    rating: 4.6,
    reviewCount: 145,
    stock: 56,
    sku: 'HOME-BLK-021',
    tags: ['new'],
  },
  {
    id: 22,
    storeId: 1,
    title: 'ওয়াল আর্ট প্রিন্ট সেট',
    description: 'মডার্ন অ্যাবস্ট্রাক্ট ওয়াল আর্ট ৩ পিস সেট। হাই-কোয়ালিটি ক্যানভাস, রেডি টু হ্যাং।',
    price: 2499,
    compareAtPrice: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=800&fit=crop',
    category: 'Home',
    rating: 4.4,
    reviewCount: 87,
    stock: 34,
    sku: 'HOME-ART-022',
    tags: ['featured'],
  },
  {
    id: 23,
    storeId: 1,
    title: 'সিরামিক ডিনার সেট',
    description: '১৬ পিস সিরামিক ডিনার সেট। মাইক্রোওয়েভ সেফ, ডিশওয়াশার সেফ, এলিগ্যান্ট ডিজাইন।',
    price: 3999,
    compareAtPrice: 5499,
    imageUrl: 'https://images.unsplash.com/photo-1603199506016-5f36e6d85c63?w=600&h=800&fit=crop',
    category: 'Home',
    variants: [{ name: 'Pattern', options: ['White Classic', 'Blue Floral', 'Gold Rim'] }],
    rating: 4.8,
    reviewCount: 76,
    stock: 23,
    sku: 'HOME-DIN-023',
    tags: ['sale'],
  },
  {
    id: 24,
    storeId: 1,
    title: 'প্লান্ট পট সেট',
    description: 'সিরামিক প্লান্ট পট ৪ পিস সেট। ড্রেইনেজ হোল সহ, ইনডোর-আউটডোর ইউজ।',
    price: 1199,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=800&fit=crop',
    category: 'Home',
    rating: 4.5,
    reviewCount: 134,
    stock: 67,
    sku: 'HOME-POT-024',
  },

  // ==================== BEAUTY (6 products) ====================
  {
    id: 25,
    storeId: 1,
    title: 'অর্গানিক ভিটামিন সি সিরাম',
    description: '২০% ভিটামিন সি সিরাম। হায়ালুরোনিক এসিড, ভিটামিন ই সহ। ব্রাইটেনিং, অ্যান্টি-এজিং ফর্মুলা।',
    price: 1299,
    compareAtPrice: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=800&fit=crop',
    category: 'Beauty',
    rating: 4.9,
    reviewCount: 345,
    stock: 123,
    sku: 'BEAU-SER-025',
    tags: ['bestseller', 'featured'],
  },
  {
    id: 26,
    storeId: 1,
    title: 'ন্যাচারাল লিপ বাম সেট',
    description: 'অর্গানিক লিপ বাম ৪ পিস সেট। চেরি, স্ট্রবেরি, হানি, মিন্ট ফ্লেভার। SPF প্রোটেকশন।',
    price: 499,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=800&fit=crop',
    category: 'Beauty',
    rating: 4.6,
    reviewCount: 234,
    stock: 189,
    sku: 'BEAU-LIP-026',
  },
  {
    id: 27,
    storeId: 1,
    title: 'হেয়ার কেয়ার কিট',
    description: 'কমপ্লিট হেয়ার কেয়ার কিট। শ্যাম্পু, কন্ডিশনার, হেয়ার অয়েল, সিরাম। সালফেট-ফ্রি ফর্মুলা।',
    price: 1999,
    compareAtPrice: 2799,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=800&fit=crop',
    category: 'Beauty',
    rating: 4.7,
    reviewCount: 167,
    stock: 78,
    sku: 'BEAU-HAIR-027',
    tags: ['sale'],
  },
  {
    id: 28,
    storeId: 1,
    title: 'ফেস মাস্ক কালেকশন',
    description: 'শীট মাস্ক ১০ পিস ভ্যারাইটি প্যাক। হাইড্রেটিং, ব্রাইটেনিং, অ্যান্টি-এজিং, পোর মিনিমাইজিং।',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=800&fit=crop',
    category: 'Beauty',
    rating: 4.5,
    reviewCount: 289,
    stock: 156,
    sku: 'BEAU-MSK-028',
    tags: ['new'],
  },
  {
    id: 29,
    storeId: 1,
    title: 'মেকআপ ব্রাশ সেট',
    description: '১২ পিস প্রফেশনাল মেকআপ ব্রাশ সেট। সিন্থেটিক ব্রিসলস, ট্রাভেল পাউচ সহ।',
    price: 1499,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=800&fit=crop',
    category: 'Beauty',
    rating: 4.8,
    reviewCount: 198,
    stock: 67,
    sku: 'BEAU-BRU-029',
    tags: ['featured'],
  },
  {
    id: 30,
    storeId: 1,
    title: 'পারফিউম গিফট সেট',
    description: 'প্রিমিয়াম পারফিউম ৩ পিস গিফট সেট। লং-লাস্টিং ফ্রেগ্রেন্স, এলিগ্যান্ট প্যাকেজিং।',
    price: 2999,
    compareAtPrice: 3999,
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop',
    category: 'Beauty',
    variants: [{ name: 'Scent', options: ['Floral', 'Woody', 'Fresh'] }],
    rating: 4.6,
    reviewCount: 145,
    stock: 45,
    sku: 'BEAU-PRF-030',
    tags: ['sale'],
  },

  // ==================== FOOD & GROCERY (6 products) ====================
  {
    id: 31,
    storeId: 1,
    title: 'অর্গানিক হানি',
    description: '১০০% পিওর অর্গানিক মধু। সুন্দরবনের খাঁটি মধু, কোনো এডিটিভ নেই। ৫০০গ্রাম।',
    price: 699,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.9,
    reviewCount: 456,
    stock: 234,
    sku: 'FOOD-HNY-031',
    tags: ['bestseller'],
  },
  {
    id: 32,
    storeId: 1,
    title: 'প্রিমিয়াম গ্রিন টি',
    description: 'অর্গানিক গ্রিন টি ১০০ ব্যাগ। অ্যান্টিঅক্সিডেন্ট রিচ, ওয়েট ম্যানেজমেন্ট সাপোর্ট।',
    price: 499,
    compareAtPrice: 699,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.7,
    reviewCount: 234,
    stock: 189,
    sku: 'FOOD-TEA-032',
    tags: ['featured'],
  },
  {
    id: 33,
    storeId: 1,
    title: 'মিক্সড নাটস প্যাক',
    description: 'প্রিমিয়াম মিক্সড নাটস ৫০০গ্রাম। আলমন্ড, ক্যাশিউ, পেস্তা, ওয়ালনাট। রোস্টেড & সল্টেড।',
    price: 899,
    compareAtPrice: 1199,
    imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.8,
    reviewCount: 178,
    stock: 145,
    sku: 'FOOD-NUT-033',
    tags: ['sale'],
  },
  {
    id: 34,
    storeId: 1,
    title: 'এক্সট্রা ভার্জিন অলিভ অয়েল',
    description: 'স্পেনিশ এক্সট্রা ভার্জিন অলিভ অয়েল ৫০০মিলি। কোল্ড প্রেসড, প্রিমিয়াম কোয়ালিটি।',
    price: 1299,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.6,
    reviewCount: 123,
    stock: 89,
    sku: 'FOOD-OIL-034',
  },
  {
    id: 35,
    storeId: 1,
    title: 'ডার্ক চকলেট বার সেট',
    description: 'প্রিমিয়াম ডার্ক চকলেট ৬ বার সেট। ৭০% কোকো, সুইস মেড, অ্যান্টিঅক্সিডেন্ট রিচ।',
    price: 799,
    compareAtPrice: 999,
    imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.7,
    reviewCount: 267,
    stock: 167,
    sku: 'FOOD-CHO-035',
    tags: ['new'],
  },
  {
    id: 36,
    storeId: 1,
    title: 'অর্গানিক কফি বিনস',
    description: 'প্রিমিয়াম অর্গানিক কফি বিনস ২৫০গ্রাম। মিডিয়াম রোস্ট, রিচ অ্যারোমা, স্মুথ ফ্লেভার।',
    price: 599,
    compareAtPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=800&fit=crop',
    category: 'Food',
    rating: 4.8,
    reviewCount: 189,
    stock: 123,
    sku: 'FOOD-COF-036',
    tags: ['bestseller'],
  },
];

// ============================================================================
// DEMO CATEGORIES
// ============================================================================
export const DEMO_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Food'];

// ============================================================================
// DEMO COLLECTIONS
// ============================================================================
export interface DemoCollection {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  image: string;
  productIds: number[];
}

export const DEMO_COLLECTIONS: DemoCollection[] = [
  {
    id: 'featured',
    name: 'Featured',
    nameBn: 'ফিচার্ড',
    description: 'আমাদের সেরা পণ্যগুলো একসাথে',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    productIds: [1, 9, 17, 25, 32],
  },
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    nameBn: 'নতুন এসেছে',
    description: 'সদ্য এসেছে আমাদের স্টোরে',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=400&fit=crop',
    productIds: [2, 6, 11, 16, 21, 28, 35],
  },
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    nameBn: 'সেরা বিক্রিত',
    description: 'গ্রাহকদের পছন্দের শীর্ষ পণ্য',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=400&fit=crop',
    productIds: [1, 4, 10, 14, 18, 25, 31, 36],
  },
  {
    id: 'on-sale',
    name: 'On Sale',
    nameBn: 'সেল চলছে',
    description: 'সীমিত সময়ের জন্য বিশেষ ছাড়',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=400&fit=crop',
    productIds: [3, 7, 12, 19, 23, 27, 30, 33],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স',
    description: 'সেরা গ্যাজেট এবং ইলেকট্রনিক্স',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=400&fit=crop',
    productIds: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    nameBn: 'ফ্যাশন',
    description: 'ট্রেন্ডি ফ্যাশন আইটেম',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
    productIds: [9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    nameBn: 'হোম ও লিভিং',
    description: 'আপনার ঘরকে সাজান',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=400&fit=crop',
    productIds: [17, 18, 19, 20, 21, 22, 23, 24],
  },
  {
    id: 'beauty',
    name: 'Beauty',
    nameBn: 'বিউটি',
    description: 'স্কিনকেয়ার ও বিউটি প্রোডাক্ট',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    productIds: [25, 26, 27, 28, 29, 30],
  },
];

// ============================================================================
// DEMO REVIEWS
// ============================================================================
export interface DemoReview {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export const DEMO_REVIEWS: DemoReview[] = [
  { id: 1, productId: 1, customerName: 'রহিম আহমেদ', rating: 5, comment: 'অসাধারণ সাউন্ড কোয়ালিটি! ANC ফিচারটা দারুণ কাজ করে।', date: '২ দিন আগে', verified: true },
  { id: 2, productId: 1, customerName: 'করিম হোসেন', rating: 4, comment: 'ভালো প্রোডাক্ট, ব্যাটারি লাইফ চমৎকার।', date: '১ সপ্তাহ আগে', verified: true },
  { id: 3, productId: 1, customerName: 'সালমা বেগম', rating: 5, comment: 'দামের তুলনায় অনেক ভালো মানের।', date: '২ সপ্তাহ আগে', verified: true },
  { id: 4, productId: 2, customerName: 'জামিল খান', rating: 5, comment: 'স্মার্ট ওয়াচ অনেক ভালো, ফিটনেস ট্র্যাকিং একদম সঠিক।', date: '৩ দিন আগে', verified: true },
  { id: 5, productId: 2, customerName: 'নাজমা আক্তার', rating: 4, comment: 'ডিজাইন সুন্দর, তবে স্ক্রিন আরেকটু বড় হলে ভালো হতো।', date: '১ সপ্তাহ আগে', verified: true },
  { id: 6, productId: 9, customerName: 'ফারজানা ইসলাম', rating: 5, comment: 'লেদারের কোয়ালিটি অসাধারণ! অনেক স্টাইলিশ দেখায়।', date: '৫ দিন আগে', verified: true },
  { id: 7, productId: 10, customerName: 'মাসুদ রানা', rating: 4, comment: 'কম্ফোর্টেবল টি-শার্ট, ফিটিং পারফেক্ট।', date: '১ সপ্তাহ আগে', verified: true },
  { id: 8, productId: 25, customerName: 'তানিয়া সুলতানা', rating: 5, comment: 'স্কিনে অনেক গ্লো এনেছে! ২ সপ্তাহে রেজাল্ট দেখা যাচ্ছে।', date: '৪ দিন আগে', verified: true },
  { id: 9, productId: 31, customerName: 'আবু বকর', rating: 5, comment: 'খাঁটি মধু, স্বাদ অসাধারণ। আবার অর্ডার করব।', date: '২ দিন আগে', verified: true },
  { id: 10, productId: 17, customerName: 'রুবিনা চৌধুরী', rating: 4, comment: 'ল্যাম্পটা দেখতে অনেক সুন্দর, লাইটও যথেষ্ট।', date: '১ সপ্তাহ আগে', verified: true },
];

// ============================================================================
// DEMO PAGES
// ============================================================================
export interface DemoPage {
  id: string;
  title: string;
  titleBn: string;
  content: string;
}

export const DEMO_PAGES: Record<string, DemoPage> = {
  about: {
    id: 'about',
    title: 'About Us',
    titleBn: 'আমাদের সম্পর্কে',
    content: `আমরা ২০২০ সাল থেকে বাংলাদেশে মানসম্পন্ন পণ্য সরবরাহ করে আসছি। আমাদের লক্ষ্য হলো গ্রাহকদের সেরা মানের পণ্য সবচেয়ে ভালো দামে পৌঁছে দেওয়া।

আমাদের দল সবসময় গ্রাহক সন্তুষ্টিকে সর্বোচ্চ প্রাধান্য দেয়। প্রতিটি পণ্য যত্ন সহকারে বাছাই করা হয় এবং কোয়ালিটি নিশ্চিত করে পাঠানো হয়।

আমরা বিশ্বাস করি ভালো পণ্য এবং ভালো সার্ভিসের মাধ্যমেই দীর্ঘমেয়াদী সম্পর্ক তৈরি হয়।`,
  },
  contact: {
    id: 'contact',
    title: 'Contact Us',
    titleBn: 'যোগাযোগ',
    content: `আমাদের সাথে যোগাযোগ করতে নিচের মাধ্যমগুলো ব্যবহার করুন।`,
  },
  faq: {
    id: 'faq',
    title: 'FAQ',
    titleBn: 'সাধারণ জিজ্ঞাসা',
    content: 'faq',
  },
  shipping: {
    id: 'shipping',
    title: 'Shipping Policy',
    titleBn: 'ডেলিভারি পলিসি',
    content: `ডেলিভারি সময়:
• ঢাকার ভেতরে: ১-২ কার্যদিবস
• ঢাকার বাইরে: ৩-৫ কার্যদিবস

ডেলিভারি চার্জ:
• ঢাকার ভেতরে: ৬০ টাকা
• ঢাকার বাইরে: ১২০ টাকা
• ১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি`,
  },
  returns: {
    id: 'returns',
    title: 'Return Policy',
    titleBn: 'রিটার্ন পলিসি',
    content: `আমরা ৭ দিনের ইজি রিটার্ন পলিসি অফার করি।

রিটার্ন শর্তাবলী:
• পণ্য অবশ্যই অরিজিনাল প্যাকেজিং সহ থাকতে হবে
• পণ্য অব্যবহৃত এবং ট্যাগ সহ থাকতে হবে
• রিসিট বা অর্ডার নম্বর দেখাতে হবে

রিফান্ড ৩-৫ কার্যদিবসের মধ্যে প্রসেস করা হয়।`,
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    titleBn: 'প্রাইভেসি পলিসি',
    content: `আমরা আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।

আমরা যে তথ্য সংগ্রহ করি:
• নাম, ঠিকানা, ফোন নম্বর
• ইমেইল (ঐচ্ছিক)
• অর্ডার সংক্রান্ত তথ্য

আমরা আপনার তথ্য কখনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না।`,
  },
};

// ============================================================================
// DEMO FAQ
// ============================================================================
export interface DemoFAQ {
  question: string;
  answer: string;
}

export const DEMO_FAQ: DemoFAQ[] = [
  { question: 'অর্ডার করতে কি করতে হবে?', answer: 'পছন্দের পণ্য বেছে নিয়ে "কার্টে যোগ করুন" বাটনে ক্লিক করুন। তারপর চেকআউট পেজে আপনার তথ্য দিয়ে অর্ডার কনফার্ম করুন।' },
  { question: 'পেমেন্ট কিভাবে করব?', answer: 'আমরা ক্যাশ অন ডেলিভারি (COD) এবং বিকাশ/নগদ পেমেন্ট গ্রহণ করি।' },
  { question: 'ডেলিভারি কত দিনে হয়?', answer: 'ঢাকায় ১-২ দিন এবং ঢাকার বাইরে ৩-৫ কার্যদিবসের মধ্যে ডেলিভারি করা হয়।' },
  { question: 'প্রোডাক্ট রিটার্ন করতে পারব?', answer: 'হ্যাঁ, ৭ দিনের মধ্যে অরিজিনাল প্যাকেজিং সহ রিটার্ন করতে পারবেন।' },
  { question: 'অর্ডার ট্র্যাক করব কিভাবে?', answer: 'অর্ডার কনফার্ম হলে আপনার ফোনে SMS এ ট্র্যাকিং লিংক পাঠানো হবে।' },
];

// ============================================================================
// DEMO SOCIAL LINKS
// ============================================================================
export const DEMO_SOCIAL_LINKS: SocialLinks = {
  facebook: 'https://facebook.com/demostore',
  instagram: 'https://instagram.com/demostore',
  whatsapp: '+8801700000000',
  youtube: 'https://youtube.com/demostore',
  tiktok: 'https://tiktok.com/@demostore',
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
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop',
};

// ============================================================================
// DEMO CART ITEMS (Initial)
// ============================================================================
export const DEMO_CART_ITEMS = [
  { ...DEMO_PRODUCTS[0], quantity: 1 },
  { ...DEMO_PRODUCTS[9], quantity: 2 },
  { ...DEMO_PRODUCTS[24], quantity: 1 },
];

// ============================================================================
// DEMO STORE NAME
// ============================================================================
export const DEMO_STORE_NAME = 'ডেমো স্টোর';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
export function getDemoProductById(id: number): DemoProduct | undefined {
  return DEMO_PRODUCTS.find(p => p.id === id);
}

export function getDemoProductsByCategory(category: string | null): DemoProduct[] {
  if (!category) return DEMO_PRODUCTS;
  return DEMO_PRODUCTS.filter(p => p.category === category);
}

export function getDemoProductsByCollection(collectionId: string): DemoProduct[] {
  const collection = DEMO_COLLECTIONS.find(c => c.id === collectionId);
  if (!collection) return [];
  return collection.productIds.map(id => getDemoProductById(id)).filter(Boolean) as DemoProduct[];
}

export function getDemoProductsByTag(tag: string): DemoProduct[] {
  return DEMO_PRODUCTS.filter(p => p.tags?.includes(tag));
}

export function getRelatedProducts(productId: number, limit = 4): DemoProduct[] {
  const product = getDemoProductById(productId);
  if (!product) return [];
  return DEMO_PRODUCTS
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

export function getProductReviews(productId: number): DemoReview[] {
  return DEMO_REVIEWS.filter(r => r.productId === productId);
}

export function searchDemoProducts(query: string): DemoProduct[] {
  const lowerQuery = query.toLowerCase();
  return DEMO_PRODUCTS.filter(p => 
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery) ||
    p.category?.toLowerCase().includes(lowerQuery)
  );
}

// For backward compatibility with SerializedProduct type
export type { DemoProduct as SerializedProduct };
