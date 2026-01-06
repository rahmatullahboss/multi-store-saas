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
    noAccount: "Don't have an account?",
    stepAccount: 'Account',
    stepBusiness: 'Business',
    stepPlan: 'Plan',
    stepSetup: 'Setup',
    stepDone: 'Done',
    
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
    selected: 'Selected',
    selectPlan: 'Select Plan',
    
    // Checkout
    paymentSuccessful: 'Payment Successful!',
    thankYouOrder: 'Thank you for your order. Your payment has been confirmed.',
    orderDetails: 'Order Details',
    
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
    
    // Landing Page - Trust Badges
    freeDelivery: 'Free Delivery',
    freeDeliveryInDhaka: 'Free delivery in Dhaka',
    originalProduct: 'Original Product',
    originalGuarantee: '100% Original Guarantee',
    payOnReceive: 'Pay when you receive the product',
    easyReturn: 'Easy Return',
    returnPolicy: '7 Days Return Policy',
    
    // Landing Page - Why Choose Us
    whyChooseUs: 'Why Buy From Us?',
    weEnsureSatisfaction: 'We ensure satisfaction for every customer',
    premiumQuality: 'Premium Quality',
    premiumQualityDesc: 'We only supply high quality products. Every product goes through strict quality control.',
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: '24 hours in Dhaka and 2-3 business days outside Dhaka, right to your doorstep.',
    support247: '24/7 Support',
    support247Desc: 'Our customer service team is always here to help you with any issues.',
    
    // Landing Page - Product Features
    productFeatures: 'Product Features',
    whyThisProductSpecial: 'Why this product is special',
    
    // Landing Page - Video Section
    watchInVideo: 'Watch in Video',
    watchVideoDetails: 'Watch the video for details',
    
    // Landing Page - How to Order
    howToOrder: 'How to Order?',
    justThreeSteps: 'Just 3 easy steps',
    stepOne: 'Click Order Button',
    stepOneDesc: 'Click the "Order Now" button below to open the order form.',
    stepTwo: 'Provide Information',
    stepTwoDesc: 'Enter your name, mobile number and full address.',
    stepThree: 'Receive Delivery',
    stepThreeDesc: 'Receive the product and pay cash on delivery.',
    
    // Landing Page - Testimonials
    customerReviews: 'Customer Reviews',
    seeWhatTheySay: 'See what they say',
    satisfiedCustomer: 'Satisfied Customer',
    
    // Landing Page - Delivery Info
    deliveryInfo: 'Delivery Information',
    whenWillYouGet: 'When will you get your product',
    insideDhaka: 'Inside Dhaka',
    within24Hours: 'Within 24 hours',
    deliveryCharge: 'Delivery charge',
    onTimeDelivery: 'On-time delivery',
    outsideDhaka: 'Outside Dhaka',
    twoToThreeDays: '2-3 business days',
    courierService: 'Courier service',
    nationwideDelivery: 'Nationwide delivery',
    
    // Landing Page - FAQ
    faq: 'FAQ',
    yourQuestionAnswers: 'Answers to your questions',
    faqDeliveryQ: 'How long will delivery take?',
    faqDeliveryA: 'Delivery within 24 hours in Dhaka and 2-3 business days outside Dhaka.',
    faqPaymentQ: 'How do I pay?',
    faqPaymentA: 'Cash on delivery available. You can pay when you receive the product. bKash/Nagad payment also available.',
    faqOriginalQ: 'Is the product original?',
    faqOriginalA: 'Yes, we guarantee 100% original product. Full refund if fake product.',
    faqReturnQ: 'What is the return policy?',
    faqReturnA: 'You can return/exchange within 7 days if there is any problem with the product.',
    faqChargeQ: 'What is the delivery charge?',
    faqChargeA: '60 BDT in Dhaka and 120 BDT outside Dhaka. Free delivery on special offers.',
    faqConfirmQ: 'How will I get order confirmation?',
    faqConfirmA: "After ordering, our team will call you to confirm the order.",
    
    // Landing Page - Guarantee
    ourGuarantee: 'Our Guarantee',
    guaranteeDesc: 'We are committed to ensuring your satisfaction. If there is any problem with the product, we will refund the full amount or send a new product.',
    
    // Landing Page - Final CTA
    whyDelay: 'Why Delay?',
    limitedTimeOffer: 'This special offer is for a limited time!',
    specialPrice: 'Special price:',
    orderNowBtn: 'Order Now',
    
    // Landing Page - Contact
    callUs: 'Call Us',
    callHours: '10 AM - 10 PM',
    messageUs: 'Message Us',
    viaMessenger: 'Facebook/WhatsApp',
    emailUs: 'Email Us',
    replyIn24Hours: 'Reply within 24 hours',
    
    // Landing Page - Order Form
    orderFormTitle: 'Order Now',
    fillFormWeContact: 'Fill out the form, we will contact you soon',
    orderComplete: 'Order Complete!',
    orderNumberLabel: 'Order Number:',
    teamWillContact: 'Our team will contact you soon.',
    newOrder: 'New Order',
    selectQuantity: 'Select Quantity',
    totalPrice: 'Total price',
    deliveryInfoTitle: 'Delivery Info',
    yourNameLabel: 'Your Name *',
    enterFullName: 'Enter full name',
    mobileNumberLabel: 'Mobile Number *',
    shippingAddressLabel: 'Shipping Address *',
    requiredField: '(Required)',
    addressPlaceholder: 'House No, Street, Area, Thana, District - Full address',
    addressHelp: 'Correct address needed to deliver product',
    confirmOrderBtn: 'Confirm Order',
    pleaseWait: 'Please wait...',
    infoSecure: 'Your information is completely safe and confidential',
    discount: 'discount',
    youSave: 'You save',
    getting: 'Getting',
    
    // Footer
    allRightsReserved: 'All rights reserved',
    
    // Onboarding Setup Progress
    creatingYourStore: 'Creating your store...',
    aiNamingStore: 'AI is naming your store...',
    addingDemoProduct: 'Adding demo product...',
    designingLandingPage: 'Designing landing page...',
    almostDone: 'Almost done!',
    somethingWentWrong: 'Something went wrong!',
    goToDashboard: 'Go to Dashboard',
    
    // Business Categories
    categoryFashion: 'Fashion & Clothing',
    categoryElectronics: 'Electronics',
    categoryBeauty: 'Beauty & Health',
    categoryFood: 'Food & Grocery',
    categoryHome: 'Home & Living',
    categoryServices: 'Services',
    categoryOther: 'Other',
    
    // Form Labels
    storeName: 'Store Name',
    subdomain: 'Subdomain',
    subdomainHelp: 'Only lowercase letters, numbers, and hyphens',
    aiHelpTip: 'The more details you provide, the better AI can set up your store!',
    upgradeAnytime: 'You can upgrade anytime from your dashboard',
    createMyStore: 'Create My Store',
    termsAgree: 'By continuing, you agree to our Terms of Service and Privacy Policy',
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
    noAccount: 'একাউন্ট নেই?',
    stepAccount: 'একাউন্ট',
    stepBusiness: 'বিজনেস',
    stepPlan: 'প্ল্যান',
    stepSetup: 'সেটআপ',
    stepDone: 'সম্পন্ন',
    
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
    selected: 'সিলেক্টেড',
    selectPlan: 'প্ল্যান সিলেক্ট করুন',
    
    // Checkout
    paymentSuccessful: 'পেমেন্ট সফল হয়েছে!',
    thankYouOrder: 'আপনার অর্ডারের জন্য ধন্যবাদ। পেমেন্ট কনফার্ম হয়েছে।',
    orderDetails: 'অর্ডার বিবরণ',
    
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
    
    // Landing Page - Trust Badges
    freeDelivery: 'ফ্রি ডেলিভারি',
    freeDeliveryInDhaka: 'ঢাকায় ফ্রি ডেলিভারি',
    originalProduct: 'অরিজিনাল প্রোডাক্ট',
    originalGuarantee: '১০০% অরিজিনাল গ্যারান্টি',
    payOnReceive: 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন',
    easyReturn: 'ইজি রিটার্ন',
    returnPolicy: '৭ দিনের রিটার্ন পলিসি',
    
    // Landing Page - Why Choose Us
    whyChooseUs: 'কেন আমাদের থেকে কিনবেন?',
    weEnsureSatisfaction: 'আমরা প্রতিটি গ্রাহকের সন্তুষ্টি নিশ্চিত করি',
    premiumQuality: 'প্রিমিয়াম কোয়ালিটি',
    premiumQualityDesc: 'আমরা শুধুমাত্র উচ্চ মানের প্রোডাক্ট সরবরাহ করি। প্রতিটি প্রোডাক্ট কঠোর মান নিয়ন্ত্রণের মধ্য দিয়ে যায়।',
    fastDelivery: 'দ্রুত ডেলিভারি',
    fastDeliveryDesc: 'ঢাকায় ২৪ ঘন্টায় এবং ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে আপনার দোরগোড়ায় পৌঁছে দিই।',
    support247: '২৪/৭ সাপোর্ট',
    support247Desc: 'যেকোনো সমস্যায় আমাদের কাস্টমার সার্ভিস টিম সবসময় আপনার পাশে থাকবে।',
    
    // Landing Page - Product Features
    productFeatures: 'প্রোডাক্টের বিশেষত্ব',
    whyThisProductSpecial: 'এই প্রোডাক্টটি কেন বিশেষ',
    
    // Landing Page - Video Section
    watchInVideo: 'ভিডিওতে দেখুন',
    watchVideoDetails: 'বিস্তারিত জানতে ভিডিওটি দেখুন',
    
    // Landing Page - How to Order
    howToOrder: 'কিভাবে অর্ডার করবেন?',
    justThreeSteps: 'মাত্র ৩টি সহজ ধাপে',
    stepOne: 'অর্ডার বাটনে ক্লিক করুন',
    stepOneDesc: 'নিচের "অর্ডার করুন" বাটনে ক্লিক করে অর্ডার ফর্ম ওপেন করুন।',
    stepTwo: 'তথ্য দিন',
    stepTwoDesc: 'আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা দিন।',
    stepThree: 'ডেলিভারি নিন',
    stepThreeDesc: 'পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে মূল্য পরিশোধ করুন।',
    
    // Landing Page - Testimonials
    customerReviews: 'গ্রাহকের মতামত',
    seeWhatTheySay: 'তারা কি বলছেন দেখুন',
    satisfiedCustomer: 'সন্তুষ্ট গ্রাহক',
    
    // Landing Page - Delivery Info
    deliveryInfo: 'ডেলিভারি তথ্য',
    whenWillYouGet: 'আপনার প্রোডাক্ট কবে পাবেন',
    insideDhaka: 'ঢাকার ভিতরে',
    within24Hours: '২৪ ঘন্টার মধ্যে',
    deliveryCharge: 'ডেলিভারি চার্জ',
    onTimeDelivery: 'সুনির্দিষ্ট সময়ে ডেলিভারি',
    outsideDhaka: 'ঢাকার বাইরে',
    twoToThreeDays: '২-৩ কার্যদিবস',
    courierService: 'কুরিয়ার সার্ভিস',
    nationwideDelivery: 'সারাদেশে ডেলিভারি',
    
    // Landing Page - FAQ
    faq: 'সাধারণ জিজ্ঞাসা',
    yourQuestionAnswers: 'আপনার প্রশ্নের উত্তর',
    faqDeliveryQ: 'ডেলিভারি কতদিনে পাব?',
    faqDeliveryA: 'ঢাকায় ২৪ ঘন্টা এবং ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে ডেলিভারি পাবেন।',
    faqPaymentQ: 'পেমেন্ট কিভাবে করব?',
    faqPaymentA: 'ক্যাশ অন ডেলিভারি সুবিধা আছে। পণ্য হাতে পেয়ে টাকা পরিশোধ করতে পারবেন। এছাড়া বিকাশ/নগদ পেমেন্টও করতে পারবেন।',
    faqOriginalQ: 'প্রোডাক্ট অরিজিনাল কিনা?',
    faqOriginalA: 'হ্যাঁ, আমরা ১০০% অরিজিনাল প্রোডাক্টের গ্যারান্টি দিই। নকল প্রোডাক্ট পেলে সম্পূর্ণ টাকা ফেরত।',
    faqReturnQ: 'রিটার্ন পলিসি কি?',
    faqReturnA: 'পণ্যে কোনো সমস্যা থাকলে ৭ দিনের মধ্যে রিটার্ন/এক্সচেঞ্জ করতে পারবেন।',
    faqChargeQ: 'ডেলিভারি চার্জ কত?',
    faqChargeA: 'ঢাকায় ৳৬০ এবং ঢাকার বাইরে ৳১২০। বিশেষ অফারে ফ্রি ডেলিভারিও থাকে।',
    faqConfirmQ: 'অর্ডার কনফার্মেশন পাব কিভাবে?',
    faqConfirmA: 'অর্ডার করার পর আমাদের টিম ফোনে কল করে অর্ডার কনফার্ম করবে।',
    
    // Landing Page - Guarantee
    ourGuarantee: 'আমাদের গ্যারান্টি',
    guaranteeDesc: 'আমরা আপনার সন্তুষ্টি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ। প্রোডাক্টে কোনো সমস্যা থাকলে আমরা সম্পূর্ণ টাকা ফেরত দেব অথবা নতুন প্রোডাক্ট পাঠাব।',
    
    // Landing Page - Final CTA
    whyDelay: 'আর দেরি কেন?',
    limitedTimeOffer: 'এই বিশেষ অফার সীমিত সময়ের জন্য!',
    specialPrice: 'বিশেষ মূল্য:',
    orderNowBtn: 'এখনই অর্ডার করুন',
    
    // Landing Page - Contact
    callUs: 'কল করুন',
    callHours: 'সকাল ১০টা - রাত ১০টা',
    messageUs: 'ম্যাসেজ করুন',
    viaMessenger: 'ফেসবুক/হোয়াটসঅ্যাপে',
    emailUs: 'ইমেইল করুন',
    replyIn24Hours: '২৪ ঘন্টার মধ্যে উত্তর',
    
    // Landing Page - Order Form
    orderFormTitle: 'এখনই অর্ডার করুন',
    fillFormWeContact: 'ফর্মটি পূরণ করুন, আমরা শীঘ্রই যোগাযোগ করব',
    orderComplete: 'অর্ডার সম্পন্ন হয়েছে!',
    orderNumberLabel: 'অর্ডার নম্বর:',
    teamWillContact: 'শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।',
    newOrder: 'নতুন অর্ডার করুন',
    selectQuantity: 'পরিমাণ নির্বাচন করুন',
    totalPrice: 'মোট মূল্য',
    deliveryInfoTitle: 'ডেলিভারি তথ্য',
    yourNameLabel: 'আপনার নাম *',
    enterFullName: 'সম্পূর্ণ নাম লিখুন',
    mobileNumberLabel: 'মোবাইল নম্বর *',
    shippingAddressLabel: 'শিপিং ঠিকানা *',
    requiredField: '(আবশ্যক)',
    addressPlaceholder: 'বাড়ি নং, রাস্তা, এলাকা, থানা, জেলা - সম্পূর্ণ ঠিকানা দিন',
    addressHelp: 'পণ্য পৌঁছে দেওয়ার জন্য সঠিক ঠিকানা প্রয়োজন',
    confirmOrderBtn: 'অর্ডার কনফার্ম করুন',
    pleaseWait: 'অপেক্ষা করুন...',
    infoSecure: 'আপনার তথ্য সম্পূর্ণ নিরাপদ এবং গোপনীয়',
    discount: 'ছাড়',
    youSave: 'সেভ করছেন',
    getting: 'পাচ্ছেন',
    
    // Footer
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত',
    
    // Onboarding Setup Progress
    creatingYourStore: 'আপনার স্টোর তৈরি হচ্ছে...',
    aiNamingStore: 'AI আপনার স্টোরের নাম দিচ্ছে...',
    addingDemoProduct: 'ডেমো প্রোডাক্ট যোগ হচ্ছে...',
    designingLandingPage: 'ল্যান্ডিং পেজ ডিজাইন হচ্ছে...',
    almostDone: 'প্রায় শেষ!',
    somethingWentWrong: 'সমস্যা হয়েছে!',
    goToDashboard: 'ড্যাশবোর্ডে যান',
    
    // Business Categories
    categoryFashion: 'ফ্যাশন ও পোশাক',
    categoryElectronics: 'ইলেকট্রনিক্স',
    categoryBeauty: 'বিউটি ও স্বাস্থ্য',
    categoryFood: 'খাবার ও মুদি',
    categoryHome: 'হোম ও লিভিং',
    categoryServices: 'সার্ভিস',
    categoryOther: 'অন্যান্য',
    
    // Form Labels
    storeName: 'স্টোরের নাম',
    subdomain: 'সাবডোমেইন',
    subdomainHelp: 'শুধুমাত্র ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন',
    aiHelpTip: 'যত বেশি তথ্য দেবেন, AI তত ভালো আপনার স্টোর সেটআপ করতে পারবে!',
    upgradeAnytime: 'আপনি যেকোনো সময় ড্যাশবোর্ড থেকে আপগ্রেড করতে পারবেন',
    createMyStore: 'আমার স্টোর তৈরি করুন',
    termsAgree: 'চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের ব্যবহারের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন',
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

