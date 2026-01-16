/**
 * Page Builder v2 - Template Presets
 * 
 * Pre-built landing page templates that users can start from.
 * Each template defines a set of sections with default props.
 * 
 * Enhanced with rich templates from the old landing builder.
 */

import type { SectionType } from './types';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory = 'sales' | 'product' | 'service' | 'minimal' | 'premium';

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
  emoji: string;
  colors: {
    primary: string;
    accent: string;
    bg: string;
  };
  sections: TemplateSection[];
}

// ============================================================================
// TEMPLATE PRESETS - Rich templates ported from old landing builder
// ============================================================================

export const TEMPLATE_PRESETS: Record<string, TemplatePreset> = {
  // ─────────────────────────────────────────────────────────────────────────
  // QUICK START - High Conversion Narrative Template (Most Popular)
  // ─────────────────────────────────────────────────────────────────────────
  'quick-start': {
    id: 'quick-start',
    name: 'কুইক স্টার্ট',
    nameEn: '⚡ Quick Start (High Conversion)',
    description: 'স্ক্রলিং ন্যারেটিভ সহ হাই-কনভার্শন টেমপ্লেট',
    descriptionEn: 'Proven high-conversion narrative template',
    thumbnail: '/templates/quick-start.png',
    category: 'sales',
    emoji: '⚡',
    colors: {
      primary: '#1D3557',
      accent: '#E63946',
      bg: 'linear-gradient(135deg, #1D3557 0%, #0D1B2A 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'আপনার জীবনকে আরো সহজ ও সুন্দর করুন আমাদের প্রিমিয়াম প্রোডাক্ট দিয়ে',
          subheadline: '১০,০০০+ সন্তুষ্ট গ্রাহক আমাদের উপর ভরসা করেছেন। ১০০% অরিজিনাল প্রোডাক্ট, ক্যাশ অন ডেলিভারি সুবিধা সহ সারা বাংলাদেশে দ্রুত ডেলিভারি।',
          ctaText: 'এখনই অর্ডার করুন',
          badgeText: '🔥 সবচেয়ে বিক্রিত প্রোডাক্ট',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '✓', text: '১০০% অরিজিনাল' },
            { icon: '🚚', text: 'ক্যাশ অন ডেলিভারি' },
            { icon: '↩️', text: '৭ দিনে রিটার্ন' },
            { icon: '📞', text: '২৪/৭ সাপোর্ট' },
          ],
        },
      },
      {
        type: 'problem-solution',
        props: {
          problemTitle: 'আপনি কি এই সমস্যায় ভুগছেন?',
          problems: [
            'বাজারে অরিজিনাল প্রোডাক্ট পাওয়া কঠিন',
            'দাম বেশি কিন্তু কোয়ালিটি খারাপ',
            'ডেলিভারি পেতে অনেক দেরি হয়',
          ],
          solutionTitle: 'আমাদের সমাধান',
          solutions: [
            '১০০% অরিজিনাল ও ওয়ারেন্টি সহ প্রোডাক্ট',
            'ফ্যাক্টরি ডাইরেক্ট দামে সেরা কোয়ালিটি',
            '২-৩ দিনে দ্রুত ডেলিভারি',
          ],
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'কেন আমাদের থেকে কিনবেন?',
          subtitle: 'আমরা নিশ্চিত করি আপনার সেরা অভিজ্ঞতা',
          benefits: [
            { icon: '🏆', title: 'প্রিমিয়াম কোয়ালিটি', description: 'বিশ্বমানের প্রোডাক্ট যা দীর্ঘদিন টেকসই' },
            { icon: '🛡️', title: '১০০% গ্যারান্টি', description: 'সমস্যা থাকলে সম্পূর্ণ টাকা ফেরত' },
            { icon: '💰', title: 'সাশ্রয়ী মূল্য', description: 'মিডলম্যান ছাড়া সরাসরি আপনার কাছে' },
            { icon: '🚚', title: 'নিরাপদ প্যাকেজিং', description: 'প্রিমিয়াম প্যাকেজিং এ ডেলিভারি' },
            { icon: '↩️', title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে প্রশ্নহীন রিটার্ন' },
            { icon: '👥', title: '১০,০০০+ খুশি গ্রাহক', description: 'হাজারো গ্রাহক আমাদের উপর ভরসা রাখেন' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'সন্তুষ্ট গ্রাহকদের মতামত',
          testimonials: [
            { name: 'রাহাত হোসেন', location: 'ঢাকা', text: 'অসাধারণ প্রোডাক্ট! দ্রুত ডেলিভারি পেয়েছি। কোয়ালিটি দেখে মুগ্ধ।', rating: 5 },
            { name: 'সাবরিনা আক্তার', location: 'চট্টগ্রাম', text: 'এত কম দামে এত ভালো প্রোডাক্ট আশা করিনি। আবার অর্ডার করব।', rating: 5 },
            { name: 'কামরুল ইসলাম', location: 'সিলেট', text: 'ক্যাশ অন ডেলিভারি সুবিধা চমৎকার! প্রোডাক্ট দেখে পেমেন্ট করলাম।', rating: 5 },
          ],
        },
      },
      {
        type: 'how-to-order',
        props: {
          title: 'অর্ডার করা একদম সহজ!',
          steps: [
            { step: '১', title: 'ফর্ম পূরণ করুন', description: 'নিচের ফর্মে আপনার নাম ও ঠিকানা দিন' },
            { step: '২', title: 'কনফার্ম করুন', description: 'আমাদের টিম কল করে অর্ডার কনফার্ম করবে' },
            { step: '৩', title: 'ডেলিভারি নিন', description: 'হাতে পেয়ে টাকা দিন, হ্যাপি শপিং!' },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'সাধারণ জিজ্ঞাসা',
          items: [
            { question: 'ডেলিভারি কত দিনে পাব?', answer: 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ৩-৫ কার্যদিবস।' },
            { question: 'প্রোডাক্ট অরিজিনাল তো?', answer: 'হ্যাঁ, ১০০% অরিজিনাল। নকল প্রোডাক্ট পেলে টাকা ফেরত।' },
            { question: 'রিটার্ন করতে পারব?', answer: '৭ দিনের মধ্যে কোনো প্রশ্ন ছাড়াই রিটার্ন করতে পারবেন।' },
            { question: 'পেমেন্ট কিভাবে করব?', answer: 'ক্যাশ অন ডেলিভারি - হাতে পেয়ে টাকা দিন।' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: 'আমাদের গ্যারান্টি',
          text: '১০০% সন্তুষ্টির গ্যারান্টি। পণ্য পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিন, টাকা ফেরত পান।',
          badgeLabel: '৭ দিন রিটার্ন গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          headline: '🔥 এখনই অর্ডার করুন!',
          subheadline: 'সীমিত স্টক! দেরি না করে এখনই অর্ডার প্লেস করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FLASH SALE - Urgency Focused with Countdown
  // ─────────────────────────────────────────────────────────────────────────
  'flash-sale': {
    id: 'flash-sale',
    name: 'ফ্ল্যাশ সেল',
    nameEn: '🔥 Flash Sale (Urgency)',
    description: 'কাউন্টডাউন ও স্টক সতর্কতা সহ আর্জেন্সি ডিজাইন',
    descriptionEn: 'Urgency design with countdown and stock warnings',
    thumbnail: '/templates/flash-sale.png',
    category: 'sales',
    emoji: '🔥',
    colors: {
      primary: '#7f1d1d',
      accent: '#fbbf24',
      bg: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: '⚡ ফ্ল্যাশ সেল - শুধুমাত্র আজ ৫০% ছাড়!',
          subheadline: '⏰ অফার শেষ হতে আর মাত্র কয়েক ঘণ্টা বাকি! এই সুযোগ মিস করবেন না।',
          ctaText: '🔥 এখনই কিনুন',
          badgeText: '⚡ ফ্ল্যাশ সেল চলছে',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '⏰', text: 'সীমিত সময়' },
            { icon: '📦', text: 'মাত্র ৫০টি বাকি' },
            { icon: '🚚', text: 'ফ্রি ডেলিভারি' },
            { icon: '💯', text: '১০০% অরিজিনাল' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: 'কেন এই অফার মিস করা যাবে না?',
          features: [
            { icon: '✅', title: 'রেগুলার দাম ৩,৯৯৯ টাকা', description: 'আজ মাত্র ১,৯৯৯ টাকা!' },
            { icon: '🎁', title: 'ফ্রি গিফট সহ', description: 'প্রতিটি অর্ডারে বিশেষ উপহার' },
            { icon: '🚚', title: 'ফ্রি ডেলিভারি', description: 'সারাদেশে বিনামূল্যে ডেলিভারি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '🌟 সন্তুষ্ট কাস্টমার',
          testimonials: [
            { name: 'রাহাত হোসেন', text: 'গতবার ফ্ল্যাশ সেলে কিনেছিলাম, অসাধারণ মানের!', rating: 5 },
            { name: 'সাবরিনা আক্তার', text: 'এত কম দামে এই কোয়ালিটি অবিশ্বাস্য!', rating: 5 },
            { name: 'কামরুল ইসলাম', text: 'দ্রুত ডেলিভারি পেয়েছি, ধন্যবাদ!', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'সাধারণ জিজ্ঞাসা',
          items: [
            { question: 'এই অফার কতক্ষণ চলবে?', answer: 'শুধুমাত্র আজ রাত ১২টা পর্যন্ত!' },
            { question: 'স্টক থাকবে তো?', answer: 'সীমিত স্টক! শেষ হলে আর পাওয়া যাবে না।' },
            { question: 'ক্যাশ অন ডেলিভারি আছে?', answer: 'হ্যাঁ, হাতে পেয়ে টাকা দিন।' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: '১০০% সন্তুষ্টি গ্যারান্টি',
          text: 'পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিন।',
          badgeLabel: 'রিস্ক ফ্রি পারচেজ',
        },
      },
      {
        type: 'cta',
        props: {
          headline: '⏰ অফার শেষ হওয়ার আগেই অর্ডার করুন!',
          subheadline: 'মাত্র ৫০টি স্টক বাকি আছে',
          buttonText: '🔥 এখনই অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PREMIUM BD - Mobile First Premium Design
  // ─────────────────────────────────────────────────────────────────────────
  'premium-bd': {
    id: 'premium-bd',
    name: 'প্রিমিয়াম বিডি',
    nameEn: '🇧🇩 Premium BD (Mobile First)',
    description: 'বাংলাদেশী মার্কেটের জন্য অপ্টিমাইজড হাই-কনভার্টিং ডিজাইন',
    descriptionEn: 'World-class, high-converting design for BD market',
    thumbnail: '/templates/premium-bd.png',
    category: 'premium',
    emoji: '🇧🇩',
    colors: {
      primary: '#18181b',
      accent: '#10b981',
      bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'বাংলাদেশের সেরা কোয়ালিটি, সেরা দামে',
          subheadline: 'আমাদের প্রিমিয়াম প্রোডাক্ট দিয়ে আপনার জীবনকে আরো সহজ করুন। ১০০% অরিজিনাল গ্যারান্টি সহ।',
          ctaText: 'এখনই অর্ডার করুন',
          badgeText: '🇧🇩 মেড ইন বাংলাদেশ',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '✓', text: 'অরিজিনাল প্রোডাক্ট' },
            { icon: '🚚', text: 'ফ্রি ডেলিভারি' },
            { icon: '💳', text: 'ক্যাশ অন ডেলিভারি' },
            { icon: '↩️', text: 'ইজি রিটার্ন' },
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          title: 'প্রোডাক্ট বিস্তারিত',
          features: [
            { title: 'প্রিমিয়াম মেটেরিয়াল', description: 'সেরা মানের উপকরণ দিয়ে তৈরি' },
            { title: 'দীর্ঘস্থায়ী', description: 'বছরের পর বছর ব্যবহার করতে পারবেন' },
            { title: 'সুন্দর ডিজাইন', description: 'আধুনিক ও ট্রেন্ডি লুক' },
          ],
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'কেন আমাদের বেছে নেবেন?',
          subtitle: 'বাংলাদেশের #১ ব্র্যান্ড',
          benefits: [
            { icon: '🏆', title: '৫ বছরের অভিজ্ঞতা', description: 'বিশ্বস্ত ব্র্যান্ড' },
            { icon: '👥', title: '৫০,০০০+ খুশি গ্রাহক', description: 'সারাদেশে' },
            { icon: '⭐', title: '৪.৯/৫ রেটিং', description: 'গুগল রিভিউ' },
            { icon: '🚚', title: '৬৪ জেলায় ডেলিভারি', description: 'দ্রুত সার্ভিস' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'গ্রাহকরা কি বলছেন?',
          testimonials: [
            { name: 'মোঃ আব্দুল্লাহ', location: 'ঢাকা', text: 'প্রিমিয়াম কোয়ালিটি! দাম একটু বেশি কিন্তু ভ্যালু ফর মানি।', rating: 5 },
            { name: 'ফাতেমা আক্তার', location: 'চট্টগ্রাম', text: 'অরিজিনাল প্রোডাক্ট পেয়েছি। খুব খুশি!', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'প্রশ্ন ও উত্তর',
          items: [
            { question: 'পেমেন্ট মেথড কি কি?', answer: 'ক্যাশ অন ডেলিভারি, বিকাশ, নগদ, রকেট সব সাপোর্ট করি।' },
            { question: 'ডেলিভারি চার্জ কত?', answer: 'ঢাকায় ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।' },
            { question: 'ওয়ারেন্টি আছে?', answer: 'হ্যাঁ, ১ বছরের ম্যানুফ্যাকচারার ওয়ারেন্টি।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'আজই অর্ডার করুন',
          subheadline: 'প্রিমিয়াম কোয়ালিটি, সাশ্রয়ী দামে',
          buttonText: 'অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MODERN DARK - Bold Gradient Design
  // ─────────────────────────────────────────────────────────────────────────
  'modern-dark': {
    id: 'modern-dark',
    name: 'মডার্ন ডার্ক',
    nameEn: '🖤 Modern Dark',
    description: 'বোল্ড গ্রেডিয়েন্ট, আধুনিক ডিজাইন',
    descriptionEn: 'Bold gradients, modern design',
    thumbnail: '/templates/modern-dark.png',
    category: 'premium',
    emoji: '🖤',
    colors: {
      primary: '#1a1a2e',
      accent: '#e94560',
      bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'নেক্সট লেভেল এক্সপেরিয়েন্স',
          subheadline: 'আধুনিক টেকনোলজি ও প্রিমিয়াম ডিজাইনের অনন্য সমন্বয়',
          ctaText: 'এক্সপ্লোর করুন',
          badgeText: '✨ নতুন আগমন',
        },
      },
      {
        type: 'features',
        props: {
          title: 'আমাদের বৈশিষ্ট্য',
          features: [
            { icon: '🚀', title: 'অ্যাডভান্সড ফিচার', description: 'সর্বাধুনিক প্রযুক্তি' },
            { icon: '🎨', title: 'প্রিমিয়াম ডিজাইন', description: 'এলিগ্যান্ট লুক' },
            { icon: '⚡', title: 'দ্রুত পারফরম্যান্স', description: 'স্মুথ এক্সপেরিয়েন্স' },
          ],
        },
      },
      {
        type: 'gallery',
        props: {
          title: 'গ্যালারি',
          images: [],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'কাস্টমার রিভিউ',
          testimonials: [],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'রেডি টু স্টার্ট?',
          subheadline: 'আজই আপনার জার্নি শুরু করুন',
          buttonText: 'শুরু করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOWCASE GALLERY - Product Details Focus
  // ─────────────────────────────────────────────────────────────────────────
  'showcase': {
    id: 'showcase',
    name: 'শোকেস গ্যালারি',
    nameEn: '🖼️ Showcase Gallery',
    description: 'প্রোডাক্ট ডিটেইলস গ্যালারি গ্রিড সহ',
    descriptionEn: 'Product details with gallery grid',
    thumbnail: '/templates/showcase.png',
    category: 'product',
    emoji: '🖼️',
    colors: {
      primary: '#18181b',
      accent: '#a855f7',
      bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'প্রোডাক্ট শোকেস',
          subheadline: 'আমাদের সেরা প্রোডাক্ট কালেকশন দেখুন',
          ctaText: 'দেখুন',
          badgeText: '🖼️ গ্যালারি',
        },
      },
      {
        type: 'gallery',
        props: {
          title: 'প্রোডাক্ট গ্যালারি',
          images: [],
        },
      },
      {
        type: 'showcase',
        props: {
          title: 'বিস্তারিত তথ্য',
          features: [
            { title: 'ম্যাটেরিয়াল', description: 'প্রিমিয়াম কোয়ালিটি' },
            { title: 'সাইজ', description: 'বিভিন্ন সাইজে পাওয়া যায়' },
            { title: 'কালার', description: 'একাধিক কালার অপশন' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: 'কেন এই প্রোডাক্ট?',
          features: [
            { icon: '✨', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের উপকরণ' },
            { icon: '🎁', title: 'গিফট রেডি', description: 'সুন্দর প্যাকেজিং' },
            { icon: '💯', title: 'গ্যারান্টি', description: 'সন্তুষ্টি নিশ্চিত' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'রিভিউ',
          testimonials: [],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'আজই অর্ডার করুন',
          buttonText: 'অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // VIDEO FOCUS - Video-centric Template
  // ─────────────────────────────────────────────────────────────────────────
  'video-focus': {
    id: 'video-focus',
    name: 'ভিডিও ফোকাস',
    nameEn: '🎬 Video Focus',
    description: 'ফুল-উইড্থ হিরো ভিডিও ও ওভারলে CTA',
    descriptionEn: 'Full-width hero video and overlay CTA',
    thumbnail: '/templates/video-focus.png',
    category: 'product',
    emoji: '🎬',
    colors: {
      primary: '#0f172a',
      accent: '#f59e0b',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'ভিডিওতে দেখুন আমাদের প্রোডাক্ট',
          subheadline: 'রিয়েল প্রোডাক্ট, রিয়েল রিভিউ',
          ctaText: 'ভিডিও দেখুন',
          badgeText: '🎬 ভিডিও রিভিউ',
        },
      },
      {
        type: 'video',
        props: {
          title: 'প্রোডাক্ট ভিডিও',
          videoUrl: '',
        },
      },
      {
        type: 'features',
        props: {
          title: 'প্রোডাক্ট ফিচার',
          features: [
            { icon: '📹', title: 'রিয়েল ভিডিও', description: 'আনবক্সিং ও রিভিউ' },
            { icon: '⭐', title: 'কাস্টমার ফিডব্যাক', description: 'রিয়েল ইউজার রিভিউ' },
            { icon: '💯', title: '১০০% অরিজিনাল', description: 'কোয়ালিটি গ্যারান্টি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'ভিডিও টেস্টিমোনিয়াল',
          testimonials: [],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'ভিডিও দেখে বিশ্বাস হলে অর্ডার করুন',
          buttonText: 'এখনই অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ORGANIC GREEN - Nature/Health Products
  // ─────────────────────────────────────────────────────────────────────────
  'organic': {
    id: 'organic',
    name: 'অর্গানিক গ্রীন',
    nameEn: '🌿 Organic Green',
    description: 'হেলথ ও ইকো-ফ্রেন্ডলি প্রোডাক্টের জন্য',
    descriptionEn: 'For health and eco-friendly products',
    thumbnail: '/templates/organic.png',
    category: 'product',
    emoji: '🌿',
    colors: {
      primary: '#fefce8',
      accent: '#16a34a',
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: '১০০% প্রাকৃতিক ও নিরাপদ',
          subheadline: 'আপনার স্বাস্থ্যের জন্য সেরা অর্গানিক প্রোডাক্ট',
          ctaText: 'অর্গানিক কিনুন',
          badgeText: '🌿 ১০০% অর্গানিক',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '🌿', text: 'অর্গানিক সার্টিফাইড' },
            { icon: '♻️', text: 'ইকো-ফ্রেন্ডলি' },
            { icon: '🧪', text: 'কেমিক্যাল মুক্ত' },
            { icon: '💚', text: 'স্বাস্থ্যকর' },
          ],
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'কেন অর্গানিক?',
          subtitle: 'প্রকৃতির শক্তি',
          benefits: [
            { icon: '🌱', title: 'প্রাকৃতিক উপাদান', description: 'কোনো রাসায়নিক নেই' },
            { icon: '💪', title: 'স্বাস্থ্যকর', description: 'শরীরের জন্য ভালো' },
            { icon: '🌍', title: 'পরিবেশবান্ধব', description: 'পৃথিবীকে ভালোবাসি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'স্বাস্থ্যসচেতন গ্রাহকদের মতামত',
          testimonials: [
            { name: 'ডাঃ সুমন', text: 'রোগীদের জন্য রেকমেন্ড করি। সত্যিই অর্গানিক।', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'জিজ্ঞাসা',
          items: [
            { question: 'সত্যিই অর্গানিক?', answer: 'হ্যাঁ, সার্টিফাইড অর্গানিক উপাদান ব্যবহার করা হয়।' },
            { question: 'এক্সপায়ারি ডেট?', answer: 'প্যাকেটে উল্লেখ থাকে। সাধারণত ৬-১২ মাস।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'স্বাস্থ্যকর জীবনের জন্য',
          subheadline: 'আজই অর্গানিক শুরু করুন',
          buttonText: '🌿 অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MINIMAL - Simple and Clean
  // ─────────────────────────────────────────────────────────────────────────
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'মিনিমাল ক্লিন',
    nameEn: '✨ Minimal Clean',
    description: 'সাদামাটা ও পরিষ্কার ডিজাইন',
    descriptionEn: 'Simple and clean design',
    thumbnail: '/templates/minimal.png',
    category: 'minimal',
    emoji: '✨',
    colors: {
      primary: '#ffffff',
      accent: '#6366f1',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
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
  // BLANK - Start from Scratch
  // ─────────────────────────────────────────────────────────────────────────
  'blank': {
    id: 'blank',
    name: 'শুরু থেকে তৈরি করুন',
    nameEn: 'Start from Scratch',
    description: 'একদম শূন্য থেকে নিজের ডিজাইন করুন',
    descriptionEn: 'Create your own design from zero',
    thumbnail: '/templates/blank.png',
    category: 'minimal',
    emoji: '📄',
    colors: {
      primary: '#f8fafc',
      accent: '#64748b',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
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
export function getTemplateCategories(): Array<{ id: TemplateCategory | 'all'; name: string; count: number }> {
  const categories: Array<{ id: TemplateCategory | 'all'; name: string; count: number }> = [
    { id: 'all', name: 'সব', count: getAllTemplates().length },
    { id: 'sales', name: 'সেলস', count: 0 },
    { id: 'product', name: 'প্রোডাক্ট', count: 0 },
    { id: 'premium', name: 'প্রিমিয়াম', count: 0 },
    { id: 'minimal', name: 'মিনিমাল', count: 0 },
    { id: 'service', name: 'সার্ভিস', count: 0 },
  ];
  
  getAllTemplates().forEach(template => {
    const cat = categories.find(c => c.id === template.category);
    if (cat) cat.count++;
  });
  
  return categories.filter(c => c.id === 'all' || c.count > 0);
}
