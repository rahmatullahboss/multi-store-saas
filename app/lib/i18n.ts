/**
 * Internationalization (i18n) Utility
 * 
 * Provides translation support for Bengali and English languages.
 * Used throughout the dashboard for localized labels and messages.
 */

export type Language = 'en' | 'bn';

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.inventory': 'Inventory',
    'nav.orders': 'Orders',
    'nav.analytics': 'Analytics',
    'nav.discounts': 'Discounts',
    'nav.shipping': 'Shipping',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.orders': 'Orders',
    'dashboard.products': 'Products',
    'dashboard.customers': 'Customers',

    // Products
    'products.title': 'Products',
    'products.add': 'Add Product',
    'products.edit': 'Edit Product',
    'products.delete': 'Delete',
    'products.save': 'Save',
    'products.cancel': 'Cancel',
    'products.name': 'Product Name',
    'products.price': 'Price',
    'products.stock': 'Stock',
    'products.category': 'Category',
    'products.status': 'Status',
    'products.published': 'Published',
    'products.draft': 'Draft',

    // Inventory
    'inventory.title': 'Inventory',
    'inventory.lowStock': 'Low Stock',
    'inventory.outOfStock': 'Out of Stock',
    'inventory.import': 'Import CSV',
    'inventory.export': 'Export CSV',
    'inventory.updateStock': 'Update Stock',

    // Orders
    'orders.title': 'Orders',
    'orders.pending': 'Pending',
    'orders.processing': 'Processing',
    'orders.shipped': 'Shipped',
    'orders.delivered': 'Delivered',
    'orders.cancelled': 'Cancelled',
    'orders.viewDetails': 'View Details',

    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.apply': 'Apply',
    'common.clear': 'Clear',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  bn: {
    // Navigation
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.products': 'পণ্য',
    'nav.inventory': 'ইনভেন্টরি',
    'nav.orders': 'অর্ডার',
    'nav.analytics': 'বিশ্লেষণ',
    'nav.discounts': 'ছাড়',
    'nav.shipping': 'শিপিং',
    'nav.settings': 'সেটিংস',
    'nav.logout': 'লগআউট',

    // Dashboard
    'dashboard.title': 'ড্যাশবোর্ড',
    'dashboard.welcome': 'স্বাগতম',
    'dashboard.totalSales': 'মোট বিক্রয়',
    'dashboard.orders': 'অর্ডার',
    'dashboard.products': 'পণ্য',
    'dashboard.customers': 'গ্রাহক',

    // Products
    'products.title': 'পণ্য',
    'products.add': 'পণ্য যোগ করুন',
    'products.edit': 'পণ্য সম্পাদনা',
    'products.delete': 'মুছুন',
    'products.save': 'সংরক্ষণ',
    'products.cancel': 'বাতিল',
    'products.name': 'পণ্যের নাম',
    'products.price': 'মূল্য',
    'products.stock': 'স্টক',
    'products.category': 'বিভাগ',
    'products.status': 'অবস্থা',
    'products.published': 'প্রকাশিত',
    'products.draft': 'খসড়া',

    // Inventory
    'inventory.title': 'ইনভেন্টরি',
    'inventory.lowStock': 'স্টক কম',
    'inventory.outOfStock': 'স্টক নেই',
    'inventory.import': 'CSV আমদানি',
    'inventory.export': 'CSV রপ্তানি',
    'inventory.updateStock': 'স্টক আপডেট',

    // Orders
    'orders.title': 'অর্ডার',
    'orders.pending': 'অপেক্ষমান',
    'orders.processing': 'প্রক্রিয়াধীন',
    'orders.shipped': 'শিপ করা হয়েছে',
    'orders.delivered': 'বিতরণ করা হয়েছে',
    'orders.cancelled': 'বাতিল',
    'orders.viewDetails': 'বিস্তারিত দেখুন',

    // Common
    'common.search': 'অনুসন্ধান',
    'common.filter': 'ফিল্টার',
    'common.apply': 'প্রয়োগ',
    'common.clear': 'পরিষ্কার',
    'common.loading': 'লোড হচ্ছে...',
    'common.noResults': 'কোন ফলাফল পাওয়া যায়নি',
    'common.save': 'সংরক্ষণ',
    'common.cancel': 'বাতিল',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা',
    'common.view': 'দেখুন',
    'common.back': 'পিছনে',
    'common.next': 'পরবর্তী',
    'common.previous': 'আগের',
  },
};

/**
 * Get translated text for a given key
 */
export function t(key: string, lang: Language = 'en'): string {
  return translations[lang][key] || translations['en'][key] || key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(lang: Language): Record<string, string> {
  return translations[lang] || translations['en'];
}

/**
 * Check if a language is supported
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'en' || lang === 'bn';
}

/**
 * Get language display name
 */
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    bn: 'বাংলা',
  };
  return names[lang] || 'English';
}

/**
 * Available languages for selection
 */
export const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];
