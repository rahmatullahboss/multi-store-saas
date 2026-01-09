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

export const DEFAULT_LANGUAGE: Language = 'bn';

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
    settingUpStore: 'Setting up your store...',
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

    // Admin Panel - Common
    adminPanel: 'Admin Panel',
    store: 'Store',
    stores: 'Stores',
    action: 'Action',
    actions: 'Actions',
    status: 'Status',
    update: 'Update',
    created: 'Created',
    noResults: 'No results found',

    // Admin - Plan Management
    planManagement: 'Plan Management',
    planManagementDesc: 'Manually upgrade or downgrade store plans',
    searchStores: 'Search stores by name or subdomain...',
    currentPlan: 'Current Plan',
    freeStores: 'Free Stores',
    starterStores: 'Starter Stores',
    premiumStores: 'Premium Stores',
    planUpdatedSuccess: 'Plan updated successfully!',
    planNotes: 'Plan Management Notes',
    planFreeNote: 'Free: 10 products, landing page only, basic features',
    planStarterNote: 'Starter (৳999/mo): 50 products, full store mode, custom domain',
    planPremiumNote: 'Premium (৳2999/mo): 500 products, priority support, all features',
    plansEffectImmediate: 'Plans take effect immediately after update',

    // Admin - Payouts
    merchantPayouts: 'Merchant Payouts',
    exportCsv: 'Export CSV',
    totalMerchants: 'Total Merchants',
    totalSales: 'Total Sales',
    platformFee: 'Platform Fee',
    totalPayouts: 'Total Payouts',
    grossSales: 'Gross Sales',
    fee: 'Fee',
    netPayout: 'Net Payout',
    markPaid: 'Mark Paid',
    paid: 'Paid',
    pending: 'Pending',
    noMerchantsFound: 'No merchants found',
    orders: 'Orders',
    discounts: 'Discount Codes',

    // Admin - Domain Management  
    domainManagement: 'Domain Management',
    domainManagementDesc: 'Manage custom domains across all stores',
    totalDomains: 'Total Domains',
    activeSslReady: 'Active (SSL Ready)',
    pendingDnsSsl: 'Pending DNS/SSL',
    pendingRequests: 'Pending Requests',
    activeDomains: 'Active Domains',
    noActiveDomains: 'No active custom domains yet.',
    domain: 'Domain',
    plan: 'Plan',
    active: 'Active',
    cloudflareConnected: 'Cloudflare API Connected - Auto-provisioning enabled',
    cloudflareNotConfigured: 'Cloudflare API not configured - Manual approval mode',
    setCloudflareEnv: 'Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID in environment variables.',
    statusRefreshed: 'Status refreshed',
    domainRemoved: 'Domain removed',
    domainApproved: 'Domain approved!',
    requestRejected: 'Request rejected',

    // Dashboard
    dashboard: 'Dashboard',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    welcomeTo: 'Welcome to',
    dashboardSubtitle: "Here's what's happening with your store today.",
    viewStore: 'View Store',
    todaysSales: "Today's Sales",
    totalRevenue: 'Total Revenue',
    pendingOrders: 'Pending Orders',
    totalProducts: 'Total Products',
    vsYesterday: 'vs yesterday',
    salesOverview: 'Sales Overview',
    last7Days: 'Last 7 days',
    actionItems: 'Action Items',
    noActionItems: 'All caught up! No pending actions.',
    allCaughtUp: 'All caught up! 🎉',
    noPendingActions: 'No pending actions at the moment',
    searchProductsPlaceholder: 'Search by name, SKU, or category...',
    searchOrdersPlaceholder: 'Search by order #, customer, or phone...',
    clearFilters: 'Clear filters',
    noOrdersMatch: 'No orders match your filters.',
    manageOrders: 'View and manage customer orders',
    processing: 'Processing...',
    adLink: 'Ad Link',
    primary: 'Primary',
    lowStockAlert: 'Low Stock Alert',
    productsRunningLow: 'products running low on inventory',
    ordersNeedProcessing: 'orders need processing',
    cartsWaitingRecovery: 'carts waiting to be recovered',
    abandonedCarts: 'Abandoned Carts',
    recentOrders: 'Recent Orders',
    viewAll: 'View all',
    noRecentOrders: 'No orders yet',
    addProduct: 'Add Product',
    viewOrders: 'View Orders',
    analytics: 'Analytics',
    settings: 'Settings',
    today: 'Today',

    // Billing
    billing: 'Billing',
    billingHistory: 'Billing History',
    currentSubscription: 'Current Subscription',
    nextBillingDate: 'Next Billing Date',
    billingPaymentMethod: 'Payment Method',
    changePlan: 'Change Plan',
    cancelSubscription: 'Cancel Subscription',
    invoices: 'Invoices',
    downloadInvoice: 'Download Invoice',
    noBillingHistory: 'No billing history yet',

    // Products
    // Products
    productName: 'Product Name',
    productDescription: 'Product Description',
    productPrice: 'Product Price',
    productInventory: 'Inventory',
    productCategory: 'Category',
    productDetail: 'Product Detail',
    productImages: 'Product Images',

    // Actions & Labels
    addNewProduct: 'Add New Product',
    createProduct: 'Create Product',
    editProduct: 'Edit Product',
    updateProduct: 'Update Product',
    deleteProduct: 'Delete Product',
    productSaved: 'Product saved successfully!',
    productDeleted: 'Product deleted',

    // Status
    noProducts: 'No products yet',
    addYourFirstProduct: 'Add your first product to get started',
    lowStock: 'Low Stock',
    outOfStockLabel: 'Out of Stock',
    inStockLabel: 'In Stock',

    // New Additions
    backToProducts: 'Back to Products',
    productImage: 'Product Image',
    selectCategory: 'Select a category',
    stock: 'Stock',
    productTitle: 'Product Title',
    category: 'Category',

    // Orders
    orderId: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    backToOrders: 'Back to Orders',

    // Campaigns
    createCampaign: 'Create Campaign',
    campaignName: 'Campaign Name',
    saveAsDraft: 'Save as Draft',
    sendNow: 'Send Now',
    sendTo: 'Send to',
    emailContent: 'Email Content',

    orderCustomerName: 'Customer Name',

    // Billing & Upgrade
    backToBilling: 'Back to Billing',
    upgradePlan: 'Upgrade Your Plan',

    customerPhone: 'Customer Phone',
    customerAddress: 'Customer Address',
    orderShippingAddress: 'Shipping Address',
    orderItems: 'Order Items',
    orderNotes: 'Order Notes',
    updateStatus: 'Update Status',
    printInvoice: 'Print Invoice',
    noOrders: 'No orders yet',
    filterByStatus: 'Filter by status',
    allOrders: 'All Orders',
    processingOrders: 'Processing',
    shippedOrders: 'Shipped',
    deliveredOrders: 'Delivered',
    cancelledOrders: 'Cancelled',

    // Inventory
    inventory: 'Inventory',
    updateInventory: 'Update Inventory',
    bulkUpdate: 'Bulk Update',
    importInventory: 'Import Inventory',
    exportInventory: 'Export Inventory',
    stockLevel: 'Stock Level',
    lowStockThreshold: 'Low Stock Threshold',

    // Settings Common
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved!',
    cancelBtn: 'Cancel',
    deleteBtn: 'Delete',
    editBtn: 'Edit',
    addBtn: 'Add',
    removeBtn: 'Remove',
    uploadBtn: 'Upload',
    downloadBtn: 'Download',
    enableBtn: 'Enable',
    disableBtn: 'Disable',
    enabledStatus: 'Enabled',
    disabledStatus: 'Disabled',
    yesBtn: 'Yes',
    noBtn: 'No',
    confirmBtn: 'Confirm',
    backBtn: 'Back',
    nextBtn: 'Next',
    finishBtn: 'Finish',
    closeBtn: 'Close',
    openBtn: 'Open',
    copyBtn: 'Copy',
    copiedMsg: 'Copied!',
    shareBtn: 'Share',
    previewBtn: 'Preview',
    publishBtn: 'Publish',
    unpublishBtn: 'Unpublish',
    draftStatus: 'Draft',
    publishedStatus: 'Published',
    archivedStatus: 'Archived',

    // Store Settings
    storeSettings: 'Store Settings',
    storeNameLabel: 'Store Name',
    storeDescription: 'Store Description',
    storeLogo: 'Store Logo',
    storeFavicon: 'Favicon',
    storeCurrency: 'Currency',
    storeTheme: 'Theme',
    accentColor: 'Accent Color',
    fontFamily: 'Font Family',
    socialMedia: 'Social Media',
    businessInformation: 'Business Information',
    businessAddress: 'Business Address',
    businessPhone: 'Business Phone',
    businessEmail: 'Business Email',

    // Shipping Settings
    shippingSettings: 'Shipping Settings',
    insideDhakaRate: 'Inside Dhaka',
    outsideDhakaRate: 'Outside Dhaka',
    shippingCost: 'Shipping Cost',
    freeShippingAbove: 'Free Shipping Above',

    // Marketing
    campaigns: 'Campaigns',
    newCampaign: 'New Campaign',
    campaignStatus: 'Campaign Status',
    subscribers: 'Subscribers',
    totalSubscribers: 'Total Subscribers',
    reviewsSection: 'Reviews',
    reports: 'Reports',
    pendingReviews: 'Pending Reviews',
    approvedReviews: 'Approved Reviews',

    // Settings Pages
    domainSettings: 'Domain Settings',
    courierSettings: 'Courier Settings',
    shippingZones: 'Shipping Zones',
    seoSettings: 'SEO Settings',
    legalSettings: 'Legal Pages',
    teamSettings: 'Team Members',
    activityLogs: 'Activity Global Logs',
    homepageSettings: 'Homepage Strategy',
    landingSettings: 'Landing Page Settings',

    // Analytics
    analyticsOverview: 'Analytics Overview',
    salesAnalytics: 'Sales Analytics',
    trafficAnalytics: 'Traffic Analytics',
    conversionRate: 'Conversion Rate',
    averageOrderValue: 'Average Order Value',
    topProducts: 'Top Products',
    topCustomers: 'Top Customers',

    // Reports
    reportsPage: 'Reports',
    salesReport: 'Sales Report',
    ordersReport: 'Orders Report',
    customersReport: 'Customers Report',
    generateReport: 'Generate Report',
    dateRange: 'Date Range',

    // Additional Labels (non-duplicate)
    divisionLabel: 'Division',
    countryLabel: 'Country',
    dateLabel: 'Date',
    timeLabel: 'Time',
    amountLabel: 'Amount',
    totalLabel: 'Total',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
    shippingLabel: 'Shipping',
    taxLabel: 'Tax',
    imageLabel: 'Image',
    tagsLabel: 'Tags',

    // Validation Messages
    fieldRequired: 'This field is required',
    invalidEmailMsg: 'Please enter a valid email',
    invalidPhoneMsg: 'Please enter a valid phone number',
    minLengthMsg: 'Minimum length is',
    maxLengthMsg: 'Maximum length is',

    // Success/Error Messages
    successMsg: 'Success!',
    errorMsg: 'Error',
    tryAgainBtn: 'Try Again',
    changesApplied: 'Changes applied successfully',

    // bKash Payment - Onboarding
    bkashPayment: 'bKash Payment',
    sendMoneyTo: 'Send Money to this number',
    enterTrxId: 'Enter Transaction ID (TRX ID)',
    trxIdPlaceholder: 'e.g., TRX123ABC456',
    paymentPending: 'Payment Pending Verification',
    paymentVerified: 'Payment Verified',
    paymentRejected: 'Payment Rejected',
    afterSendMoney: 'After sending money, enter the TRX ID below',
    proceedWithFree: 'Continue with Free Plan',
    proceedWithPayment: 'I have paid, proceed',
    orContinueFree: 'Or continue with Free plan',

    // Admin - Pending Payments
    pendingPayments: 'Pending Payments',
    pendingPaymentsDesc: 'Stores with unverified bKash payments',
    noPendingPayments: 'No pending payments to verify',
    verifyPayment: 'Verify',
    rejectPayment: 'Reject',
    contactUser: 'Contact',
    downgradeToFree: 'Downgrade to Free',
    trxId: 'TRX ID',
    paymentPhone: 'Payment Phone',
    paymentAmount: 'Amount',
    submittedAt: 'Submitted',
    ownerEmail: 'Owner Email',
    verificationSuccess: 'Payment verified successfully!',
    rejectionSuccess: 'Payment rejected',
    downgradeSuccess: 'Store downgraded to Free plan',

    // Sidebar Navigation - Section Headers
    sidebarHome: 'Home',
    sidebarCatalog: 'Catalog',
    sidebarOrders: 'Orders',
    sidebarMarketing: 'Marketing',
    sidebarAnalytics: 'Analytics',
    sidebarSettings: 'Settings',
    sidebarAdmin: 'Admin',

    // Sidebar Navigation - Item Labels
    navDashboard: 'Dashboard',
    navProducts: 'Products',
    navInventory: 'Inventory',
    navDiscounts: 'Discounts',
    navAllOrders: 'All Orders',
    navAbandonedCarts: 'Abandoned Carts',
    navCampaigns: 'Campaigns',
    navSubscribers: 'Subscribers',
    navReviews: 'Reviews',
    navOverview: 'Overview',
    navReports: 'Reports',
    navStoreEditor: 'Store Editor',
    navStoreTemplates: 'Store Templates',
    navHomepage: 'Homepage',
    navShipping: 'Shipping',
    navDomain: 'Domain',
    navBilling: 'Billing',
    navAllSettings: 'All Settings',
    navPlanManagement: 'Plan Management',
    navPayouts: 'Payouts',
    navDomainRequests: 'Domain Requests',
    navTutorials: 'Tutorials',
    goToStore: 'Go to Store',

    // Store Language Settings
    storeLanguage: 'Store Language',
    storeLanguageDesc: 'Default language for your storefront',
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

    // Products
    backToProducts: 'প্রোডাক্ট ভিউতে ফিরে যান',
    addNewProduct: 'নতুন প্রোডাক্ট যোগ করুন',
    productImage: 'প্রোডাক্ট ছবি',
    selectCategory: 'ক্যাটেগরি সিলেক্ট করুন',
    stock: 'স্টক',
    productTitle: 'প্রোডাক্টের নাম',
    category: 'ক্যাটেগরি',
    productDetail: 'প্রোডাক্ট বিবরণ',
    createProduct: 'প্রোডাক্ট তৈরি করুন',
    editProduct: 'প্রোডাক্ট এডিট করুন',
    updateProduct: 'প্রোডাক্ট আপডেট করুন',
    outOfStockLabel: 'স্টক নেই',
    lowStockLabel: 'লো স্টক',

    // Orders & Campaigns
    backToOrders: 'অর্ডার তালিকায় ফিরুন',
    createCampaign: 'ক্যাম্পেইন তৈরি করুন',
    campaignName: 'ক্যাম্পেইনের নাম',
    saveAsDraft: 'ড্রাফট হিসেবে সংরক্ষণ করুন',
    sendNow: 'এখনই পাঠান',
    sendTo: 'পাঠান',
    emailContent: 'ইমেইল কন্টেন্ট',

    // Billing & Upgrade
    backToBilling: 'বিলিং এ ফিরুন',
    upgradePlan: 'প্ল্যান আপগ্রেড করুন',
    abandonedCarts: 'পরিত্যক্ত কার্ট',

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
    settingUpStore: 'আপনার স্টোর সেটআপ হচ্ছে...',
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

    // Admin Panel - Common
    adminPanel: 'অ্যাডমিন প্যানেল',
    store: 'স্টোর',
    stores: 'স্টোরসমূহ',
    action: 'অ্যাকশন',
    actions: 'অ্যাকশনসমূহ',
    status: 'স্ট্যাটাস',
    update: 'আপডেট',
    created: 'তৈরির তারিখ',
    noResults: 'কোনো ফলাফল পাওয়া যায়নি',

    // Admin - Plan Management
    planManagement: 'প্ল্যান ম্যানেজমেন্ট',
    planManagementDesc: 'ম্যানুয়ালি স্টোর প্ল্যান আপগ্রেড বা ডাউনগ্রেড করুন',
    searchStores: 'নাম বা সাবডোমেইন দিয়ে স্টোর খুঁজুন...',
    currentPlan: 'বর্তমান প্ল্যান',
    freeStores: 'ফ্রি স্টোর',
    starterStores: 'স্টার্টার স্টোর',
    premiumStores: 'প্রিমিয়াম স্টোর',
    planUpdatedSuccess: 'প্ল্যান সফলভাবে আপডেট হয়েছে!',
    planNotes: 'প্ল্যান ম্যানেজমেন্ট নোট',
    planFreeNote: 'ফ্রি: ১০টি প্রোডাক্ট, শুধুমাত্র ল্যান্ডিং পেজ, বেসিক ফিচার',
    planStarterNote: 'স্টার্টার (৳৯৯৯/মাস): ৫০টি প্রোডাক্ট, ফুল স্টোর মোড, কাস্টম ডোমেইন',
    planPremiumNote: 'প্রিমিয়াম (৳২৯৯৯/মাস): ৫০০টি প্রোডাক্ট, প্রায়োরিটি সাপোর্ট, সব ফিচার',
    plansEffectImmediate: 'আপডেটের পর প্ল্যান তাৎক্ষণিক কার্যকর হয়',

    // Admin - Payouts
    merchantPayouts: 'মার্চেন্ট পেআউট',
    exportCsv: 'CSV এক্সপোর্ট',
    totalMerchants: 'মোট মার্চেন্ট',
    totalSales: 'মোট বিক্রি',
    platformFee: 'প্ল্যাটফর্ম ফি',
    totalPayouts: 'মোট পেআউট',
    grossSales: 'গ্রস সেলস',
    fee: 'ফি',
    netPayout: 'নেট পেআউট',
    markPaid: 'পেইড হিসেবে চিহ্নিত করুন',
    paid: 'পেইড',
    pending: 'পেন্ডিং',
    noMerchantsFound: 'কোনো মার্চেন্ট পাওয়া যায়নি',
    orders: 'অর্ডার',
    discounts: 'ডিসকাউন্ট কোড',

    // Admin - Domain Management  
    domainManagement: 'ডোমেইন ম্যানেজমেন্ট',
    domainManagementDesc: 'সব স্টোরের কাস্টম ডোমেইন পরিচালনা করুন',
    totalDomains: 'মোট ডোমেইন',
    activeSslReady: 'সক্রিয় (SSL রেডি)',
    pendingDnsSsl: 'পেন্ডিং DNS/SSL',
    pendingRequests: 'পেন্ডিং রিকোয়েস্ট',
    activeDomains: 'সক্রিয় ডোমেইন',
    noActiveDomains: 'এখনো কোনো সক্রিয় কাস্টম ডোমেইন নেই।',
    domain: 'ডোমেইন',
    plan: 'প্ল্যান',
    active: 'সক্রিয়',
    cloudflareConnected: 'Cloudflare API কানেক্টেড - অটো-প্রভিশনিং চালু',
    cloudflareNotConfigured: 'Cloudflare API কনফিগার করা হয়নি - ম্যানুয়াল অ্যাপ্রুভাল মোড',
    setCloudflareEnv: 'Environment variables-এ CLOUDFLARE_API_TOKEN এবং CLOUDFLARE_ZONE_ID সেট করুন।',
    statusRefreshed: 'স্ট্যাটাস রিফ্রেশ হয়েছে',
    domainRemoved: 'ডোমেইন সরানো হয়েছে',
    domainApproved: 'ডোমেইন অনুমোদন হয়েছে!',
    requestRejected: 'রিকোয়েস্ট প্রত্যাখ্যান হয়েছে',

    // Dashboard
    dashboard: 'ড্যাশবোর্ড',
    goodMorning: 'সুপ্রভাত',
    goodAfternoon: 'শুভ অপরাহ্ণ',
    goodEvening: 'শুভ সন্ধ্যা',
    welcomeTo: 'স্বাগতম',
    dashboardSubtitle: 'আজ আপনার স্টোরে কি হচ্ছে দেখুন।',
    viewStore: 'স্টোর দেখুন',
    todaysSales: 'আজকের বিক্রি',
    totalRevenue: 'মোট আয়',
    pendingOrders: 'পেন্ডিং অর্ডার',
    totalProducts: 'মোট প্রোডাক্ট',
    vsYesterday: 'গতকালের তুলনায়',
    salesOverview: 'বিক্রির সারসংক্ষেপ',
    last7Days: 'শেষ ৭ দিন',
    actionItems: 'কাজের তালিকা',
    noActionItems: 'সব ঠিক আছে! কোনো পেন্ডিং কাজ নেই।',
    allCaughtUp: 'সব ঠিক আছে! 🎉',
    noPendingActions: 'এই মুহূর্তে কোন পেন্ডিং কাজ নেই',
    searchProductsPlaceholder: 'নাম, SKU, বা ক্যাটাগরি দিয়ে খুঁজুন...',
    searchOrdersPlaceholder: 'অর্ডার নম্বর, কাস্টমার বা ফোন দিয়ে খুঁজুন...',
    clearFilters: 'ফিল্টার মুছুন',
    noOrdersMatch: 'আপনার ফিল্টারের সাথে কোনো অর্ডার মিলছে না।',
    manageOrders: 'কাস্টমার অর্ডার দেখুন ও ম্যানেজ করুন',
    processing: 'প্রসেসিং...',
    adLink: 'অ্যাড লিংক',
    primary: 'প্রাইমারি',
    lowStockAlert: 'কম স্টক সতর্কতা',
    productsRunningLow: 'টি প্রোডাক্টে স্টক কম',
    ordersNeedProcessing: 'টি অর্ডার প্রসেস করতে হবে',
    cartsWaitingRecovery: 'টি কার্ট রিকভারির অপেক্ষায়',
    recentOrders: 'সাম্প্রতিক অর্ডার',
    viewAll: 'সব দেখুন',
    noRecentOrders: 'এখনো কোনো অর্ডার নেই',
    addProduct: 'প্রোডাক্ট যোগ করুন',
    viewOrders: 'অর্ডার দেখুন',
    analytics: 'অ্যানালিটিক্স',
    settings: 'সেটিংস',
    today: 'আজ',

    // Billing
    billing: 'বিলিং',
    billingHistory: 'বিলিং ইতিহাস',
    currentSubscription: 'বর্তমান সাবস্ক্রিপশন',
    nextBillingDate: 'পরবর্তী বিলিং তারিখ',
    billingPaymentMethod: 'পেমেন্ট পদ্ধতি',
    changePlan: 'প্ল্যান পরিবর্তন',
    cancelSubscription: 'সাবস্ক্রিপশন বাতিল',
    invoices: 'ইনভয়েস',
    downloadInvoice: 'ইনভয়েস ডাউনলোড',
    noBillingHistory: 'এখনো কোনো বিলিং ইতিহাস নেই',

    // Products
    productName: 'প্রোডাক্টের নাম',
    productDescription: 'প্রোডাক্টের বিবরণ',
    productPrice: 'প্রোডাক্টের দাম',
    productInventory: 'ইনভেন্টরি',
    productCategory: 'ক্যাটাগরি',
    productImages: 'প্রোডাক্টের ছবি',
    deleteProduct: 'প্রোডাক্ট মুছুন',
    productSaved: 'প্রোডাক্ট সেভ হয়েছে!',
    productDeleted: 'প্রোডাক্ট মুছে ফেলা হয়েছে',
    noProducts: 'এখনো কোনো প্রোডাক্ট নেই',
    addYourFirstProduct: 'শুরু করতে প্রথম প্রোডাক্ট যোগ করুন',
    lowStock: 'কম স্টক',
    inStockLabel: 'স্টকে আছে',

    // Orders
    orderId: 'অর্ডার নম্বর',
    orderDate: 'অর্ডারের তারিখ',
    orderStatus: 'অর্ডারের স্ট্যাটাস',
    orderTotal: 'অর্ডার মোট',
    orderCustomerName: 'কাস্টমারের নাম',
    customerPhone: 'কাস্টমারের ফোন',
    customerAddress: 'কাস্টমারের ঠিকানা',
    orderShippingAddress: 'শিপিং ঠিকানা',
    orderItems: 'অর্ডার আইটেম',
    orderNotes: 'অর্ডার নোট',
    updateStatus: 'স্ট্যাটাস আপডেট',
    printInvoice: 'ইনভয়েস প্রিন্ট',
    noOrders: 'এখনো কোনো অর্ডার নেই',
    filterByStatus: 'স্ট্যাটাস অনুযায়ী ফিল্টার',
    allOrders: 'সব অর্ডার',
    processingOrders: 'প্রসেসিং',
    shippedOrders: 'শিপড',
    deliveredOrders: 'ডেলিভার্ড',
    cancelledOrders: 'বাতিল',

    // Inventory
    inventory: 'ইনভেন্টরি',
    updateInventory: 'ইনভেন্টরি আপডেট',
    bulkUpdate: 'বাল্ক আপডেট',
    importInventory: 'ইনভেন্টরি ইমপোর্ট',
    exportInventory: 'ইনভেন্টরি এক্সপোর্ট',
    stockLevel: 'স্টক লেভেল',
    lowStockThreshold: 'কম স্টক থ্রেশহোল্ড',

    // Settings Common
    saveChanges: 'পরিবর্তন সংরক্ষণ',
    saving: 'সংরক্ষণ হচ্ছে...',
    saved: 'সংরক্ষিত!',
    cancelBtn: 'বাতিল',
    deleteBtn: 'মুছুন',
    editBtn: 'সম্পাদনা',
    addBtn: 'যোগ করুন',
    removeBtn: 'সরান',
    uploadBtn: 'আপলোড',
    downloadBtn: 'ডাউনলোড',
    enableBtn: 'চালু করুন',
    disableBtn: 'বন্ধ করুন',
    enabledStatus: 'চালু',
    disabledStatus: 'বন্ধ',
    yesBtn: 'হ্যাঁ',
    noBtn: 'না',
    confirmBtn: 'নিশ্চিত করুন',
    backBtn: 'পেছনে',
    nextBtn: 'পরবর্তী',
    finishBtn: 'শেষ করুন',
    closeBtn: 'বন্ধ করুন',
    openBtn: 'খুলুন',
    copyBtn: 'কপি',
    copiedMsg: 'কপি হয়েছে!',
    shareBtn: 'শেয়ার',
    previewBtn: 'প্রিভিউ',
    publishBtn: 'প্রকাশ করুন',
    unpublishBtn: 'প্রকাশ বাতিল',
    draftStatus: 'ড্রাফট',
    publishedStatus: 'প্রকাশিত',
    archivedStatus: 'আর্কাইভড',

    // Store Settings
    storeSettings: 'স্টোর সেটিংস',
    storeNameLabel: 'স্টোরের নাম',
    storeDescription: 'স্টোরের বিবরণ',
    storeLogo: 'স্টোর লোগো',
    storeFavicon: 'ফ্যাভিকন',
    storeCurrency: 'মুদ্রা',
    storeTheme: 'থিম',
    accentColor: 'অ্যাকসেন্ট রং',
    fontFamily: 'ফন্ট ফ্যামিলি',
    socialMedia: 'সোশ্যাল মিডিয়া',
    businessInformation: 'ব্যবসায়িক তথ্য',
    businessAddress: 'ব্যবসায়ের ঠিকানা',
    businessPhone: 'ব্যবসায়ের ফোন',
    businessEmail: 'ব্যবসায়ের ইমেইল',

    // Shipping Settings
    shippingSettings: 'শিপিং সেটিংস',
    insideDhakaRate: 'ঢাকার ভেতরে',
    outsideDhakaRate: 'ঢাকার বাইরে',
    shippingCost: 'শিপিং খরচ',
    freeShippingAbove: 'ফ্রি শিপিং',

    // Marketing
    campaigns: 'ক্যাম্পেইন',
    newCampaign: 'নতুন ক্যাম্পেইন',
    campaignStatus: 'ক্যাম্পেইন স্ট্যাটাস',
    subscribers: 'সাবস্ক্রাইবার',
    totalSubscribers: 'মোট সাবস্ক্রাইবার',
    reviewsSection: 'রিভিউ',
    pendingReviews: 'পেন্ডিং রিভিউ',
    approvedReviews: 'অনুমোদিত রিভিউ',
    reports: 'রিপোর্ট',

    // Settings Pages
    courierSettings: 'কুরিয়ার সেটিংস',
    shippingZones: 'শিপিং জোন',
    domainSettings: 'ডোমেইন সেটিংস',
    seoSettings: 'SEO সেটিংস',
    legalSettings: 'লিগ্যাল পেজ',
    teamSettings: 'টিম মেম্বারস',
    activityLogs: 'অ্যাক্টিভিটি লগ',
    homepageSettings: 'হোমপেজ সেটিংস',
    landingSettings: 'ল্যান্ডিং স্টাইল',

    // Analytics
    analyticsOverview: 'অ্যানালিটিক্স সারসংক্ষেপ',
    salesAnalytics: 'বিক্রি অ্যানালিটিক্স',
    trafficAnalytics: 'ট্রাফিক অ্যানালিটিক্স',
    conversionRate: 'রূপান্তর হার',
    averageOrderValue: 'গড় অর্ডার মূল্য',
    topProducts: 'শীর্ষ প্রোডাক্ট',
    topCustomers: 'শীর্ষ কাস্টমার',

    // Reports
    reportsPage: 'রিপোর্ট',
    salesReport: 'বিক্রি রিপোর্ট',
    ordersReport: 'অর্ডার রিপোর্ট',
    customersReport: 'কাস্টমার রিপোর্ট',
    generateReport: 'রিপোর্ট তৈরি করুন',
    dateRange: 'তারিখের সীমা',

    // Additional Labels
    divisionLabel: 'বিভাগ',
    countryLabel: 'দেশ',
    dateLabel: 'তারিখ',
    timeLabel: 'সময়',
    amountLabel: 'পরিমাণ',
    totalLabel: 'মোট',
    subtotalLabel: 'সাবটোটাল',
    discountLabel: 'ছাড়',
    shippingLabel: 'শিপিং',
    taxLabel: 'ট্যাক্স',
    imageLabel: 'ছবি',
    tagsLabel: 'ট্যাগ',

    // Validation Messages
    fieldRequired: 'এই ফিল্ড আবশ্যক',
    invalidEmailMsg: 'সঠিক ইমেইল দিন',
    invalidPhoneMsg: 'সঠিক ফোন নম্বর দিন',
    minLengthMsg: 'ন্যূনতম দৈর্ঘ্য',
    maxLengthMsg: 'সর্বোচ্চ দৈর্ঘ্য',

    // Success/Error Messages
    successMsg: 'সফল!',
    errorMsg: 'ত্রুটি',
    tryAgainBtn: 'আবার চেষ্টা করুন',
    changesApplied: 'পরিবর্তন প্রয়োগ হয়েছে',

    // bKash Payment - Onboarding
    bkashPayment: 'বিকাশ পেমেন্ট',
    sendMoneyTo: 'এই নম্বরে Send Money করুন',
    enterTrxId: 'ট্রানজেকশন আইডি (TRX ID) দিন',
    trxIdPlaceholder: 'যেমন: TRX123ABC456',
    paymentPending: 'পেমেন্ট ভেরিফিকেশন পেন্ডিং',
    paymentVerified: 'পেমেন্ট ভেরিফাইড',
    paymentRejected: 'পেমেন্ট রিজেক্টেড',
    afterSendMoney: 'Send Money করার পর নিচে TRX ID দিন',
    proceedWithFree: 'ফ্রি প্ল্যানে চালিয়ে যান',
    proceedWithPayment: 'পেমেন্ট করেছি, চালিয়ে যান',
    orContinueFree: 'অথবা ফ্রি প্ল্যানে চালিয়ে যান',

    // Admin - Pending Payments
    pendingPayments: 'পেন্ডিং পেমেন্টস',
    pendingPaymentsDesc: 'আনভেরিফাইড বিকাশ পেমেন্ট সহ স্টোর',
    noPendingPayments: 'কোনো পেন্ডিং পেমেন্ট নেই',
    verifyPayment: 'ভেরিফাই',
    rejectPayment: 'রিজেক্ট',
    contactUser: 'যোগাযোগ',
    downgradeToFree: 'ফ্রিতে ডাউনগ্রেড',
    trxId: 'TRX ID',
    paymentPhone: 'পেমেন্ট ফোন',
    paymentAmount: 'পরিমাণ',
    submittedAt: 'সাবমিট সময়',
    ownerEmail: 'মালিকের ইমেইল',
    verificationSuccess: 'পেমেন্ট সফলভাবে ভেরিফাই হয়েছে!',
    rejectionSuccess: 'পেমেন্ট রিজেক্ট হয়েছে',
    downgradeSuccess: 'স্টোর ফ্রি প্ল্যানে ডাউনগ্রেড হয়েছে',

    // Sidebar Navigation - Section Headers
    sidebarHome: 'হোম',
    sidebarCatalog: 'ক্যাটালগ',
    sidebarOrders: 'অর্ডার',
    sidebarMarketing: 'মার্কেটিং',
    sidebarAnalytics: 'অ্যানালিটিক্স',
    sidebarSettings: 'সেটিংস',
    sidebarAdmin: 'অ্যাডমিন',

    // Sidebar Navigation - Item Labels
    navDashboard: 'ড্যাশবোর্ড',
    navProducts: 'পণ্য',
    navInventory: 'ইনভেন্টরি',
    navDiscounts: 'ছাড়',
    navAllOrders: 'সব অর্ডার',
    navAbandonedCarts: 'পরিত্যক্ত কার্ট',
    navCampaigns: 'ক্যাম্পেইন',
    navSubscribers: 'সাবস্ক্রাইবার',
    navReviews: 'রিভিউ',
    navOverview: 'সারসংক্ষেপ',
    navReports: 'রিপোর্ট',
    navStoreEditor: 'স্টোর এডিটর',
    navStoreTemplates: 'স্টোর টেমপ্লেট',
    navHomepage: 'হোমপেজ',
    navShipping: 'শিপিং',
    navDomain: 'ডোমেইন',
    navBilling: 'বিলিং',
    navAllSettings: 'সব সেটিংস',
    navPlanManagement: 'প্ল্যান ম্যানেজমেন্ট',
    navPayouts: 'পেআউট',
    navDomainRequests: 'ডোমেইন রিকোয়েস্ট',
    navTutorials: 'টিউটোরিয়াল',
    goToStore: 'স্টোরে যান',

    // Store Language Settings
    storeLanguage: 'স্টোর ভাষা',
    storeLanguageDesc: 'আপনার স্টোরফ্রন্টের ডিফল্ট ভাষা',
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

