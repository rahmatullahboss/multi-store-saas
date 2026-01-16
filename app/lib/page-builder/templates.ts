/**
 * Page Builder v2 - Template Presets
 * 
 * Pre-built landing page templates that users can start from.
 * Each template defines a set of sections with default props.
 */

import type { SectionType } from './types';
import { getDefaultProps } from './registry';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory = 'sales' | 'product' | 'service' | 'minimal';

export interface TemplateSection {
  type: SectionType;
  props: Record<string, unknown>;
}

export interface TemplatePreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  thumbnail: string;
  category: TemplateCategory;
  sections: TemplateSection[];
}

// ============================================================================
// TEMPLATE PRESETS
// ============================================================================

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  // ─────────────────────────────────────────────────────────────────────────
  // FLASH SALE - Urgency focused
  // ─────────────────────────────────────────────────────────────────────────
  'flash-sale': {
    id: 'flash-sale',
    name: 'ফ্ল্যাশ সেল',
    nameEn: 'Flash Sale',
    description: 'দ্রুত বিক্রয়ের জন্য আকর্ষণীয় ডিজাইন',
    descriptionEn: 'Engaging design for quick sales',
    thumbnail: '/templates/flash-sale.png',
    category: 'sales',
    sections: [
      {
        type: 'hero',
        props: {
          headline: '⚡ ফ্ল্যাশ সেল - সীমিত সময়!',
          subheadline: 'আজই অর্ডার করুন এবং পান বিশেষ ছাড়',
          ctaText: 'এখনই কিনুন',
          badgeText: '৫০% ছাড়',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '🚚', text: 'সারাদেশে ডেলিভারি' },
            { icon: '💯', text: '১০০% অরিজিনাল' },
            { icon: '🔄', text: '৭ দিনে রিটার্ন' },
            { icon: '📞', text: '২৪/৭ সাপোর্ট' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: 'কেন আমাদের থেকে কিনবেন?',
          features: [
            { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য গ্যারান্টি সহ' },
            { icon: '💰', title: 'সেরা দাম', description: 'বাজারের সর্বনিম্ন মূল্যে' },
            { icon: '🎁', title: 'ফ্রি গিফট', description: 'প্রতিটি অর্ডারে বিশেষ উপহার' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'আমাদের সন্তুষ্ট কাস্টমার',
          testimonials: [
            { name: 'রাহাত হোসেন', text: 'অসাধারণ প্রোডাক্ট! দ্রুত ডেলিভারি পেয়েছি।' },
            { name: 'সাবরিনা আক্তার', text: 'কোয়ালিটি দেখে মুগ্ধ। আবার অর্ডার করব।' },
            { name: 'কামরুল ইসলাম', text: 'ক্যাশ অন ডেলিভারি সুবিধা চমৎকার!' },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'সাধারণ জিজ্ঞাসা',
          items: [
            { question: 'ডেলিভারি কত দিনে পাব?', answer: 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।' },
            { question: 'রিটার্ন পলিসি কি?', answer: 'প্রোডাক্টে সমস্যা থাকলে ৭ দিনের মধ্যে রিটার্ন করতে পারবেন।' },
            { question: 'পেমেন্ট কিভাবে করব?', answer: 'ক্যাশ অন ডেলিভারি এবং বিকাশ/নগদ দুটোই সাপোর্ট করি।' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: 'আমাদের গ্যারান্টি',
          text: '১০০% সন্তুষ্টির গ্যারান্টি। পণ্য পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিন।',
          badgeLabel: '৭ দিন রিটার্ন গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'এখনই অর্ডার করুন',
          subheadline: 'সীমিত স্টক! দেরি না করে এখনই অর্ডার প্লেস করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT LAUNCH - New product showcase
  // ─────────────────────────────────────────────────────────────────────────
  'product-launch': {
    id: 'product-launch',
    name: 'প্রোডাক্ট লঞ্চ',
    nameEn: 'Product Launch',
    description: 'নতুন পণ্য পরিচয়ের জন্য',
    descriptionEn: 'For introducing new products',
    thumbnail: '/templates/product-launch.png',
    category: 'product',
    sections: [
      {
        type: 'hero',
        props: {
          headline: '🎉 নতুন এসেছে!',
          subheadline: 'আমাদের সর্বশেষ প্রোডাক্ট এখন অর্ডারের জন্য উন্মুক্ত',
          ctaText: 'বিস্তারিত দেখুন',
          badgeText: 'নতুন আগমন',
        },
      },
      {
        type: 'video',
        props: {
          title: 'প্রোডাক্ট ভিডিও দেখুন',
        },
      },
      {
        type: 'features',
        props: {
          title: 'বিশেষ বৈশিষ্ট্যসমূহ',
          features: [
            { icon: '🌟', title: 'আধুনিক ডিজাইন', description: 'সর্বশেষ ট্রেন্ড অনুযায়ী তৈরি' },
            { icon: '🛡️', title: 'দীর্ঘস্থায়ী', description: 'প্রিমিয়াম মেটেরিয়াল দিয়ে তৈরি' },
            { icon: '📦', title: 'সম্পূর্ণ প্যাকেজ', description: 'সব কিছু এক প্যাকেজে' },
          ],
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '✓', text: 'অরিজিনাল প্রোডাক্ট' },
            { icon: '✓', text: 'ওয়ারেন্টি সহ' },
            { icon: '✓', text: 'দ্রুত ডেলিভারি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'প্রি-অর্ডার কাস্টমারদের মতামত',
          testimonials: [],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'আপনার প্রশ্নের উত্তর',
          items: [],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'এখনই প্রি-অর্ডার করুন',
          subheadline: 'প্রথম ৫০ জন কাস্টমার পাবেন বিশেষ ছাড়',
          buttonText: 'প্রি-অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MINIMAL CLEAN - Simple and clean
  // ─────────────────────────────────────────────────────────────────────────
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'মিনিমাল ক্লিন',
    nameEn: 'Minimal Clean',
    description: 'সাদামাটা ও পরিষ্কার ডিজাইন',
    descriptionEn: 'Simple and clean design',
    thumbnail: '/templates/minimal.png',
    category: 'minimal',
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'আপনার পণ্যের নাম',
          subheadline: 'সংক্ষিপ্ত বর্ণনা এখানে লিখুন',
          ctaText: 'অর্ডার করুন',
        },
      },
      {
        type: 'features',
        props: {
          title: 'বৈশিষ্ট্যসমূহ',
          features: [
            { icon: '•', title: 'বৈশিষ্ট্য ১', description: 'বর্ণনা লিখুন' },
            { icon: '•', title: 'বৈশিষ্ট্য ২', description: 'বর্ণনা লিখুন' },
            { icon: '•', title: 'বৈশিষ্ট্য ৩', description: 'বর্ণনা লিখুন' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'অর্ডার করুন',
          buttonText: 'অর্ডার প্লেস করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SERVICE LANDING - For services
  // ─────────────────────────────────────────────────────────────────────────
  'service-landing': {
    id: 'service-landing',
    name: 'সার্ভিস ল্যান্ডিং',
    nameEn: 'Service Landing',
    description: 'সেবা প্রদানকারীদের জন্য',
    descriptionEn: 'For service providers',
    thumbnail: '/templates/service.png',
    category: 'service',
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'প্রফেশনাল সার্ভিস',
          subheadline: 'আমরা আপনার সমস্যার সমাধান দিতে প্রস্তুত',
          ctaText: 'এপয়েন্টমেন্ট নিন',
          badgeText: 'বিশ্বস্ত সেবা',
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'আমাদের সেবার সুবিধা',
          benefits: [
            { icon: '⏰', title: 'সময়মত সেবা', description: 'সময় মেনে কাজ সম্পন্ন' },
            { icon: '👨‍💼', title: 'অভিজ্ঞ টিম', description: 'দক্ষ পেশাদার টিম' },
            { icon: '💵', title: 'সাশ্রয়ী মূল্য', description: 'যুক্তিসঙ্গত দাম' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'ক্লায়েন্টদের মতামত',
          testimonials: [],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
          items: [],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'যোগাযোগ করুন',
          subheadline: 'আজই আমাদের সাথে কথা বলুন',
          buttonText: 'এপয়েন্টমেন্ট বুক করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BLANK - Start from scratch
  // ─────────────────────────────────────────────────────────────────────────
  'blank': {
    id: 'blank',
    name: 'শুরু থেকে তৈরি করুন',
    nameEn: 'Start from Scratch',
    description: 'একদম শূন্য থেকে নিজের ডিজাইন করুন',
    descriptionEn: 'Create your own design from zero',
    thumbnail: '/templates/blank.png',
    category: 'minimal',
    sections: [], // Empty - user adds sections manually
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all available templates
 */
export function getAllTemplates(): TemplatePreset[] {
  return Object.values(TEMPLATE_PRESETS);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): TemplatePreset | null {
  return TEMPLATE_PRESETS[id] || null;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): TemplatePreset[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Get template categories with counts
 */
export function getTemplateCategories(): Array<{ id: TemplateCategory; name: string; count: number }> {
  const categories: Array<{ id: TemplateCategory; name: string; count: number }> = [
    { id: 'sales', name: 'সেলস', count: 0 },
    { id: 'product', name: 'প্রোডাক্ট', count: 0 },
    { id: 'service', name: 'সার্ভিস', count: 0 },
    { id: 'minimal', name: 'মিনিমাল', count: 0 },
  ];
  
  getAllTemplates().forEach(template => {
    const cat = categories.find(c => c.id === template.category);
    if (cat) cat.count++;
  });
  
  return categories;
}
