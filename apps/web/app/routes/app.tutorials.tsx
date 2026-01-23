/**
 * Merchant Dashboard Tutorial Page
 * 
 * Route: /app/tutorials
 * 
 * A comprehensive step-by-step guide for merchants to understand
 * all features and settings of the platform.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { useState } from 'react';
import { 
  BookOpen, 
  Package, 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Palette,
  Globe,
  BarChart3,
  Mail,
  Tag,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Warehouse,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Home,
  Crown,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [
  { title: 'টিউটোরিয়াল - Dashboard Guide' },
  { name: 'description', content: 'মার্চেন্ট ড্যাশবোর্ডের সম্পূর্ণ গাইড - সব সেটিংস ও ফিচার শিখুন' },
];

// Tutorial sections data
const tutorialSections = [
  {
    id: 'getting-started',
    icon: Play,
    title: '🏁 শুরু করুন',
    subtitle: 'প্রথম স্টেপস',
    color: 'emerald',
    content: [
      {
        heading: 'ড্যাশবোর্ড ওভারভিউ',
        text: 'লগইন করার পরে আপনি ড্যাশবোর্ডে আসবেন। এখানে আপনার স্টোরের সারাংশ দেখতে পাবেন - আজকের অর্ডার, মোট সেলস, পেন্ডিং অর্ডার ইত্যাদি।'
      },
      {
        heading: 'প্রথম কাজ',
        steps: [
          '১. প্রথমে Settings থেকে আপনার স্টোরের নাম, লোগো এবং বেসিক তথ্য দিন',
          '২. Shipping সেটিংস থেকে ডেলিভারি চার্জ সেট করুন',
          '৩. Payment সেটিংস থেকে পেমেন্ট মেথড অন করুন',
          '৪. তারপর প্রোডাক্ট যোগ করা শুরু করুন'
        ]
      },
      {
        heading: 'সাইডবার মেনু',
        text: 'বামপাশের সাইডবার থেকে সব সেকশনে যেতে পারবেন। মোবাইলে উপরের হ্যামবার্গার মেনু থেকে সাইডবার খুলুন।'
      }
    ]
  },
  {
    id: 'products',
    icon: Package,
    title: '📦 প্রোডাক্ট ম্যানেজমেন্ট',
    subtitle: 'প্রোডাক্ট যোগ ও এডিট',
    color: 'blue',
    content: [
      {
        heading: 'নতুন প্রোডাক্ট যোগ করা',
        steps: [
          '১. Products → Add Product বাটনে ক্লিক করুন',
          '২. প্রোডাক্টের নাম দিন (বাংলা/ইংরেজি যেকোনো)',
          '৩. প্রোডাক্টের ছবি আপলোড করুন (স্কয়ার ছবি সবচেয়ে ভালো দেখায়)',
          '৪. দাম সেট করুন - Regular Price এবং Sale Price (যদি ডিসকাউন্ট থাকে)',
          '৫. স্টক কোয়ান্টিটি দিন',
          '৬. ক্যাটাগরি সিলেক্ট করুন',
          '৭. Save বাটনে ক্লিক করুন'
        ]
      },
      {
        heading: 'প্রোডাক্ট এডিট করা',
        text: 'Products লিস্ট থেকে যেকোনো প্রোডাক্টে ক্লিক করলে এডিট পেজ আসবে। সেখান থেকে সব তথ্য পরিবর্তন করতে পারবেন।'
      },
      {
        heading: 'টিপস',
        tips: [
          '✅ ভালো মানের ছবি ব্যবহার করুন - সেলস বাড়ে',
          '✅ প্রোডাক্ট ডেসক্রিপশন বিস্তারিত লিখুন',
          '✅ Compare Price দিলে কাস্টমার ডিসকাউন্ট বুঝতে পারবে',
          '✅ স্টক ০ হলে প্রোডাক্ট Out of Stock দেখাবে'
        ]
      }
    ]
  },
  {
    id: 'orders',
    icon: ShoppingCart,
    title: '🛒 অর্ডার ম্যানেজমেন্ট',
    subtitle: 'অর্ডার দেখুন ও প্রসেস করুন',
    color: 'orange',
    content: [
      {
        heading: 'অর্ডার দেখা',
        text: 'Orders মেনু থেকে সব অর্ডার দেখতে পাবেন। প্রতিটি অর্ডারে ক্লিক করলে বিস্তারিত দেখা যাবে - কাস্টমারের নাম, ঠিকানা, ফোন নম্বর, প্রোডাক্ট লিস্ট ইত্যাদি।'
      },
      {
        heading: 'অর্ডার স্ট্যাটাস আপডেট',
        steps: [
          '• Pending - নতুন অর্ডার, এখনো প্রসেস হয়নি',
          '• Confirmed - অর্ডার কনফার্ম করা হয়েছে',
          '• Processing - প্যাকেজিং হচ্ছে',
          '• Shipped - কুরিয়ারে দেওয়া হয়েছে',
          '• Delivered - ডেলিভারি সম্পন্ন',
          '• Cancelled - অর্ডার বাতিল'
        ]
      },
      {
        heading: 'ইনভয়েস প্রিন্ট',
        text: 'অর্ডার ডিটেইলস পেজে Print Invoice বাটন থেকে ইনভয়েস প্রিন্ট করতে পারবেন। এটি প্যাকেজের সাথে দিতে পারেন।'
      },
      {
        heading: 'Abandoned Carts',
        text: 'Abandoned Carts সেকশনে সেসব কাস্টমার দেখাবে যারা চেকআউট শুরু করেছিল কিন্তু অর্ডার কমপ্লিট করেনি। তাদের ফলো-আপ করতে পারেন।'
      }
    ]
  },
  {
    id: 'inventory',
    icon: Warehouse,
    title: '🏭 ইনভেন্টরি',
    subtitle: 'স্টক ম্যানেজমেন্ট',
    color: 'purple',
    content: [
      {
        heading: 'ইনভেন্টরি ট্র্যাকিং',
        text: 'Inventory সেকশন থেকে আপনার সব প্রোডাক্টের স্টক পরিস্থিতি এক নজরে দেখতে পাবেন।'
      },
      {
        heading: 'লো স্টক অ্যালার্ট',
        text: 'কোনো প্রোডাক্টের স্টক ৫ বা তার কম হলে লো স্টক ওয়ার্নিং পাবেন। এটি আপনাকে রি-স্টক করতে মনে করিয়ে দেবে।'
      },
      {
        heading: 'বাল্ক ইম্পোর্ট',
        text: 'অনেক প্রোডাক্ট থাকলে Inventory Import ফিচার থেকে CSV ফাইল আপলোড করে একসাথে অনেক প্রোডাক্ট যোগ করতে পারবেন।'
      }
    ]
  },
  {
    id: 'store-design',
    icon: Palette,
    title: '🎨 স্টোর ডিজাইন',
    subtitle: 'থিম ও কাস্টমাইজেশন',
    color: 'pink',
    content: [
      {
        heading: 'স্টোর সেটিংস',
        text: 'Settings পেজ থেকে আপনার স্টোরের বেসিক তথ্য দিতে পারবেন:'
      },
      {
        heading: 'কী কী সেট করবেন',
        steps: [
          '• Store Name - আপনার ব্র্যান্ডের নাম',
          '• Logo - স্কয়ার লোগো বেস্ট (PNG/JPG)',
          '• Favicon - ব্রাউজার ট্যাবে দেখাবে (ছোট আইকন)',
          '• Theme Color - আপনার ব্র্যান্ড কালার সিলেক্ট করুন',
          '• Currency - BDT সিলেক্ট করুন বাংলাদেশের জন্য'
        ]
      },
      {
        heading: 'Store Templates',
        text: 'Store Design সেকশন থেকে রেডিমেড টেমপ্লেট সিলেক্ট করতে পারবেন। প্রতিটি টেমপ্লেটে ক্লিক করে প্রিভিউ দেখুন, পছন্দ হলে Apply করুন।'
      },
      {
        heading: 'Landing Page Builder',
        text: 'Store Editor দিয়ে আপনার স্টোরের হোমপেজ ও ল্যান্ডিং পেজ কাস্টমাইজ করতে পারবেন - সেকশন যোগ/বাদ, টেক্সট এডিট, ছবি পরিবর্তন ইত্যাদি।'
      }
    ]
  },
  {
    id: 'shipping',
    icon: Truck,
    title: '📍 শিপিং সেটিংস',
    subtitle: 'ডেলিভারি চার্জ সেটআপ',
    color: 'cyan',
    content: [
      {
        heading: 'শিপিং জোন কী?',
        text: 'বিভিন্ন এলাকায় বিভিন্ন ডেলিভারি চার্জ সেট করতে Shipping Zones ব্যবহার করুন। যেমন: ঢাকার ভেতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।'
      },
      {
        heading: 'শিপিং জোন তৈরি',
        steps: [
          '১. Settings → Shipping এ যান',
          '২. Add Zone বাটনে ক্লিক করুন',
          '৩. জোনের নাম দিন (যেমন: Inside Dhaka)',
          '৪. ডেলিভারি চার্জ দিন (যেমন: ৬০)',
          '৫. ফ্রি শিপিং থ্রেশহোল্ড দিন (ঐচ্ছিক) - যেমন: ১০০০ টাকার উপরে ফ্রি',
          '৬. Save করুন'
        ]
      },
      {
        heading: 'ফ্রি শিপিং',
        text: 'Free Shipping Threshold দিলে ঐ পরিমাণের উপরে অর্ডারে ফ্রি ডেলিভারি হবে। এটি কাস্টমারদের বেশি কিনতে উৎসাহিত করে।'
      }
    ]
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: '💰 পেমেন্ট সেটিংস',
    subtitle: 'পেমেন্ট মেথড কনফিগার',
    color: 'green',
    content: [
      {
        heading: 'পেমেন্ট অপশন',
        text: 'Settings → Payment থেকে পেমেন্ট মেথড সেটআপ করুন।'
      },
      {
        heading: 'সাপোর্টেড মেথড',
        steps: [
          '• Cash on Delivery (COD) - বাংলাদেশে সবচেয়ে জনপ্রিয়',
          '• bKash - মোবাইল পেমেন্ট',
          '• Nagad - মোবাইল পেমেন্ট'
        ]
      },
      {
        heading: 'বিকাশ/নগদ সেটআপ',
        text: 'Manual Payment অপশন থেকে আপনার বিকাশ/নগদ নম্বর দিতে পারবেন। কাস্টমার সেন্ড মানি করে Transaction ID দিলে আপনি ভেরিফাই করবেন।'
      },
      {
        heading: 'টিপস',
        tips: [
          '✅ COD অবশ্যই রাখুন - বেশিরভাগ কাস্টমার এটি পছন্দ করেন',
          '✅ বিকাশ/নগদ দিলে অ্যাডভান্স পেমেন্ট নিতে পারবেন'
        ]
      }
    ]
  },
  {
    id: 'courier',
    icon: Truck,
    title: '🚚 কুরিয়ার ইন্টিগ্রেশন',
    subtitle: 'Pathao, Steadfast, RedX',
    color: 'red',
    content: [
      {
        heading: 'কুরিয়ার সংযোগ কেন?',
        text: 'কুরিয়ার কানেক্ট করলে সরাসরি ড্যাশবোর্ড থেকে পার্সেল বুক করতে পারবেন, ট্র্যাকিং দেখতে পারবেন।'
      },
      {
        heading: 'সাপোর্টেড কুরিয়ার',
        steps: [
          '• Pathao - সবচেয়ে বড় নেটওয়ার্ক',
          '• Steadfast - দ্রুত সার্ভিস',
          '• RedX - সাশ্রয়ী দাম'
        ]
      },
      {
        heading: 'Steadfast সেটআপ (সবচেয়ে সহজ)',
        steps: [
          '১. Steadfast Merchant অ্যাকাউন্ট খুলুন',
          '২. API Key ও Secret Key সংগ্রহ করুন',
          '৩. Settings → Courier এ গিয়ে Steadfast সিলেক্ট করুন',
          '৪. API Key ও Secret Key পেস্ট করুন',
          '৫. Test Connection করুন',
          '৬. Save করুন'
        ]
      },
      {
        heading: 'Pathao সেটআপ',
        steps: [
          '১. Pathao Merchant থেকে অ্যাকাউন্ট করুন',
          '২. Client ID, Client Secret, Username, Password সংগ্রহ করুন',
          '৩. Settings → Courier এ গিয়ে Pathao সিলেক্ট করুন',
          '৪. সব তথ্য দিন এবং Test Connection করুন',
          '৫. আপনার Pickup Store সিলেক্ট করুন'
        ]
      }
    ]
  },
  {
    id: 'tracking',
    icon: BarChart3,
    title: '📊 ট্র্যাকিং ও অ্যানালিটিক্স',
    subtitle: 'Facebook Pixel, Google Analytics',
    color: 'indigo',
    content: [
      {
        heading: 'কেন ট্র্যাকিং দরকার?',
        text: 'Facebook Pixel দিলে Facebook/Instagram Ad থেকে কে কী কিনছে ট্র্যাক করতে পারবেন। এতে Ad Performance বোঝা যায় এবং Retargeting করা যায়।'
      },
      {
        heading: 'Facebook Pixel সেটআপ',
        steps: [
          '১. Facebook Business Manager এ যান',
          '২. Events Manager থেকে Pixel তৈরি করুন',
          '৩. Pixel ID কপি করুন',
          '৪. Settings → Tracking এ গিয়ে Pixel ID পেস্ট করুন',
          '৫. Save করুন'
        ]
      },
      {
        heading: 'Conversion API (Advanced)',
        text: 'Server-side tracking এর জন্য Conversion API Access Token দিতে পারেন। এটি iOS 14+ ইউজারদের ট্র্যাক করতে সাহায্য করে।'
      },
      {
        heading: 'Google Analytics',
        steps: [
          '১. Google Analytics 4 অ্যাকাউন্ট তৈরি করুন',
          '২. Measurement ID (G-XXXXXXX) কপি করুন',
          '৩. Settings → Tracking এ পেস্ট করুন',
          '৪. Save করুন'
        ]
      }
    ]
  },
  {
    id: 'domain',
    icon: Globe,
    title: '🌐 ডোমেইন সেটআপ',
    subtitle: 'কাস্টম ডোমেইন যুক্ত করুন',
    color: 'teal',
    content: [
      {
        heading: 'ডিফল্ট সাবডোমেইন',
        text: 'প্রতিটি স্টোর একটি ফ্রি সাবডোমেইন পায়, যেমন: yourstore.ozzyl.com। এটি ফ্রি প্ল্যানেও কাজ করে।'
      },
      {
        heading: 'কাস্টম ডোমেইন (পেইড প্ল্যান)',
        text: 'পেইড প্ল্যানে আপনার নিজের ডোমেইন যুক্ত করতে পারবেন, যেমন: www.yourbrand.com'
      },
      {
        heading: 'কাস্টম ডোমেইন সেটআপ',
        steps: [
          '১. একটি ডোমেইন কিনুন (Namecheap, GoDaddy, Exonhost ইত্যাদি থেকে)',
          '২. Settings → Domain এ যান',
          '৩. আপনার ডোমেইন লিখুন',
          '৪. Add Domain বাটনে ক্লিক করুন',
          '৫. DNS সেটিংস দেখানো হবে - সেগুলো আপনার ডোমেইন প্রোভাইডারে সেট করুন',
          '৬. SSL অটো অ্যাক্টিভ হতে কিছুক্ষণ লাগতে পারে'
        ]
      },
      {
        heading: 'DNS সেটিংস',
        text: 'সাধারণত CNAME record যোগ করতে হয়। আমরা অটোমেটিক DNS ইন্সট্রাকশন দেখাই।'
      }
    ]
  },
  {
    id: 'campaigns',
    icon: Mail,
    title: '📧 ক্যাম্পেইন ও মার্কেটিং',
    subtitle: 'ইমেইল মার্কেটিং',
    color: 'violet',
    content: [
      {
        heading: 'ইমেইল ক্যাম্পেইন',
        text: 'Campaigns সেকশন থেকে আপনার কাস্টমারদের ইমেইল পাঠাতে পারবেন - নতুন প্রোডাক্ট, অফার, ডিসকাউন্ট ইত্যাদি।'
      },
      {
        heading: 'সাবস্ক্রাইবার',
        text: 'Subscribers সেকশনে যারা আপনার স্টোরে ইমেইল দিয়েছে তাদের লিস্ট দেখতে পাবেন। এদের টার্গেট করে ক্যাম্পেইন পাঠান।'
      },
      {
        heading: 'অটোমেশন',
        text: 'Automations ফিচার দিয়ে অটোমেটিক ইমেইল সেটআপ করতে পারেন - যেমন: Welcome Email, Abandoned Cart Reminder ইত্যাদি।'
      }
    ]
  },
  {
    id: 'discounts',
    icon: Tag,
    title: '🏷️ ডিসকাউন্ট',
    subtitle: 'কুপন কোড তৈরি',
    color: 'amber',
    content: [
      {
        heading: 'ডিসকাউন্ট কোড',
        text: 'Discounts সেকশন থেকে কুপন কোড তৈরি করতে পারবেন।'
      },
      {
        heading: 'ডিসকাউন্ট টাইপ',
        steps: [
          '• Percentage - ১০%, ২০% ইত্যাদি ছাড়',
          '• Fixed Amount - ৫০ টাকা, ১০০ টাকা ইত্যাদি ছাড়'
        ]
      },
      {
        heading: 'কুপন তৈরি',
        steps: [
          '১. Discounts → Create Discount',
          '২. কুপন কোড দিন (যেমন: SAVE10)',
          '৩. ডিসকাউন্ট টাইপ ও পরিমাণ দিন',
          '৪. মিনিমাম অর্ডার ভ্যালু দিন (ঐচ্ছিক)',
          '৫. মেয়াদ সেট করুন',
          '৬. Save করুন'
        ]
      },
      {
        heading: 'টিপস',
        tips: [
          '✅ সহজে মনে রাখা যায় এমন কোড দিন',
          '✅ সোশ্যাল মিডিয়ায় কুপন কোড শেয়ার করুন',
          '✅ মেয়াদ সীমিত রাখলে আর্জেন্সি তৈরি হয়'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    icon: FileText,
    title: '📈 রিপোর্টস ও অ্যানালিটিক্স',
    subtitle: 'সেলস ও পারফরম্যান্স',
    color: 'slate',
    content: [
      {
        heading: 'Analytics ড্যাশবোর্ড',
        text: 'Analytics সেকশনে আপনার স্টোরের পারফরম্যান্স দেখতে পাবেন - ভিজিটর, সেলস, কনভার্শন রেট ইত্যাদি।'
      },
      {
        heading: 'রিপোর্ট টাইপ',
        steps: [
          '• Sales Report - মোট সেলস, অর্ডার সংখ্যা',
          '• Product Performance - কোন প্রোডাক্ট বেশি বিক্রি হচ্ছে',
          '• Customer Insights - নতুন vs রিপিট কাস্টমার'
        ]
      },
      {
        heading: 'রিপোর্ট এক্সপোর্ট',
        text: 'Reports সেকশন থেকে আপনার সেলস ডেটা এক্সপোর্ট করতে পারবেন হিসাবপত্র বা ট্যাক্স ক্যালকুলেশনের জন্য।'
      }
    ]
  },
  {
    id: 'billing',
    icon: Crown,
    title: '💳 বিলিং ও প্ল্যান',
    subtitle: 'সাবস্ক্রিপশন ম্যানেজমেন্ট',
    color: 'yellow',
    content: [
      {
        heading: 'প্ল্যান তুলনা',
        steps: [
          '• Free - ২০টি প্রোডাক্ট, ৫০টি অর্ডার/মাস',
          '• Starter - ১০০টি প্রোডাক্ট, ৩০০টি অর্ডার/মাস',
          '• Growth - ৫০০টি প্রোডাক্ট, ১০০০টি অর্ডার/মাস',
          '• Pro - আনলিমিটেড প্রোডাক্ট ও অর্ডার'
        ]
      },
      {
        heading: 'আপগ্রেড করা',
        steps: [
          '১. Billing সেকশনে যান',
          '২. প্ল্যান সিলেক্ট করুন',
          '৩. বিকাশ/নগদ দিয়ে পেমেন্ট করুন',
          '৪. Transaction ID দিন',
          '৫. অ্যাডমিন ভেরিফাই করলে প্ল্যান আপগ্রেড হবে'
        ]
      },
      {
        heading: 'পেমেন্ট হিস্ট্রি',
        text: 'Billing পেজে আপনার সব পেমেন্ট হিস্ট্রি দেখতে পাবেন।'
      }
    ]
  },
  {
    id: 'reviews',
    icon: MessageSquare,
    title: '⭐ রিভিউ ম্যানেজমেন্ট',
    subtitle: 'কাস্টমার ফিডব্যাক',
    color: 'rose',
    content: [
      {
        heading: 'রিভিউ দেখা',
        text: 'Reviews সেকশনে কাস্টমারদের দেওয়া সব রিভিউ দেখতে পাবেন।'
      },
      {
        heading: 'রিভিউ মডারেশন',
        text: 'আপনি রিভিউ Approve বা Delete করতে পারবেন। ভালো রিভিউ আপনার স্টোরের বিশ্বাসযোগ্যতা বাড়ায়।'
      },
      {
        heading: 'টিপস',
        tips: [
          '✅ কাস্টমারদের রিভিউ দিতে উৎসাহিত করুন',
          '✅ নেগেটিভ রিভিউতে প্রফেশনালি রেসপন্স করুন',
          '✅ ভালো রিভিউ সোশ্যাল মিডিয়ায় শেয়ার করুন'
        ]
      }
    ]
  }
];

export default function TutorialsPage() {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [activeSection, setActiveSection] = useState('getting-started');

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    setActiveSection(sectionId);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (!expandedSections.includes(sectionId)) {
      setExpandedSections(prev => [...prev, sectionId]);
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', hover: 'hover:bg-emerald-100' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', hover: 'hover:bg-green-100' },
      red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', hover: 'hover:bg-red-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', hover: 'hover:bg-indigo-100' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', hover: 'hover:bg-teal-100' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', hover: 'hover:bg-violet-100' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
      slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', hover: 'hover:bg-slate-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', hover: 'hover:bg-rose-100' },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">স্টোর গাইড ও টিউটোরিয়াল</h1>
            <p className="text-gray-500 text-sm">সব সেটিংস ও ফিচার স্টেপ বাই স্টেপ শিখুন</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              বিষয়সূচি
            </h2>
            <nav className="space-y-1">
              {tutorialSections.map((section) => {
                const colorClasses = getColorClasses(section.color);
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                      isActive
                        ? `${colorClasses.bg} ${colorClasses.text} font-medium`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className={`w-4 h-4 ${isActive ? colorClasses.text : 'text-gray-400'}`} />
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Quick Start Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">দ্রুত শুরু করুন! 🚀</h2>
                <p className="text-emerald-100 text-sm mb-3">
                  নিচের প্রতিটি সেকশনে ক্লিক করে বিস্তারিত দেখুন। প্রথমে "শুরু করুন" সেকশনটি পড়ুন।
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    ১৫+ টপিক
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    বাংলায় ব্যাখ্যা
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    স্টেপ বাই স্টেপ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorial Sections */}
          {tutorialSections.map((section) => {
            const colorClasses = getColorClasses(section.color);
            const isExpanded = expandedSections.includes(section.id);
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                id={section.id}
                className={`bg-white rounded-xl border transition-all ${
                  isExpanded ? colorClasses.border : 'border-gray-200'
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-4 ${colorClasses.hover} rounded-xl transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-xs text-gray-500">{section.subtitle}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {section.content.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className={`font-medium ${colorClasses.text}`}>{item.heading}</h4>
                          
                          {item.text && (
                            <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                          )}
                          
                          {item.steps && (
                            <ul className="space-y-1.5 ml-1">
                              {item.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-gray-400 mt-0.5">‣</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {item.tips && (
                            <div className={`${colorClasses.bg} rounded-lg p-3 space-y-1.5`}>
                              {item.tips.map((tip, tipIndex) => (
                                <p key={tipIndex} className="text-sm text-gray-700">{tip}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Help Banner */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">আরও সাহায্য দরকার?</h3>
                <p className="text-gray-500 text-sm mb-3">
                  কোনো প্রশ্ন থাকলে বা কোনো সমস্যায় পড়লে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  যোগাযোগ করুন
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
