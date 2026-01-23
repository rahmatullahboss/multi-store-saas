/**
 * Translation System for Ozzyl
 * 
 * Provides English and Bengali translations for storefront UI
 */

export type SupportedLocale = 'en' | 'bn';

// Translation keys - all UI text that needs translation
export interface Translations {
  // Navigation
  home: string;
  allProducts: string;
  cart: string;
  
  // Products
  featuredProducts: string;
  products: string;
  product: string;
  noProductsFound: string;
  checkBackSoon: string;
  browseAllProducts: string;
  addToCart: string;
  adding: string;
  
  // Price & Discount
  off: string;
  
  // Order Form
  orderNow: string;
  orderForm: string;
  quantity: string;
  yourName: string;
  enterFullName: string;
  mobileNumber: string;
  fullAddress: string;
  houseStreetAreaCity: string;
  cashOnDelivery: string;
  payOnDelivery: string;
  confirmOrder: string;
  pleaseWait: string;
  
  // Order Success
  orderComplete: string;
  orderNumber: string;
  teamWillContact: string;
  close: string;
  
  // Footer
  quickLinks: string;
  categories: string;
  contact: string;
  aboutUs: string;
  allRightsReserved: string;
  poweredBy: string;
  contactNotSet: string;
  
  // Customer Section
  satisfiedCustomers: string;
  watchVideo: string;
  
  // Language/Currency
  language: string;
  currency: string;
  
  // Shop
  shopNow: string;
  shopByCategory: string;
}

// English translations
export const en: Translations = {
  // Navigation
  home: 'Home',
  allProducts: 'All Products',
  cart: 'Cart',
  
  // Products
  featuredProducts: 'Featured Products',
  products: 'products',
  product: 'product',
  noProductsFound: 'No products found',
  checkBackSoon: 'Check back soon for new arrivals!',
  browseAllProducts: 'Browse All Products',
  addToCart: 'Add to Cart',
  adding: 'Adding...',
  
  // Price & Discount
  off: 'OFF',
  
  // Order Form
  orderNow: 'Order Now',
  orderForm: 'Order Form',
  quantity: 'Quantity',
  yourName: 'Your Name',
  enterFullName: 'Enter full name',
  mobileNumber: 'Mobile Number',
  fullAddress: 'Full Address',
  houseStreetAreaCity: 'House No, Street, Area, City',
  cashOnDelivery: 'Cash on Delivery',
  payOnDelivery: 'Pay when you receive the product',
  confirmOrder: 'Confirm Order',
  pleaseWait: 'Please wait...',
  
  // Order Success
  orderComplete: 'Order Complete!',
  orderNumber: 'Order Number',
  teamWillContact: 'Our team will contact you soon.',
  close: 'Close',
  
  // Footer
  quickLinks: 'Quick Links',
  categories: 'Categories',
  contact: 'Contact',
  aboutUs: 'About Us',
  allRightsReserved: 'All rights reserved.',
  poweredBy: 'Powered by',
  contactNotSet: 'Contact info not set',
  
  // Customer Section
  satisfiedCustomers: 'Our Satisfied Customers',
  watchVideo: 'Watch Product Video',
  
  // Language/Currency
  language: 'Language',
  currency: 'Currency',
  
  // Shop
  shopNow: 'Shop Now',
  shopByCategory: 'Shop by Category',
};

// Bengali translations
export const bn: Translations = {
  // Navigation
  home: 'হোম',
  allProducts: 'সব পণ্য',
  cart: 'কার্ট',
  
  // Products
  featuredProducts: 'বিশেষ পণ্যসমূহ',
  products: 'টি পণ্য',
  product: 'টি পণ্য',
  noProductsFound: 'কোনো পণ্য পাওয়া যায়নি',
  checkBackSoon: 'শীঘ্রই নতুন পণ্য আসবে!',
  browseAllProducts: 'সব পণ্য দেখুন',
  addToCart: 'কার্টে যোগ করুন',
  adding: 'যোগ হচ্ছে...',
  
  // Price & Discount
  off: 'ছাড়',
  
  // Order Form
  orderNow: 'অর্ডার করুন',
  orderForm: 'অর্ডার ফর্ম',
  quantity: 'পরিমাণ',
  yourName: 'আপনার নাম',
  enterFullName: 'সম্পূর্ণ নাম লিখুন',
  mobileNumber: 'মোবাইল নম্বর',
  fullAddress: 'সম্পূর্ণ ঠিকানা',
  houseStreetAreaCity: 'বাড়ি নং, রাস্তা, এলাকা, শহর',
  cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
  payOnDelivery: 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন',
  confirmOrder: 'অর্ডার কনফার্ম করুন',
  pleaseWait: 'অপেক্ষা করুন...',
  
  // Order Success
  orderComplete: 'অর্ডার সম্পন্ন হয়েছে!',
  orderNumber: 'অর্ডার নম্বর',
  teamWillContact: 'শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।',
  close: 'বন্ধ করুন',
  
  // Footer
  quickLinks: 'দ্রুত লিংক',
  categories: 'ক্যাটাগরি',
  contact: 'যোগাযোগ',
  aboutUs: 'আমাদের সম্পর্কে',
  allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',
  poweredBy: 'পাওয়ার্ড বাই',
  contactNotSet: 'যোগাযোগের তথ্য দেয়া হয়নি',
  
  // Customer Section
  satisfiedCustomers: 'আমাদের সন্তুষ্ট গ্রাহক',
  watchVideo: 'পণ্যের ভিডিও দেখুন',
  
  // Language/Currency
  language: 'ভাষা',
  currency: 'মুদ্রা',
  
  // Shop
  shopNow: 'কিনুন',
  shopByCategory: 'ক্যাটাগরি অনুযায়ী কিনুন',
};

// Get translations for a locale
export function getTranslations(locale: SupportedLocale): Translations {
  return locale === 'bn' ? bn : en;
}
