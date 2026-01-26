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
  // TECH ULTRA (Gadgets/Electronics) - Dark, Futuristic, Neon
  // ─────────────────────────────────────────────────────────────────────────
  'tech-ultra': {
    id: 'tech-ultra',
    name: 'টেক আল্ট্রা প্রো',
    nameEn: '⚡ Tech Ultra (Premium Gadget)',
    description: 'গ্যাজেট এবং ইলেকট্রনিক্সের জন্য ফিউচারিস্টিক ডার্ক থিম',
    descriptionEn: 'Futuristic dark theme for gadgets & electronics',
    thumbnail: '/templates/tech-ultra.png',
    category: 'premium',
    emoji: '⚡',
    colors: {
      primary: '#3b82f6', // Electric Blue
      accent: '#8b5cf6',  // Neon Purple
      bg: '#09090b',      // Zinc 950 (Deep Dark)
    },
    sections: [
      {
        type: 'hero',
        props: {
          variant: 'glassmorphism',
          headline: 'ভবিষ্যতের প্রযুক্তি আজই আপনার হাতে',
          subheadline: 'সেরা মানের গ্যাজেট কালেকশন। ১০০% অফিসিয়াল ওয়ারেন্টি এবং ক্যাশ অন ডেলিভারি সুবিধা।',
          ctaText: 'অর্ডার করুন 🛒',
          badgeText: '🔥 ট্রেন্ডিং গ্যাজেট',
        },
      },
      {
        type: 'trust-badges',
        props: {
          variant: 'glow',
          badges: [
            { icon: '🛡️', text: 'অফিসিয়াল ওয়ারেন্টি' },
            { icon: '🚚', text: 'এক্সপ্রেস ডেলিভারি' },
            { icon: '৳', text: 'ক্যাশ অন ডেলিভারি' },
            { icon: '🔄', text: '৭ দিন রিপ্লেসমেন্ট' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          variant: 'bento',
          title: 'কেন এই গ্যাজেটটি অদ্বিতীয়?',
          features: [
            { icon: '🔋', title: 'লং ব্যাটারি লাইফ', description: 'এক চার্জে সারাদিন ব্যবহারের সুবিধা' },
            { icon: '🔊', title: 'ক্রিস্টাল ক্লিয়ার সাউন্ড', description: 'নয়েজ ক্যান্সেলেশন টেকনোলজি' },
            { icon: '💧', title: 'ওয়াটারপ্রুফ ডিজাইন', description: 'IPX7 রেটেড সুরক্ষা ব্যবস্থা' },
            { icon: '📱', title: 'স্মার্ট কানেক্টিভিটি', description: 'ব্লুটুথ ৫.৩ এর সাথে ইনস্ট্যান্ট পেয়ারিং' },
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          title: 'পণ্যের বিশেষ মুহূর্ত',
          images: [], 
        },
      },
      {
        type: 'testimonials',
        props: {
          variant: 'dark-card',
          title: 'টেক লাভাররা কি বলছেন?',
          testimonials: [],
        },
      },
      {
        type: 'faq',
        props: {
          title: 'সচরাচর জিজ্ঞাসা (FAQ)',
          items: [
            { question: 'এটা কি অরিজিনাল প্রোডাক্ট?', answer: 'জি, আমরা ১০০% অরিজিনাল প্রোডাক্ট বিক্রি করি অথেন্টিক সোর্স থেকে।' },
            { question: 'ওয়ারেন্টি কতদিনের?', answer: 'আমরা ৬ মাসের অফিসিয়াল ওয়ারেন্টি দিচ্ছি।' },
            { question: 'চার্জে কতক্ষণ চলে?', answer: 'একটানা ৬-৭ ঘণ্টা ব্যবহার করতে পারবেন।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          variant: 'gradient',
          headline: 'আজই আপগ্রেড করুন আপনার লাইফস্টাইল',
          subheadline: 'লিমিটেড স্টক! এখনই অর্ডার কনফার্ম করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
        },
      },
    ],
  },



  // ─────────────────────────────────────────────────────────────────────────
  // GREEN MART (Organic/Food) - Fresh, Trustworthy
  // ─────────────────────────────────────────────────────────────────────────
  'green-mart': {
    id: 'green-mart',
    name: 'গ্রীন মার্ট',
    nameEn: '🌿 Green Mart (Organic & Food)',
    description: 'অর্গানিক ফুড এবং গ্রোসারির জন্য বিশ্বাসযোগ্য ক্লিন ডিজাইন',
    descriptionEn: 'Trustworthy clean design for organic food & grocery',
    thumbnail: '/templates/green-mart.png',
    category: 'premium',
    emoji: '🌿',
    colors: {
      primary: '#15803d', // Green 700
      accent: '#f97316',  // Orange 500
      bg: '#ffffff',      // White
    },
    sections: [
      {
        type: 'hero',
        props: {
          variant: 'nature',
          headline: 'প্রকৃতির বিশুদ্ধতা, আপনার পরিবারে',
          subheadline: 'ভেজালমুক্ত, ১০০% প্রাকৃতিক ও নিরাপদ খাদ্য সামগ্রী। আপনার সুস্বাস্থ্যই আমাদের অঙ্গীকার।',
          ctaText: 'অর্ডার করুন',
          badgeText: '🌿 ১০০% ন্যাচারাল',
        },
      },
      {
        type: 'problem-solution',
        props: {
          problemTitle: 'বাজারে ভেজালের ভিড়ে আপনি কি চিন্তিত?',
          problems: [
            'রাসায়নিক মিশ্রিত খাবার',
            'অস্বাস্থ্যকর পরিবেশে তৈরি',
            'ভেজাল মধুর বা তেলের ভয়',
          ],
          solutionTitle: 'আমরা দিচ্ছি শতভাগ নিশ্চয়তা',
          solutions: [
            'নিজস্ব তত্ত্বাবধানে সংগৃহীত',
            'ল্যাব টেস্টেড ও বিএসটিআই অনুমোদিত',
            'মানি ব্যাক গ্যারান্টি',
          ],
        },
      },
      {
        type: 'trust-badges',
        props: {
          badges: [
            { icon: '🌿', text: 'অর্গানিক' },
            { icon: '🔬', text: 'ল্যাব টেস্টেড' },
            { icon: '🕌', text: 'হালাল' },
            { icon: '✅', text: 'বিএসটিআই' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          title: 'পুষ্টিগুণ ও উপকারিতা',
          features: [
            { icon: '💪', title: 'ইমিউনিটি বুস্টার', description: 'রোগ প্রতিরোধ ক্ষমতা বাড়ায়' },
            { icon: '🧠', title: 'স্মৃতিশক্তি বৃদ্ধি', description: 'শিশুদের মেধা বিকাশে সহায়ক' },
            { icon: '⚡', title: 'এনার্জি সোর্স', description: 'সারাদিন রাখে কর্মচঞ্চল' },
          ],
        },
      },
      {
        type: 'how-to-order',
        props: {
          title: 'কিভাবে অর্ডার করবেন?',
          steps: [
            { step: '১', title: 'অর্ডার করুন', description: 'বটন ক্লিক করে ফর্ম পূরণ করুন' },
            { step: '২', title: 'কনফার্মেশন', description: 'আমরা কল করে কনফার্ম করব' },
            { step: '৩', title: 'রিসিভ করুন', description: 'দ্রুততম সময়ে হোম ডেলিভারি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: 'গ্রাহকদের আস্থা',
          testimonials: [],
        },
      },
      {
        type: 'cta',
        props: {
          variant: 'green-box',
          headline: 'সুস্থ থাকতে আজই অর্ডার করুন',
          subheadline: 'প্রথম অর্ডারে ডেলিভারি চার্জ ফ্রি!',
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
          variant: 'urgency',
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
            { icon: '📦', text: 'স্টক সীমিত' },
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
            { icon: '✅', title: 'সেরা অফার', description: 'সীমিত সময়ের জন্য' },
            { icon: '🎁', title: 'ফ্রি গিফট সহ', description: 'প্রতিটি অর্ডারে বিশেষ উপহার' },
            { icon: '🚚', title: 'ফ্রি ডেলিভারি', description: 'সারাদেশে বিনামূল্যে ডেলিভারি' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          title: '🌟 সন্তুষ্ট কাস্টমার',
          testimonials: [],
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
          subheadline: 'স্টক সীমিত! দেরি না করে এখনই অর্ডার প্লেস করুন',
          buttonText: '🔥 এখনই অর্ডার করুন',
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
          variant: 'glassmorphism',
          headline: 'ফিউচারিস্টিক ডিজাইন এখন আপনার হাতের মুঠোয়',
          subheadline: 'সম্পূর্ণ নতুন প্রযুক্তিতে তৈরি আমাদের এই কালেকশন।',
          ctaText: 'এক্সপ্লোর কালেকশন',
          badgeText: '✨ নিউ অ্যারাইভাল',
        },
      },
      {
        type: 'trust-badges',
        props: {
          variant: 'glassmorphism',
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
          variant: 'glassmorphism',
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
          variant: 'masonry',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          title: 'কাস্টমার ফিডব্যাক',
          testimonials: [],
        },
      },
      {
        type: 'cta',
        props: {
          styleVariant: 'glassmorphism',
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
          variant: 'bento',
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

  // SHOWCASE - Clean Minimal (Premium)
  // ─────────────────────────────────────────────────────────────────────────
  'showcase': {
    id: 'showcase',
    name: 'শোকেস মিনিমাল',
    nameEn: '✨ Showcase Minimal',
    description: 'প্রিমিয়াম অডিও এবং লাইফস্টাইল প্রোডাক্টের জন্য মিনিমালিস্ট ডিজাইন',
    descriptionEn: 'Minimalist design for premium audio & lifestyle products',
    thumbnail: '/templates/showcase.png',
    category: 'product',
    emoji: '✨',
    colors: {
      primary: '#0f172a', // Slate 900 (Black-ish)
      accent: '#64748b',  // Slate 500 (Subtle)
      bg: '#ffffff',      // Pure White
    },
    sections: [
      {
        type: 'hero',
        props: {
          variant: 'centered', // Centered for minimal look
          headline: 'বিশুদ্ধ শব্দ, তারহীন স্বাধীনতা',
          subheadline: 'অরা ওয়ান - নয়েজ ক্যান্সেলেশন এবং ৩০ ঘণ্টা ব্যাটারি লাইফ।',
          ctaText: 'এখনই কিনুন',
          badgeText: '✨ নিউ রিলিজ',
          backgroundImage: '', // Clean background
        },
      },
      {
        type: 'trust-badges',
        props: {
          variant: 'grid',
          badges: [
            { icon: 'Truck', text: 'ফ্রি শিপিং' },
            { icon: 'ShieldCheck', text: '২ বছরের ওয়ারেন্টি' },
            { icon: 'Lock', text: 'নিরাপদ পেমেন্ট' },
            { icon: 'RefreshCcw', text: '৭ দিনে রিটার্ন' },
          ],
        },
      },
      {
        type: 'features',
        props: {
          variant: 'cards', // Cards with shadow for "subtle shadows" look
          title: 'অরা ওয়ান এর বিশেষত্ব',
          features: [
            { icon: 'Music', title: 'অ্যাডাপ্টিভ সাউন্ড', description: 'আপনার পরিবেশ অনুযায়ী সাউন্ড অ্যাডজাস্ট করে' },
            { icon: 'Battery', title: 'লং ব্যাটারি', description: 'এক চার্জে ৩০ ঘণ্টা পর্যন্ত প্লেব্যাক' },
            { icon: 'Feather', title: 'হালকা ডিজাইন', description: 'কানের জন্য আরামদায়ক, দীর্ঘ সময় ব্যবহারের উপযোগী' },
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          variant: 'highlight', // Highlight variant as per scheme update
          title: 'টেকনিক্যাল স্পেসিফিকেশন',
          features: [
            { title: 'ড্রাইভার', description: '৪০ মি.মি. ডায়নামিক' },
            { title: 'কানেক্টিভিটি', description: 'ব্লুটুথ ৫.২' },
            { title: 'ব্যাটারি', description: '৫০০০ এমএএইচ' },
            { title: 'চার্জিং', description: 'ইউএসবি টাইপ-সি' },
          ],
        },
      },
      {
        type: 'gallery',
        props: {
          title: 'লাইফস্টাইল গ্যালারি',
          layout: 'masonry', // Masonry works well for minimal galleries
          images: [],
        },
      },
      {
        type: 'testimonials',
        props: {
          variant: 'minimal',
          title: 'ব্যবহারকারীরা যা বলছেন',
          testimonials: [],
        },
      },
      {
        type: 'faq',
        props: {
          variant: 'accordion',
          title: 'জিজ্ঞাসা',
          items: [
            { question: 'অর্ডার কনফার্ম হবে কিভাবে?', answer: 'অর্ডার করার পর আমাদের প্রতিনিধি কল করবেন।' },
            { question: 'ওয়ারেন্টি কত দিনের?', answer: '২ বছরের অফিসিয়াল ওয়ারেন্টি।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          variant: 'minimal', // Minimal CTA
          headline: 'সীমিত স্টক, আজই সংগ্রহ করুন',
          subheadline: 'ফ্রি শিপিং ও বিশেষ ডিসকাউন্ট পেতে এখনই অর্ডার করুন',
          buttonText: 'অর্ডার কনফার্ম করুন',
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
  // ─────────────────────────────────────────────────────────────────────────
  // ORGANIC GREEN - Modern Eco-Luxury
  // ─────────────────────────────────────────────────────────────────────────
  'organic': {
    id: 'organic',
    name: 'অর্গানিক লাক্সারি',
    nameEn: '🍃 Organic Eco-Luxury',
    description: 'প্রাকৃতিক ও প্রিমিয়াম অর্গানিক প্রোডাক্টের জন্য ডিজাইন',
    descriptionEn: 'Premium design for natural & organic products',
    thumbnail: '/templates/organic.png',
    category: 'product',
    emoji: '🍃',
    colors: {
      primary: '#3f6212', // Lime 800 (Deep Natural Green)
      accent: '#a3e635',  // Lime 400 (Fresh Leaf)
      bg: '#fefce8',      // Yellow 50 (Creamy White)
    },
    sections: [
      {
        type: 'hero',
        props: {
          variant: 'organic', // Triggers OrganicHero
          headline: 'বিশুদ্ধ প্রকৃতি, বোতলজাত',
          subheadline: 'ত্বকের জন্য ১০০% কার্যকর এবং প্রাকৃতিক উপাদান। কোনো ক্ষতিকর কেমিক্যাল নেই।',
          ctaText: 'শপ নাও',
          badgeText: '🌿 ১০০% অর্গানিক',
          backgroundImage: '', // Use clean background provided by theme
        },
      },
      {
        type: 'features',
        props: {
          variant: 'organic', // Triggers OrganicFeatures
          title: 'প্রকৃতির সেরা উপহার',
          features: [
            { icon: 'Sprout', title: 'টেকসই উৎস', description: 'আমরা সরাসরি কৃষকদের থেকে সংগ্রহ করি।' },
            { icon: 'FlaskConical', title: 'ল্যাব টেস্টেড', description: 'প্রতিটি ব্যাচ ডার্মাটোলজিস্ট দ্বারা পরীক্ষিত।' },
            { icon: 'Recycle', title: 'জিরো ওয়েস্ট', description: 'আমাদের প্যাকেজিং ১০০% রিসাইকেলযোগ্য।' },
          ],
        },
      },
      {
        type: 'showcase',
        props: {
          variant: 'highlight',
          title: 'কেন এটি অনন্য?',
          features: [
            { title: 'উপাদান', description: 'অ্যালোভেরা, গ্রিন টি, শিয়া বাটার' },
            { title: 'ত্বকের ধরণ', description: 'সব ধরণের ত্বকের জন্য' },
            { title: 'ব্যবহার', description: 'দিনে দুইবার' },
            { title: 'পরিমাণ', description: '৫০ গ্রাম / ১০০ গ্রাম' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          variant: 'minimal',
          title: 'গ্রাহকদের ভালোবাসা',
          testimonials: [
            { name: 'নিগার সুলতানা', text: 'আমার সেনসিটিভ স্কিনের জন্য এটি আশীর্বাদ।', rating: 5 },
            { name: 'ডাঃ রুবিনা', text: 'কেমিক্যাল মুক্ত হওয়ায় আমি এটি রেকমেন্ড করি।', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          variant: 'accordion',
          title: 'সাধারণ জিজ্ঞাসা',
          items: [
            { question: 'এটি কি সব বয়সের জন্য?', answer: 'হ্যাঁ, এটি সম্পূর্ণ প্রাকৃতিক হওয়ায় নিরাপদ।' },
            { question: 'সাইড ইফেক্ট আছে?', answer: 'না, তবে প্যাচ টেস্ট করে নেওয়া ভালো।' },
          ],
        },
      },
      {
        type: 'cta',
        props: {
          variant: 'organic', // Triggers OrganicOrderForm
          headline: 'প্রকৃতির ছোঁয়া নিন',
          subheadline: 'আজই শুরু করুন আপনার অর্গানিক জার্নি',
          buttonText: 'অর্ডার করুন',
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
          variant: 'trust-first',
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
          variant: 'cards',
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
          variant: 'trust-first',
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
          variant: 'trust-first',
          title: '১০০% সন্তুষ্টি গ্যারান্টি',
          text: 'আমরা আপনার সন্তুষ্টির জন্য প্রতিশ্রুতিবদ্ধ। পণ্য পছন্দ না হলে ৭ দিনের মধ্যে ফেরত দিন।',
          badgeLabel: '৭ দিন মানি ব্যাক গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          styleVariant: 'trust-first',
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
          variant: 'story-driven',
          headline: 'আপনি কি এই সমস্যায় ভুগছেন?',
          subheadline: 'আমিও একসময় ঠিক আপনার মতোই ছিলাম। কিন্তু তারপর এই প্রোডাক্ট আমার জীবন বদলে দিয়েছে...',
          ctaText: 'আমার গল্প পড়ুন',
          badgeText: '💛 আমার অভিজ্ঞতা',
        },
      },
      {
        type: 'problem-solution',
        props: {
          variant: 'default',
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
          variant: 'minimal',
          title: '💬 অন্যরা কি বলছেন?',
          testimonials: [
            { name: 'শারমিন সুলতানা', text: 'একই অভিজ্ঞতা! সত্যিই কাজ করে।', rating: 5 },
            { name: 'রাকিব হাসান', text: 'বন্ধুর রেকমেন্ডেশনে কিনেছিলাম, এখন নিজেও রেকমেন্ড করছি।', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          variant: 'accordion',
          title: '❓ প্রশ্নোত্তর',
          items: [
            { question: 'এটা কি সত্যিই কাজ করে?', answer: 'হ্যাঁ, হাজারো মানুষ ব্যবহার করে উপকৃত হয়েছেন।' },
            { question: 'কতদিনে ফলাফল পাব?', answer: 'সাধারণত ১-২ সপ্তাহের মধ্যে পার্থক্য বুঝতে পারবেন।' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          variant: 'default',
          title: '💛 আমার প্রতিশ্রুতি',
          text: 'আমি নিজে ব্যবহার করে দেখেছি, তাই আপনাকেও গ্যারান্টি দিচ্ছি - পছন্দ না হলে টাকা ফেরত।',
          badgeLabel: '১০০% সন্তুষ্টি গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          styleVariant: 'story-driven',
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
          variant: 'urgency',
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
          variant: 'urgency',
          title: '🔥 কেন এখনই অর্ডার করবেন?',
          features: [
            { icon: '💰', title: '৫০% ছাড়', description: 'শুধু আজকের জন্য' },
            { icon: '🎁', title: 'ফ্রি গিফট', description: 'প্রথম ২০ অর্ডারে' },
            { icon: '🚚', title: 'ফ্রি ডেলিভারি', description: 'আজই অর্ডার করলে' },
          ],
        },
      },
      {
        type: 'benefits',
        props: {
          variant: 'urgency',
          title: '🎁 বোনাস যা পাচ্ছেন',
          benefits: [
            { icon: '🎁', title: 'ফ্রি গিফট', description: 'বিশেষ উপহার' },
            { icon: '📦', title: 'এক্সট্রা প্যাক', description: 'অতিরিক্ত স্যাম্পল' },
            { icon: '🏷️', title: 'ডিসকাউন্ট কুপন', description: 'পরবর্তী অর্ডারে' },
          ],
        },
      },
      {
        type: 'testimonials',
        props: {
          variant: 'chat-bubbles',
          title: '⭐ সাম্প্রতিক অর্ডার',
          testimonials: [
            { name: 'Rahim', location: 'ঢাকা', text: '২ মিনিট আগে অর্ডার করেছেন', rating: 5 },
            { name: 'Fatema', location: 'চট্টগ্রাম', text: '৫ মিনিট আগে অর্ডার করেছেন', rating: 5 },
            { name: 'Karim', location: 'সিলেট', text: '১২ মিনিট আগে অর্ডার করেছেন', rating: 5 },
          ],
        },
      },
      {
        type: 'faq',
        props: {
          variant: 'accordion',
          title: '❓ সাধারণ প্রশ্ন',
          items: [
            { question: 'এই অফার কতক্ষণ চলবে?', answer: 'শুধুমাত্র আজ রাত ১২টা পর্যন্ত!' },
            { question: 'স্টক থাকবে তো?', answer: 'সীমিত স্টক! শেষ হলে আর পাওয়া যাবে না।' },
          ],
        },
      },
      {
        type: 'guarantee',
        props: {
          variant: 'urgency',
          title: '🛡️ রিস্ক ফ্রি পারচেজ',
          text: 'পছন্দ না হলে ৭ দিনের মধ্যে টাকা ফেরত।',
          badgeLabel: '১০০% মানি ব্যাক গ্যারান্টি',
        },
      },
      {
        type: 'cta',
        props: {
          styleVariant: 'urgency',
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
