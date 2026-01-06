/**
 * Global i18n Translations
 * 
 * Supports English (en) and Bengali (bn) with extensible architecture
 * Usage: const t = useTranslation();
 *        t('addToCart')
 * 
 * To add a new language:
 * 1. Add code to Language type
 * 2. Add config to LANGUAGES
 * 3. Add translations to translations object
 */

export type Language = 'en' | 'bn';

/**
 * Language Configuration
 * Extensible - add new languages here with their metadata
 */
export interface LanguageConfig {
  code: Language;
  name: string;         // English name
  nativeName: string;   // Name in that language
  flag: string;         // Emoji flag
  direction: 'ltr' | 'rtl';  // Text direction (for future Arabic, Hebrew, etc.)
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', direction: 'ltr' },
  // Add more languages here:
  // { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  // { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Store
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    
    // Product
    description: 'Description',
    reviews: 'Reviews',
    relatedProducts: 'Related Products',
    categories: 'Categories',
    allProducts: 'All Products',
    searchProducts: 'Search products...',
    noProductsFound: 'No products found',
    product: 'product',
    adding: 'Adding...',
    featuredProducts: 'Featured Products',
    checkBackSoon: 'Check back soon for new products',
    browseAllProducts: 'Browse All Products',
    shopByCategory: 'Shop by Category',
    
    // Cart
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    removeFromCart: 'Remove',
    updateCart: 'Update Cart',
    
    // Checkout
    orderSummary: 'Order Summary',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    
    // Form
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    district: 'District',
    postalCode: 'Postal Code',
    notes: 'Order Notes',
    required: 'Required',
    
    // Onboarding
    createAccount: 'Create Account',
    yourName: 'Your Name',
    password: 'Password',
    continueBtn: 'Continue',
    back: 'Back',
    businessInfo: 'Tell Us About Your Business',
    whatDoYouSell: 'What do you sell?',
    businessCategory: 'Business Category',
    choosePlan: 'Choose Your Plan',
    chooseStyle: 'Choose Your Style',
    creatingStore: 'Creating your store...',
    storeReady: 'Your store is ready!',
    retry: 'Retry',
    startOver: 'Start Over',
    alreadyHaveAccount: 'Already have an account? Login',
    emailAlreadyRegistered: 'Email already registered. Please login instead.',
    
    // Marketing Landing
    tagline: '#1 E-commerce Platform in Bangladesh',
    heroTitle1: 'Launch Your Online Store',
    heroTitle2: 'in 5 Minutes',
    heroSubtitle: 'No coding required. Get a professional e-commerce store with custom domain, payment integration, and powerful dashboard.',
    startFree: 'Start Free Today',
    viewPricing: 'View Pricing',
    noCreditCard: 'No credit card required • Free forever plan available',
    featuresTitle: 'Everything You Need to Sell Online',
    featuresSubtitle: 'Powerful features to grow your business',
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Start free, upgrade when you\'re ready',
    ctaTitle: 'Ready to Start Your Online Business?',
    ctaSubtitle: 'Join thousands of merchants who trust Multi-Store for their e-commerce needs.',
    ctaButton: 'Create Your Free Store',
    perMonth: '/month',
    mostPopular: 'Most Popular',
    
    // Features
    feature1Title: 'Your Own Store',
    feature1Desc: 'Get a professional online store with your custom subdomain in minutes.',
    feature2Title: 'Lightning Fast',
    feature2Desc: 'Built on edge computing for instant page loads worldwide.',
    feature3Title: 'Secure Payments',
    feature3Desc: 'Accept bKash, Nagad, Stripe and Cash on Delivery seamlessly.',
    feature4Title: 'Analytics Dashboard',
    feature4Desc: 'Track sales, orders, and customer insights in real-time.',
    feature5Title: 'Bangla + English',
    feature5Desc: 'Full bilingual support for your Bangladeshi customers.',
    feature6Title: '24/7 Support',
    feature6Desc: 'We are here to help you succeed, anytime.',
    
    // Plans
    planFree: 'Free',
    planStarter: 'Starter',
    planPremium: 'Premium',
    planFreeDesc: 'Perfect to get started',
    planStarterDesc: 'For growing businesses',
    planPremiumDesc: 'For established stores',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
  },
  
  bn: {
    // Navigation
    home: 'হোম',
    products: 'পণ্য',
    cart: 'কার্ট',
    checkout: 'চেকআউট',
    login: 'লগইন',
    register: 'রেজিস্টার',
    logout: 'লগআউট',
    
    // Store
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'এখনই কিনুন',
    outOfStock: 'স্টক নেই',
    inStock: 'স্টক আছে',
    price: 'মূল্য',
    quantity: 'পরিমাণ',
    total: 'মোট',
    subtotal: 'সাবটোটাল',
    shipping: 'শিপিং',
    tax: 'ট্যাক্স',
    grandTotal: 'সর্বমোট',
    
    // Product
    description: 'বিবরণ',
    reviews: 'রিভিউ',
    relatedProducts: 'সম্পর্কিত পণ্য',
    categories: 'ক্যাটাগরি',
    allProducts: 'সব পণ্য',
    searchProducts: 'পণ্য খুঁজুন...',
    noProductsFound: 'কোনো পণ্য পাওয়া যায়নি',
    product: 'পণ্য',
    adding: 'যোগ করা হচ্ছে...',
    featuredProducts: 'বৈশিষ্ট্যযুক্ত পণ্য',
    checkBackSoon: 'নতুন পণ্য শীঘ্রই আসছে',
    browseAllProducts: 'সব পণ্য দেখুন',
    shopByCategory: 'ক্যাটাগরি অনুযায়ী কেনাকাটা',
    
    // Cart
    yourCart: 'আপনার কার্ট',
    cartEmpty: 'আপনার কার্ট খালি',
    continueShopping: 'কেনাকাটা চালিয়ে যান',
    proceedToCheckout: 'চেকআউটে যান',
    removeFromCart: 'সরান',
    updateCart: 'কার্ট আপডেট করুন',
    
    // Checkout
    orderSummary: 'অর্ডার সারাংশ',
    shippingAddress: 'শিপিং ঠিকানা',
    paymentMethod: 'পেমেন্ট মেথড',
    cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    placeOrder: 'অর্ডার করুন',
    orderPlaced: 'অর্ডার সফল হয়েছে!',
    orderNumber: 'অর্ডার নম্বর',
    
    // Form
    name: 'নাম',
    email: 'ইমেইল',
    phone: 'ফোন',
    address: 'ঠিকানা',
    city: 'শহর',
    district: 'জেলা',
    postalCode: 'পোস্টাল কোড',
    notes: 'অর্ডার নোট',
    required: 'আবশ্যক',
    
    // Onboarding
    createAccount: 'একাউন্ট তৈরি করুন',
    yourName: 'আপনার নাম',
    password: 'পাসওয়ার্ড',
    continueBtn: 'চালিয়ে যান',
    back: 'পেছনে',
    businessInfo: 'আপনার ব্যবসা সম্পর্কে বলুন',
    whatDoYouSell: 'আপনি কী বিক্রি করেন?',
    businessCategory: 'ব্যবসার ক্যাটাগরি',
    choosePlan: 'আপনার প্ল্যান সিলেক্ট করুন',
    chooseStyle: 'আপনার স্টাইল সিলেক্ট করুন',
    creatingStore: 'আপনার স্টোর তৈরি হচ্ছে...',
    storeReady: 'আপনার স্টোর তৈরি হয়ে গেছে!',
    retry: 'আবার চেষ্টা করুন',
    startOver: 'শুরু থেকে শুরু করুন',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন',
    emailAlreadyRegistered: 'এই ইমেইল আগেই রেজিস্টার করা হয়েছে। অনুগ্রহ করে লগইন করুন।',
    
    // Marketing Landing
    tagline: 'বাংলাদেশের #১ ই-কমার্স প্ল্যাটফর্ম',
    heroTitle1: 'আপনার অনলাইন স্টোর চালু করুন',
    heroTitle2: 'মাত্র ৫ মিনিটে',
    heroSubtitle: 'কোনো কোডিং প্রয়োজন নেই। কাস্টম ডোমেইন, পেমেন্ট ইন্টিগ্রেশন এবং শক্তিশালী ড্যাশবোর্ড সহ একটি পেশাদার ই-কমার্স স্টোর পান।',
    startFree: 'ফ্রি শুরু করুন',
    viewPricing: 'মূল্য দেখুন',
    noCreditCard: 'কোনো ক্রেডিট কার্ড প্রয়োজন নেই • চিরকালের জন্য ফ্রি প্ল্যান',
    featuresTitle: 'অনলাইনে বিক্রি করতে যা যা দরকার',
    featuresSubtitle: 'আপনার ব্যবসা বাড়াতে শক্তিশালী ফিচার',
    pricingTitle: 'সহজ, স্বচ্ছ মূল্য',
    pricingSubtitle: 'ফ্রি শুরু করুন, প্রস্তুত হলে আপগ্রেড করুন',
    ctaTitle: 'আপনার অনলাইন ব্যবসা শুরু করতে প্রস্তুত?',
    ctaSubtitle: 'হাজার হাজার মার্চেন্ট যারা তাদের ই-কমার্স প্রয়োজনে Multi-Store-কে বিশ্বাস করে তাদের সাথে যোগ দিন।',
    ctaButton: 'আপনার ফ্রি স্টোর তৈরি করুন',
    perMonth: '/মাস',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    
    // Features
    feature1Title: 'আপনার নিজের স্টোর',
    feature1Desc: 'মিনিটের মধ্যে আপনার কাস্টম সাবডোমেইন সহ একটি পেশাদার অনলাইন স্টোর পান।',
    feature2Title: 'অতি দ্রুত',
    feature2Desc: 'বিশ্বব্যাপী তাৎক্ষণিক পেজ লোডের জন্য এজ কম্পিউটিং-এ নির্মিত।',
    feature3Title: 'নিরাপদ পেমেন্ট',
    feature3Desc: 'বিকাশ, নগদ, স্ট্রাইপ এবং ক্যাশ অন ডেলিভারি সহজেই গ্রহণ করুন।',
    feature4Title: 'অ্যানালিটিক্স ড্যাশবোর্ড',
    feature4Desc: 'রিয়েল-টাইমে সেলস, অর্ডার এবং কাস্টমার ইনসাইট ট্র্যাক করুন।',
    feature5Title: 'বাংলা + ইংরেজি',
    feature5Desc: 'আপনার বাংলাদেশী গ্রাহকদের জন্য সম্পূর্ণ দ্বিভাষিক সমর্থন।',
    feature6Title: '২৪/৭ সাপোর্ট',
    feature6Desc: 'আমরা যেকোনো সময় আপনাকে সফল হতে সাহায্য করতে এখানে আছি।',
    
    // Plans
    planFree: 'ফ্রি',
    planStarter: 'স্টার্টার',
    planPremium: 'প্রিমিয়াম',
    planFreeDesc: 'শুরু করার জন্য পারফেক্ট',
    planStarterDesc: 'বাড়তে থাকা ব্যবসার জন্য',
    planPremiumDesc: 'প্রতিষ্ঠিত স্টোরের জন্য',
    
    // Language
    language: 'ভাষা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    
    // Common
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    view: 'দেখুন',
    next: 'পরবর্তী',
    previous: 'পূর্ববর্তী',
    search: 'অনুসন্ধান',
    filter: 'ফিল্টার',
    sort: 'সাজান',
    all: 'সব',
    none: 'কোনোটি না',
    yes: 'হ্যাঁ',
    no: 'না',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Get translation for a key
 */
export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}

/**
 * Create a translator function for a specific language
 */
export function createTranslator(lang: Language) {
  return (key: TranslationKey): string => t(key, lang);
}

/**
 * Get language config by code
 */
export function getLanguageConfig(code: Language): LanguageConfig | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

/**
 * Check if a language code is valid
 */
export function isValidLanguage(code: string): code is Language {
  return LANGUAGES.some(lang => lang.code === code);
}

/**
 * Get language from URL search params
 */
export function getLanguageFromUrl(url: string): Language {
  try {
    const urlObj = new URL(url);
    const lang = urlObj.searchParams.get('lang');
    if (lang && isValidLanguage(lang)) {
      return lang;
    }
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Add language param to URL
 */
export function addLanguageToUrl(url: string, lang: Language): string {
  try {
    const urlObj = new URL(url, 'http://localhost');
    urlObj.searchParams.set('lang', lang);
    return urlObj.pathname + urlObj.search;
  } catch {
    return `${url}?lang=${lang}`;
  }
}

/**
 * Storage key for language preference
 */
export const LANGUAGE_STORAGE_KEY = 'preferred-language';

