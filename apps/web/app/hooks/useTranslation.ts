import { useState, useEffect } from 'react';

// Simple key-value translation
const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.customers': 'Customers',
    'nav.settings': 'Settings',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.totalOrders': 'Total Orders',
    'product.addNew': 'Add New Product',
    'order.status.pending': 'Pending',
    'order.status.confirmed': 'Confirmed',
    'order.status.shipped': 'Shipped',
    'order.status.delivered': 'Delivered',

    // Fallbacks for other strings
    'sidebarHome': 'Home',
    'sidebarOrders': 'Orders',
    'sidebarCustomers': 'Customers',
    'sidebarCatalog': 'Catalog',
    'sidebarOnlineStore': 'Online Store',
    'sidebarMarketing': 'Marketing',
    'sidebarSettings': 'Settings',
    'sidebarAdmin': 'Admin',
    'navTutorials': 'Tutorials',
    'navAllOrders': 'All Orders',
    'navAbandonedCarts': 'Abandoned Carts',
    'navInventory': 'Inventory',
    'navPages': 'Pages',
    'navDragDropBuilder': 'Drag & Drop Builder',
    'navTheme': 'Theme',
    'navCampaigns': 'Campaigns',
    'landingFinalCTA_aiAssistantName': 'AI Assistant',
    'navSubscribers': 'Subscribers',
    'navPushNotifications': 'Push Notifications',
    'navDiscounts': 'Discounts',
    'navReviews': 'Reviews',
    'navAnalytics': 'Analytics',
    'navGeneral': 'General',
    'navStorefront': 'Storefront',
    'navDomain': 'Domain',
    'navShipping': 'Shipping',
    'navPayments': 'Payments',
    'navPlanBilling': 'Plan & Billing',
    'navTeam': 'Team',
    'navPlanManagement': 'Plan Management',
    'navPayouts': 'Payouts',
    'navDomainRequests': 'Domain Requests',
    'goToStore': 'Go to Store',
    'upgrade': 'Upgrade',
    'logout': 'Logout',
    'shadowModeActive': 'Shadow Mode Active',
    'viewingAs': 'Viewing As',
    'exit': 'Exit',
  },
  bn: {
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.products': 'পণ্য',
    'nav.orders': 'অর্ডার',
    'nav.customers': 'গ্রাহক',
    'nav.settings': 'সেটিংস',
    'dashboard.totalRevenue': 'মোট আয়',
    'dashboard.totalOrders': 'মোট অর্ডার',
    'product.addNew': 'নতুন পণ্য যোগ করুন',
    'order.status.pending': 'অপেক্ষমান',
    'order.status.confirmed': 'নিশ্চিত',
    'order.status.shipped': 'পাঠানো হয়েছে',
    'order.status.delivered': 'ডেলিভারি দেওয়া হয়েছে',

    // Fallbacks for other strings
    'sidebarHome': 'হোম',
    'sidebarOrders': 'অর্ডার',
    'sidebarCustomers': 'গ্রাহক',
    'sidebarCatalog': 'ক্যাটালগ',
    'sidebarOnlineStore': 'অনলাইন স্টোর',
    'sidebarMarketing': 'মার্কেটিং',
    'sidebarSettings': 'সেটিংস',
    'sidebarAdmin': 'অ্যাডমিন',
    'navTutorials': 'টিউটোরিয়াল',
    'navAllOrders': 'সব অর্ডার',
    'navAbandonedCarts': 'পরিত্যক্ত কার্ট',
    'navInventory': 'ইনভেন্টরি',
    'navPages': 'পেজ',
    'navDragDropBuilder': 'ড্র্যাগ এন্ড ড্রপ বিল্ডার',
    'navTheme': 'থিম',
    'navCampaigns': 'ক্যাম্পেইন',
    'landingFinalCTA_aiAssistantName': 'AI অ্যাসিস্ট্যান্ট',
    'navSubscribers': 'সাবস্ক্রাইবার',
    'navPushNotifications': 'পুশ নোটিফিকেশন',
    'navDiscounts': 'ছাড়',
    'navReviews': 'রিভিউ',
    'navAnalytics': 'অ্যানালিটিক্স',
    'navGeneral': 'সাধারণ',
    'navStorefront': 'স্টোরফ্রন্ট',
    'navDomain': 'ডোমেইন',
    'navShipping': 'শিপিং',
    'navPayments': 'পেমেন্টস',
    'navPlanBilling': 'প্ল্যান ও বিলিং',
    'navTeam': 'টিম',
    'navPlanManagement': 'প্ল্যান ম্যানেজমেন্ট',
    'navPayouts': 'পেআউট',
    'navDomainRequests': 'ডোমেইন রিকোয়েস্ট',
    'goToStore': 'স্টোরে যান',
    'upgrade': 'আপগ্রেড',
    'logout': 'লগআউট',
    'shadowModeActive': 'শ্যাডো মোড সক্রিয়',
    'viewingAs': 'হিসাবে দেখা হচ্ছে',
    'exit': 'বাহির',
  }
};

type Language = 'en' | 'bn';

export function useTranslation() {
  const [lang, setLangState] = useState<Language>('bn');

  // Hydrate lang from localStorage on client side mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lang') as Language;
      if (stored === 'en' || stored === 'bn') {
        setLangState(stored);
      }

      const handleStorageChange = () => {
        const current = localStorage.getItem('lang') as Language;
        if (current === 'en' || current === 'bn') {
          setLangState(current);
        }
      };

      window.addEventListener('languagechange', handleStorageChange);
      return () => window.removeEventListener('languagechange', handleStorageChange);
    }
  }, []);

  const t = (key: string) => translations[lang][key as keyof typeof translations['en']] ?? key;

  const toggleLang = () => {
    const next = lang === 'en' ? 'bn' : 'en';
    setLangState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', next);
      window.dispatchEvent(new Event('languagechange'));
    }
  };

  return { t, lang, toggleLang };
}