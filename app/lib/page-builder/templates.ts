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
  // BD HIGH CONVERSION - Optimized for maximum sales in BD Market
  // ─────────────────────────────────────────────────────────────────────────
  'bd-high-conversion': {
    id: 'bd-high-conversion',
    name: 'হাই-কনভার্শন প্রো',
    nameEn: '🚀 High Conversion Pro (BD Premium)',
    description: 'বাংলাদেশী মার্কেটের জন্য বিশেষভাবে তৈরি হাই-কনভার্টিং সেলস পেজ',
    descriptionEn: 'Specifically optimized sales page for maximum conversion in BD',
    thumbnail: '/templates/bd-high-conversion.png',
    category: 'sales',
    emoji: '🚀',
    colors: {
      primary: '#800000', // Maroon
      accent: '#FFD700', // Gold
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #0c0a09 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'আপনার কাঙ্ক্ষিত প্রিমিয়াম প্রোডাক্ট এখন বাংলাদেশে!',
          subheadline: 'অরিজিনাল কোয়ালিটি এবং সেরা দামের নিশ্চয়তা। স্টক শেষ হওয়ার আগেই আজই আপনার অর্ডারটি কনফার্ম করুন।',
          ctaText: 'অর্ডার করতে ক্লিক করুন',
          badgeText: '🔥 ট্রেন্ডিং প্রোডাক্ট',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '🚚', text: 'সারাদেশে ক্যাশ অন ডেলিভারি' },
            { icon: '✅', text: '১০০% অরিজিনাল প্রোডাক্ট' },
            { icon: '↩️', text: '৩ দিনের ইজি রিটার্ন' },
            { icon: '📞', text: 'লাইভ কাস্টমার সাপোর্ট' },
          ],
        },
      },
      {
        type: 'video',
        props: {
          title: 'আমাদের প্রোডাক্টটি কিভাবে ব্যবহার করবেন দেখুন',
          videoUrl: '',
        },
      },
      {
        type: 'problem-solution',
        props: {
          problemTitle: 'আপনি কি এই ঝামেলার সম্মুখীন হচ্ছেন?',
          problems: [
            'বাজারে নকল প্রোডাক্টের ছড়াছড়ি',
            'প্রয়োজনের সময় ভালো সাপোর্ট না পাওয়া',
            'অতিরিক্ত ডেলিভারি চার্জের ভয়',
          ],
          solutionTitle: 'আমরা দিচ্ছি সেরা সমাধান',
          solutions: [
            '১০০% গ্যারান্টি সহ অরিজিনাল প্রোডাক্ট',
            'অভিজ্ঞ কাস্টমার কেয়ার টিম',
            'খুবই সাশ্রয়ী ডেলিভারি চার্জ',
          ],
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'কেন এই প্রোডাক্টটি আপনার পছন্দ হবে?',
          benefits: [
            { icon: '✨', title: 'এক্সক্লুসিভ ডিজাইন', description: 'আধুনিক ও আকর্ষণীয় লুক' },
            { icon: '⚙️', title: 'টেকসই মেটেরিয়াল', description: 'দীর্ঘদিন ব্যবহারের নিশ্চয়তা' },
            { icon: '🚀', title: 'উন্নত প্রযুক্তি', description: 'সেরা পারফরম্যান্স পাবেন' },
            { icon: '💖', title: 'সহজ ব্যবহারযোগ্য', description: 'যে কেউ খুব সহজে ব্যবহার করতে পারবে' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'আমাদের হ্যাপি কাস্টমারদের রিভিউ',
          testimonials: [
            { name: 'আরিফ আহমেদ', location: 'ঢাকা', text: 'প্রোডাক্ট হাতে পাওয়ার পর খুবি ভালো লাগলো। কোয়ালিটি আসলেই দারুণ!', rating: 5 },
            { name: 'ফারজানা আক্তার', location: 'খুলনা', text: 'খুবই দ্রুত ডেলিভারি পেয়েছি। ধন্যবাদ আপনাদের!', rating: 5 },
          ],
        },
      },
      {
        type: 'delivery',
        props: {
          title: 'ডেলিভারি সংক্রান্ত তথ্য',
          description: 'আমরা সারা বাংলাদেশে কুরিয়ারের মাধ্যমে ডেলিভারি দিয়ে থাকি।',
          insideDhakaPrice: 60,
          outsideDhakaPrice: 120,
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'অফার শেষ হতে আর অল্প সময় বাকি!',
          subheadline: 'নিচের ফর্মটি পূরণ করে এখনই অর্ডার করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BD ORGANIC GROWTH - Optimized for Health, Beauty & Organic Products
  // ─────────────────────────────────────────────────────────────────────────
  'bd-organic-growth': {
    id: 'bd-organic-growth',
    name: 'অর্গানিক গ্রোথ',
    nameEn: '🌿 Organic Growth (Health & Beauty)',
    description: 'হেলথ, বিউটি এবং প্রাকৃতিক পণ্যের জন্য প্রিমিয়াম টেমপ্লেট',
    descriptionEn: 'Premium template for health, beauty and organic products',
    thumbnail: '/templates/bd-organic-growth.png',
    category: 'product',
    emoji: '🌿',
    colors: {
      primary: '#064e3b', // Deep Green
      accent: '#10b981', // Emerald
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'প্রকৃতির ছোঁয়ায় আপনার জীবন হোক আরো সুন্দর',
          subheadline: '১০০% প্রাকৃতিক উপাদানে তৈরি আমাদের এই এক্সক্লুসিভ কালেকশন আপনার স্বাস্থ্যের জন্য সম্পূর্ণ নিরাপদ।',
          ctaText: 'এখনই কিনুন',
          badgeText: '🌿 ১০০% অর্গানিক',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '🌱', text: 'পরিবেশ বান্ধব' },
            { icon: '🚫', text: 'কোন ক্ষতিকর কেমিক্যাল নেই' },
            { icon: '🧪', text: 'ল্যাব সার্টিফাইড' },
            { icon: '⭐', text: 'হাজারো সন্তুষ্ট গ্রাহক' },
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          title: 'উপকারিতা এবং বৈশিষ্ট্য',
          features: [
            'সম্পূর্ণ অর্গানিক এবং প্রাকৃতিক উপাদানে তৈরি',
            'ত্বক ও শরীরের জন্য অত্যন্ত কার্যকর',
            'কোনো পার্শ্বপ্রতিক্রিয়া ছাড়াই ফলাফল পাওয়া যাবে',
            'দীর্ঘস্থায়ী সমাধান প্রদান করে',
          ],
        },
      },
      {
        type: 'comparison',
        props: {
          title: 'কেন বাজারের অন্যান্য প্রোডাক্ট থেকে আলাদা?',
          beforeLabel: 'অন্যান্য প্রোডাক্ট',
          afterLabel: 'আমাদের প্রোডাক্ট',
          description: 'বাজারে প্রচলিত রাসায়নিক যুক্ত প্রোডাক্টের চেয়ে আমাদের অর্গানিক প্রোডাক্ট হাজার গুণ নিরাপদ।',
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'আমাদের ওপর কেন ভরসা করবেন?',
          benefits: [
            { icon: '🌿', title: 'বিশুদ্ধ উপাদান', description: 'সরাসরি প্রকৃতি থেকে সংগৃহীত' },
            { icon: '🛡️', title: 'হাই-কোয়ালিটি গ্যারান্টি', description: 'প্রতিটি ধাপ কঠোরভাবে নিয়ন্ত্রিত' },
            { icon: '🤝', title: 'বিশ্বস্ততা', description: 'বিগত ৩ বছর ধরে আস্থার সাথে সেবা দিচ্ছি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'যারা আমাদের প্রোডাক্ট ব্যবহার করেছেন',
          testimonials: [
            { name: 'শারমিন সুলতানা', text: 'এটি ব্যবহারের পর আমার ধারণা বদলে গেছে। সত্যি কাজ করে!', rating: 5 },
            { name: 'রাকিব হাসান', text: 'অর্গানিক প্রোডাক্ট হিসেবে এটি সেরা। আমি হাইলি রেকমেন্ড করছি।', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'আপনার মনে আসা কিছু প্রশ্ন',
          items: [
            { question: 'এটি কি ব্যবহারের জন্য নিরাপদ?', answer: 'হ্যাঁ, এটি সম্পূর্ণ কেমিক্যাল মুক্ত এবং ব্যবহারের জন্য ১০০% নিরাপদ।' },
            { question: 'ফলাফল পেতে কতদিন সময় লাগবে?', answer: 'নিয়মিত ব্যবহারে সাধারণত ১-২ সপ্তাহের মধ্যেই দৃশ্যমান ফলাফল পাওয়া যায়।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          headline: 'প্রকৃতির আশীর্বাদ নিন আপনার জীবনে',
          subheadline: 'নিচের ফর্মটি পূরণ করে ডিসকাউন্টে অর্ডার করুন',
          buttonText: 'অর্ডার সাবমিট করুন',
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
  // AWWWARDS 2025 - Award Winning Design of the Year
  // ─────────────────────────────────────────────────────────────────────────
  'awwwards-2025': {
    id: 'awwwards-2025',
    name: 'ডিজাইন অফ দ্য ইয়ার ২০২৫',
    nameEn: '🏆 Design of the Year 2025',
    description: 'ফিউচারিস্টিক গ্লাস-মর্ফিজম এবং বেন্টো গ্রিড ডিজাইন',
    descriptionEn: 'Futuristic glassmorphism and bento grid layout',
    thumbnail: '/templates/awwwards-2025.png',
    category: 'premium',
    emoji: '🏆',
    colors: {
      primary: '#6366f1',
      accent: '#a855f7',
      bg: '#000000',
    },
    sections: [
      {
        type: 'hero',
        props: {
          variant: 'glow',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          headline: 'ফিউচারিস্টিক ডিজাইন এখন আপনার হাতের মুঠোয়',
          subheadline: 'সম্পূর্ণ নতুন প্রযুক্তিতে তৈরি আমাদের এই কালেকশন।',
          ctaText: 'এক্সপ্লোর কালেকশন',
          badgeText: '✨ নিউ অ্যারাইভাল',
        },
      },
      {
        type: 'trust-badges',
        props: {
          variant: 'marquee',
          backgroundColor: '#000000',
          textColor: '#A1A1AA',
          badges: [
            { icon: '💎', text: 'প্রিমিয়াম কোয়ালিটি' },
            { icon: '🚀', text: 'সুপার ফাস্ট ডেলিভারি' },
            { icon: '🛡️', text: '১০০% সিকিউর' },
            { icon: '⭐', text: '৫ স্টার রেটেড' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          variant: 'bento',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          title: 'এক্সক্লুসিভ ফিচারস',
          features: [
            { icon: '⚡', title: 'আল্ট্রা ফাস্ট পারফরম্যান্স', description: 'বিদ্যুৎ গতিতে কাজ করার অভিজ্ঞতা।' },
            { icon: '🎨', title: 'মডার্ন আর্টওয়ার্ক', description: 'নিখুঁত ডিজাইন।' },
            { icon: '🔄', title: 'অটোমেটেড আপডেট', description: 'সবসময় আপ-টু-ডেট।' },
            { icon: '🛡️', title: 'আয়রনক্লাড সিকিউরিটি', description: 'ডাটা সুরক্ষিত।' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          title: 'কাস্টমার ফিডব্যাক',
          testimonials: [
             { name: 'তাসনিয়া রহমান', text: 'একদম ইউনিক এবং মডার্ন!', rating: 5 },
             { name: 'জুবায়ের হোসেন', text: 'প্রিমিয়াম কোয়ালিটি। অসাধারণ!', rating: 5 },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          headline: 'আজই শুরু করুন আপনার নতুন জার্নি',
          subheadline: 'লিমিটেড এডিশন - স্টক শেষ হওয়ার আগেই অর্ডার করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
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
  // TRUST-FIRST - Testimonial Heavy Design
  // ─────────────────────────────────────────────────────────────────────────
  'trust-first': {
    id: 'trust-first',
    name: 'ট্রাস্ট ফার্স্ট',
    nameEn: '💚 Trust First (Testimonial Heavy)',
    description: 'টেস্টিমোনিয়াল ও কাস্টমার রিভিউ ফোকাসড ডিজাইন',
    descriptionEn: 'Testimonial and customer review focused design',
    thumbnail: '/templates/trust-first.png',
    category: 'sales',
    emoji: '💚',
    colors: {
      primary: '#059669',
      accent: '#10B981',
      bg: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'হাজারো সন্তুষ্ট গ্রাহকের বিশ্বস্ত পছন্দ',
          subheadline: '১৫,০০০+ গ্রাহক আমাদের উপর ভরসা করেছেন। ৪.৯/৫ রেটিং এবং ৯৮% পজিটিভ রিভিউ।',
          ctaText: 'এখনই অর্ডার করুন',
          badgeText: '✓ ১০০% অরিজিনাল প্রোডাক্ট',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '👥', text: '১৫,০০০+ সন্তুষ্ট গ্রাহক' },
            { icon: '⭐', text: '৪.৯/৫ রেটিং' },
            { icon: '✓', text: '৯৮% পজিটিভ রিভিউ' },
            { icon: '🚚', text: 'ফ্রি ডেলিভারি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '💬 আমাদের গ্রাহকদের অভিজ্ঞতা',
          testimonials: [
            { name: 'রহিম আহমেদ', location: 'ঢাকা', text: 'অসাধারণ প্রোডাক্ট! দ্রুত ডেলিভারি পেয়েছি। কোয়ালিটি দেখে মুগ্ধ হয়ে গেছি।', rating: 5 },
            { name: 'ফাতেমা বেগম', location: 'চট্টগ্রাম', text: 'এত ভালো সার্ভিস আর কোথাও পাইনি। আবার অর্ডার করব ইনশাআল্লাহ।', rating: 5 },
            { name: 'করিম উদ্দিন', location: 'সিলেট', text: 'বন্ধুদেরও রেকমেন্ড করেছি। সবাই খুশি!', rating: 5 },
            { name: 'সাবরিনা আক্তার', location: 'রাজশাহী', text: 'প্রোডাক্ট হাতে পেয়ে সত্যিই অবাক হয়েছি। দারুণ কোয়ালিটি!', rating: 5 },
          ],
        },
      },
      {
        type: 'comparison',
        props: {
          title: 'কেন আমাদের থেকে কিনবেন?',
          beforeLabel: 'অন্যান্য সেলার',
          afterLabel: 'আমরা',
          description: 'আমরা সবসময় গ্রাহক সন্তুষ্টিকে প্রথম স্থানে রাখি।',
        },
      },
      {
        type: 'benefits',
        props: {
          title: 'আমাদের প্রতিশ্রুতি',
          benefits: [
            { icon: '🏆', title: '১০০% অরিজিনাল', description: 'নকল প্রোডাক্ট পেলে পুরো টাকা ফেরত' },
            { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনের মধ্যে ডেলিভারি' },
            { icon: '↩️', title: '৭ দিন রিটার্ন', description: 'প্রশ্নহীন রিটার্ন পলিসি' },
            { icon: '📞', title: '২৪/৭ সাপোর্ট', description: 'যেকোনো সময় কল করুন' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: '১০০% সন্তুষ্টি গ্যারান্টি',
          text: 'আমরা আপনার সন্তুষ্টির জন্য প্রতিশ্রুতিবদ্ধ। পণ্য পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিন।',
          badgeLabel: '৭ দিন মানি ব্যাক গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          headline: '💚 আজই অর্ডার করুন',
          subheadline: 'হাজারো সন্তুষ্ট গ্রাহকের দলে যোগ দিন',
          buttonText: 'অর্ডার কনফার্ম করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STORY-DRIVEN - Emotional Narrative Design
  // ─────────────────────────────────────────────────────────────────────────
  'story-driven': {
    id: 'story-driven',
    name: 'স্টোরি ড্রিভেন',
    nameEn: '📖 Story Driven (Emotional)',
    description: 'সমস্যা থেকে সমাধান - আবেগপূর্ণ গল্প বলার ডিজাইন',
    descriptionEn: 'Problem to solution - emotional storytelling design',
    thumbnail: '/templates/story-driven.png',
    category: 'sales',
    emoji: '📖',
    colors: {
      primary: '#D97706',
      accent: '#F59E0B',
      bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: 'আপনি কি এই সমস্যায় ভুগছেন?',
          subheadline: 'আমিও একসময় ঠিক আপনার মতোই ছিলাম। কিন্তু তারপর এই প্রোডাক্ট আমার জীবন বদলে দিয়েছে...',
          ctaText: 'আমার গল্প পড়ুন',
          badgeText: '💛 আমার অভিজ্ঞতা',
        },
      },
      {
        type: 'problem-solution',
        props: {
          problemTitle: '😔 আমি যে সমস্যায় ভুগছিলাম...',
          problems: [
            'প্রতিদিন একই সমস্যা, একই হতাশা',
            'বাজারে কিছুই কাজ করছিল না',
            'আশা ছেড়ে দিতে বসেছিলাম',
          ],
          solutionTitle: '✨ তারপর আমি এটা খুঁজে পেলাম!',
          solutions: [
            'প্রথম সপ্তাহেই পার্থক্য বুঝতে পারলাম',
            'এখন আমি সম্পূর্ণ সুস্থ ও খুশি',
            'সবাইকে রেকমেন্ড করছি',
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          title: '❤️ কেন এটা কাজ করে?',
          features: [
            'বিশেষ ফর্মুলা যা অন্যদের নেই',
            'প্রাকৃতিক উপাদানে তৈরি',
            'কোনো পার্শ্বপ্রতিক্রিয়া নেই',
            'দ্রুত ফলাফল পাওয়া যায়',
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '💬 অন্যরা কি বলছেন?',
          testimonials: [
            { name: 'শারমিন সুলতানা', text: 'একই অভিজ্ঞতা! সত্যিই কাজ করে।', rating: 5 },
            { name: 'রাকিব হাসান', text: 'বন্ধুর রেকমেন্ডেশনে কিনেছিলাম, এখন নিজেও রেকমেন্ড করছি।', rating: 5 },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: '💛 আমার প্রতিশ্রুতি',
          text: 'আমি নিজে ব্যবহার করে দেখেছি, তাই আপনাকেও গ্যারান্টি দিচ্ছি - পছন্দ না হলে টাকা ফেরত।',
          badgeLabel: '১০০% সন্তুষ্টি গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          headline: '💛 হ্যাঁ, আমিও চেষ্টা করতে চাই!',
          subheadline: 'আপনার জার্নি আজই শুরু করুন',
          buttonText: 'এখনই অর্ডার করুন',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL-PROOF - Facebook/WhatsApp Style
  // ─────────────────────────────────────────────────────────────────────────
  'social-proof-style': {
    id: 'social-proof-style',
    name: 'সোশ্যাল প্রুফ',
    nameEn: '👥 Social Proof (Facebook Style)',
    description: 'ফেসবুক ও হোয়াটসঅ্যাপ স্টাইলের পরিচিত ডিজাইন',
    descriptionEn: 'Facebook and WhatsApp style familiar design',
    thumbnail: '/templates/social-proof.png',
    category: 'sales',
    emoji: '👥',
    colors: {
      primary: '#1877F2',
      accent: '#25D366',
      bg: '#F0F2F5',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: '🔥 এই প্রোডাক্ট এখন ভাইরাল!',
          subheadline: '২,৪০০+ লাইক • ৩৪৭ মন্তব্য • ৮৯ শেয়ার',
          ctaText: 'এখনই অর্ডার করুন',
          badgeText: '📱 সোশ্যাল মিডিয়ায় ট্রেন্ডিং',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '👍', text: '২.৪K লাইক' },
            { icon: '💬', text: '৩৪৭ কমেন্ট' },
            { icon: '🔄', text: '৮৯ শেয়ার' },
            { icon: '⭐', text: '৫ স্টার' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '💬 কাস্টমার কমেন্টস',
          testimonials: [
            { name: 'Rahim Ahmed', text: 'আমি অর্ডার করেছি, খুবই ভালো প্রোডাক্ট! 👍', rating: 5 },
            { name: 'Fatema Begum', text: 'গতকালই পেয়েছি, অসাধারণ! 🔥', rating: 5 },
            { name: 'Karim Uddin', text: 'বন্ধুদেরও বলে দিয়েছি অর্ডার করতে ❤️', rating: 5 },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: '✅ প্রোডাক্ট ফিচার',
          features: [
            { icon: '✓', title: '১০০% অরিজিনাল', description: 'গ্যারান্টি সহ' },
            { icon: '✓', title: 'ক্যাশ অন ডেলিভারি', description: 'হাতে পেয়ে টাকা দিন' },
            { icon: '✓', title: 'ফ্রি শিপিং', description: 'সারাদেশে' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          headline: '📱 এখনই অর্ডার করুন',
          subheadline: '৩৪৭ জন অর্ডার করেছেন',
          buttonText: 'Send Order',
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // URGENCY-SCARCITY - FOMO Focused Design
  // ─────────────────────────────────────────────────────────────────────────
  'urgency-scarcity': {
    id: 'urgency-scarcity',
    name: 'আর্জেন্সি স্কারসিটি',
    nameEn: '🚨 Urgency & Scarcity (FOMO)',
    description: 'কাউন্টডাউন, স্টক সতর্কতা এবং FOMO ফোকাসড ডিজাইন',
    descriptionEn: 'Countdown, stock warning and FOMO focused design',
    thumbnail: '/templates/urgency-scarcity.png',
    category: 'sales',
    emoji: '🚨',
    colors: {
      primary: '#DC2626',
      accent: '#FBBF24',
      bg: '#0F0F0F',
    },
    sections: [
      {
        type: 'hero',
        props: {
          headline: '⚠️ সতর্কতা: মাত্র ১৫টি বাকি!',
          subheadline: '⏰ অফার শেষ হতে আর মাত্র ২ ঘণ্টা ৪৫ মিনিট বাকি! এই সুযোগ মিস করবেন না।',
          ctaText: '🔥 এখনই অর্ডার করুন',
          badgeText: '⚡ ফ্ল্যাশ সেল চলছে',
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '👁️', text: '৪৭ জন এখন দেখছে' },
            { icon: '📦', text: 'মাত্র ১৫টি বাকি' },
            { icon: '⏰', text: 'সীমিত সময়' },
            { icon: '🔥', text: 'দ্রুত বিক্রি হচ্ছে' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: '🔥 কেন এখনই অর্ডার করবেন?',
          features: [
            { icon: '💰', title: '৫০% ছাড়', description: 'শুধু আজকের জন্য' },
            { icon: '🎁', title: 'ফ্রি গিফট', description: 'প্রথম ২০ অর্ডারে' },
            { icon: '🚚', title: 'ফ্রি ডেলিভারি', description: 'আজই অর্ডার করলে' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '⭐ সাম্প্রতিক অর্ডার',
          testimonials: [
            { name: 'Rahim', location: 'ঢাকা', text: '২ মিনিট আগে অর্ডার করেছেন', rating: 5 },
            { name: 'Fatema', location: 'চট্টগ্রাম', text: '৫ মিনিট আগে অর্ডার করেছেন', rating: 5 },
            { name: 'Karim', location: 'সিলেট', text: '১২ মিনিট আগে অর্ডার করেছেন', rating: 5 },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          title: '🛡️ রিস্ক ফ্রি পারচেজ',
          text: 'পছন্দ না হলে ৭ দিনের মধ্যে টাকা ফেরত।',
          badgeLabel: '১০০% মানি ব্যাক গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          headline: '⏰ অফার শেষ হওয়ার আগেই অর্ডার করুন!',
          subheadline: 'মাত্র ১৫টি স্টক বাকি আছে',
          buttonText: '🔥 এখনই অর্ডার করুন',
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
