(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/landing/utils/i18n/en/common.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "common",
    ()=>common
]);
const common = {
    // Navigation
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    // Common Actions
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    unauthorized: 'Unauthorized',
    storeNotFound: 'Store not found',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    retry: 'Retry',
    startOver: 'Start Over',
    back: 'Back',
    continueBtn: 'Continue',
    closeBtn: 'Close',
    openBtn: 'Open',
    copyBtn: 'Copy',
    copiedMsg: 'Copied!',
    shareBtn: 'Share',
    previewBtn: 'Preview',
    publishBtn: 'Publish',
    livePreview: 'Live Preview',
    refresh: 'Refresh',
    unpublishBtn: 'Unpublish',
    saveChanges: 'Save Changes',
    saveBtn: 'Save',
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
    done: 'Done',
    finishBtn: 'Finish',
    confirmBtn: 'Confirm',
    // Form & Labels
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    district: 'District',
    postalCode: 'Postal Code',
    notes: 'Order Notes',
    required: 'Required',
    yourName: 'Your Name',
    password: 'Password',
    emailAddress: 'Email Address',
    mobileNumber: 'Mobile Number',
    // Status
    enabledStatus: 'Enabled',
    disabledStatus: 'Disabled',
    draftStatus: 'Draft',
    publishedStatus: 'Published',
    archivedStatus: 'Archived',
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    active: 'Active',
    inactive: 'Inactive',
    // Validation
    fieldRequired: 'This field is required',
    invalidEmailMsg: 'Please enter a valid email',
    invalidPhoneMsg: 'Please enter a valid phone number',
    minLengthMsg: 'Minimum length is',
    maxLengthMsg: 'Maximum length is',
    validEmailRequired: 'Valid email required',
    passwordMinChars: 'Password must be at least 6 characters',
    nameRequired: 'Name required',
    validMobileRequired: 'Valid mobile number required (01XXXXXXXXX)',
    subdomainTaken: 'The subdomain "{{subdomain}}" is already taken. Please choose another one.',
    subdomainMinChars: 'Subdomain must be at least 3 characters',
    // Sidebar
    sidebarHome: 'Home',
    sidebarCatalog: 'Catalog',
    sidebarOrders: 'Orders',
    sidebarMarketing: 'Marketing',
    sidebarAnalytics: 'Analytics',
    sidebarSettings: 'Settings',
    sidebarAdmin: 'Admin',
    // Navigation Items
    navDashboard: 'Dashboard',
    navProducts: 'Products',
    navInventory: 'Inventory',
    navDiscounts: 'Discounts',
    navAllOrders: 'All Orders',
    allProducts: 'All Products',
    navAbandonedCarts: 'Abandoned Carts',
    navCampaigns: 'Campaigns',
    navAgent: 'AI Agent',
    navSubscribers: 'Subscribers',
    navReviews: 'Reviews',
    navOverview: 'Overview',
    navReports: 'Reports',
    navStoreEditor: 'Landing Builder (Legacy)',
    navStoreTemplates: 'Store Design',
    navPageBuilder: 'Landing Page Editor',
    navPageBuilderV2: 'New Landing Builder',
    navHomepage: 'Homepage Strategy',
    navShipping: 'Shipping',
    navDomain: 'Domain',
    navBilling: 'Billing',
    navCredits: 'AI Credits',
    navAllSettings: 'All Settings',
    navPlanManagement: 'Plan Management',
    navCustomers: 'Customers',
    navPayouts: 'Payouts',
    navDomainRequests: 'Domain Requests',
    navTutorials: 'Tutorials',
    goToStore: 'Go to Store',
    goToDashboard: 'Go to Dashboard',
    viewStore: 'View Store',
    addNewProduct: 'Add New Product',
    processingOrders: 'Processing Orders',
    shippedOrders: 'Shipped Orders',
    deliveredOrders: 'Delivered Orders',
    cancelledOrders: 'Cancelled Orders',
    ago: 'ago',
    minShort: 'min',
    hourShort: 'h',
    dayShort: 'd',
    view: 'View',
    shadowModeActive: 'Shadow Mode Active',
    exit: 'Exit',
    viewingAs: 'Viewing as',
    upgrade: 'Upgrade',
    templatePreviewMode: 'Template Preview Mode',
    templatePreviewDesc: 'You are viewing a preview of this template. Some features may be limited.',
    comingSoon: 'Coming Soon',
    storeUnderConstruction: 'This store is currently under construction.',
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    storeLanguage: 'Store Language',
    storeLanguageDesc: 'Default language for your storefront',
    // Onboarding
    creatingYourStore: 'Creating your store...',
    designingLandingPage: 'Designing your landing page...',
    almostDone: 'Almost done...',
    storeReady: 'Your store is ready!',
    createAccount: 'Create Account',
    businessInfo: 'Tell Us About Your Business',
    whatDoYouSell: 'What do you sell?',
    businessCategory: 'Business Category',
    choosePlan: 'Choose Your Plan',
    chooseStyle: 'Choose Your Style',
    alreadyHaveAccount: 'Already have an account?',
    emailAlreadyRegistered: 'Email already registered. Please login instead.',
    noAccount: "Don't have an account?",
    stepAccount: 'Account',
    stepBusiness: 'Business',
    stepPlan: 'Plan',
    stepSetup: 'Setup',
    stepDone: 'Done',
    // Business Categories
    categoryFashion: 'Fashion & Clothing',
    categoryElectronics: 'Electronics',
    categoryBeauty: 'Beauty & Health',
    categoryFood: 'Food & Grocery',
    categoryHome: 'Home & Living',
    categoryServices: 'Services',
    categoryOther: 'Other',
    // Activity Logs
    activityLogs: 'Activity Global Logs',
    activityLogsDesc: 'Track all actions in your store',
    filters: 'Filters',
    teamMember: 'Team Member',
    allMembers: 'All Members',
    actionType: 'Action Type',
    noActivityYet: 'No activity recorded yet',
    actionsAppearHere: 'Actions will appear here as they happen',
    system: 'System',
    justNow: 'just now',
    mAgo: 'm ago',
    hAgo: 'h ago',
    dAgo: 'd ago',
    details: 'Details',
    pageOf: 'Page {page} of {total}',
    page: 'Page',
    of: 'of',
    // Activity Actions
    staff_invited: 'Invited team member',
    staff_removed: 'Removed team member',
    invite_accepted: 'Joined team',
    invite_revoked: 'Revoked invitation',
    order_created: 'New order placed',
    order_updated: 'Updated order',
    order_cancelled: 'Cancelled order',
    order_status_update: 'Status changed',
    order_note_added: 'Note added',
    payment_update: 'Payment updated',
    product_created: 'Created product',
    product_updated: 'Updated product',
    product_deleted: 'Deleted product',
    stock_change: 'Stock adjusted',
    settings_updated: 'Updated settings',
    discount_created: 'Created discount',
    discount_updated: 'Updated discount',
    discount_deleted: 'Deleted discount',
    // Others
    allRightsReserved: 'All rights reserved',
    common_there: 'there',
    successMsg: 'Success!',
    errorMsg: 'Error',
    tryAgainBtn: 'Try Again',
    changesApplied: 'Changes applied successfully',
    somethingWentWrong: 'Something went wrong!',
    // Password Reset
    forgotPassword: 'Forgot Password?',
    enterEmailForReset: 'Enter your email address and we will send you a link to reset your password.',
    sendResetLink: 'Send Reset Link',
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    enterNewPassword: 'Enter a new password for your account.',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordResetSuccess: 'Password Reset Successful',
    loginNow: 'Login Now',
    // Auth / Registration
    createStoreIn30Sec: 'Create your store in 30 seconds',
    fullNameLabel: 'Your Name',
    fullNamePlaceholder: 'John Doe',
    storeNameLabel: 'Store Name',
    storeNamePlaceholder: 'My Awesome Store',
    storeUrlLabel: 'Store URL',
    useCustomSubdomainLabel: 'Use custom subdomain',
    subdomainPlaceholder: 'yourstore',
    subdomainHint: 'Only lowercase letters, numbers, and hyphens allowed. This will be your store\'s URL.',
    creatingStoreBtn: 'Creating your store...',
    createStoreBtn: 'Create Store',
    loginHere: 'Login here',
    freeToStart: 'Free to start',
    noCreditCardRequired: 'No credit card required',
    setupIn30Seconds: 'Setup in 30 seconds',
    // Errors
    nameMinLength: 'Name must be at least 2 characters',
    passwordMinLength6: 'Password must be at least 6 characters',
    subdomainMinLength: 'Subdomain must be at least 2 characters',
    subdomainInvalid: 'Subdomain must start and end with a letter or number',
    tooManyAttempts: 'Too many registration attempts. Please try again in an hour.',
    registrationFailed: 'Registration failed unexpectedly. Please try again.',
    registrationFailedGeneric: 'Registration failed. Please try again.',
    storeCreationFailed: 'Store creation failed. Please try again.',
    accountCreatedLoginFailed: 'Account created but login failed. Please try logging in.',
    aiCredits: 'AI Credits',
    manageCredits: 'Manage Credits',
    invalidCredentials: 'Invalid email or password',
    orContinueWith: 'Or continue with',
    continueWithGoogle: 'Continue with Google',
    pendingOrders: 'Pending Orders'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
const store = {
    // Store Core
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
    product: 'product',
    adding: 'Adding...',
    featuredProducts: 'Featured Products',
    checkBackSoon: 'Check back soon for new products',
    browseAllProducts: 'Browse All Products',
    sortNewest: 'Newest',
    sortPriceLowHigh: 'Price: Low to High',
    sortPriceHighLow: 'Price: High to Low',
    min: 'Min',
    max: 'Max',
    shopByCategory: 'Shop by Category',
    sku: 'SKU',
    stock: 'Stock',
    stockLevel: 'Stock Level',
    stockValue: 'Stock Value',
    productName: 'Product Name',
    productDescription: 'Product Description',
    productPrice: 'Product Price',
    productInventory: 'Inventory',
    productCategory: 'Category',
    productDetail: 'Product Detail',
    productImages: 'Product Images',
    lowStock: 'Low Stock',
    outOfStockLabel: 'Out of Stock',
    inStockLabel: 'In Stock',
    noProducts: 'No products yet',
    addYourFirstProduct: 'Add your first product to get started',
    backToProducts: 'Back to Products',
    productImage: 'Product Image',
    selectCategory: 'Select a category',
    productTitle: 'Product Title',
    category: 'Category',
    addProduct: 'Add Product',
    manageProductCatalog: 'Manage your product catalog',
    noProductsDescription: 'Start adding products to your store.',
    fillProductDetails: 'Fill in the details to create a new product',
    uploadHint: 'Click to upload or drag and drop',
    uploading: 'Uploading...',
    pngJpgWebp: 'PNG, JPG, WebP up to 10MB',
    enterProductTitle: 'Enter product title',
    describeProduct: 'Describe your product...',
    seoSettings: 'SEO Settings',
    seoDescription: 'Search Engine Optimization (Auto-generated)',
    googlePreview: 'Google Preview:',
    metaTitle: 'Meta Title',
    metaDescription: 'Meta Description',
    keywords: 'Keywords',
    commaSeparated: 'comma separated',
    autoGenerateHint: 'will be auto-generated if empty',
    createProduct: 'Create Product',
    productLimitReached: 'Product Limit Reached',
    productLimitDesc: 'You have reached your plan\'s product limit. Upgrade to add more products.',
    upgradePlan: 'Upgrade Plan',
    productsSelected: 'products selected',
    publish: 'Publish',
    unpublish: 'Unpublish',
    delete: 'Delete',
    adLinkCopied: 'Ad Link Copied!',
    copyAdLink: 'Copy Ad Link',
    edit: 'Edit',
    sales7d: 'Sales (7d)',
    noProductsFound: 'No products match your filters.',
    clearSearch: 'Clear search',
    seoDescriptionPreview: 'Product description will appear here...',
    autoTitleHint: 'Will be taken from product title...',
    autoDescHint: 'Will be taken from product description...',
    keywordPlaceholder: 'e.g. t-shirt, cotton, casual wear',
    // Cart
    yourCart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    removeFromCart: 'Remove',
    updateCart: 'Update Cart',
    // Checkout & Ordering
    orderSummary: 'Order Summary',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    placeOrder: 'Place Order',
    orderPlaced: 'Order Placed Successfully!',
    orderBumps: 'Order Bumps',
    orderBumpsDesc: 'Increase your AOV by offering add-ons during checkout',
    newBump: 'New Bump',
    whatAreOrderBumps: 'What are Order Bumps?',
    orderBumpExplainer: 'Order bumps are add-on product offers shown in the checkout form. Customers can add them to their order with one click. This can increase Average Order Value by 20-60%!',
    createNewOrderBump: 'Create New Order Bump',
    mainProduct: 'Main Product',
    bumpProduct: 'Bump Product',
    whenMainPurchased: 'Bump will show when this product is purchased',
    productToOfferAsBump: 'Product to offer as bump',
    offerTitle: 'Offer Title',
    offerTitlePlaceholder: 'e.g., Add Express Shipping',
    descriptionPlaceholder: 'Why they should add this...',
    discountPercentage: 'Discount %',
    yourOrderBumps: 'Your Order Bumps',
    noOrderBumpsYet: 'No Order Bumps Yet',
    createFirstOrderBump: 'Create your first order bump to increase your AOV',
    showsWhen: 'Shows when: ',
    offersLabel: 'Offers: ',
    views: 'views',
    conversions: 'conversions',
    bumpConversionRate: 'rate',
    deleteBumpConfirm: 'Delete this bump?',
    paymentSuccessful: 'Payment Successful!',
    thankYouOrder: 'Thank you for your order. Your payment has been confirmed.',
    orderDetails: 'Order Details',
    confirmOrderBtn: 'Confirm Order',
    orderId: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    backToOrders: 'Back to Orders',
    orderCustomerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    customerAddress: 'Customer Address',
    orderShippingAddress: 'Shipping Address',
    orderItems: 'Order Items',
    orderNotes: 'Order Notes',
    noOrders: 'No orders yet',
    allOrders: 'All Orders',
    order: 'Order',
    date: 'Date',
    customer: 'Customer',
    payment: 'Payment',
    orderNumberLabel: 'Order Number:',
    fillFormWeContact: 'Fill out the form, we will contact you soon',
    orderComplete: 'Order Complete!',
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
    confirmOrderBtn_secure: 'Confirm Order',
    infoSecure: 'Your information is completely safe and confidential',
    discount: 'discount',
    youSave: 'You save',
    getting: 'Getting',
    // Shipping & Delivery
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
    shippingZones: 'Shipping Zones',
    shippingZonesSubtitle: 'Manage delivery zones and rates',
    addZone: 'Add Zone',
    editZone: 'Edit Zone',
    newShippingZone: 'New Shipping Zone',
    zoneName: 'Zone Name',
    deliveryRate: 'Delivery Rate',
    freeShippingAbove: 'Free Shipping Above',
    estimatedDeliveryTime: 'Estimated Delivery Time',
    regionsDistricts: 'Regions / Districts',
    zoneNamePlaceholder: 'e.g., Dhaka City, Whole Bangladesh',
    freeAbovePlaceholder: 'e.g., 2000',
    estimatedDaysPlaceholder: 'e.g., 2-3 days',
    regionsPlaceholder: 'e.g., Dhaka, Chittagong...',
    createZone: 'Create Zone',
    updateZone: 'Update Zone',
    deleteZoneConfirm: 'Are you sure you want to delete this shipping zone?',
    noShippingZones: 'No shipping zones set up yet',
    addFirstZone: 'Add your first shipping zone',
    free: 'Free',
    freeAbove: 'Free above',
    shippingCost: 'Shipping Cost',
    // Discounts & Coupons
    discounts: 'Discount Codes',
    discountsDesc: 'Create promo codes for your customers',
    addCode: 'Add Code',
    editDiscountCode: 'Edit Discount Code',
    newDiscountCode: 'New Discount Code',
    codeLabel: 'Code',
    discountValue: 'Value',
    minOrder: 'Minimum Order',
    maxDiscount: 'Max Discount',
    maxUses: 'Max Uses',
    expiresAt: 'Expires At',
    updateCode: 'Update Code',
    createCode: 'Create Code',
    noDiscountCodes: 'No discount codes yet',
    createFirstCode: 'Create your first code',
    deleteCodeConfirm: 'Delete this code?',
    percentageOff: '{{value}}% off',
    fixedOff: '{{value}} off',
    // Courier Integrations
    courierSettings: 'Courier Settings',
    courierSettingsDesc: 'Connect shipping providers for automated delivery',
    selectCourierProvider: 'Select Courier Provider',
    fastDeliveryDhaka: 'Fast delivery inside Dhaka',
    nationwideCoverage: 'Nationwide coverage (Coming Soon)',
    affordableRates: 'Affordable rates outside Dhaka',
    merchantSignup: 'Merchant Signup',
    credentials: 'Credentials',
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    usernameEmail: 'Username / Email',
    apiKey: 'API Key',
    secretKey: 'Secret Key',
    howToGetPathao: 'How to get Pathao Credentials',
    howToGetSteadfast: 'How to get Steadfast Credentials',
    redxComingSoon: 'RedX Integration Coming Soon',
    connectedTo: 'Connected to',
    canCreateShipments: 'You can now create shipments from Order details',
    disconnect: 'Disconnect',
    saveCredentials: 'Save Credentials',
    testConnection: 'Test Connection',
    howShipmentsWork: 'How Shipments Work',
    howShipmentsWork1: 'Connect your courier account above using API credentials',
    howShipmentsWork2: 'Go to Orders page and view an order',
    howShipmentsWork3: 'Click "Send to Courier" button',
    howShipmentsWork4: 'Select delivery type and confirm',
    howShipmentsWork5: 'Tracking code will be automatically saved to order',
    // Legal Policies
    legalSettings: 'Legal Policies',
    legalPagesDesc: "Customize your store's legal pages",
    autoGeneratedPolicies: 'Auto-Generated Policies',
    autoGeneratedDesc: 'We automatically generate legal policies using your store name ({{name}}) and contact email ({{email}}).',
    privacyPolicy: 'Privacy Policy',
    privacyPolicyDesc: 'How you collect and use customer data',
    termsOfService: 'Terms of Service',
    termsDesc: 'Rules and conditions for using your store',
    refundPolicy: 'Refund & Return Policy',
    refundDesc: 'Your return and refund conditions',
    custom: 'Custom',
    autoGenerated: 'Auto-Generated',
    showPreview: 'Show Auto-Generated Preview',
    hidePreview: 'Hide Preview',
    viewLivePage: 'View Live Page',
    resetToAutoGenerated: 'Reset to Auto-Generated',
    customContentOptional: 'Custom Content (Optional)',
    markdownHint: 'Supports markdown formatting (# headers, **bold**, - lists)',
    savePolicies: 'Save Policies',
    policiesSaved: 'Policies saved successfully!',
    policyReset: 'Policy reset to auto-generated',
    // Payment Methods Configuration
    manualPaymentSettings: 'Manual Payment Methods',
    paymentSettingsDesc: 'Configure manual payment options (bKash, Nagad, Rocket) for your customers.',
    bkashDesc: 'Accept payments via bKash personal or merchant numbers.',
    nagadPayment: 'Nagad Payment',
    nagadDesc: 'Accept payments via Nagad personal or merchant numbers.',
    rocketPayment: 'Rocket Payment',
    rocketDesc: 'Accept payments via Rocket personal or merchant numbers.',
    personalNumber: 'Personal Number',
    merchantNumber: 'Merchant Number',
    manualPaymentInstructions: 'These numbers will be shown to customers at checkout.',
    // Upsell & Cross-sell
    upsellSettings: 'Upsell/Downsell Offers',
    upsellSubtitle: 'Offer additional products after order completion',
    createUpsellOffer: 'Create New Offer',
    newUpsellOffer: 'New Upsell Offer',
    triggerProduct: 'Trigger Product (When this is bought)',
    selectProduct: 'Select Product',
    offerProduct: 'Offer Product (To be offered)',
    offerType: 'Offer Type',
    upsell: 'Upsell (Higher value)',
    downsell: 'Downsell (If rejected)',
    nextOffer: 'If rejected then (Downsell)',
    upsellNone: 'None (Go to Thank You Page)',
    headline: 'Headline',
    headlinePlaceholder: 'e.g., Wait! Special Offer!',
    upsellSubheadline: 'Sub-headline',
    subheadlinePlaceholder: 'e.g., Add this for just ৳499!',
    upsellDescription: 'Description',
    upsellDescriptionPlaceholder: 'More details about this offer...',
    totalOffers: 'Total Offers',
    totalViews: 'Total Views',
    totalConversions: 'Total Conversions',
    noUpsellOffers: 'No upsell offers yet',
    createFirstUpsell: 'Create your first upsell offer to boost sales!',
    trigger: 'Trigger',
    offer: 'Offer',
    deleteOfferConfirm: 'Are you sure you want to delete this offer?',
    // Product Interaction (Storefront)
    whatsappOrder: 'Order via WhatsApp',
    orderMsg_greeting: 'As-salamu alaykum!',
    orderMsg_iWantToOrder: 'I want to order *{productName}*.',
    orderMsg_quantity: '📦 Quantity: {quantity}',
    orderMsg_price: '💰 Price: {total}',
    orderMsg_myInfo: 'My Info:',
    orderMsg_name: 'Name:',
    orderMsg_address: 'Address:',
    orderMsg_mobile: 'Mobile:',
    orderMsg_thanks: 'Thanks!',
    selectedLabel: 'Selected:',
    selectOption: '-- Select Option --',
    outOfStock_badge: '(Stock Out)',
    orderOnWhatsapp: 'Order on WhatsApp',
    whatsappMsgHello: 'Assalamualaikum!',
    whatsappMsgOrder: 'I want to order *{productName}*.',
    whatsappMsgQuantity: '📦 Quantity: {quantity} pcs',
    whatsappMsgPrice: '💰 Price: {currency}{total}',
    whatsappMsgMyInfo: 'My Information:',
    whatsappMsgName: 'Name: ',
    whatsappMsgAddress: 'Address: ',
    whatsappMsgMobile: 'Mobile: ',
    whatsappMsgThanks: 'Thanks!',
    noStock: 'Out of Stock'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/dashboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dashboard",
    ()=>dashboard
]);
const dashboard = {
    // Dashboard Core
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    orders: 'Orders',
    campaigns: 'Campaigns',
    manageSubscribersDesc: 'Manage your email list',
    addOns: 'Add-ons',
    aiSalesAgent: 'AI Sales Agent',
    aiAgentBillingDesc: '24/7 Customer Support & Sales. Select a tier based on your usage needs.',
    messagesPerMo: 'messages/mo',
    switch: 'Switch',
    select: 'Select',
    turnOffAiAgent: 'Turn off AI Agent',
    aiLiteDesc: 'Starter AI',
    aiStandardDesc: 'Growing stores',
    aiProDesc: 'High volume',
    verificationInProgress: 'Verification in Progress',
    verificationDesc: 'We are verifying your payment (TRX ID: {{trxId}}). You will receive a notification once activated.',
    sendMoneyTo: 'Send Money To',
    addSubscriber: 'Add Subscriber',
    totalSubscribers: 'Total Subscribers',
    activeSubscribers: 'Active Subscribers',
    unsubscribed: 'Unsubscribed',
    noSubscribersTitle: 'No subscribers yet',
    noSubscribersDesc: 'Add subscribers to start sending campaigns',
    importFromCsv: 'Import from CSV',
    csvImportDesc: 'Paste your CSV data below. Format: email,name (one per line)',
    emailLabel: 'Email',
    nameLabel: 'Name',
    joinedLabel: 'Joined',
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
    lowStockAlert: 'Low Stock Alert',
    productsRunningLow: 'products running low on inventory',
    ordersNeedProcessing: 'orders need processing',
    abandonedCarts: 'Abandoned Carts',
    recentOrders: 'Recent Orders',
    viewAll: 'View all',
    analytics: 'Analytics',
    today: 'Today',
    totalOrders: 'Total Orders',
    viewManageOrders: 'View and manage customer orders',
    noOrdersYet: 'No orders yet',
    noOrdersDescription: 'Orders will appear here when customers place them.',
    order: 'Order',
    customer: 'Customer',
    total: 'Total',
    status: 'Status',
    actions: 'Actions',
    view: 'View',
    searchByOrderNumber: 'Search by order #, customer, or phone...',
    searchByOrderHint: 'Search by order number or customer...',
    clearFilters: 'Clear filters',
    noOrdersMatchFilters: 'No orders match your filters.',
    manageCustomerOrders: 'Manage customer orders',
    // First Sale Checklist
    letsGetYourFirstSale: "Let's get your first sale!",
    completeStepsToLaunch: "Complete these steps to launch your business effectively.",
    readyStatus: "Ready",
    firstProductTitle: "Add your first product",
    firstProductDesc: "Start by adding a product to sell.",
    visitStoreTitle: "Visit your store",
    visitStoreDesc: "See how your store looks to customers.",
    shareStoreTitle: "Share your store link",
    shareStoreDesc: "Share on social media to get visitors.",
    copyLink: "Copy Link",
    // Analytics & Reports
    analyticsOverview: 'Analytics Overview',
    salesAnalytics: 'Sales Analytics',
    trafficAnalytics: 'Traffic Analytics',
    conversionRate: 'Conversion Rate',
    averageOrderValue: 'Average Order Value',
    topProducts: 'Top Products',
    topCustomers: 'Top Customers',
    ordersReport: 'Orders Report',
    backToOrders: 'Back to Orders',
    orderNumber: 'Order Number',
    printInvoice: 'Print Invoice',
    downloadPdf: 'Download PDF',
    updateStatus: 'Update Status',
    billTo: 'Bill To',
    shipTo: 'Ship To',
    orderItems: 'Order Items',
    tax: 'Tax',
    bookCourier: 'Book Courier',
    booking: 'Booking...',
    tracking: 'Tracking',
    activityLog: 'Activity Log',
    addNote: 'Add Note',
    notePlaceholder: 'Type order note here...',
    internalNote: 'Internal Note (Private)',
    courier: 'Courier',
    consignmentId: 'Consignment ID',
    shippingCost: 'Shipping Cost',
    pricePerUnit: 'Price per Unit',
    // Sidebar & Navigation
    sidebarHome: 'Home',
    navDashboard: 'Dashboard',
    navTutorials: 'Tutorials',
    sidebarCatalog: 'Catalog',
    navProducts: 'Products',
    navInventory: 'Inventory',
    navDiscounts: 'Discounts',
    sidebarOrders: 'Orders',
    navAllOrders: 'All Orders',
    navAbandonedCarts: 'Abandoned Carts',
    sidebarMarketing: 'Marketing',
    navCampaigns: 'Campaigns',
    navAgent: 'AI Agent',
    navSubscribers: 'Subscribers',
    navPushNotifications: 'Push Notifications',
    navReviews: 'Reviews',
    sidebarAnalytics: 'Analytics',
    navAnalytics: 'Analytics',
    // New World-class IA navs
    sidebarCustomers: 'Customers',
    sidebarOnlineStore: 'Online Store',
    navPages: 'Pages',
    navDragDropBuilder: 'Drag & Drop Builder',
    navTheme: 'Theme',
    navGeneral: 'General',
    navStorefront: 'Storefront',
    navPayments: 'Payments',
    navPlanBilling: 'Plan & Billing',
    navTeam: 'Team',
    navOverview: 'Overview',
    navReports: 'Reports',
    // Enable Store CTA
    enableStoreTitle: 'Ready to Sell Products?',
    enableStoreDescription: 'Enable your online store to add products, accept orders, and grow your business.',
    enableStoreButton: 'Enable Store',
    // navPlans already defined
    navPageBuilder: 'Advanced Builder (WIP)',
    navPageBuilderV2: 'New Landing Builder',
    navStoreTemplates: 'Store Design',
    navHomepage: 'Homepage Settings',
    navShipping: 'Shipping',
    navDomain: 'Domain',
    navBilling: 'Billing',
    navCredits: 'AI Credits',
    navAllSettings: 'All Settings',
    navStoreEditor: 'Simple Landing Builder',
    sidebarAdmin: 'Admin Panel',
    navPlanManagement: 'Plan Management',
    navPayouts: 'Payouts',
    navDomainRequests: 'Domain Requests',
    logout: 'Logout',
    goToStore: 'Go to Store',
    upgrade: 'Upgrade',
    shadowModeActive: 'Shadow Mode Active',
    viewingAs: 'Viewing as',
    exit: 'Exit',
    viewOrders: 'View Orders',
    aiMessages: 'AI Messages',
    limitReached: 'Limit Reached',
    runningLow: 'Running Low',
    // AI Credits
    aiCredits: 'AI Credits',
    aiCreditsSubtitle: 'Power your store with AI. Pay as you go.',
    availableBalance: 'Available Balance',
    creditsNeverExpire: 'Credits never expire',
    topUpCredits: 'Top up Credits',
    bestValue: 'Best Value',
    buyNow: 'Buy Now',
    addedCreditsMsg: 'Successfully added {{added}} credits!',
    generateStores: 'Generate Stores',
    writeProductDescriptions: 'Write Product Descriptions',
    designLandingPages: 'Design Landing Pages',
    transactionHistory: 'Transaction History',
    type: 'Type',
    amount: 'Amount',
    date: 'Date',
    description: 'Description',
    storeSetup: 'Store Setup',
    noTransactionHistory: 'No transaction history yet.',
    howMuchDoesItCost: 'How much does it cost?',
    fullLandingPage: 'Full Landing Page',
    pageSection: 'Page Section',
    // shadowModeActive already defined
    countRecoverNeeded: '{{count}} carts need recovery',
    totalAbandoned: 'Total Abandoned',
    recovered: 'Recovered',
    recoveryRate: 'Recovery Rate',
    lostRevenue: 'Potential Revenue',
    noAbandonedCarts: 'No abandoned carts yet',
    // viewingAs, exit, goToStore already defined
    copiedMsg: 'Copied!',
    // addedCreditsMsg already defined
    creditsLabel: 'credits',
    daysAgo: '{{days}} days ago',
    hoursAgo: '{{hours}} hours ago',
    justNow: 'Just now',
    abandoned: 'Abandoned',
    // Settings / Landing Mode fixes
    landingSettings: 'Landing Page Settings',
    landingSettingsDesc: 'Configure your landing page mode and content',
    storeMode: 'Store Mode',
    storeModeDesc: 'Choose how your store is displayed to customers',
    fullStore: 'Full Store',
    fullStoreDesc: 'Full product catalog with categories and cart',
    landingPage: 'Landing Page',
    landingPageDesc: 'High-converting landing page designed for single product sellers',
    featuredProduct: 'Featured Product',
    featuredProductDesc: 'Choose the main product for your landing page',
    selectAProduct: 'Select a product',
    headlinesCopy: 'Headlines & Copy',
    headlinesCopyDesc: 'Change the main text on your landing page',
    mainHeadline: 'Main Headline',
    urgencyTextPlaceholder: 'e.g., Limited time offer!',
    guaranteeTextPlaceholder: 'e.g., 30-day money back guarantee',
    videoEmbed: 'Video Embed',
    videoEmbedDesc: 'Add a video of your product',
    videoUrl: 'Video URL',
    videoUrlDesc: 'Link to a YouTube or Vimeo video',
    callToAction: 'Call to Action',
    callToActionDesc: 'Change the order button and its text',
    buttonText: 'Button Text',
    buttonSubtext: 'Small text below the button',
    customerName: 'Customer Name',
    theirReview: 'Their Review',
    noTestimonialsYet: 'No testimonials yet',
    socialMedia: 'Social Media',
    connectSocialProfiles: 'Connect your social profiles',
    // shadowModeActive already defined
    totalPrice: 'Total Price',
    item: 'item',
    items: 'items',
    more: 'more',
    // processing already defined
    reports: 'Reports',
    salesReport: 'Sales Report',
    inventoryReport: 'Inventory Report',
    customerReport: 'Customer Report',
    taxReport: 'Tax Report',
    dateRange: 'Date Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    clearDates: 'Clear dates',
    records: 'records',
    noSalesData: 'No sales data found',
    noInventoryData: 'No inventory data found',
    noCustomerData: 'No customer data found',
    noTaxData: 'No tax data found',
    exportCSV: 'Export CSV',
    // Settings & Configuration
    settings: 'Settings',
    storeSettings: 'Store Settings',
    storeName: 'Store Name',
    subdomain: 'Subdomain',
    storeDescription: 'Store Description',
    storeLogo: 'Store Logo',
    storeInformation: 'Store Information',
    storeInformationDesc: 'Your basic store identity',
    settingsSubtitle: 'Manage your store configuration',
    settingsSaved: 'Settings saved successfully!',
    storeNameMinLength: 'Store name must be at least 2 characters',
    storeModeUpgradeRequired: 'Full Store mode requires a paid plan. Please upgrade to unlock.',
    faviconHint: '32x32 or 16x16 PNG',
    planManagement: 'Plan Management',
    exitReasonLabel: 'Reason for leaving',
    feedbackLabel: 'Feedback (optional)',
    subdomainLabel: 'Subdomain',
    currentPlanLabel: 'Current Plan',
    customDomainLabel: 'Custom Domain',
    branding: 'Branding',
    brandingDesc: 'Your store logo and branding',
    logoHint: 'Recommended: Square image, 200x200px or larger',
    storeNameLabel: 'Store Name',
    landingPageMode: 'Landing Page Mode',
    landingPageModeActive: 'Display a high-converting single page',
    fullStoreMode: 'Full Store Mode',
    fullStoreModeLocked: 'Requires Pro plan',
    storeFavicon: 'Favicon',
    storeCurrency: 'Currency',
    storeTheme: 'Theme',
    accentColor: 'Accent Color',
    fontFamily: 'Font Family',
    businessInformation: 'Business Information',
    businessAddress: 'Business Address',
    businessPhone: 'Business Phone',
    businessEmail: 'Business Email',
    businessAddressLabel: 'Business Address',
    businessPhoneLabel: 'Business Phone',
    businessEmailLabel: 'Business Email',
    seoSettings: 'SEO Settings',
    legalSettings: 'Legal Policies',
    domainSettings: 'Domain Settings',
    courierSettings: 'Courier Settings',
    developerSettings: 'Developer Settings',
    favicon: 'Favicon',
    whatsappCountryCodeHint: 'Include country code for WhatsApp link',
    contactDetailsInvoices: 'Contact details for invoices and customers',
    // Currencies
    currencyBDT: '৳ BDT - Bangladeshi Taka',
    currencyUSD: '$ USD - US Dollar',
    currencyEUR: '€ EUR - Euro',
    currencyGBP: '£ GBP - British Pound',
    currencyINR: '₹ INR - Indian Rupee',
    // Languages
    english: 'English',
    bengali: 'বাংলা (Bengali)',
    // Domain Settings
    domainSettingsDesc: "Manage your store's domain and URL",
    yourStoreUrls: 'Your Store URLs',
    freeSubdomainActive: 'Free subdomain (always active)',
    autoChecking: 'Auto-checking...',
    completeDnsSetup: 'Complete DNS Setup',
    nameHost: 'Name / Host',
    valueTarget: 'Value / Target',
    refreshStatus: 'Refresh Status',
    removeDomainBtn: 'Remove Domain',
    addCnameRecord: "Add this CNAME record to your domain's DNS settings:",
    dnsSetupWaitMsg: 'After adding the DNS record, SSL certificate will be automatically issued (usually 5-15 minutes).',
    domainConnected: 'Domain Connected!',
    domainConnectedDesc: 'Your custom domain is active and serving your store with HTTPS.',
    domainRequestPending: 'Domain Request Pending',
    domainRequestReviewing: 'Your request for {{domain}} is being reviewed.',
    willNotifyOnceApproved: 'We will notify you once your domain is ready to be connected.',
    cancelRequest: 'Cancel Request',
    addCustomDomain: 'Add Custom Domain',
    addCustomDomainDesc: 'Connect your own domain to your store.',
    premiumFeature: 'Premium Feature',
    upgradeToStarter: 'Upgrade to a paid plan',
    upgradeToConnectDomain: 'to connect your own domain (e.g., myshop.com).',
    freePlanSubdomainOnly: 'Free plans use subdomains only. Custom domains require a paid subscription.',
    upgradeToStarterPlan: 'Upgrade to Starter Plan',
    yourDomain: 'Your Domain',
    enterDomainYouOwn: 'Enter the domain you want to use for your store. You must own this domain.',
    addingDomain: 'Adding domain...',
    dnsInstructionsPreview: "After adding, you'll need to add this DNS record:",
    invalidDomainFormat: 'Invalid domain format. Example: shop.example.com',
    domainAlreadyTaken: 'This domain is already in use by another store.',
    domainRequestSubmitted: 'Domain request submitted. Our team will set it up within 24 hours.',
    domainAddedSuccess: 'Domain added! Now configure your DNS to complete the setup.',
    ssl: 'SSL',
    dns: 'DNS',
    cnameNameHost: '@ (or www)',
    domainPlaceholder: 'shop.yourdomain.com',
    domainAlreadyConfigured: 'You already have a custom domain configured. Remove it first to add a new one.',
    hostnameRefreshSuccess: 'Status refreshed!',
    hostnameRefreshFailed: 'Failed to refresh status',
    domainRemovalSuccess: 'Domain removed successfully.',
    domainRemovalFailed: 'Failed to remove domain',
    customDomain: 'Custom Domain',
    connectOwnDomain: 'Connect your own domain',
    storeCurrentlyAt: 'Your store is currently accessible at:',
    customDomainOptional: 'Custom Domain (optional)',
    enterDomainWithoutHttps: 'Enter your domain without https://',
    setupInstructions: 'Setup Instructions:',
    dnsStep1: "Go to your domain registrar's DNS settings",
    dnsStep2: 'Add a CNAME record:',
    dnsStep3: 'Contact admin to add your domain in Cloudflare Dashboard',
    dnsStep4: 'Wait for DNS propagation (up to 48 hours)',
    // SEO Settings
    seoOptimizeDesc: 'Optimize your store for search engines',
    seoSearchPreview: 'Search Engine Preview',
    seoGoogleAppear: 'How your store appears in Google',
    seoAddDescription: 'Add a description to help customers find your store in search results.',
    metaTitle: 'Meta Title',
    metaDescription: 'Meta Description',
    characters: 'characters',
    seoDescPlaceholder: 'Describe your store in 1-2 sentences...',
    keywordsLabel: 'Keywords (comma separated)',
    keywordsPlaceholder: 'e.g., online store, fashion, electronics',
    socialMediaImage: 'Social Media Image',
    socialMediaImageDesc: 'Shown when sharing on Facebook, Twitter, etc.',
    uploadImage: 'Upload Image',
    ogImageRecommend: 'Recommended: 1200×630 pixels (1.91:1 ratio)',
    seoTips: 'SEO Tips',
    seoTip1: 'Keep meta title under 60 characters for best display',
    seoTip2: 'Meta description should be 150-160 characters',
    seoTip3: 'Include your main product or service in the title',
    seoTip4: 'Use action words in description (Shop, Discover, Buy)',
    saveSeoSettings: 'Save SEO Settings',
    seoSettingsSaved: 'SEO settings saved successfully!',
    uploading: 'Uploading...',
    // Billing & Plans
    billing: 'Billing',
    billingHistory: 'Billing History',
    currentSubscription: 'Current Subscription',
    nextBillingDate: 'Next Billing Date',
    billingPaymentMethod: 'Payment Method',
    changePlan: 'Change Plan',
    cancelSubscription: 'Cancel Subscription',
    invoices: 'Invoices',
    managePlanAndUsage: 'Manage your plan and monitor usage',
    monthlyOrders: 'Monthly Orders',
    usage: 'Usage',
    activeProducts: 'Active Products',
    monthlyVisitors: 'Monthly Visitors',
    unlimited: 'Unlimited',
    resetsOn1st: 'Resets on the 1st of every month',
    approachingLimit: 'You are approaching your limit. Consider upgrading.',
    highTrafficUpgrade: 'High traffic detected. Upgrade to handle more visitors.',
    publishedProducts: 'Active products in your store',
    freePlanLimit5Products: 'You have reached the 5 product limit. Upgrade for more.',
    upgradeNow: 'Upgrade Now',
    readyToGrow: 'Ready to Grow?',
    selectPlanBasedNeeds: 'Select a plan based on your needs',
    startFreeUpgradeLater: 'Start with Free plan and upgrade later!',
    free: 'Free',
    starter: 'Starter',
    perMonth: '/month',
    unlockMoreFeatures: 'Choose a plan to unlock more features',
    backToBilling: 'Back to Billing',
    upgradePlan: 'Upgrade Plan',
    copyBtn: 'Copy',
    manageCredits: 'Manage Credits',
    upgradeTo: 'Upgrade to',
    plan: 'Plan',
    planStatusActive: 'Active',
    planStatusPastDue: 'Past Due',
    planStatusCanceled: 'Canceled',
    upgradeToStarterDesc: 'Unlock all features and grow your business.',
    businessPlan: 'Business Plan',
    customSolutionForLarge: 'Custom solutions for large scale businesses.',
    unlimitedProducts: 'Unlimited Products',
    unlimitedOrders: 'Unlimited Orders',
    unlimitedVisitors: 'Unlimited Visitors',
    dedicatedSupport: 'Dedicated Support',
    everythingUnlimited: 'Everything unlimited to help you scale without limits.',
    contactUs: 'Contact Us',
    needHelp: 'Need Help?',
    billingSupportContact: 'For billing related queries, contact our support team.',
    bkashNagadPayment: 'bKash / Nagad Payment',
    sendMoneySubmitTrx: 'Send Money and submit Transaction ID',
    sendMoneyToNumber: 'Send Money to this number:',
    numberCopied: 'Number copied!',
    selectPlanFirst: '👇 Select a plan below first',
    haveCouponCode: 'Have a Coupon Code?',
    discountApplied: 'Discount applied!',
    enterCouponCode: 'Enter coupon code',
    checking: 'Checking...',
    apply: 'Apply',
    selectPlanToApplyCoupon: 'Select a plan first to apply coupon',
    mostPopular: 'Most Popular',
    saveAmount: 'Save',
    selectThisPlan: 'Select This Plan',
    selected: 'Selected',
    notAvailable: 'Not Available',
    contactViaWhatsapp: 'Contact via WhatsApp',
    successfullySubmitted: 'Successfully Submitted!',
    paymentVerifyActivation: 'We will verify your payment and activate your plan within 24 hours.',
    amountToSend: 'Amount to Send:',
    bkashNagadNumber: 'Your bKash/Nagad Number',
    revenueLabel: 'revenue',
    submitting: 'Submitting...',
    submitPayment: 'Submit Payment',
    faqs: 'Frequently Asked Questions',
    faqBillingTitle: 'How does billing work?',
    faqBillingDesc: "You'll be charged monthly. Your subscription renews automatically unless you cancel before the renewal date.",
    faqUpgradeTitle: 'Can I upgrade later?',
    faqUpgradeDesc: "Yes! You can upgrade to a higher plan anytime. You'll only pay the difference for the remaining billing period.",
    faqDowngradeTitle: 'What happens to my data if I downgrade?',
    faqDowngradeDesc: "Your data is safe. However, if you exceed the new plan's limits, you may need to remove some products or wait for the next billing cycle for orders.",
    faqCouponTitle: 'How do coupon codes work?',
    faqCouponDesc: "Coupon codes give you a discount on your subscription fee. Select a plan, enter your coupon code, and click Apply. The discounted price will be shown.",
    teamSettings: 'Team Management',
    teamMembers: 'Team Members',
    inviteTeamMember: 'Invite Team Member',
    // Inventory
    inventoryManageDesc: 'Manage stock levels and track inventory',
    importCsv: 'Import CSV',
    exportCsv: 'Export CSV',
    totalUnits: 'Total Units',
    importProducts: 'Import Products',
    bulkImportDesc: 'Bulk import products from a CSV file',
    csvFormatRequirements: 'CSV Format Requirements',
    csvFormatInstructions: 'Your CSV file should have the following columns:',
    downloadTemplate: 'Download sample CSV template',
    chooseCsvFile: 'Choose CSV File',
    clickToUpload: 'Click to upload or drag and drop',
    csvFilesOnly: 'CSV files only',
    previewFirst5Rows: 'Preview (first 5 rows)',
    totalRows: 'Total rows',
    importing: 'Importing...',
    importCompleteMessage: 'Import complete: {{created}} created, {{updated}} updated',
    invalidPriceRow: 'Row {{row}}: Invalid price',
    missingFieldsRow: 'Row {{row}}: Missing required fields (title, price)',
    rowCountMismatch: 'Row {{row}}: Column count mismatch',
    noCsvData: 'No CSV data provided',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStockLabel: 'Out of Stock',
    lowStockAlertWithCount: '{{count}} products running low on stock',
    lowStockThresholdDesc: 'Stock level is at or below {{threshold}} units',
    viewLowStock: 'View Low Stock',
    searchInventoryPlaceholder: 'Search by name or SKU...',
    noProductsTitle: 'No products yet',
    noProductsDesc: 'Add products to start tracking inventory.',
    noProductsMatchFilters: 'No products match your filters.',
    productTableHeader: 'Product',
    skuTableHeader: 'SKU',
    priceTableHeader: 'Price',
    stockLevelTableHeader: 'Stock Level',
    adjustTableHeader: 'Adjust',
    unitsLabel: 'units',
    role: 'Role',
    ownerRole: 'Owner',
    adminRole: 'Admin',
    staffRole: 'Staff',
    viewerRole: 'Viewer',
    // Discounts
    discountsManageDesc: 'Create promo codes to boost sales',
    createCode: 'Create Code',
    editDiscountCode: 'Edit Discount Code',
    createDiscountCode: 'Create Discount Code',
    discountCodeLabel: 'Discount Code',
    discountTypeLabel: 'Discount Type',
    percentage: 'Percentage',
    fixed: 'Fixed',
    percentageOff: 'Percentage Off (%)',
    amountOff: 'Amount Off',
    minOrderAmountLabel: 'Minimum Order',
    maxDiscountCap: 'Max Discount Cap',
    maxUsesLabel: 'Max Uses (Total)',
    expiryDateLabel: 'Expiry Date',
    codeIsActive: 'Code is active',
    saving: 'Saving...',
    updateCode: 'Update Code',
    yourDiscountCodes: 'Your Discount Codes',
    offLabel: 'off',
    usedLabel: 'used',
    expiredLabel: 'Expired',
    expiresLabel: 'Expires',
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    deleteConfirmDiscount: 'Delete this discount code?',
    noDiscountsYet: 'No discount codes yet',
    createFirstCodeDesc: 'Create promo codes to attract more customers',
    createFirstCodeBtn: 'Create Your First Code',
    codeMinLength: 'Code must be at least 3 characters',
    valueMin: 'Discount value must be greater than 0',
    percentageMax: 'Percentage cannot exceed 100%',
    codeExists: 'This code already exists',
    failedProcessRequest: 'Failed to process request',
    // Developer
    developerApi: 'Developer API',
    developerApiDesc: 'Manage your API keys and webhooks for custom integrations',
    apiKeys: 'API Keys',
    webhooks: 'Webhooks',
    generateKey: 'Generate Key',
    keysSecretWarning: 'Secret keys are only visible once upon creation. Keep them safe.',
    keyName: 'Key Name',
    keyPrefix: 'Key Prefix',
    keyCreated: 'Created',
    noApiKeys: 'No API keys found',
    createWebhook: 'Create Webhook',
    realtimeUpdates: 'Realtime Updates',
    webhooksDesc: 'Receive notifications when events happen in your store.',
    signaturesValidVia: 'Signatures are validated via',
    topics: 'Topics',
    addWebhook: 'Add Webhook',
    adding: 'Adding...',
    noResults: 'No results found',
    deleteWebhookConfirm: 'Are you sure you want to delete this webhook?',
    webhookSecretTitle: 'Webhook Secret',
    webhookSecretDesc: 'Use this secret to verify webhook signatures',
    apiKeyCreatedTitle: 'API Key Created',
    copyKeyNow: 'Copy your API key now. You won\'t be able to see it again.',
    savedIt: 'I\'ve saved it',
    revokeConfirm: 'Are you sure you want to revoke this API key?',
    revoked: 'Revoked',
    active: 'Active',
    inactive: 'Inactive',
    url: 'URL',
    done: 'Done',
    name: 'Name',
    // Tracking & Analytics Configuration
    trackingAnalyticsHeader: 'Tracking & Analytics',
    ffPixelDesc: 'Facebook Pixel & Google Analytics',
    configureTracking: 'Configure Tracking',
    notConfigured: 'Not configured',
    fbPixelIdDesc: '15-16 digit Pixel ID from Facebook Events Manager.',
    openEventsManager: 'Open Events Manager',
    capiToken: 'Conversion API Access Token',
    capiActive: 'CAPI Active',
    howToGet: 'How to get:',
    capiStep1: '1. Go to Facebook Business Manager → Events Manager',
    capiStep2: '2. Select your Pixel',
    capiStep3: '3. Click on Settings tab',
    capiStep4: '4. Go to "Conversions API" section',
    capiStep5: '5. Click "Generate Access Token" button',
    capiStep6: '6. Copy the token and paste it here',
    capiSecretWarning: '⚠️ Keep this token secret, do not share with anyone.',
    capiBenefit: 'Add Access Token for better tracking with iOS 14+ and ad blockers.',
    gaIdDesc: 'GA4 Measurement ID (G-XXXXXXXXXX) from Google Analytics.',
    openGA: 'Open Google Analytics',
    eventsTracked: 'Events That Will Be Tracked',
    pageView: 'PageView',
    viewContent: 'ViewContent',
    initiateCheckout: 'InitiateCheckout',
    purchase: 'Purchase',
    lead: 'Lead',
    importantInfo: 'Important Information',
    pixelWarning: 'Your pixel data is stored by Facebook/Google. If you disconnect your pixels, you will lose access to this data.',
    trackingSetupDesc: 'Set up Facebook Pixel and Google Analytics to track customer behavior.',
    everyPageLoad: 'Every page load',
    productPage: 'Product page',
    checkoutPage: 'Checkout page',
    thankYouPage: 'Thank you page',
    contactForm: 'Contact form',
    invalidPixelId: 'Invalid Facebook Pixel ID format.',
    invalidGaId: 'Invalid GA4 Measurement ID format.',
    trackingSaved: 'Tracking settings saved successfully!',
    // Store Design
    storeDesignTitle: 'Store Design',
    storeDesignDesc: "Customize your store's appearance and settings",
    viewLiveStore: 'View Live Store',
    openLiveEditor: 'Open Live Editor',
    storeModeRequired: 'Store Mode Required',
    goToSettings: 'Go to Settings',
    activeTemplate: 'Active',
    fullPreview: 'Full Preview',
    quickPreview: 'Quick Preview',
    currentlyActive: 'Currently Active',
    applying: 'Applying...',
    applyTemplate: 'Apply Template',
    colorTheme: 'Color Theme',
    colorThemeDesc: 'Choose colors that match your brand.',
    quickPresets: 'Quick Presets',
    primaryColor: 'Primary Color',
    primaryColorDesc: 'Used for buttons, headers, and accents',
    accentColorDesc: 'Used for highlights and secondary elements',
    primaryButton: 'Primary Button',
    accentButton: 'Accent Button',
    saveColors: 'Save Colors',
    heroBanner: 'Hero Banner',
    bannerImage: 'Banner Image',
    bannerSizeHint: 'Recommended size: 1920x600px',
    bannerHeadline: 'Banner Headline',
    bannerHeadlinePlaceholder: 'Welcome to Our Store',
    announcementBar: 'Announcement Bar',
    announcementBarDesc: 'Shows at the top of your store.',
    announcementText: 'Announcement Text',
    announcementPlaceholder: '🎉 Free shipping on orders over ৳1000!',
    linkOptional: 'Link (optional)',
    saveBanner: 'Save Banner',
    storeLogoTitle: 'Store Logo',
    logoRecommendedSize: 'Recommended: Square image, 200x200px or larger',
    contactInfo: 'Contact Information',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    socialMediaLinks: 'Social Media Links',
    socialMediaLinksDesc: 'Display your social profiles on your store footer.',
    facebookUrl: 'Facebook URL',
    instagramUrl: 'Instagram URL',
    whatsappNumber: 'WhatsApp Number',
    saveStoreInfo: 'Save Store Info',
    advancedSaved: 'Advanced settings saved!',
    templates: 'Templates',
    theme: 'Theme',
    banner: 'Banner',
    info: 'Info',
    advanced: 'Advanced',
    colors: 'Colors',
    templateApplied: 'Template applied!',
    themeSaved: 'Theme saved!',
    bannerSaved: 'Banner saved!',
    infoSaved: 'Store info saved!',
    customCss: 'Custom CSS',
    customCssDesc: "Add custom CSS to further customize your store's styling.",
    saveAdvancedSettings: 'Save Advanced Settings',
    cssWarning: '⚠️ Be careful with CSS - invalid styles may break your store layout.',
    catLuxury: 'Luxury',
    catTech: 'Tech',
    catArtisan: 'Artisan',
    catModern: 'Modern',
    colorIndigo: 'Indigo',
    colorEmerald: 'Emerald',
    colorRose: 'Rose',
    colorAmber: 'Amber',
    colorSky: 'Sky',
    colorSlate: 'Slate',
    fontInterDesc: 'Modern & Clean',
    fontPoppinsDesc: 'Geometric & Friendly',
    fontRobotoDesc: 'Industrial & Reliable',
    fontHindDesc: 'Optimized for Bengali',
    fontPlayfairDesc: 'Elegant & Classic',
    fontMontserratDesc: 'Stylish & Versatile',
    // Reviews
    reviewsSection: 'Reviews',
    reviewsSectionDesc: 'Manage customer reviews for your products',
    pending: 'Pending',
    published: 'Published',
    rejected: 'Rejected',
    noReviewsTitle: 'No {{status}} reviews',
    noReviewsPendingDesc: 'New reviews from customers will appear here for moderation.',
    noReviewsOtherDesc: "Reviews you've {{status}} will appear here.",
    product: 'Product',
    rating: 'Rating',
    comment: 'Comment',
    approve: 'Approve',
    reject: 'Reject',
    approved: 'Approved',
    unknownProduct: 'Unknown Product',
    // Others
    moreSettings: 'More Settings',
    shippingZonesLink: 'Shipping Zones',
    seoSettingsLink: 'SEO Settings',
    teamMembersLink: 'Team Members',
    activityLogLink: 'Activity Log',
    landingModeLink: 'Landing Mode',
    courierApiLink: 'Courier API',
    developerApiLink: 'Developer API',
    dangerZone: 'Danger Zone',
    irreversibleActions: 'Irreversible actions',
    deleteStore: 'Delete Store',
    deleteStoreConfirmTitle: 'Delete Store?',
    deleteStoreConfirmSubtitle: 'This action cannot be undone',
    permanentlyDeleteWarning: 'You are about to permanently delete',
    dataLossWarning: 'All your store data will be lost forever. This includes:',
    dataYouWillLose: 'Data You Will Lose',
    whyLeaving: 'Why are you leaving?',
    selectReason: 'Select a reason...',
    pricingTooHigh: 'Pricing is too high',
    missingFeatures: 'Missing features I need',
    switchingCompetitor: 'Switching to another platform',
    closingBusiness: 'Closing my business',
    takingBreak: 'Taking a break temporarily',
    otherReason: 'Other reason',
    feedbackPlaceholder: 'Any additional feedback? (helps us improve)',
    typeDeleteToConfirm: 'Type DELETE to confirm',
    typeDeleteHere: 'Type DELETE here...',
    cancelKeepStore: 'Cancel, Keep My Store',
    deleteForever: 'Delete Forever',
    deleting: 'Deleting...',
    lastChanceReminder: "This is your last chance. Once deleted, there's no going back.",
    permanentlyDeleteStore: 'Permanently delete this store and all its data',
    savingSettings: 'Saving...',
    saveSettings: 'Save Settings',
    liveEditor: 'Live Editor',
    // Homepage Strategy
    homepageSettings: 'Homepage Strategy',
    homepageSettingsDesc: 'Configure what visitors see when they visit your store.',
    homepageDesc: "Choose how your store's homepage appears to customers",
    landingPageSaved: 'Your landing page has been saved!',
    landingPageSavedDesc: 'Your previous homepage is now available as a campaign link.',
    campaignLink: 'Campaign Link',
    currentHomepage: 'Current Homepage',
    featuredProductLabel: 'Featured Product',
    chooseStrategy: 'Choose Your Strategy',
    funnelMode: 'Funnel Mode',
    funnelModeDesc: 'High-converting landing page with single product focus.',
    storefrontMode: 'Storefront Mode',
    storefrontModeDesc: 'Full product catalog with categories, cart, and checkout.',
    landingSavedAuto: 'Your landing page will be saved automatically',
    campaignLinkNotice: "We'll create a campaign link so you can still use it for ads.",
    singleProductFocus: 'Landing page with single product focus',
    homepageStrategyUpdated: 'Homepage strategy updated successfully.',
    landingSavedAsCampaign: 'Your landing page has been saved as a campaign!',
    upgradeRequiredStoreMode: 'Full Store mode requires a paid plan. Please upgrade.',
    homepageBackupName: 'Homepage Backup - {{date}}',
    switching: 'Switching...',
    noChanges: 'No Changes',
    applyStrategy: 'Apply Strategy',
    unlockStorefrontModeStatus: 'Unlock Storefront Mode',
    upgradeToSwitchModes: 'Upgrade to a paid plan to switch between modes.',
    savedCampaignsCountMsg: 'You have {{count}} saved campaign(s) from previous mode switches.',
    // Hybrid Mode Settings (NEW)
    enableStoreRoutes: 'Enable Store Routes',
    enableStoreRoutesDesc: 'When enabled, /products, /cart, and /checkout routes will be accessible.',
    homepageSelection: 'Homepage Selection',
    homepageSelectionDesc: 'Choose what visitors see on your homepage.',
    storeHome: 'Store Catalog',
    storeHomeDesc: 'Show your product catalog as the homepage.',
    noPublishedPages: 'No published landing pages yet.',
    createLandingPage: 'Create a Landing Page',
    yourStoreUrl: 'Your Store URL',
    // Page Builder
    pageBuilderTitle: 'Drag & Drop Builder',
    pageBuilderDesc: 'Create beautiful, custom pages easily with Drag & Drop Builder.',
    createNewPage: 'Create New Page',
    newPageDetails: 'New Page Details',
    internalPageName: 'Internal Page Name',
    urlSlug: 'URL Slug',
    urlSlugHint: 'Example: yourstore.com/p/summer-offer',
    startBuilding: 'Start Building',
    creating: 'Creating...',
    noPagesCreated: 'No pages created yet',
    noPagesDesc: 'Create your first advanced landing page today!',
    editPage: 'EDIT PAGE',
    live: 'Live',
    draft: 'Draft',
    exitEditor: 'EXIT EDITOR',
    editingPage: 'Editing Page',
    viewPublished: 'View Live',
    autoSaveActive: 'Auto-save Active',
    bootingCanvas: 'Booting Builder Canvas...',
    pageSettings: 'Page Settings',
    pageSettingsDesc: 'Configure global settings for this landing page.',
    // featuredProduct already defined
    selectProduct: 'Select Product',
    chooseProduct: 'Choose a product...',
    loadingProducts: 'Loading store products...',
    smartBlockTip: '* Smart blocks like Order Form will automatically use the selected product\'s name and price.',
    whatsappConfig: 'WhatsApp Config',
    defaultMessage: 'Default Message',
    whatsappPlaceholder: 'I want to order this product...',
    conversionTools: 'Conversion Tools',
    offerEndDate: 'Offer End Date',
    socialProofCountLabel: 'Social Proof Count',
    socialProofHint: 'Simulate "X people bought this" or "Y items left"',
    templatesSelectDesc: 'Select a ready-made template and customize',
    orderNow: 'ORDER NOW',
    blocks: 'blocks',
    templateTip: 'Select a template to load it into the canvas. Then customize colors, fonts, and content to match your brand.',
    loadingEditor: 'Loading editor...',
    savingDraft: 'Saving draft...',
    draftSaved: 'Draft saved successfully!',
    saveDraftFailed: 'Failed to save draft',
    publishingPage: 'Publishing page...',
    pagePublished: 'Page live and published!',
    publishFailed: 'Failed to publish page',
    importSuccess: 'Page imported successfully!',
    applyFailed: 'Failed to apply changes. Check code syntax.',
    initializingEditor: 'Initializing Editor...',
    templateNotFound: 'Template not found',
    loadTemplateBlocksError: 'Could not load template blocks',
    templateLoaded: 'Template loaded!',
    loadTemplateError: 'Failed to load template',
    connect: 'Connect',
    connectButtonsBackend: 'Connect buttons to backend',
    buttonsConnectedCount: '{{count}} button(s) connected!',
    savingForPreview: 'Preparing preview...',
    previewFailed: 'Failed to prepare preview',
    confirmClearCanvas: 'Are you sure you want to clear the canvas?',
    clearCanvas: 'Clear Canvas',
    desktopView: 'Desktop View',
    tabletView: 'Tablet View',
    mobileView: 'Mobile View',
    undo: 'Undo',
    redo: 'Redo',
    magicEditLabel: 'MAGIC EDIT',
    magicAiLabel: 'MAGIC AI',
    proBadge: 'PRO',
    magicEdit: 'Magic Edit',
    magicAi: 'Magic AI',
    addBlock: 'Add Block',
    code: 'Code',
    preview: 'Preview',
    saveDraft: 'Save Draft',
    publish: 'Publish',
    cancel: 'Cancel',
    applyChanges: 'Apply Changes',
    editElementHtml: 'Edit Element HTML',
    editPageHtml: 'Edit Page HTML',
    editElementAi: 'Edit Selected Element with AI',
    generateWithAi: 'Generate Page with AI',
    openPage: 'Open Page',
    widgets: 'WIDGETS',
    design: 'DESIGN',
    structure: 'STRUCTURE',
    availableWidgets: 'Available Widgets',
    uncategorized: 'Uncategorized',
    styles: 'STYLES',
    presets: 'PRESETS',
    activeElement: 'Active Element',
    selectElementHint: 'Select an element to start styling',
    attributes: 'Attributes',
    visualStyle: 'Visual Style',
    documentStructure: 'Document Structure',
    globalTheme: 'Global Theme',
    globalThemeDesc: 'Apply brand colors & fonts across the entire page.',
    brandColors: 'Brand Colors',
    pickPrimaryColor: 'Pick primary color',
    pickSecondaryColor: 'Pick secondary color',
    typography: 'Typography',
    headingFont: 'Heading Font',
    bodyFont: 'Body Font',
    themeNote: 'Note: Changes apply instantly to all "Smart Blocks". Custom elements might need manual updates.',
    magicAiEditor: 'Magic AI Editor',
    magicPageGenerator: 'Magic Page Generator',
    designingRequest: 'Designing Your Request...',
    designReady: 'Design Ready!',
    appliedSuccess: 'Applied Successfully!',
    designApplied: 'Design Applied!',
    checkCanvas: 'Check your canvas',
    describeEditHint: 'Tell AI how to edit or design this section. (e.g. "Move this to right", "Make it dark gold")',
    describeProductHint: 'Describe your product, and AI will build a high-converting landing page.',
    generatingHtml: 'AI is generating high-quality HTML & Tailwind CSS...',
    designCompletedHint: 'The AI has completed your design. Click Apply to update your page.',
    updatingEditorHint: 'Your page has been updated. Loading editor changes...',
    premiumPro: 'Premium PRO',
    unlockMagicAi: 'Unlock Magic AI',
    magicAiFutureDesc: 'Experience the future of landing page creation. Our AI models generate high-converting, mobile-perfect designs in seconds.',
    customSectionRedesign: 'Custom Section Redesign',
    editInstantly: 'Edit colors, layouts, and copy instantly.',
    landingPageGeneration: 'Landing Page Generation',
    fullPageTemplates: 'Full-page high-converting templates.',
    persuasiveCopy: 'Persuasive Bengali Marketing Copy',
    autoGeneratedBdMarket: 'Auto-generated for the BD market.',
    startAiDesign: 'Start AI Design',
    generateFullPage: 'Generate Full Page',
    processingMagic: 'Processing magic...',
    applyDesignToPage: 'Apply Design to Page',
    tryAgain: 'Try Again',
    everythingSet: 'Everything is set!',
    blockLibrary: 'Block Library',
    blockLibraryDesc: 'Ready-made components for your page',
    searchBlocks: 'Search blocks...',
    categories: 'Categories',
    all: 'All',
    noBlocksFound: 'No blocks found matching your criteria.',
    insertBlock: 'Insert Block',
    premiumBadge: 'Premium',
    blocksAvailable: 'Blocks Available',
    blockLibraryTip: 'Tip: Blocks are automatically responsive and compatible with global theme.',
    // Campaigns
    campaignsDescription: 'Create and manage marketing email campaigns',
    campaignsSent: 'Campaigns Sent',
    totalEmailsSent: 'Total Emails Sent',
    startEngagingDesc: 'Start engaging with your customers by creating your first email campaign.',
    noCampaignsYet: 'No campaigns yet',
    createYourFirstCampaign: 'Create Your First Campaign',
    campaign: 'Campaign',
    newCampaign: 'New Campaign',
    recipients: 'Recipients',
    stats: 'Stats',
    created: 'Created',
    createCampaign: 'Create Campaign',
    sendEmailToSubscribers: 'Send an email to your subscribers',
    noSubscribersYet: 'No subscribers yet',
    addSubscribersTip: 'You need to add subscribers before sending a campaign.',
    campaignName: 'Campaign Name',
    subjectLine: 'Subject Line',
    previewText: 'Preview Text',
    previewTextHint: 'Short preview that appears in email clients',
    emailContentHtml: 'Email Content (HTML)',
    emailPreview: 'Email Preview',
    campaignTargetCount: 'This campaign will be sent to {{count}} subscriber(s)',
    saveAsDraft: 'Save as Draft',
    sendNow: 'Send Now',
    sending: 'Sending...',
    campaignSentSuccess: 'Campaign sent successfully to {{count}} subscribers!',
    opens: 'Opens',
    clicks: 'Clicks',
    emailContent: 'Email Content',
    sendTo: 'Send to',
    subscribers: 'Subscribers',
    scheduled: 'Scheduled',
    sent: 'Sent',
    failed: 'Failed',
    confirmStatusUpdate: 'Are you sure you want to update the status?',
    generateReport: 'Generate Report',
    indexed: 'Indexed',
    noAbandonedCartsDesc: 'No abandoned carts yet',
    noConversationsYet: 'No conversations yet',
    noNotes: 'No notes',
    orSelectLandingPage: 'Or select a landing page',
    processing: 'Processing',
    quantity: 'Quantity',
    sidebarSettings: 'Settings',
    storeRoutesDisabledWarning: 'Store routes are disabled',
    textEdit: 'Text Edit',
    homepageSettingsUpdated: 'Homepage settings updated successfully!',
    // AI Agent - General
    aiAgentManager: 'AI Agent Manager',
    aiAgentDescription: 'Manage your virtual assistant and support automation.',
    overview: 'Overview',
    inbox: 'Inbox',
    configuration: 'Configuration',
    chatSimulator: 'Chat Simulator',
    knowledgeBase: 'Knowledge Base',
    premiumFeatureDesc: 'AI Agent is a premium feature. Upgrade your plan to enable 24/7 automated customer support.',
    agentNotConfigured: 'Agent not configured.',
    noActiveAgentFound: 'No active agent found.',
    setupAgent: 'Setup Agent',
    // AI Agent - Metrics
    totalConversations: 'Total Conversations',
    leadsCaptured: 'Leads Captured',
    activityOverview7Days: 'Activity Overview (Last 7 Days)',
    // AI Agent - Inbox
    searchCustomers: 'Search customers...',
    guestUser: 'Guest User',
    guest: 'Guest',
    started: 'Started',
    readOnlyView: 'This is a read-only view of the AI conversation.',
    selectConversation: 'Select a conversation to view history',
    // AI Agent - Configuration
    agentConfiguration: 'Agent Configuration',
    agentConfigDesc: 'Customize how your AI assistant behaves and interacts with customers.',
    agentStatus: 'Agent Status',
    agentStatusDesc: 'Enable or disable the AI assistant on your store',
    agentName: 'Agent Name',
    defaultAgentName: 'Sales Assistant',
    communicationTone: 'Communication Tone',
    friendlyCasual: 'Friendly & Casual 😊',
    professionalFormal: 'Professional & Formal',
    directSales: 'Direct & Sales-focused',
    primaryLanguage: 'Primary Language',
    saveConfiguration: 'Save Configuration',
    failedToSave: 'Failed to save settings',
    // AI Agent - Simulator
    simulator: 'Simulator',
    online: 'Online',
    clearChat: 'Clear Chat',
    testAgentDesc: 'Start a conversation to test your agent.',
    typeMessage: 'Type a message...',
    connectionError: 'Connection error occurred.',
    // AI Agent - Knowledge Base
    trainAgentDesc: 'Train your agent with custom data sources.',
    addSource: 'Add Source',
    source: 'Source',
    chunks: 'Chunks',
    lastSynced: 'Last Synced',
    noSourcesFound: 'No knowledge sources found. Add one to get started.',
    // processing already defined
    addKnowledgeSource: 'Add Knowledge Source',
    manualText: 'Manual Text',
    website: 'Website',
    fileUpload: 'File Upload',
    title: 'Title',
    content: 'Content',
    enterContentPlaceholder: 'Enter the text content here...',
    scraping: 'Scraping...',
    uploadFile: 'Upload File',
    websiteUrl: 'Website URL',
    scrapeDesc: 'We will scrape the text content from this page.',
    confirmDelete: 'Are you sure?',
    dragDrop: 'or drag and drop',
    fileLimit: 'TXT, MD, PDF, DOC, DOCX (max 5MB)',
    // AI Chat Widget
    dashboardChat_title: 'Ozzyl AI Assistant',
    dashboardChat_online: 'Online',
    dashboardChat_welcome: 'Hey {{userName}}! I\'m Ozzyl, your AI business assistant. How can I help you grow your store today?',
    dashboardChat_unlockTitle: 'Unlock Ozzyl AI',
    dashboardChat_unlockDesc: 'Get business insights, automated responses, and smart suggestions with our Pro plan.',
    dashboardChat_upgradePro: 'Upgrade to Pro',
    dashboardChat_maybeLater: 'Maybe later',
    dashboardChat_thinking: 'Ozzyl is thinking...',
    dashboardChat_askAnything: 'Ask anything about your store...',
    analyzing: 'Analyzing',
    designing: 'Designing',
    generating: 'Generating',
    analyzingPrompt: 'Analyzing your request...',
    generatingDesign: 'Creating beautiful design...',
    aiWorkingHint: 'AI is working its magic ✨',
    aiTip: 'Tip: AI uses your product info for personalized copy!',
    // Dashboard - Growth & Actions
    growthOpportunities: 'Growth Opportunities',
    aiInsights: 'AI Insights',
    revenueForecast: 'Revenue Forecast (7 Days)',
    revenueForecastDesc: 'Based on recent trends, you are expected to generate this amount next week.',
    recommendedActions: 'Recommended Actions',
    launchRetentionCampaign: 'Launch Retention Campaign',
    launchRetentionCampaignDesc: 'Purchase frequency is low. Send an SMS to inactive customers.',
    enableOrderBumps: 'Enable Order Bumps',
    enableOrderBumpsDesc: 'AOV is lower than optimal. Add checkout cross-sells to boost it.',
    scaleAdSpend: 'Scale Ad Spend',
    scaleAdSpendDesc: 'Metrics look healthy! Consider increasing ad budget to acquire more users.',
    viewFullAnalyticsReport: 'View Full Analytics Report',
    avgPerDay: 'Avg/Day',
    totalSalesShort: 'Total Sales',
    allCaughtUp: 'All caught up!',
    noPendingActions: 'No pending actions.',
    pendingOrdersTitle: 'Pending Orders',
    pendingOrdersDesc: '{{count}} orders need processing',
    lowStockTitle: 'Low Stock Alert',
    lowStockDesc: '{{count}} products running low on inventory',
    abandonedCartsTitle: 'Abandoned Carts',
    abandonedCartsDesc: '{{count}} carts need to be recovered',
    // Customers
    customersTitle: 'Customers',
    customersDescription: 'Manage your customer base and view their history',
    totalCustomers: 'Total Customers',
    newCustomers30Days: 'New (30 Days)',
    returningCustomers: 'Returning Customers',
    noCustomersTitle: 'No customers yet',
    noCustomersDescription: 'Customers will appear here once you receive your first order.',
    noCustomersMatchSearch: 'No customers match your search.',
    customerLabel: 'Customer',
    contactLabel: 'Contact',
    customerOrdersLabel: 'Orders',
    totalSpentLabel: 'Total Spent',
    lastActiveLabel: 'Last Active',
    customerActionLabel: 'Action',
    guestLabel: 'Guest',
    ordersCount: '{{count}} orders',
    backToCustomers: 'Back to Customers',
    guestCustomer: 'Guest Customer',
    customerSince: 'Customer since {{date}}',
    customerOverview: 'Overview',
    customerContactInfo: 'Contact Info',
    noPhoneProvided: 'No phone provided',
    primaryAddress: 'Primary Address',
    noAddressOnFile: 'No address on file',
    orderHistory: 'Order History',
    noOrdersFoundForCustomer: 'No orders found for this customer.',
    customerAvgOrderValue: 'Avg. Order Value',
    updating: 'Updating...',
    // Analytics
    analyticsSubtitle: 'Track your store performance',
    templatePerformanceReport: 'Template Performance Report',
    analyticsToday: "Today",
    analyticsThisWeek: 'This Week',
    analyticsThisMonth: 'This Month',
    analyticsAllTime: 'All Time',
    revenueLast7Days: 'Revenue - Last 7 Days',
    customerDemographics: 'Customer Demographics',
    firstTimeLabel: 'First-time',
    returningLabel: 'Returning',
    topCities: 'Top Cities',
    noGeographicData: 'No geographic data yet',
    conversionMetrics: 'Conversion Metrics',
    abandonedRate: 'Abandoned Rate',
    abandonedSubtext: '{{abandoned}} abandoned, {{recovered}} recovered',
    avgOrderValueSubtext: 'Per paid order',
    quickInsights: 'Quick Insights',
    returningCustomerRate: '{{rate}}% returning customer rate',
    recoveredCartsCount: '{{count}} recovered carts',
    topSellingProducts: 'Top Selling Products',
    noSalesDataYet: 'No sales data yet',
    amountLabel: 'Amount',
    visits: 'visits',
    orderStatus: 'Order Status',
    sold: 'sold',
    revenue: 'Revenue'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/landing.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "landing",
    ()=>landing
]);
const landing = {
    badge: 'Trusted by 500+ Merchants in Bangladesh',
    heroTitle1: 'Your Complete',
    heroTitle2: 'E-commerce Solution',
    heroSubtitle: 'Create your professional online store in minutes. Accept bKash, Nagad & Cash on Delivery. Manage orders, track inventory, and grow your business - all in one platform.',
    getStarted: 'Create Free Store',
    talkExpert: 'Watch Demo',
    noCreditCard: 'No credit card required • Free forever plan available',
    // Stats
    statsStores: 'Active Stores',
    statsOrders: 'Orders Processed',
    statsMerchants: 'Happy Merchants',
    statsUptime: 'Uptime',
    // Features Section
    featuresTitle: 'Everything You Need to Sell Online',
    featuresSubtitle: 'Powerful features designed for Bangladeshi e-commerce',
    // Pricing
    pricingTitle: 'Simple, Honest Pricing',
    pricingSubtitle: 'Start free, upgrade as you grow',
    perMonth: '/month',
    mostPopularTitle: 'Most Popular',
    getStartedCta: 'Get Started',
    // How it works
    howTitle: 'Launch Your Store in 3 Steps',
    howSubtitle: 'From signup to first sale in under 10 minutes',
    step1: 'Create Account',
    step1Desc: 'Sign up with email & choose your subdomain (yourstore.ozzyl.com)',
    step2: 'Add Products',
    step2Desc: 'Upload product photos, set prices in BDT, and write descriptions.',
    step3: 'Start Selling',
    step3Desc: 'Share your store link on Facebook, accept orders via bKash/COD.',
    // Testimonials
    testimonialsTitle: 'Merchants Love Us',
    testimonialsSubtitle: 'Real stories from successful store owners',
    // FAQ
    faqBadge: 'Got Questions?',
    faqTitlePart1: 'Common',
    faqTitlePart2: 'Questions',
    faqSubtitle: 'Answers to our most popular questions',
    faqStillQuestions: 'Still have questions?',
    faqContactUs: 'Contact Us',
    // CTA
    ctaTitle: 'Start Selling Today',
    ctaSubtitle: 'Join 500+ merchants already growing their business with Ozzyl',
    ctaButton: 'Create Your Free Store',
    // Features (Keys for mapping if needed, or just use as strings)
    featureGlobeTitle: 'Your Own Store URL',
    featureGlobeDesc: 'Get yourstore.ozzyl.com instantly. Premium users can connect their own domain.',
    featureSmartphoneTitle: 'bKash & Nagad Ready',
    featureSmartphoneDesc: 'Accept mobile payments from millions of Bangladeshi customers. Also supports Cash on Delivery.',
    featurePackageTitle: 'Order Management',
    featurePackageDesc: 'Track all orders in one dashboard. Update status, print invoices, manage COD collections.',
    featureChartTitle: 'Inventory Tracking',
    featureChartDesc: 'Never oversell. Automatic stock updates, low stock alerts, and SKU management.',
    featureZapTitle: 'Landing Page Mode',
    featureZapDesc: 'Perfect for single product sellers. High-converting sales page with order form built-in.',
    featureTruckTitle: 'Courier Integration',
    featureTruckDesc: 'Connect with Pathao, Steadfast & RedX. Auto-create shipments and track deliveries.',
    // Plans
    planFreeDesc: 'Perfect for testing',
    planStarterDesc: 'For growing sellers',
    planPremiumDesc: 'For serious businesses',
    planCtaStartFree: 'Start Free',
    planCtaGetStarted: 'Get Started',
    planCtaGoPremium: 'Go Premium',
    // Testimonials (Mock data)
    testimonial1Name: 'Rahim Ahmed',
    testimonial1Role: 'Fashion Store, Dhaka',
    testimonial1Text: 'Started with Free plan, now doing 200+ orders monthly on Starter. Best platform for Bangladeshi sellers!',
    testimonial2Name: 'Fatima Khan',
    testimonial2Role: 'Cosmetics, Chittagong',
    testimonial2Text: 'bKash integration is seamless. My customers love ordering via mobile. Revenue up 150% in 2 months.',
    testimonial3Name: 'Karim Hossain',
    testimonial3Role: 'Electronics, Sylhet',
    testimonial3Text: 'The landing page mode is perfect for my gadget business. Easy COD orders, great dashboard!',
    faq1Q: 'What is Ozzyl?',
    faq1A: 'Ozzyl is a complete e-commerce platform designed specifically for Bangladeshi merchants to easily create and manage online stores.',
    faq2Q: 'Do you support bKash and Nagad?',
    faq2A: 'Yes! Ozzyl comes with built-in integration for bKash, Nagad, and Cash on Delivery to help you accept payments easily.',
    faq3Q: 'Can I use my own domain?',
    faq3A: 'Yes! From Starter Plan, you can connect your Custom Domain. In Free Plan, you get a yourstore.ozzyl.com subdomain.',
    faq3Q_custom: 'Yes! From Starter Plan, you can connect your Custom Domain. In Free Plan, you get a yourstore.ozzyl.com subdomain.',
    faq4Q: 'How do I receive my payments?',
    faq4A: 'bKash/Nagad payments go directly to your account. For COD, you collect from customers. We never hold your money.',
    faq5Q: 'How long does it take to setup a store?',
    faq5A: 'Only 5 minutes! Sign up, pick a template, add products — and you are ready! No technical knowledge required.',
    faq6Q: 'Who can I talk to if I have any issues?',
    faq6A: 'Our Support Team is available 24/7. WhatsApp, Phone, or Email — whatever works for you. We are always ready to help!',
    // Footer
    footerAbout: 'The complete e-commerce platform for Bangladeshi merchants. Create, sell, and grow.',
    footerProduct: 'Product',
    footerCompany: 'Company',
    footerLegal: 'Legal',
    footerLinkFeatures: 'Features',
    footerLinkPricing: 'Pricing',
    footerLinkTemplates: 'Templates',
    footerLinkIntegrations: 'Integrations',
    footerLinkAbout: 'About',
    footerLinkBlog: 'Blog',
    footerLinkCareers: 'Careers',
    footerLinkContact: 'Contact',
    footerLinkPrivacy: 'Privacy',
    footerLinkTerms: 'Terms',
    footerLinkRefund: 'Refund Policy',
    copyright: '© 2026 Ozzyl. Made with ❤️ in Bangladesh.',
    // AwardWinningHero
    heroSignupPrefix: 'Already',
    heroSignupSuffix: 'users signed up...',
    heroDemoTemplate: 'Select Template',
    heroDemoStoreName: 'Fashion House BD',
    heroDemoStorePlaceholder: 'Your Store Name',
    heroDemoStoreSlogan: 'Best Quality Fashion Products',
    heroDemoSloganPlaceholder: 'Slogan here',
    heroDemoTheme: 'Theme',
    heroDemoContent: 'Content',
    heroDemoPublishing: 'Publishing...',
    heroDemoPublished: 'Published!',
    heroDemoLive: 'Your store is now live',
    heroDemoReady: 'Ready in 5 mins!',
    heroDemoNoCoding: 'No coding required',
    heroBadge: "Bangladesh's First Bangla-Based Builder",
    heroSubtitle1: 'No coding, no hassle.',
    heroSubtitle2: 'Pick a template, add content —',
    heroSubtitle3: 'Online in 5 mins.',
    heroCtaPrimary: 'Start for Free',
    heroTrust1: 'No credit card required',
    heroTrust2: '1-minute signup',
    heroBetaNotice: 'Join as a Beta User — Get Early Adopter Benefits',
    heroFooter: 'From Bangladesh, for Bangladesh',
    // AIHeroSection
    heroAiBadge: 'The Future of E-commerce',
    heroAiTitle: 'AI-Powered Store Builder',
    heroAiSubtitle: 'Let our AI handle everything from product descriptions to customer support. Your autonomous store is just one click away.',
    heroAiCta: 'Start Your AI Store',
    heroAiTrust1: 'bKash/Nagad Integrated',
    heroAiTrust2: '24/7 AI Support',
    heroAiVisualEditor: 'Drag & Drop Editor',
    heroAiVisualUserMsg: 'How much is this product?',
    heroAiVisualAiReply: 'It is ৳999, M size available',
    // ProblemSolutionSection
    problemHeaderTitle1: 'Why',
    problemHeaderTitle2: 'Struggle',
    problemHeaderTitle3: 'when there is a ',
    problemHeaderTitle4: 'better way?',
    problemLeftTitle1: 'Still',
    problemLeftTitle2: 'Struggling',
    problemLeftTitle3: 'like this?',
    problemPain1: 'Tired of posting manually on Facebook',
    problemPain2: 'Running after developers',
    problemPain3: 'Tracking orders in Excel',
    problemPain4: 'Paying 5000+ BDT/month for Shopify',
    problemPain5: 'Cannot understand English platforms',
    problemRightTitle1: 'Now everything is',
    problemRightTitle2: 'Easy',
    problemStep1: 'Choose Template',
    problemStep2: 'Add Content',
    problemStep3: 'Publish Store',
    problemSuccess: 'Your Store is Ready!',
    problemTag1: 'Everything in Bengali',
    problemTag2: 'Live Preview',
    problemTag3: 'Start for Free',
    // AIShowcaseSection
    landingShowcase_suite: 'AI Suite',
    landingShowcase_title: '🤖 AI Everywhere — For You, For Customers',
    landingShowcase_subtitle: 'Not one, but three AIs — your helpers at every step',
    landingShowcase_visitorTitle: 'Visitor AI',
    landingShowcase_visitorRole: 'For Visitors',
    landingShowcase_visitorDesc: 'Every visitor gets a personal shopping assistant',
    landingShowcase_visitor_askAi: 'Ask AI anything about your business',
    landingShowcase_visitor_feature1: 'Product Knowledge',
    landingShowcase_visitor_feature1_desc: 'AI knows every detail of your inventory.',
    landingShowcase_visitor_feature2: 'Instant Checkout',
    landingShowcase_visitor_feature2_desc: 'Customers can order directly within the chat.',
    landingShowcase_visitor_feature3: 'Smart Suggestions',
    landingShowcase_visitor_feature4: 'Store Policies',
    landingShowcase_visitor_feature4_desc: 'Answers questions about shipping, returns, and other policies.',
    landingShowcase_visitor_feature5: 'Always Active',
    landingShowcase_visitor_feature5_desc: 'AI is there for your customers 24/7.',
    landingShowcase_visitor_tip: 'Save up to 80% on sales & support staff costs using Visitor AI.',
    landingShowcase_visitor_aiName: 'Visitor Assistant',
    landingShowcase_visitor_alwaysActive: 'Always Active',
    landingShowcase_visitor_initialMsg: 'Hello! I am OZZYL AI. How can I help you today?',
    landingShowcase_visitor_userMsg1: 'Do you have size 42 red shoes?',
    landingShowcase_visitor_aiResponse1: 'Yes, we do! Here are some options:',
    landingShowcase_visitor_aiResponseBullet1: 'Red Sport Pro - ৳2,499',
    landingShowcase_visitor_aiResponseBullet2: 'Elite Runner Red - ৳3,200',
    landingShowcase_visitor_aiResponseBullet3: 'Classic Red Sneaker - ৳1,850',
    landingShowcase_visitor_typeMessage: 'Type a message...',
    landingShowcase_merchantTitle: 'Merchant AI',
    landingShowcase_merchantRole: 'For You',
    landingShowcase_merchantDesc: 'Your intelligent business co-pilot',
    landingShowcase_merchant_dashboard: 'Dashboard',
    landingShowcase_merchant_products: 'Products',
    landingShowcase_merchant_orders: 'Orders',
    landingShowcase_merchant_analytics: 'Analytics',
    landingShowcase_merchant_todaysSales: "Today's Sales",
    landingShowcase_merchant_visitors: 'Visitors',
    landingShowcase_merchant_assistantName: 'Business Co-pilot',
    landingShowcase_merchant_userMsg1: 'How is my business doing today?',
    landingShowcase_merchant_aiSnippet: 'Management Insight',
    landingShowcase_merchant_aiResponse1: 'Today your total sales are {{total}}, which is higher than yesterday.',
    landingShowcase_merchant_aiResponse2: 'Orders increased by {{percent}}% compared to last week.',
    landingShowcase_merchant_suggested: 'Try asking these:',
    landingShowcase_merchant_suggested1: 'Create product descriptions',
    landingShowcase_merchant_suggested2: 'Stock prediction for next month',
    landingShowcase_merchant_suggested3: 'What are the best products?',
    landingShowcase_customerTitle: 'Retention AI',
    landingShowcase_customerRole: 'Post-Purchase',
    landingShowcase_customerDesc: 'Automated support & retention system',
    landingShowcase_customer_storeTitle: 'Your Store',
    landingShowcase_customer_assistantName: 'Order Assistant',
    landingShowcase_customer_userMsg1: 'Can I track my order?',
    landingShowcase_customer_aiResponse1: 'Certainly! Your order #1234 is on the way. You might also like this:',
    landingShowcase_customer_addToCartMsg: 'Would you like to add this to your next order?',
    landingShowcase_customer_yes: 'Yes, please!',
    landingShowcase_customer_otherColor: 'Show another color',
    landingShowcase_customer_canAsk: 'Customers can ask:',
    landingShowcase_customer_ask1: 'Where is my order?',
    landingShowcase_customer_ask2: 'How do I return a product?',
    landingShowcase_customer_ask3: 'Are there any discounts?',
    // DragDropBuilderShowcase
    landingDragDrop_title: 'Drag & Drop Builder',
    landingDragDrop_customizeAsYouWish: 'Customize as you wish',
    landingDragDrop_builderDesc: 'No design skills? No problem. Use our intuitive drag and drop builder to create the perfect store for your brand.',
    landingDragDrop_widgets: 'Widgets',
    landingDragDrop_dropHere: 'Drop Here',
    landingDragDrop_widgetText: 'Text',
    landingDragDrop_widgetImage: 'Image',
    landingDragDrop_widgetButton: 'Button',
    landingDragDrop_widgetForm: 'Form',
    landingDragDrop_widgetChart: 'Chart',
    landingDragDrop_widgetVideo: 'Video',
    landingDragDrop_widgetReview: 'Review',
    landingDragDrop_pixelPerfect: 'Pixel Perfect',
    landingDragDrop_placeAnywhere: 'Place elements exactly where you want.',
    landingDragDrop_responsive: 'Fully Responsive',
    landingDragDrop_perfectEverywhere: 'Looks great on Mobile, Tablet & Desktop.',
    landingDragDrop_livePreview: 'Live Preview',
    landingDragDrop_seeRealTime: 'See changes as you make them.',
    landingDragDrop_autoSave: 'Auto Save',
    landingDragDrop_nothingLost: 'Every change is saved automatically.',
    landingDragDrop_undoRedo: 'Undo/Redo',
    landingDragDrop_backToPrevious: 'Easily fix mistakes with one click.',
    landingDragDrop_copyPaste: 'Copy Paste',
    landingDragDrop_sectionCopyPaste: 'Duplicate sections across pages.',
    // EditorModeComparison
    landingEditorMode_flexibleWorkflow: 'Flexible Workflow',
    landingEditorMode_yourChoice: 'Your Choice, Your Way',
    landingEditorMode_comparisonDesc: 'Choose the mode that fits your style. Start simple and go pro whenever you want.',
    landingEditorMode_simpleMode: 'Simple Mode',
    landingEditorMode_fastEasy: 'Fast & Easy',
    landingEditorMode_templateSelect: 'Select Template',
    landingEditorMode_fillContent: 'Fill Content',
    landingEditorMode_publish: 'Publish',
    landingEditorMode_ready5Mins: 'Ready in 5 Mins',
    landingEditorMode_noCoding: 'No coding required',
    landingEditorMode_noLearning: 'No Learning Curve',
    landingEditorMode_preMade: 'Pre-made components',
    landingEditorMode_tempChangeEasy: 'Easy Template Change',
    landingEditorMode_oneClickDesign: 'One-click design refresh',
    landingEditorMode_forBeginners: 'Perfect for Beginners',
    landingEditorMode_easiestWay: 'The easiest way to start',
    landingEditorMode_bestFor: 'Best for',
    landingEditorMode_launchFast: 'I want to launch my store fast without any hassle',
    landingEditorMode_startSimple: 'Start with Simple Mode',
    landingEditorMode_proMode: 'Pro Mode',
    landingEditorMode_fullControl: 'Full Creative Control',
    landingEditorMode_dragDrop: 'Drag & Drop',
    landingEditorMode_customization: 'Deep Customization',
    landingEditorMode_ppDesign: 'Pixel Perfect Design',
    landingEditorMode_controlEveryPixel: 'Control every single pixel',
    landingEditorMode_unlimitedWidgets: 'Unlimited Widgets',
    landingEditorMode_widgetCollection: 'Access our full widget library',
    landingEditorMode_completeFreedom: 'Complete Freedom',
    landingEditorMode_arrangeAsYouWish: 'Arrange anything anywhere',
    landingEditorMode_advancedUsers: 'For Advanced Users',
    landingEditorMode_proFinishing: 'Give your store a pro finish',
    landingEditorMode_customizeMyWay: 'I want to customize every detail of my store',
    landingEditorMode_tryProMode: 'Try Pro Mode',
    landingEditorMode_simple: 'Simple',
    landingEditorMode_pro: 'Pro',
    landingEditorMode_anywhere: 'Anywhere',
    landingEditorMode_switchModeHint: 'You can switch between modes at any time',
    // AIMagicSection
    landingMagic_title: 'Our AI works 24/7 to grow your business while you focus on what matters most.',
    landingMagic_step1: 'Step 1',
    landingMagic_step2: 'Step 2',
    landingMagic_step3: 'Step 3',
    landingMagic_build: 'Build',
    landingMagic_automate: 'Automate',
    landingMagic_sell: 'Sell',
    landingMagic_sleeping: 'You are sleeping',
    landingMagic_morning: 'Management Morning',
    landingMagic_totalSales: 'Total Sales',
    landingMagic_chatOnline: 'Chatbot Online',
    landingMagic_chatUserMsg: 'I want to buy the Premium Black Jacket in XL size. Is it available?',
    landingMagic_chatAiMsg: 'Yes, it is available! I have added it to your cart. You can proceed to checkout here.',
    landingMagic_productConfirmed: 'Product Confirmed',
    landingMagic_notificationTitle: 'New Order Received',
    landingMagic_notificationBody: '৳2,499 Order from Rahim',
    landingMagic_notificationDesc: 'AI Chatbot handled the sale at 2:05 AM',
    landingMagic_captionSleepAi: 'AI works while you sleep',
    landingMagic_captionMorningReport: 'Wake up to new orders and sales report',
    // AISocialProofSection
    landingSocialProof_firstInBD: 'First in Bangladesh',
    landingSocialProof_title: 'Why OZZYL is Different',
    landingSocialProof_platformCol: 'Platform',
    landingSocialProof_allThree: 'Only platform with all three',
    landingSocialProof_saveStaffCost: 'Save Staff Cost',
    landingSocialProof_noSupportNeeded: 'No need to hire support staff',
    landingSocialProof_available247: 'Available 24/7',
    landingSocialProof_someoneIsThere: 'AI is always there for customers',
    landingSocialProof_scaleNoHiring: 'Scale without Hiring',
    landingSocialProof_handle1000Customers: 'Handle 1000 customers at once',
    landingSocialProof_happyCustomers: 'Happy Customers',
    landingSocialProof_instantResponseTrust: 'Instant response builds trust',
    landingSocialProof_poweredBy: 'Powered by World-Class AI',
    landingSocialProof_bestTech: 'We use the best technology for your business',
    // InfrastructureSection
    infraBadge: 'Enterprise Infrastructure',
    infraTitle: 'Built for High-Growth Brands',
    infraSubtitle: 'Your store runs on the same global infrastructure that powers the worlds largest e-commerce sites.',
    infraCard1Title: 'Global Edge Network',
    infraCard1Desc: '310+ servers worldwide ensures your store loads instantly from any corner of Bangladesh.',
    infraCard2Title: 'Unbreakable Security',
    infraCard2Desc: 'Enterprise-grade protection against DDoS attacks and bots. Your data is always safe.',
    infraCard3Title: 'Automatic Scaling',
    infraCard3Desc: 'From 1 to 1M visitors, our infrastructure scales automatically to handle any traffic spike.',
    infraTrustBar: 'Trusted by modern digital brands worldwide',
    infraLabelLocation: 'Your Location (BD)',
    infraLabelEdge: 'Edge Servers',
    infraLabelNearest: 'Nearest',
    infraDhakaEdge: 'Dhaka Edge (~5ms)',
    infraLiveLatency: 'Live Latency',
    infraGlobalServers: 'Global Servers',
    infraLoadingTime: 'Loading Time',
    infraUptime: 'Uptime Guarantee',
    infraEnterpriseRel: 'Enterprise Reliability',
    infraSixContinents: 'Spread over 6 continents',
    infraFromDhaka: 'From Dhaka Edge Server',
    infraWhoUses: 'Who use Cloudflare:',
    infraAndMillionsMore: 'and 40+ million more websites',
    infraLatency: '<10ms Latency',
    infraSecurity: 'Enterprise Security',
    // InfrastructureCTA
    infraCtaBadge: 'Shopify runs on this, now you can too',
    infraCtaTitlePart1: 'The Technology used by',
    infraCtaTitlePart2: 'Big Brands with Millions of Dollars',
    infraCtaTitlePart3: 'is now yours for',
    infraCtaSubtitle: 'Facebook, Google, and Shopify use the same Cloudflare technology. Activate it for your store today.',
    infraCtaPrimary: 'Start for Free',
    infraCtaSecondary: 'Watch Demo',
    // AIPoweredFinalCTA
    landingFinalCTA_chatPrompt: 'Hi! I am OZZYL AI. How can I help you today?',
    landingFinalCTA_chatResponse1: 'OZZYL is Bangladeshs first AI-powered e-commerce platform. You can start for free!',
    landingFinalCTA_chatResponse2: 'Our pricing starts at 0 for the Free Plan. Starter Plan is only ৳490/month.',
    landingFinalCTA_chatResponse3: 'We have AI chatbots, order management, bKash/Nagad integration, and much more!',
    landingFinalCTA_chatResponse4: 'Awesome! You can register in just 1 minute. No credit card required.',
    landingFinalCTA_limitedOffer: 'Special Beta Offer',
    landingFinalCTA_ctaMainTitle: 'Ready to build your autonomous store?',
    landingFinalCTA_ctaSubtitle: 'Join 100+ early adopters and start your e-commerce journey with the power of AI.',
    landingFinalCTA_startFreeBtn: 'Get Started for Free',
    landingFinalCTA_aiIncluded: 'AI Included',
    landingFinalCTA_noCardNeeded: 'No credit card needed',
    landingFinalCTA_setupOneMin: '1-minute setup',
    landingFinalCTA_aiFreeAllPlans: 'AI available on all plans',
    landingFinalCTA_orSeparator: 'OR',
    landingFinalCTA_callUs: 'Call us at +8801570260118',
    landingFinalCTA_typeQuestion: 'Ask me anything...',
    landingFinalCTA_tryAiHint: 'Try asking about features or pricing',
    // FinalCTA
    finalCtaTitlePart1: 'Start Today,',
    finalCtaTitlePart2: 'Build the Future',
    finalCtaTitlePart3: 'Today',
    finalCtaMission: 'We are building Bangladesh\'s first truly Bengali E-commerce Platform.',
    finalCtaJourney: 'Ready to join this journey?',
    finalCtaPrimary: 'Start for Free',
    finalCtaLive: 'Live',
    finalCtaFrom: 'from',
    finalCtaJustSignedUp: 'just signed up!',
    finalCtaSecondaryCall: 'Call us',
    finalCtaSecondaryMail: 'Have a question?',
    finalCtaEarlyBird: 'Lifetime Early Bird Pricing',
    finalCtaOr: 'OR',
    landingSocialProof_advancedNLP: 'Advanced NLP',
    landingMagic_nightTime: '02:00 AM',
    landingMagic_morningTime: '08:00 AM',
    landingMagic_productName: 'Premium Jacket',
    landingMagic_productDetails: 'Size: XL • Black',
    landingMagic_salesValueFlat: '৳0',
    landingMagic_salesValueUp: '৳2,499',
    landingFinalCTA_aiAssistantName: 'OZZYL AI Assistant',
    landingFinalCTA_onlineNow: 'Online Now',
    landingOzzylChat_identifyYourself: 'Identify Yourself',
    landingOzzylChat_identifyDesc: 'Please provide your details to start the conversation.',
    landingOzzylChat_yourName: 'Your Name',
    landingOzzylChat_phone: 'Mobile Number',
    landingOzzylChat_namePlaceholder: 'Enter your name',
    landingOzzylChat_phonePlaceholder: '01XXXXXXXXX',
    landingOzzylChat_startChat: 'Start Chat',
    landingOzzylChat_typeMessage: 'Type your message...',
    landingOzzylChat_createFreeStore: 'Create Your Free Store',
    landingOzzylChat_alwaysHelp: 'Always here to help',
    landingOzzylChat_initialMsg: 'Hello! I am Ozzyl AI. How can I help you today?',
    landingOzzylChat_greetingMsg: 'Hi! Want to know how AI can grow your business?',
    landingOzzylChat_suggestWhatIs: 'What is Ozzyl AI?',
    landingOzzylChat_suggestPricing: 'What is the price?',
    landingOzzylChat_suggestBkash: 'Do you support bKash?',
    landingOzzylChat_suggestHowToStart: 'How to start?',
    landingOzzylChat_errorMsg: 'Something went wrong. Please try again.',
    landingOzzylChat_phoneInvalidError: 'Enter a valid Bangladeshi mobile number (01XXXXXXXXX)',
    landingOzzylChat_betaBadge: 'BETA',
    landingVisitorAi_newFeature: 'New Feature',
    landingVisitorAi_askAiTitle: 'Ask AI Anything About Your Business',
    landingVisitorAi_askAiSubtitle: 'Our AI is trained on your store data, products, and policies to provide instant, accurate answers.',
    landingVisitorAi_feature1Title: 'Product Knowledge',
    landingVisitorAi_feature1Desc: 'AI knows every detail of your inventory.',
    landingVisitorAi_feature2Title: 'Instant Checkout',
    landingVisitorAi_feature2Desc: 'Customers can order directly within the chat.',
    landingVisitorAi_feature3Title: 'Smart Recommendations',
    landingVisitorAi_feature3Desc: 'AI suggests products based on customer interests.',
    landingVisitorAi_feature4Title: 'Store Policies',
    landingVisitorAi_feature4Desc: 'Answers questions about shipping, returns, and more.',
    landingVisitorAi_saveSalesCostDesc: 'Save up to 80% on sales & support staff costs.',
    landingVisitorAi_aiAssistantName: 'AI Assistant',
    landingVisitorAi_alwaysActive: 'Always Active',
    landingProduct_whatsappOrder: 'Order via WhatsApp',
    landingProduct_selected: 'Selected:',
    landingProduct_selectOption: 'Select an option',
    landingProduct_outOfStock: '(Out of Stock)',
    landingProduct_orderMsg_greeting: 'Hi! I want to order some products.',
    landingProduct_orderMsg_iWantToOrder: 'Product: {{productName}}',
    landingProduct_orderMsg_quantity: 'Quantity: {{quantity}}',
    landingProduct_orderMsg_price: 'Total Price: {{total}}',
    landingProduct_orderMsg_myInfo: 'My Details:',
    landingProduct_orderMsg_name: 'Name:',
    landingProduct_orderMsg_address: 'Address:',
    landingProduct_orderMsg_mobile: 'Mobile:',
    landingProduct_orderMsg_thanks: 'Thanks!',
    landingConversion_days: 'Days',
    landingConversion_hours: 'Hours',
    landingConversion_minutes: 'Mins',
    landingConversion_seconds: 'Secs',
    landingConversion_offerExpired: 'Offer Expired!',
    landingConversion_offerEnding: 'Offer Ending In:',
    landingConversion_stockOut: 'Stock Out',
    landingConversion_onlyStockLeft: 'Hurry! Only {{stock}} items left!',
    landingConversion_onlyXInStock: 'Only {{stock}} in stock',
    landingConversion_xInStock: '{{stock}} items in stock',
    landingConversion_justNow: 'just now',
    landingConversion_minutesAgo: '{{randomMinutes}} minutes ago',
    landingConversion_orderedText: 'just ordered',
    landingOrderBump_specialOffer: 'SPECIAL OFFER',
    landingOrderBump_yesIWant: 'Yes, I want this!',
    landingOrderBump_offDiscount: '{{discount}}% OFF',
    landingOrderBump_youAreSaving: 'You are saving {{savings}}!',
    landingOrderBump_addAndSave: 'Add these to save even more!',
    // BentoFeaturesSection
    bentoBadge: 'Features',
    bentoMainTitle_part1: 'Powerful Features,',
    bentoMainTitle_part2: 'Simple Interface',
    bentoTemplateLibrary_title: 'Template Library',
    bentoTemplateLibrary_desc: 'Professional Templates in one click',
    bentoLivePreview_title: 'Live Preview',
    bentoLivePreview_desc: 'Real-time Editing',
    bentoDragDrop_title: 'Drag & Drop',
    bentoDragDrop_desc: 'Section Rearrange',
    bentoBanglaSupport_title: '🇧🇩 Bangla Support',
    bentoBanglaSupport_main: 'Full Bengali',
    bentoBanglaSupport_sub: 'Interface and Support',
    bentoMobileReady_title: 'Mobile Ready',
    bentoAllInOne_title: 'All-in-One Platform',
    bentoAllInOne_desc: 'E-commerce and Landing Page - Together',
    bentoAllInOne_badge: 'ONE SUBSCRIPTION',
    bentoComingSoon_badge: 'Coming Soon',
    bentoComingSoon_desc: 'Drag & Drop Builder, AI Content, Payment Gateway and much more...',
    bentoComingSoon_placeholder: 'Email for updates'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/chat.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chat",
    ()=>chat
]);
const chat = {
    // Ozzyl AI Chat Widget (Landing)
    landingOzzylChat_greetingMsg: '👋 Hello! Need help with your online business?',
    landingOzzylChat_initialMsg: "Hello! 👋 I am Ozzyl AI - Ozzyl's official assistant. How can I help with your online business?",
    landingOzzylChat_suggestWhatIs: 'What is Ozzyl?',
    landingOzzylChat_suggestPricing: 'I want to know about pricing',
    landingOzzylChat_suggestBkash: 'Can I take Bkash payments?',
    landingOzzylChat_suggestHowToStart: 'How to start?',
    landingOzzylChat_alwaysHelp: 'Always here to help',
    landingOzzylChat_identifyYourself: 'Identify yourself',
    landingOzzylChat_identifyDesc: 'Please provide your name and phone number before starting the chat.',
    landingOzzylChat_yourName: 'Your Name',
    landingOzzylChat_namePlaceholder: 'e.g., Mr. Rahim',
    landingOzzylChat_phone: 'Phone Number',
    landingOzzylChat_phonePlaceholder: 'e.g., 017XXXXXXXX',
    landingOzzylChat_startChat: 'Start Chat',
    landingOzzylChat_typeMessage: 'Type your question...',
    landingOzzylChat_createFreeStore: 'Create Free Store',
    landingOzzylChat_errorMsg: 'Sorry, there was a problem. Please try again.',
    landingAiChat_greetingTitle: 'Ozzyl AI',
    landingAiChat_greetingMsg: '👋 Assalamualaikum! Need help to do business online?',
    landingAiChat_initialMsg: 'Assalamualaikum! 👋 I am Ozzyl AI - Ozzyl\'s official assistant. How can I help with your online business?',
    landingAiChat_suggest1: 'What is Ozzyl?',
    landingAiChat_suggest2: 'Tell me about pricing',
    landingAiChat_suggest3: 'Can I take bKash payment?',
    landingAiChat_suggest4: 'How to start?',
    landingAiChat_errorMsg: 'Sorry, there was a problem. Please try again.',
    landingAiChat_placeholder: 'Write your question...',
    landingAiChat_createFreeStore: 'Create Free Store',
    // Storefront Chat Widget
    chatWidget_merchantTitle: 'AI Assistant',
    chatWidget_customerTitle: 'Sales Support',
    chatWidget_repliesInSeconds: 'Usually replies in seconds',
    chatWidget_merchantWelcome: "Hello! 👋 I'm your AI assistant. How can I help you today?",
    chatWidget_customerWelcome: "Hello! 👋 How can I help you today?",
    chatWidget_thinking: 'Thinking...',
    chatWidget_placeholder: 'Type your message...',
    chatWidget_clearChat: 'Clear chat',
    chatWidget_errorConnection: 'Failed to connect to AI service',
    // Dashboard Chat Widget
    dashboardChat_welcome: "Hi {{userName}}! I'm your store assistant. Ask me about your sales, orders, or how to configure settings.",
    dashboardChat_title: 'Store Assistant',
    dashboardChat_online: 'Online',
    dashboardChat_unlockTitle: 'Unlock Store Assistant',
    dashboardChat_unlockDesc: 'Get real-time insights and help with your store management. Available exclusively on the Pro plan.',
    dashboardChat_upgradePro: 'Upgrade to Pro',
    dashboardChat_maybeLater: 'Maybe Later',
    dashboardChat_askAnything: 'Ask anything...',
    // Page Builder AI Chat
    builderChat_intro: "Hi! I'm your AI design assistant. Select any element and tell me how to change it. (e.g., \"Change to blue\", \"Add a button here\")",
    builderChat_title: 'Lovable AI',
    builderChat_subtitle: 'Design Assistant',
    builderChat_unlockTitle: 'Unlock AI Assistant',
    builderChat_unlockDesc: 'Chat with your editor to design instantly. Available exclusively on the Pro plan.',
    builderChat_describeChange: 'Describe change...',
    builderChat_doneMessage: "Done! I've updated the design."
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/admin.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "admin",
    ()=>admin
]);
const admin = {
    // Super Admin & Merchant Admin Common
    adminPanel: 'Admin Panel',
    store: 'Store',
    stores: 'Stores',
    action: 'Action',
    actions: 'Actions',
    status: 'Status',
    update: 'Update',
    created: 'Created',
    noResults: 'No results found',
    // Plan Management
    planManagement: 'Plan Management',
    planManagementDesc: 'Manually upgrade or downgrade store plans',
    currentPlan: 'Current Plan',
    freeStores: 'Free Stores',
    starterStores: 'Starter Stores',
    premiumStores: 'Premium Stores',
    searchStores: 'Search stores by name or subdomain...',
    planUpdatedSuccess: 'Plan updated successfully!',
    planNotes: 'Plan Management Notes',
    planFreeNote: 'Free: 10 products, landing page only, basic features',
    planStarterNote: 'Starter (৳999/mo): 50 products, full store mode, custom domain',
    planPremiumNote: 'Premium (৳2999/mo): 500 products, priority support, all features',
    plansEffectImmediate: 'Plans take effect immediately after update',
    // Merchants & Payouts
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
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    noMerchantsFound: 'No merchants found',
    // Domain Management
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
    // Payments
    pendingPayments: 'Pending Payments',
    pendingPaymentsDesc: 'Stores with unverified bKash payments',
    noPendingPayments: 'No pending payments to verify',
    verifyPayment: 'Verify',
    rejectPayment: 'Reject',
    contactUser: 'Contact',
    downgradeToFree: 'Downgrade to Free',
    // Discount Codes (Merchant)
    discounts: 'Discount Codes',
    discountsDesc: 'Create promo codes for your customers',
    addCode: 'Add Code',
    editDiscountCode: 'Edit Discount Code',
    newDiscountCode: 'New Discount Code',
    codeLabel: 'Code',
    discountValue: 'Value',
    minOrder: 'Minimum Order',
    maxDiscount: 'Max Discount',
    maxUses: 'Max Uses',
    expiresAt: 'Expires At',
    updateCode: 'Update Code',
    createCode: 'Create Code',
    noDiscountCodes: 'No discount codes yet',
    createFirstCode: 'Create your first code',
    deleteCodeConfirm: 'Delete this code?',
    percentageOff: '{{value}}% off',
    fixedOff: '{{value}} off',
    disabled: 'Disabled',
    expired: 'Expired',
    enable: 'Enable',
    disable: 'Disable',
    // Marketing Coupons
    couponCodeLabel: 'Coupon Code *',
    couponCodePlaceholder: 'e.g., START50',
    discountTypeLabel: 'Discount Type *',
    percentage: 'Percentage',
    fixed: 'Fixed',
    discountPercentLabel: 'Discount (%)',
    discountAmountLabel: 'Discount Amount',
    discountExample50: 'e.g., 50',
    discountExample500: 'e.g., 500',
    maxUsesOptional: 'Max Uses (optional)',
    expiryDateOptional: 'Expiry Date (optional)',
    createCouponBtn: 'Create Coupon',
    creatingBtn: 'Creating...',
    deleteCouponConfirm: 'Are you sure you want to delete this coupon?',
    noCoupons: 'No coupons yet',
    createFirstCouponDesc: 'Create your first coupon to offer discounts on subscriptions',
    marketingCouponsTitle: 'Marketing - Coupons',
    marketingCouponsDesc: 'Manage subscription discount coupons for plan upgrades',
    newCouponBtn: 'New Coupon',
    statusInactive: 'Inactive',
    statusExpired: 'Expired',
    statusExhausted: 'Exhausted',
    statusActive: 'Active',
    leaveEmptyUnlimited: 'Leave empty for unlimited',
    // Storage
    storageManagement: 'Storage Management',
    storageManagementDesc: 'Manage R2 storage and clean up unused files',
    totalStorage: 'Total Storage',
    totalFiles: 'Total Files',
    orphaned: 'Orphaned',
    searchFilesPlaceholder: 'Search files...',
    orphanedOnly: 'Orphaned Only',
    deleteFilesBtn: 'Delete {{count}} files',
    selectAllOrphaned: 'Select all orphaned ({{count}})',
    clearSelection: 'Clear selection',
    colFile: 'File',
    colStatus: 'Status',
    colSize: 'Size',
    colUploaded: 'Uploaded',
    colActions: 'Actions',
    noOrphanedFiles: 'No orphaned files found',
    noFiles: 'No files found',
    inUse: 'In Use',
    viewFile: 'View file',
    deleteFile: 'Delete file',
    orphanedFilesNoticeTitle: 'Orphaned Files',
    orphanedFilesNoticeDesc: 'Orphaned files are not referenced by any product, store, or landing page. Review carefully before deleting as some files might be used in ways not detected automatically.'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/onboarding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "onboarding",
    ()=>onboarding
]);
const onboarding = {
    // Onboarding Steps & Titles
    stepAccount: 'Account',
    stepBusiness: 'Business',
    stepPlan: 'Plan',
    stepDone: 'Done',
    createAccount: 'Create Account',
    setupYourStore: 'Set Up Your Store',
    choosePlan: 'Choose Your Plan',
    createStoreIn2Min: 'Create your store in just 2 minutes',
    canChangeLater: 'You can change everything later',
    selectPlanBasedNeeds: 'Select a plan based on your needs',
    // Form Labels & Progress
    storeLink: 'Store Link',
    createMyStore: 'Create My Store',
    proceedWithPayment: 'I have paid, proceed',
    // Category Templates
    categoryFashionHeadline: 'Premium Fashion Collection',
    categoryFashionSubheadline: 'Trendy & Stylish Clothing',
    featurePremiumQuality: 'Premium Quality',
    descBestFabric: 'Best quality fabric',
    featureFastDelivery: 'Fast Delivery',
    descTwoThreeDays: 'Delivery in 2-3 days',
    featureCashOnDelivery: 'Cash on Delivery',
    descPayOnReceive: 'Pay when you receive the product',
    descStylishFashion: 'Stylish and trendy fashion item',
    categoryElectronicsHeadline: 'Best Electronics Products',
    categoryElectronicsSubheadline: 'Original Gadgets & Accessories',
    featureOriginal: '100% Original',
    descWarranty: 'With warranty',
    featureAfterSales: 'After Sales Service',
    descTechnicalSupport: 'Free technical support',
    descPremiumElectronics: 'Premium electronics item',
    categoryBeautyHeadline: 'Beauty & Skincare Solutions',
    categoryBeautySubheadline: 'Glow Yourself',
    featureAuthentic: 'Authentic Products',
    descGenuine: '100% Genuine',
    featureNatural: 'Natural Ingredients',
    descSkinFriendly: 'Skin friendly',
    featureFreeGift: 'Free Gift',
    descSurprise: 'Surprise with every order',
    descPremiumBeauty: 'Premium beauty product',
    categoryFoodHeadline: 'Delicious Food & Snacks',
    categoryFoodSubheadline: 'Fresh & Hygienic',
    featureFresh: 'Fresh Products',
    descDaily: 'Made fresh daily',
    featureHotDelivery: 'Hot Delivery',
    descHot: 'Will arrive hot',
    featureTasteGuarantee: 'Taste Guarantee',
    descDelicious: 'Delicious taste',
    descDeliciousFood: 'Delicious food',
    categoryHomeHeadline: 'Home & Lifestyle Products',
    categoryHomeSubheadline: 'Decorate Your Home',
    featureQuality: 'Quality Products',
    descLongLasting: 'Long lasting',
    featureSafePackaging: 'Safe Packaging',
    descCorrectCondition: 'Delivered in correct condition',
    featureEasyReturn: 'Easy Return',
    descSevenDays: '7 days return',
    descHomeDecor: 'Home decor item',
    categoryServicesHeadline: 'Professional Services',
    categoryServicesSubheadline: 'Expert Solutions',
    featureExpertTeam: 'Expert Team',
    descExperienced: 'Experienced professionals',
    featureOnTime: 'On-time Delivery',
    descDeadline: 'Deadline maintained',
    featureSatisfaction: 'Satisfaction Guarantee',
    descBestQuality: 'Best quality service',
    descProfessionalService: 'Professional service package',
    categoryOtherHeadline: 'Quality Products',
    categoryOtherSubheadline: 'Best Selection',
    descBestQualityItem: 'Best quality items',
    descPremiumProduct: 'Premium product',
    // Landing Config Defaults
    orderNow: 'Order Now',
    cashOnDelivery: 'Cash on Delivery',
    satisfiedCustomer: 'Satisfied Customer',
    satisfiedCustomerText: 'Great product, fast delivery!',
    limitedTimeOffer: '🔥 Limited Time Offer!',
    satisfactionGuarantee: '100% Satisfaction Guarantee',
    // Onboarding Payment
    bkashPayment: 'bKash Payment',
    sendMoneyTo: 'Send Money to this number',
    bkashNumber: 'bKash Number',
    amount: 'Amount',
    afterSendMoney: 'After sending money, enter the TRX ID below',
    enterTrxId: 'Enter Transaction ID (TRX ID)',
    trxIdPlaceholder: 'e.g., TRX123ABC456',
    paymentPhoneUsed: 'Phone number used for payment',
    orContinueFree: 'Or continue with Free plan',
    startFreeUpgradeLater: 'Start with Free plan and upgrade later!',
    paymentPending: 'Payment Pending Verification',
    paymentVerificationNotice: 'Your payment will be verified. Your plan will be activated within 24 hours.',
    // Validation
    trxIdRequired: 'Please enter TRX ID',
    storeNameRequired: 'Store name is required',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    // Plan Features
    feature1Product: '5 Products',
    feature50Orders: '50 Orders/Month',
    featureLandingPageMode: 'Landing Page Mode',
    featureBasicSupport: 'Basic Support',
    feature50Products: '50 Products',
    feature500Orders: '500 Orders/Month',
    featureFullStoreMode: 'Full Store Mode',
    featureCustomDomain: 'Custom Domain',
    featureBkashNagad: 'bKash/Nagad Payment',
    feature200Products: '200 Products',
    feature3000Orders: '3000 Orders/Month',
    featureFbApi: 'Facebook Conversion API',
    featurePrioritySupport: 'Priority Support',
    feature247Support: '24/7 Support',
    // Placeholders & Meta
    placeholderName: 'John Doe',
    placeholderEmail: 'you@example.com',
    placeholderStoreName: 'My Awesome Store',
    placeholderSubdomain: 'my-store',
    metaTitle: 'Create Your Store - Ozzyl',
    // Errors
    emailAlreadyRegistered: 'Email already registered. Please login instead.',
    failedToCreateStore: 'Failed to create store. Please try again.',
    invalidStep: 'Invalid step'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/en/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "en",
    ()=>en
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/dashboard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$landing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/landing.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/chat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/admin.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$onboarding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/onboarding.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
const en = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["common"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboard"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$landing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["landing"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chat"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["admin"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$onboarding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onboarding"]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/common.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "common",
    ()=>common
]);
const common = {
    // Navigation
    home: 'হোম',
    products: 'পণ্য',
    cart: 'কার্ট',
    checkout: 'চেকআউট',
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    // Common Actions
    loading: 'লোড হচ্ছে...',
    error: 'এরর',
    success: 'সফল',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    delete: 'মুছে ফেলুন',
    edit: 'সম্পাদনা করুন',
    next: 'পরবর্তী',
    previous: 'পূর্ববর্তী',
    search: 'অনুসন্ধান করুন',
    unauthorized: 'অননুমোদিত',
    storeNotFound: 'স্টোর পাওয়া যায়নি',
    filter: 'ফিল্টার',
    sort: 'সাজান',
    all: 'সব',
    none: 'কিছুই না',
    yes: 'হ্যাঁ',
    no: 'না',
    retry: 'আবার চেষ্টা করুন',
    startOver: 'আবার শুরু করুন',
    back: 'পিছনে',
    continueBtn: 'এগিয়ে যান',
    closeBtn: 'বন্ধ করুন',
    openBtn: 'খুলুন',
    copyBtn: 'কপি',
    copiedMsg: 'কপি হয়েছে!',
    shareBtn: 'শেয়ার',
    previewBtn: 'প্রিভিউ',
    publishBtn: 'পাবলিশ',
    livePreview: 'লাইভ প্রিভিউ',
    refresh: 'রিফ্রেশ',
    unpublishBtn: 'আনপাবলিশ',
    saveChanges: 'পরিবর্তনগুলো সেভ করুন',
    saveBtn: 'সেভ করুন',
    saving: 'সেভ হচ্ছে...',
    saved: 'সেভ হয়েছে!',
    cancelBtn: 'বাতিল',
    deleteBtn: 'মুছে ফেলুন',
    editBtn: 'সম্পাদনা',
    addBtn: 'যোগ করুন',
    removeBtn: 'সরান',
    uploadBtn: 'আপলোড',
    downloadBtn: 'ডাউনলোড',
    enableBtn: 'চালু করুন',
    disableBtn: 'বন্ধ করুন',
    done: 'সম্পন্ন',
    finishBtn: 'শেষ করুন',
    confirmBtn: 'নিশ্চিত করুন',
    // Form & Labels
    name: 'নাম',
    email: 'ইমেল',
    phone: 'ফোন',
    address: 'ঠিকানা',
    city: 'শহর',
    district: 'জেলা',
    postalCode: 'পোস্টাল কোড',
    notes: 'অর্ডার নোট',
    required: 'আবশ্যক',
    yourName: 'আপনার নাম',
    password: 'পাসওয়ার্ড',
    emailAddress: 'ইমেল ঠিকানা',
    mobileNumber: 'মোবাইল নম্বর',
    // Status
    enabledStatus: 'চালু',
    disabledStatus: 'বন্ধ',
    draftStatus: 'ড্রাফট',
    publishedStatus: 'প্রকাশিত',
    archivedStatus: 'আর্কাইভকৃত',
    pending: 'পেন্ডিং',
    confirmed: 'নিশ্চিত',
    processing: 'প্রসেসিং',
    shipped: 'শিপড',
    delivered: 'ডেলিভারড',
    cancelled: 'ক্যান্সেলড',
    paid: 'পেইড',
    failed: 'ফেইলড',
    refunded: 'রিফান্ডেড',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    // Validation
    fieldRequired: 'এই ফিল্ডটি পূরণ করা আবশ্যক',
    invalidEmailMsg: 'সঠিক ইমেল প্রদান করুন',
    invalidPhoneMsg: 'সঠিক ফোন নম্বর প্রদান করুন',
    minLengthMsg: 'সর্বনিম্ন দৈর্ঘ্য হতে হবে',
    maxLengthMsg: 'সর্বোচ্চ দৈর্ঘ্য হতে হবে',
    validEmailRequired: 'সঠিক ইমেল আবশ্যক',
    passwordMinChars: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    nameRequired: 'নাম আবশ্যক',
    validMobileRequired: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)',
    subdomainTaken: '"{{subdomain}}" সাবডোমেইন আগেই নেওয়া হয়েছে। অন্য একটি বেছে নিন।',
    subdomainMinChars: 'সাবডোমেইন কমপক্ষে ৩ অক্ষরের হতে হবে',
    // Sidebar
    sidebarHome: 'হোম',
    sidebarCatalog: 'ক্যাটালগ',
    sidebarOrders: 'অর্ডার',
    sidebarMarketing: 'মার্কেটিং',
    sidebarAnalytics: 'অ্যানালিটিক্স',
    sidebarSettings: 'সেটিংস',
    sidebarAdmin: 'অ্যাডমিন',
    // Navigation Items
    navDashboard: 'ড্যাশবোর্ড',
    navProducts: 'পণ্য',
    navInventory: 'ইনভেন্টরি',
    navDiscounts: 'ছাড়',
    navAllOrders: 'সব অর্ডার',
    navAbandonedCarts: 'পরিত্যক্ত কার্ট',
    navCampaigns: 'ক্যাম্পেইন',
    navAgent: 'AI এজেন্ট',
    navSubscribers: 'সাবস্ক্রাইবার',
    navReviews: 'রিভিউ',
    navOverview: 'সারসংক্ষেপ',
    navReports: 'রিপোর্ট',
    navStoreEditor: 'ল্যান্ডিং বিল্ডার (Legacy)',
    navStoreTemplates: 'স্টোর ডিজাইন',
    navPageBuilder: 'ল্যান্ডিং পেজ এডিটর',
    navPageBuilderV2: 'নতুন ল্যান্ডিং বিল্ডার',
    navHomepage: 'হোমপেজ সেটিংস',
    navShipping: 'শিপিং',
    navDomain: 'ডোমেইন',
    navBilling: 'বিলিং',
    navCredits: 'AI ক্রেডিট',
    navAllSettings: 'সব সেটিংস',
    navPlanManagement: 'প্ল্যান ম্যানেজমেন্ট',
    navCustomers: 'কাস্টমারস',
    navPayouts: 'পেআউট',
    navDomainRequests: 'ডোমেইন রিকোয়েস্ট',
    navTutorials: 'টিউটোরিয়াল',
    goToStore: 'স্টোরে যান',
    goToDashboard: 'ড্যাশবোর্ড যান',
    viewStore: 'স্টোর দেখুন',
    addNewProduct: 'নতুন পণ্য যোগ করুন',
    processingOrders: 'প্রসেসিং অর্ডার',
    allProducts: 'সব প্রোডাক্ট',
    pendingOrders: 'পেন্ডিং অর্ডার',
    shippedOrders: 'শিপড করা অর্ডার',
    deliveredOrders: 'ডেলিভারি করা অর্ডার',
    cancelledOrders: 'বাতিল করা অর্ডার',
    ago: 'আগে',
    minShort: 'মিনিট',
    hourShort: 'ঘন্টা',
    dayShort: 'দিন',
    view: 'দেখুন',
    shadowModeActive: 'শ্যাডো মোড সক্রিয়',
    exit: 'বাহির',
    viewingAs: 'হিসাবে দেখা হচ্ছে',
    upgrade: 'আপগ্রেড',
    templatePreviewMode: 'টেমপ্লেট প্রিভিউ মোড',
    templatePreviewDesc: 'আপনি এই টেমপ্লেটের প্রিভিউ দেখছেন। কিছু ফিচার সীমিত হতে পারে।',
    comingSoon: 'শীঘ্রই আসছে',
    storeUnderConstruction: 'এই স্টোরটি বর্তমানে নির্মাণাধীন রয়েছে।',
    // Language
    language: 'ভাষা',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    storeLanguage: 'স্টোর ভাষা',
    storeLanguageDesc: 'আপনার স্টোরফ্রন্টের জন্য ডিফল্ট ভাষা',
    // Onboarding
    creatingYourStore: 'আপনার স্টোর তৈরি করা হচ্ছে...',
    designingLandingPage: 'আপনার ল্যান্ডিং পেজ ডিজাইন করা হচ্ছে...',
    almostDone: 'প্রায় শেষ...',
    storeReady: 'আপনার স্টোর প্রস্তুত!',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    businessInfo: 'আপনার ব্যবসা সম্পর্কে বলুন',
    whatDoYouSell: 'আপনি কি বিক্রি করেন?',
    businessCategory: 'ব্যবসার ধরন',
    choosePlan: 'আপনার প্ল্যান বেছে নিন',
    chooseStyle: 'আপনার স্টাইল বেছে নিন',
    alreadyHaveAccount: 'ইতিমধ্যে একাউন্ট আছে?',
    emailAlreadyRegistered: 'এই ইমেলটি ইতিপূর্বে নিবন্ধিত হয়েছে। অনুগ্রহ করে লগইন করুন।',
    noAccount: "কোনো একাউন্ট নেই?",
    stepAccount: 'একাউন্ট',
    stepBusiness: 'ব্যবসা',
    stepPlan: 'প্ল্যান',
    stepSetup: 'সেটআপ',
    stepDone: 'সম্পন্ন',
    // Auth / Registration
    createStoreIn30Sec: '৩০ সেকেন্ডে আপনার স্টোর তৈরি করুন',
    fullNameLabel: 'আপনার নাম',
    fullNamePlaceholder: 'আপনার নাম লিখুন',
    storeNameLabel: 'স্টোরের নাম',
    storeNamePlaceholder: 'আমার চমৎকার স্টোর',
    storeUrlLabel: 'স্টোর URL',
    useCustomSubdomainLabel: 'কাস্টম সাবডোমেইন ব্যবহার করুন',
    subdomainPlaceholder: 'আপনার-স্টোর',
    subdomainHint: 'শুধুমাত্র ইংরেজি ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন ব্যবহার করা যাবে। এটিই হবে আপনার স্টোরের লিঙ্ক।',
    creatingStoreBtn: 'আপনার স্টোর তৈরি হচ্ছে...',
    createStoreBtn: 'স্টোর তৈরি করুন',
    loginHere: 'এখানে লগইন করুন',
    freeToStart: 'সম্পূর্ণ ফ্রি শুরু করুন',
    noCreditCardRequired: 'ক্রেডিট কার্ড প্রয়োজন নেই',
    setupIn30Seconds: '৩০ সেকেন্ডে সেটআপ করুন',
    // Errors
    nameMinLength: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে',
    passwordMinLength6: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    subdomainMinLength: 'সাবডোমেইন কমপক্ষে ২ অক্ষরের হতে হবে',
    subdomainInvalid: 'সাবডোমেইন অবশ্যই অক্ষর বা সংখ্যা দিয়ে শুরু ও শেষ হতে হবে',
    tooManyAttempts: 'অনেক বার চেষ্টা করা হয়েছে। অনুগ্রহ করে এক ঘণ্টা পরে আবার চেষ্টা করুন।',
    registrationFailed: 'নিবন্ধনকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    registrationFailedGeneric: 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    storeCreationFailed: 'স্টোর তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    accountCreatedLoginFailed: 'একাউন্ট তৈরি হয়েছে কিন্তু লগইন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে লগইন করার চেষ্টা করুন।',
    aiCredits: 'AI ক্রেডিট',
    manageCredits: 'ক্রেডিট ম্যানেজ',
    invalidCredentials: 'ভুল ইমেল বা পাসওয়ার্ড',
    // Business Categories
    categoryFashion: 'ফ্যাশন ও পোশাক',
    categoryElectronics: 'ইলেকট্রনিক্স',
    categoryBeauty: 'রূপচর্চা ও স্বাস্থ্য',
    categoryFood: 'খাবার ও মুদি',
    categoryHome: 'ঘর ও জীবনযাত্রা',
    categoryServices: 'সার্ভিস',
    categoryOther: 'অন্যান্য',
    // Activity Logs
    activityLogs: 'অ্যাক্টিভিটি লগ',
    activityLogsDesc: 'আপনার স্টোরে ঘটে যাওয়া সব কাজ ট্র্যাক করুন',
    filters: 'ফিল্টার',
    teamMember: 'টিম মেম্বার',
    allMembers: 'সব মেম্বার',
    actionType: 'কাজের ধরন',
    noActivityYet: 'এখনও কোনো অ্যাক্টিভিটি নেই',
    actionsAppearHere: 'কাজগুলো হওয়ার সাথে সাথে এখানে প্রদর্শিত হবে',
    system: 'সিস্টেম',
    justNow: 'এইমাত্র',
    mAgo: 'মিনিট আগে',
    hAgo: 'ঘণ্টা আগে',
    dAgo: 'দিন আগে',
    details: 'বিস্তারিত',
    pageOf: 'পৃষ্ঠা {page} / {total}',
    page: 'পৃষ্ঠা',
    of: '/',
    // Activity Actions
    staff_invited: 'টিম মেম্বার আমন্ত্রিত',
    staff_removed: 'টিম মেম্বার সরানো হয়েছে',
    invite_accepted: 'টিমে যোগ দিয়েছেন',
    invite_revoked: 'আমন্ত্রণ বাতিল করা হয়েছে',
    order_created: 'নতুন অর্ডার এসেছে',
    order_updated: 'অর্ডার আপডেট করা হয়েছে',
    order_cancelled: 'অর্ডার বাতিল করা হয়েছে',
    order_status_update: 'স্ট্যাটাস পরিবর্তন',
    order_note_added: 'নোট যোগ করা হয়েছে',
    payment_update: 'পেমেন্ট আপডেট করা হয়েছে',
    product_created: 'পণ্য তৈরি করা হয়েছে',
    product_updated: 'পণ্য আপডেট করা হয়েছে',
    product_deleted: 'পণ্য মুছে ফেলা হয়েছে',
    stock_change: 'স্টক সমন্বয় করা হয়েছে',
    settings_updated: 'সেটিংস আপডেট করা হয়েছে',
    discount_created: 'ডিসকাউন্ট কোড তৈরি করা হয়েছে',
    discount_updated: 'ডিসকাউন্ট কোড আপডেট করা হয়েছে',
    discount_deleted: 'ডিসকাউন্ট কোড মুছে ফেলা হয়েছে',
    // Others
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত',
    common_there: '',
    successMsg: 'সফল!',
    errorMsg: 'এরর',
    tryAgainBtn: 'আবার চেষ্টা করুন',
    changesApplied: 'পরিবর্তনগুলো সফলভাবে প্রয়োগ করা হয়েছে',
    somethingWentWrong: 'কিছু ভুল হয়েছে!',
    // Password Reset
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    enterEmailForReset: 'আপনার ইমেল ঠিকানা লিখুন এবং আমরা আপনাকে পাসওয়ার্ড রিসেট করার একটি লিঙ্ক পাঠাব।',
    sendResetLink: 'রিসেট লিঙ্ক পাঠান',
    backToLogin: 'লগইনে ফিরে যান',
    resetPassword: 'পাসওয়ার্ড রিসেট করুন',
    enterNewPassword: 'আপনার অ্যাকাাউন্টের জন্য একটি নতুন পাসওয়ার্ড লিখুন।',
    newPassword: 'নতুন পাসওয়ার্ড',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    passwordResetSuccess: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে',
    loginNow: 'এখন লগইন করুন',
    orContinueWith: 'অথবা চালিয়ে যান',
    continueWithGoogle: 'Google দিয়ে চালিয়ে যান'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
const store = {
    // Store Core
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'এখনই কিনুন',
    outOfStock: 'স্টক শেষ',
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
    product: 'পণ্য',
    adding: 'যোগ করা হচ্ছে...',
    featuredProducts: 'সেরা পণ্যসমূহ',
    checkBackSoon: 'নতুন পণ্যের জন্য শীঘ্রই আবার চেক করুন',
    browseAllProducts: 'সব পণ্য ব্রাউজ করুন',
    sortNewest: 'নতুনতম',
    sortPriceLowHigh: 'দাম: কম থেকে বেশি',
    sortPriceHighLow: 'দাম: বেশি থেকে কম',
    min: 'সর্বনিম্ন',
    max: 'সর্বোচ্চ',
    shopByCategory: 'ক্যাটাগরি অনুযায়ী কিনুন',
    sku: 'এসকেইউ',
    stock: 'স্টক',
    stockLevel: 'স্টক লেভেল',
    stockValue: 'স্টক ভ্যালু',
    productName: 'পণ্যের নাম',
    productDescription: 'পণ্যের বিবরণ',
    productPrice: 'পণ্যের মূল্য',
    productInventory: 'ইনভেন্টরি',
    productCategory: 'ক্যাটাগরি',
    productDetail: 'পণ্যের বিস্তারিত',
    productImages: 'পণ্যের ছবি',
    lowStock: 'কম স্টক',
    outOfStockLabel: 'স্টক শেষ',
    inStockLabel: 'স্টক আছে',
    noProducts: 'এখনও কোনো পণ্য নেই',
    addYourFirstProduct: 'শুরু করতে আপনার প্রথম পণ্য যোগ করুন',
    backToProducts: 'পণ্যের তালিকায় ফিরে যান',
    productImage: 'পণ্যের ছবি',
    selectCategory: 'একটি ক্যাটাগরি বেছে নিন',
    productTitle: 'পণ্যের শিরোনাম',
    category: 'ক্যাটাগরি',
    addProduct: 'পণ্য যোগ করুন',
    manageProductCatalog: 'আপনার প্রোডাক্ট ক্যাটালগ ম্যানেজ করুন',
    noProductsDescription: 'আপনার স্টোরে পণ্য যোগ করা শুরু করুন।',
    fillProductDetails: 'নতুন প্রোডাক্ট তৈরি করতে বিস্তারিত তথ্য দিন',
    uploadHint: 'আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ অ্যান্ড ড্রপ করুন',
    uploading: 'আপলোড হচ্ছে...',
    pngJpgWebp: 'PNG, JPG, WebP ১০এমবি পর্যন্ত',
    enterProductTitle: 'প্রোডাক্টের নাম লিখুন',
    describeProduct: 'পণ্যের বিবরণ লিখুন...',
    seoSettings: 'এসইও সেটিংস',
    seoDescription: 'সার্চ ইঞ্জিন অপ্টিমাইজেশন (অটো-জেনারেটেড)',
    googlePreview: 'Google প্রিভিউ:',
    metaTitle: 'মেটা টাইটেল',
    metaDescription: 'মেটা ডেসক্রিপশন',
    keywords: 'কিওয়ার্ড',
    commaSeparated: 'কমা দিয়ে আলাদা করুন',
    autoGenerateHint: 'খালি থাকলে অটো-জেনারেট হবে',
    createProduct: 'পণ্য তৈরি করুন',
    productLimitReached: 'প্রোডাক্ট লিমিট পূর্ণ',
    productLimitDesc: 'আপনার প্ল্যানের প্রোডাক্ট লিমিট পূর্ণ হয়েছে। আরও প্রোডাক্ট যোগ করতে প্ল্যান আপগ্রেড করুন।',
    upgradePlan: 'প্ল্যান আপগ্রেড করুন',
    productsSelected: 'টি প্রোডাক্ট নির্বাচিত',
    publish: 'পাবলিশ',
    unpublish: 'আনপাবলিশ',
    delete: 'ডিলিট',
    adLinkCopied: 'অ্যাডলিংক কপি হয়েছে!',
    copyAdLink: 'অ্যাডলিংক কপি করুন',
    edit: 'এডিট',
    sales7d: 'বিক্রি (৭ দিন)',
    noProductsFound: 'আপনার ফিল্টারের সাথে কোনো প্রোডাক্ট মিলছে না।',
    clearSearch: 'সার্চ মুছুন',
    seoDescriptionPreview: 'প্রোডাক্ট ডেসক্রিপশন এখানে দেখা যাবে...',
    autoTitleHint: 'প্রোডাক্ট টাইটেল থেকে নেওয়া হবে...',
    autoDescHint: 'প্রোডাক্ট ডেসক্রিপশন থেকে নেওয়া হবে...',
    keywordPlaceholder: 'যেমন: t-shirt, cotton, casual wear',
    // Cart
    yourCart: 'আপনার কার্ট',
    cartEmpty: 'আপনার কার্ট খালি',
    continueShopping: 'কেনাকাটা চালিয়ে যান',
    proceedToCheckout: 'চেকআউটে এগিয়ে যান',
    removeFromCart: 'সরান',
    updateCart: 'কার্ট আপডেট করুন',
    // Checkout & Ordering
    orderSummary: 'অর্ডার সারাংশ',
    shippingAddress: 'শিপিং ঠিকানা',
    paymentMethod: 'পেমেন্ট পদ্ধতি',
    cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    placeOrder: 'অর্ডার করুন',
    orderPlaced: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
    orderBumps: 'অর্ডার বাম্পস',
    orderBumpsDesc: 'চেকআউটের সময় অতিরিক্ত পণ্য অফার করে আপনার এওভি বাড়ান',
    newBump: 'নতুন বাম্প',
    whatAreOrderBumps: 'অর্ডার বাম্পস কি?',
    orderBumpExplainer: 'অর্ডার বাম্পস হলো চেকআউট ফর্মে দেখানো বাড়তি পণ্যের অফার। গ্রাহকরা এক ক্লিকেই এগুলো অর্ডারে যোগ করতে পারেন। এতে গড় অর্ডার ভ্যালু ২০-৬০% পর্যন্ত বাড়তে পারে!',
    createNewOrderBump: 'নতুন অর্ডার বাম্প তৈরি করুন',
    mainProduct: 'প্রধান পণ্য',
    bumpProduct: 'বাম্প পণ্য',
    whenMainPurchased: 'এই পণ্যটি কেনা হলে বাম্প প্রদর্শিত হবে',
    productToOfferAsBump: 'বাম্প হিসেবে অফার করার পণ্য',
    offerTitle: 'অফারের শিরোনাম',
    offerTitlePlaceholder: 'যেমন: এক্সপ্রেস শিপিং যোগ করুন',
    descriptionPlaceholder: 'কেন তারা এটি যোগ করবে...',
    discountPercentage: 'ডিসকাউন্ট %',
    yourOrderBumps: 'আপনার অর্ডার বাম্পস',
    noOrderBumpsYet: 'এখনও কোনো অর্ডার বাম্প নেই',
    createFirstOrderBump: 'এওভি বাড়াতে আপনার প্রথম অর্ডার বাম্প তৈরি করুন',
    showsWhen: 'যখন দেখানো হয়: ',
    offersLabel: 'অফার করে: ',
    views: 'ভিউ',
    conversions: 'কনভার্সন',
    bumpConversionRate: 'রেট',
    deleteBumpConfirm: 'বাম্পটি মুছে ফেলবেন?',
    paymentSuccessful: 'পেমেন্ট সফল হয়েছে!',
    thankYouOrder: 'আপনার অর্ডারের জন্য ধন্যবাদ। পেমেন্ট নিশ্চিত করা হয়েছে।',
    orderDetails: 'অর্ডারের বিবরণ',
    confirmOrderBtn: 'অর্ডার নিশ্চিত করুন',
    orderId: 'অর্ডার নম্বর',
    orderDate: 'অর্ডার তারিখ',
    orderStatus: 'অর্ডার স্ট্যাটাস',
    orderTotal: 'অর্ডার মোট',
    backToOrders: 'অর্ডার তালিকায় ফিরে যান',
    orderCustomerName: 'গ্রাহকের নাম',
    customerPhone: 'গ্রাহকের ফোন',
    customerAddress: 'গ্রাহকের ঠিকানা',
    orderShippingAddress: 'শিপিং ঠিকানা',
    orderItems: 'অর্ডার আইটেম',
    orderNotes: 'অর্ডার নোটস',
    noOrders: 'এখনও কোনো অর্ডার নেই',
    allOrders: 'সব অর্ডার',
    order: 'অর্ডার',
    date: 'তারিখ',
    customer: 'গ্রাহক',
    payment: 'পেমেন্ট',
    orderNumberLabel: 'অর্ডার নম্বর:',
    fillFormWeContact: 'ফর্মটি পূরণ করুন, আমরা আপনার সাথে যোগাযোগ করব',
    orderComplete: 'অর্ডার সম্পন্ন!',
    teamWillContact: 'আমাদের টিম আপনার সাথে শীঘ্রই যোগাযোগ করবে।',
    newOrder: 'নতুন অর্ডার',
    selectQuantity: 'পরিমাণ নির্বাচন করুন',
    totalPrice: 'মোট মূল্য',
    deliveryInfoTitle: 'ডেলিভারি তথ্য',
    yourNameLabel: 'আপনার নাম *',
    enterFullName: 'পূর্ণ নাম লিখুন',
    mobileNumberLabel: 'মোবাইল নম্বর *',
    shippingAddressLabel: 'শিপিং ঠিকানা *',
    requiredField: '(আবশ্যক)',
    addressPlaceholder: 'বাসা নং, রাস্তা, এলাকা, থানা, জেলা - পূর্ণ ঠিকানা',
    addressHelp: 'সঠিকভাবে পণ্য ডেলিভারি দিতে পূর্ণ ঠিকানা আবশ্যক',
    confirmOrderBtn_secure: 'অর্ডার নিশ্চিত করুন',
    infoSecure: 'আপনার তথ্য সম্পূর্ণ নিরাপদ এবং গোপনীয়',
    discount: 'ডিসকাউন্ট',
    youSave: 'আপনার সাশ্রয়',
    getting: 'পাচ্ছেন',
    // Shipping & Delivery
    deliveryInfo: 'ডেলিভারি তথ্য',
    whenWillYouGet: 'কখন আপনি পণ্যটি পাবেন',
    insideDhaka: 'ঢাকার ভিতরে',
    within24Hours: '২৪ ঘণ্টার মধ্যে',
    deliveryCharge: 'ডেলিভারি চার্জ',
    onTimeDelivery: 'সঠিক সময়ে ডেলিভারি',
    outsideDhaka: 'ঢাকার বাইরে',
    twoToThreeDays: '২-৩ কর্মদিবস',
    courierService: 'কুরিয়ার সার্ভিস',
    nationwideDelivery: 'সারাদেশে ডেলিভারি',
    shippingZones: 'শিপিং জোন',
    shippingZonesSubtitle: 'ডেলিভারি জোন এবং রেট ম্যানেজ করুন',
    addZone: 'জোন যোগ করুন',
    editZone: 'জোন সম্পাদনা করুন',
    newShippingZone: 'নতুন শিপিং জোন',
    zoneName: 'জোনের নাম',
    deliveryRate: 'ডেলিভারি রেট',
    freeShippingAbove: 'ফ্রি শিপিং লিমিট',
    estimatedDeliveryTime: 'সম্ভাব্য ডেলিভারি সময়',
    regionsDistricts: 'অঞ্চল / জেলাসমূহ',
    zoneNamePlaceholder: 'যেমন: ঢাকা শহর, সারাদেশ',
    freeAbovePlaceholder: 'যেমন: ২০০০',
    estimatedDaysPlaceholder: 'যেমন: ২-৩ দিন',
    regionsPlaceholder: 'যেমন: ঢাকা, চট্টগ্রাম...',
    createZone: 'জোন তৈরি করুন',
    updateZone: 'জোন আপডেট করুন',
    deleteZoneConfirm: 'আপনি কি নিশ্চিত যে আপনি এই শিপিং জোনটি মুছে ফেলতে চান?',
    noShippingZones: 'এখনও কোনো শিপিং জোন নেই',
    addFirstZone: 'আপনার প্রথম শিপিং জোন যোগ করুন',
    free: 'ফ্রি',
    freeAbove: 'ফ্রি হবে',
    shippingCost: 'শিপিং খরচ',
    // Discounts & Coupons
    discounts: 'ডিসকাউন্ট কোড',
    discountsDesc: 'আপনার গ্রাহকদের জন্য প্রমো কোড তৈরি করুন',
    addCode: 'কোড যোগ করুন',
    editDiscountCode: 'কোড সম্পাদনা করুন',
    newDiscountCode: 'নতুন ডিসকাউন্ট কোড',
    codeLabel: 'কোড',
    discountValue: 'ভ্যালু',
    minOrder: 'সর্বনিম্ন অর্ডার',
    maxDiscount: 'সর্বোচ্চ ডিসকাউন্ট',
    maxUses: 'সর্বোচ্চ ব্যবহার',
    expiresAt: 'মেয়াদ শেষ',
    updateCode: 'কোড আপডেট করুন',
    createCode: 'কোড তৈরি করুন',
    noDiscountCodes: 'এখনও কোনো ডিসকাউন্ট কোড নেই',
    createFirstCode: 'আপনার প্রথম কোড তৈরি করুন',
    deleteCodeConfirm: 'কোডটি মুছে ফেলবেন?',
    percentageOff: '{{value}}% ছাড়',
    fixedOff: '{{value}} ছাড়',
    // Courier Integrations
    courierSettings: 'কুরিয়ার সেটিংস',
    courierSettingsDesc: 'অটোমেটেড ডেলিভারির জন্য কুরিয়ার কানেক্ট করুন',
    selectCourierProvider: 'কুরিয়ার প্রোভাইডার নির্বাচন করুন',
    fastDeliveryDhaka: 'ঢাকার ভেতরে দ্রুত ডেলিভারি',
    nationwideCoverage: 'সারাদেশে কাভারেজ (শীঘ্রই আসছে)',
    affordableRates: 'ঢাকার বাইরে সাশ্রয়ী রেট',
    merchantSignup: 'মার্চেন্ট সাইনআপ',
    credentials: 'ক্রেডেনশিয়ালস',
    clientId: 'ক্লায়েন্ট আইডি',
    clientSecret: 'ক্লায়েন্ট সিক্রেট',
    usernameEmail: 'ইউজারনেম / ইমেল',
    apiKey: 'এপিআই কী',
    secretKey: 'সিক্রেট কী',
    howToGetPathao: 'পাঠাও ক্রেডেনশিয়ালস পাওয়ার নিয়ম',
    howToGetSteadfast: 'স্টেডফাস্ট ক্রেডেনশিয়ালস পাওয়ার নিয়ম',
    redxComingSoon: 'রেডক্স ইন্টিগ্রেশন শীঘ্রই আসছে',
    connectedTo: 'কানেক্টেড:',
    canCreateShipments: 'অর্ডার ডিটেইলস থেকে এখন শিপমেন্ট তৈরি করতে পারবেন',
    disconnect: 'ডিসকানেক্ট',
    saveCredentials: 'ক্রেডেনশিয়ালস সেভ করুন',
    testConnection: 'কানেকশন টেস্ট করুন',
    howShipmentsWork: 'শিপমেন্ট যেভাবে কাজ করে',
    howShipmentsWork1: 'এপিআই ব্যবহার করে কুরিয়ার অ্যাকাউন্ট কানেক্ট করুন',
    howShipmentsWork2: 'অর্ডার পেজ থেকে একটি অর্ডার ওপেন করুন',
    howShipmentsWork3: '"কুরিয়ারে পাঠান" বাটনে ক্লিক করুন',
    howShipmentsWork4: 'ডেলিভারি টাইপ সিলেক্ট করে কনফার্ম করুন',
    howShipmentsWork5: 'ট্র্যাকিং কোড অটোমেটিক অর্ডারে সেভ হয়ে যাবে',
    // Legal Policies
    legalSettings: 'লিগ্যাল পলিসি',
    legalPagesDesc: "আপনার স্টোরের লিগ্যাল পেজগুলো কাস্টমাইজ করুন",
    autoGeneratedPolicies: 'অটো-জেনারেটেড পলিসি',
    autoGeneratedDesc: 'আমরা আপনার স্টোরের নাম ({{name}}) এবং ইমেল ({{email}}) ব্যবহার করে পলিসি তৈরি করেছি।',
    privacyPolicy: 'গোপনীয়তা নীতি',
    privacyPolicyDesc: 'গ্রাহকের তথ্য যেভাবে সংগ্রহ ও ব্যবহার করা হয়',
    termsOfService: 'পরিষেবার শর্তাবলী',
    termsDesc: 'স্টোর ব্যবহারের নিয়ম ও শর্তসমূহ',
    refundPolicy: 'রিফান্ড ও রিটার্ন পলিসি',
    refundDesc: 'রিটার্ন এবং রিফান্ডের শর্তাবলী',
    custom: 'কাস্টম',
    autoGenerated: 'অটো-জেনারেটেড',
    showPreview: 'অটো-জেনারেটেড প্রিভিউ দেখুন',
    hidePreview: 'প্রিভিউ লুকান',
    viewLivePage: 'লাইভ পেজ দেখুন',
    resetToAutoGenerated: 'অটো-জেনারেটেড হিসেবে রিসেট করুন',
    customContentOptional: 'কাস্টম কন্টেন্ট (ঐচ্ছিক)',
    markdownHint: 'Markdown ফরম্যাট সাপোর্ট করে (# headers, **bold**, - lists)',
    savePolicies: 'পলিসি সেভ করুন',
    policiesSaved: 'পলিসি সফলভাবে সেভ হয়েছে!',
    policyReset: 'পলিসি রিসেট করা হয়েছে',
    // Payment Methods Configuration
    manualPaymentSettings: 'ম্যানুয়াল পেমেন্ট পদ্ধতি',
    paymentSettingsDesc: 'গ্রাহকদের জন্য ম্যানুয়াল পেমেন্ট অপশন (বিকাশ, নগদ, রকেট) সেট করুন।',
    bkashDesc: 'বিকাশ পার্সোনাল বা মার্চেন্ট নম্বরের মাধ্যমে পেমেন্ট গ্রহণ করুন।',
    nagadPayment: 'নগদ পেমেন্ট',
    nagadDesc: 'নগদ পার্সোনাল বা মার্চেন্ট নম্বরের মাধ্যমে পেমেন্ট গ্রহণ করুন।',
    rocketPayment: 'রকেট পেমেন্ট',
    rocketDesc: 'রকেট পার্সোনাল বা মার্চেন্ট নম্বরের মাধ্যমে পেমেন্ট গ্রহণ করুন।',
    personalNumber: 'পার্সোনাল নম্বর',
    merchantNumber: 'মার্চেন্ট নম্বর',
    manualPaymentInstructions: 'এই নম্বরগুলো চেকআউট করার সময় গ্রাহকদের দেখানো হবে।',
    // Upsell & Cross-sell
    upsellSettings: 'আপসেল/ডাউনসেল অফার',
    upsellSubtitle: 'অর্ডার সম্পন্ন হওয়ার পর অতিরিক্ত পণ্য অফার করুন',
    createUpsellOffer: 'নতুন অফার তৈরি করুন',
    newUpsellOffer: 'নতুন আপসেল অফার',
    triggerProduct: 'ট্রিগার পণ্য (এটি কিনলে অফার দেখাবে)',
    selectProduct: 'পণ্য নির্বাচন করুন',
    offerProduct: 'অফার পণ্য (যা অফার করা হবে)',
    offerType: 'অফারের ধরন',
    upsell: 'আপসেল (উচ্চ মূল্য)',
    downsell: 'ডাউনসেল (প্রত্যাখ্যাত হলে)',
    nextOffer: 'প্রত্যাখ্যাত হলে (ডাউনসেল)',
    upsellNone: 'কিছু না (থ্যাঙ্ক ইউ পেজে যান)',
    headline: 'শিরোনাম',
    headlinePlaceholder: 'যেমন: অপেক্ষা করুন! বিশেষ অফার!',
    upsellSubheadline: 'সাব-শিরোনাম',
    subheadlinePlaceholder: 'যেমন: মাত্র ৳৪৯৯ এ এটি যোগ করুন!',
    upsellDescription: 'বিবরণ',
    upsellDescriptionPlaceholder: 'অফারের বিস্তারিত...',
    totalOffers: 'মোট অফার',
    totalViews: 'মোট ভিউ',
    totalConversions: 'মোট কনভার্সন',
    noUpsellOffers: 'এখনও কোনো আপসেল অফার নেই',
    createFirstUpsell: 'বিক্রি বাড়াতে আপনার প্রথম আপসেল অফার তৈরি করুন!',
    trigger: 'ট্রিগার',
    offer: 'অফার',
    deleteOfferConfirm: 'অফারটি মুছে ফেলবেন?',
    // Product Interaction (Storefront)
    whatsappOrder: 'হোয়াটসঅ্যাপে অর্ডার করুন',
    orderMsg_greeting: 'আস-সালামু আলাইকুম!',
    orderMsg_iWantToOrder: 'আমি *{productName}* অর্ডার করতে চাই।',
    orderMsg_quantity: '📦 পরিমাণ: {quantity}',
    orderMsg_price: '💰 মূল্য: {total}',
    orderMsg_myInfo: 'আমার তথ্য:',
    orderMsg_name: 'নাম:',
    orderMsg_address: 'ঠিকানা:',
    orderMsg_mobile: 'মোবাইল:',
    orderMsg_thanks: 'ধন্যবাদ!',
    selectedLabel: 'নির্বাচিত:',
    selectOption: '-- অপশন বেছে নিন --',
    outOfStock_badge: '(স্টক শেষ)',
    orderOnWhatsapp: 'হোয়াটসঅ্যাপে অর্ডার করুন',
    whatsappMsgHello: 'আস-সালামু আলাইকুম!',
    whatsappMsgOrder: 'আমি *{productName}* অর্ডার করতে চাই।',
    whatsappMsgQuantity: '📦 পরিমাণ: {quantity} টি',
    whatsappMsgPrice: '💰 মূল্য: {currency}{total}',
    whatsappMsgMyInfo: 'আমার তথ্য:',
    whatsappMsgName: 'নাম: ',
    whatsappMsgAddress: 'ঠিকানা: ',
    whatsappMsgMobile: 'মোবাইল: ',
    whatsappMsgThanks: 'ধন্যবাদ!',
    noStock: 'স্টক নেই'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/dashboard.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dashboard",
    ()=>dashboard
]);
const dashboard = {
    // Dashboard Core
    dashboard: 'ড্যাশবোর্ড',
    inventory: 'ইনভেন্টরি',
    orders: 'অর্ডার',
    campaigns: 'ক্যাম্পেইন',
    subscribers: 'সাবস্ক্রাইবার',
    manageSubscribersDesc: 'আপনার ইমেইল লিস্ট ম্যানেজ করুন',
    addOns: 'অ্যাড-অনস',
    aiSalesAgent: 'AI সেলস এজেন্ট',
    aiAgentBillingDesc: '২৪/৭ কাস্টমার সাপোর্ট এবং সেলস। আপনার প্রয়োজন অনুযায়ী একটি টিয়ার বেছে নিন।',
    messagesPerMo: 'মেসেজ/মাস',
    switch: 'পরিবর্তন করুন',
    select: 'বেছে নিন',
    turnOffAiAgent: 'AI এজেন্ট বন্ধ করুন',
    aiLiteDesc: 'স্টার্টার AI',
    aiStandardDesc: 'বাড়তে থাকা স্টোর',
    aiProDesc: 'অধিক ভলিউম',
    verificationInProgress: 'ভেরিফিকেশন চলছে',
    verificationDesc: 'আমরা আপনার পেমেন্ট ভেরিফাই করছি (TRX ID: {{trxId}})। সম্পন্ন হলে আপনি একটি নোটিফিকেশন পাবেন।',
    sendMoneyTo: 'এই নম্বরে পেমেন্ট পাঠান',
    addSubscriber: 'সাবস্ক্রাইবার যুক্ত করুন',
    totalSubscribers: 'মোট সাবস্ক্রাইবার',
    activeSubscribers: 'সক্রিয় সাবস্ক্রাইবার',
    unsubscribed: 'আনসাবস্ক্রাইবড',
    noSubscribersTitle: 'এখনও কোনো সাবস্ক্রাইবার নেই',
    noSubscribersDesc: 'ক্যাম্পেইন শুরু করতে সাবস্ক্রাইবার যুক্ত করুন',
    importFromCsv: 'CSV থেকে ইমপোর্ট করুন',
    csvImportDesc: 'নিচে আপনার CSV ডেটা পেস্ট করুন। ফরম্যাট: ইমেইল,নাম (প্রতি লাইনে একটি)',
    emailLabel: 'ইমেইল',
    nameLabel: 'নাম',
    joinedLabel: 'যুক্ত হয়েছে',
    goodMorning: 'শুভ সকাল',
    goodAfternoon: 'শুভ দুপুর',
    goodEvening: 'শুভ সন্ধ্যা',
    welcomeTo: 'স্বাগতম',
    dashboardSubtitle: 'আপনার স্টোরের আজকের অবস্থা দেখুন।',
    viewStore: 'স্টোর দেখুন',
    todaysSales: 'আজকের বিক্রি',
    totalRevenue: 'মোট আয়',
    pendingOrders: 'পেন্ডিং অর্ডার',
    totalProducts: 'মোট প্রোডাক্ট',
    vsYesterday: 'গতকালের তুলনায়',
    salesOverview: 'বিক্রির ওভারভিউ',
    last7Days: 'গত ৭ দিন',
    actionItems: 'করণীয় কাজ',
    noActionItems: 'সব কাজ শেষ! কোনো পেন্ডিং কাজ নেই।',
    lowStockAlert: 'লো স্টক অ্যালার্ট',
    productsRunningLow: 'প্রোডাক্টের স্টক কমে গেছে',
    ordersNeedProcessing: 'অর্ডার প্রসেস করা প্রয়োজন',
    abandonedCarts: 'অ্যাবানডনড কার্টস',
    recentOrders: 'সাম্প্রতিক অর্ডার',
    viewAll: 'সবগুলো দেখুন',
    analytics: 'অ্যানালিটিক্স',
    today: 'আজ',
    totalOrders: 'মোট অর্ডার',
    viewManageOrders: 'কাস্টমার অর্ডার দেখুন এবং ম্যানেজ করুন',
    noOrdersYet: 'এখনও কোনো অর্ডার নেই',
    noOrdersDescription: 'কাস্টমাররা অর্ডার করলে এখানে দেখা যাবে।',
    order: 'অর্ডার',
    customer: 'কাস্টমার',
    total: 'মোট',
    status: 'স্ট্যাটাস',
    actions: 'অ্যাকশন',
    view: 'দেখুন',
    searchByOrderNumber: 'অর্ডার নম্বর, কাস্টমার বা ফোন দিয়ে সার্চ করুন...',
    searchByOrderHint: 'অর্ডার নম্বর বা কাস্টমার দিয়ে খুঁজুন...',
    clearFilters: 'ফিল্টার মুছুন',
    noOrdersMatchFilters: 'ফিল্টারের সাথে কোনো অর্ডার মেলেনি।',
    manageCustomerOrders: 'কাস্টমার অর্ডার ম্যানেজ করুন',
    // First Sale Checklist
    letsGetYourFirstSale: 'চলুন আপনার প্রথম বিক্রি শুরু করি!',
    completeStepsToLaunch: 'আপনার ব্যবসা সফলভাবে চালু করতে এই ধাপগুলো সম্পন্ন করুন।',
    readyStatus: 'প্রস্তুত',
    firstProductTitle: 'আপনার প্রথম পণ্য যোগ করুন',
    firstProductDesc: 'বিক্রি শুরু করতে একটি পণ্য যোগ করুন।',
    visitStoreTitle: 'আপনার স্টোর ভিজিট করুন',
    visitStoreDesc: 'আপনার স্টোর কাস্টমারদের কাছে কেমন দেখায় তা দেখুন।',
    shareStoreTitle: 'আপনার স্টোর লিংক শেয়ার করুন',
    shareStoreDesc: 'ভিজিটর পেতে সোশ্যাল মিডিয়ায় শেয়ার করুন।',
    copyLink: 'লিংক কপি করুন',
    // Analytics & Reports
    analyticsOverview: 'অ্যানালিটিক্স ওভারভিউ',
    salesAnalytics: 'সেলস অ্যানালিটিক্স',
    trafficAnalytics: 'ট্রাফিক অ্যানালিটিক্স',
    conversionRate: 'কনভার্সন রেট',
    averageOrderValue: 'অভারেজ অর্ডার ভ্যালু',
    topProducts: 'সেরা প্রোডাক্টগুলো',
    topCustomers: 'সেরা কাস্টমারগুলো',
    ordersReport: 'অর্ডার রিপোর্ট',
    backToOrders: 'অর্ডারে ফিরে যান',
    orderNumber: 'অর্ডার নম্বর',
    printInvoice: 'ইনভয়েস প্রিন্ট করুন',
    downloadPdf: 'পিডিএফ ডাউনলোড',
    updateStatus: 'স্ট্যাটাস আপডেট করুন',
    billTo: 'বিল টু',
    shipTo: 'শিপ টু',
    orderItems: 'অর্ডারের পণ্যসমূহ',
    tax: 'ট্যাক্স',
    bookCourier: 'কুরিয়ার বুক করুন',
    booking: 'বুকিং হচ্ছে...',
    tracking: 'ট্র্যাকিং',
    activityLog: 'অ্যাক্টিভিটি লগ',
    addNote: 'নোট যোগ করুন',
    notePlaceholder: 'এখানে অর্ডার নোট লিখুন...',
    internalNote: 'আভ্যন্তরীণ নোট (ব্যক্তিগত)',
    courier: 'কুরিয়ার',
    consignmentId: 'কনসাইনমেন্ট আইডি',
    shippingCost: 'শিপিং খরচ',
    pricePerUnit: 'প্রতি ইউনিটের দাম',
    // Sidebar & Navigation
    sidebarHome: 'সারসংক্ষেপ',
    navDashboard: 'ড্যাশবোর্ড',
    navTutorials: 'টিউটোরিয়াল',
    sidebarCatalog: 'ক্যাটালগ',
    navProducts: 'পণ্য',
    navInventory: 'ইনভেন্টরি',
    navDiscounts: 'ছাড়',
    sidebarOrders: 'অর্ডার',
    navAllOrders: 'সব অর্ডার',
    navAbandonedCarts: 'পরিত্যক্ত কার্ট',
    sidebarMarketing: 'মার্কেটিং',
    navCampaigns: 'ক্যাম্পেইন',
    navAgent: 'AI এজেন্ট',
    navSubscribers: 'সাবস্ক্রাইবার',
    navPushNotifications: 'পুশ নোটিফিকেশন',
    navReviews: 'রিভিউ',
    sidebarAnalytics: 'অ্যানালিটিক্স',
    navAnalytics: 'অ্যানালিটিক্স',
    // New World-class IA navs
    sidebarCustomers: 'কাস্টমার',
    sidebarOnlineStore: 'অনলাইন স্টোর',
    navPages: 'পেজ',
    navDragDropBuilder: 'ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার',
    navTheme: 'থিম',
    navGeneral: 'সাধারণ',
    navStorefront: 'স্টোরফ্রন্ট',
    navPayments: 'পেমেন্ট',
    navPlanBilling: 'প্ল্যান ও বিলিং',
    navTeam: 'টিম',
    navOverview: 'ওভারভিউ',
    navReports: 'রিপোর্ট',
    // Enable Store CTA
    enableStoreTitle: 'প্রোডাক্ট বিক্রি করতে প্রস্তুত?',
    enableStoreDescription: 'আপনার অনলাইন স্টোর সক্রিয় করুন, প্রোডাক্ট যোগ করুন, অর্ডার গ্রহণ করুন এবং আপনার ব্যবসা বাড়ান।',
    enableStoreButton: 'স্টোর সক্রিয় করুন',
    sidebarSettings: 'সেটিংস',
    navPageBuilder: 'অ্যাডভান্সড বিল্ডার (কাজ চলছে)',
    navPageBuilderV2: 'নতুন ল্যান্ডিং বিল্ডার',
    navStoreTemplates: 'স্টোর ডিজাইন',
    navHomepage: 'হোমপেজ সেটিংস',
    navShipping: 'শিপিং',
    navDomain: 'ডোমেইন',
    navBilling: 'বিলিং',
    navCredits: 'AI ক্রেডিট',
    navAllSettings: 'সব সেটিংস',
    navStoreEditor: 'সিম্পল ল্যান্ডিং বিল্ডার',
    sidebarAdmin: 'অ্যাডমিন প্যানেল',
    navPlanManagement: 'প্ল্যান ম্যানেজমেন্ট',
    navPayouts: 'পে-আউট',
    navDomainRequests: 'ডোমেইন রিকোয়েস্ট',
    logout: 'লগআউট',
    goToStore: 'স্টোরে যান',
    upgrade: 'আপগ্রেড',
    shadowModeActive: 'শ্যাডো মোড সক্রিয়',
    viewingAs: 'দেখছেন',
    exit: 'বাহির হোন',
    viewOrders: 'অর্ডার দেখুন',
    aiMessages: 'AI মেসেজ',
    limitReached: 'সীমা অতিক্রম করেছে',
    runningLow: 'ব্যালেন্স কমে গেছে',
    // AI Credits
    aiCredits: 'AI ক্রেডিট',
    aiCreditsSubtitle: 'AI দিয়ে আপনার স্টোর পরিচালনা করুন। প্রয়োজনমতো ক্রেডিট কিনুন।',
    availableBalance: 'বর্তমান ব্যালেন্স',
    creditsNeverExpire: 'ক্রেডিটের কোনো মেয়াদ নেই',
    topUpCredits: 'ক্রেডিট টপ-আপ',
    bestValue: 'সেরা ডিল',
    buyNow: 'এখনই কিনুন',
    addedCreditsMsg: 'সফলভাবে {{added}} ক্রেডিট যোগ করা হয়েছে!',
    generateStores: 'স্টোর তৈরি করুন',
    writeProductDescriptions: 'পণ্যের বিবরণ লিখুন',
    designLandingPages: 'ল্যান্ডিং পেজ ডিজাইন করুন',
    transactionHistory: 'লেনদেনের ইতিহাস',
    type: 'টাইপ',
    amount: 'পরিমাণ',
    date: 'তারিখ',
    description: 'বিবরণ',
    storeSetup: 'স্টোর সেটআপ',
    howMuchDoesItCost: 'এটির খরচ কত?',
    fullLandingPage: 'সম্পূর্ণ ল্যান্ডিং পেজ',
    pageSection: 'পেজ সেকশন',
    textEdit: 'টেক্সট এডিট',
    processing: 'প্রসেসিং...',
    // Abandoned Carts Expanded
    countRecoverNeeded: '{{count}}টি কার্ট রিকভার করা প্রয়োজন',
    totalAbandoned: 'মোট পরিত্যক্ত কার্ট',
    recovered: 'রিকভার করা হয়েছে',
    recoveryRate: 'রিকভারির হার',
    lostRevenue: 'সম্ভাব্য আয়',
    noAbandonedCarts: 'এখনও কোনো পরিত্যক্ত কার্ট নেই',
    noAbandonedCartsDesc: 'আপনার পরিত্যক্ত কার্টগুলো এখানে দেখা যাবে।',
    // General
    updating: 'আপডেট হচ্ছে...',
    copiedMsg: 'কপি করা হয়েছে!',
    creditsLabel: 'ক্রেডিট',
    daysAgo: '{{days}} দিন আগে',
    hoursAgo: '{{hours}} ঘণ্টা আগে',
    justNow: 'এইমাত্র',
    abandoned: 'পরিত্যক্ত',
    // Settings / Landing Mode fixes
    landingSettings: 'ল্যান্ডিং পেজ সেটিংস',
    landingSettingsDesc: 'আপনার ল্যান্ডিং পেজ মোড এবং কন্টেন্ট কনফিগার করুন',
    storeMode: 'স্টোর মোড',
    storeModeDesc: 'আপনার স্টোর কিভাবে কাস্টমারদের কাছে প্রদর্শিত হবে তা বেছে নিন',
    fullStore: 'ফুল স্টোর',
    fullStoreDesc: 'ক্যাটাগরি এবং কার্ট সহ পূর্ণাঙ্গ প্রোডাক্ট ক্যাটালগ',
    landingPage: 'ল্যান্ডিং পেজ',
    landingPageDesc: 'সিঙ্গেল প্রোডাক্ট সেলারদের জন্য ডিজাইন করা হাই-কনভার্টিং ল্যান্ডিং পেজ',
    featuredProduct: 'ফিচারড প্রোডাক্ট',
    featuredProductDesc: 'আপনার ল্যান্ডিং পেজের প্রধান প্রোডাক্টটি বেছে নিন',
    selectAProduct: 'একটি প্রোডাক্ট বেছে নিন',
    headlinesCopy: 'হেডলাইন এবং টেক্সট',
    headlinesCopyDesc: 'আপনার ল্যান্ডিং পেজের প্রধান টেক্সটগুলো পরিবর্তন করুন',
    mainHeadline: 'প্রধান হেডলাইন',
    urgencyTextPlaceholder: 'যেমন: সীমিত সময়ের অফার!',
    guaranteeTextPlaceholder: 'যেমন: ৩০ দিনের মানি ব্যাক গ্যারান্টি',
    videoEmbed: 'ভিডিও এম্বেড',
    videoEmbedDesc: 'প্রোডাক্টের একটি ভিডিও যুক্ত করুন',
    videoUrl: 'ভিডিও URL',
    videoUrlDesc: 'ইউটিউব বা ভিমিও ভিডিওর লিংক দিন',
    callToAction: 'কল টু অ্যাকশন',
    callToActionDesc: 'অর্ডার বাটন এবং এর টেক্সট পরিবর্তন করুন',
    buttonText: 'বাটন টেক্সট',
    buttonSubtext: 'বাটনের নিচের ছোট টেক্সট',
    customerName: 'কাস্টমারের নাম',
    theirReview: 'তাদের রিভিউ',
    noTestimonialsYet: 'এখনও কোনো টেস্টিমোনিয়াল নেই',
    socialMedia: 'সোশ্যাল মিডিয়া',
    connectSocialProfiles: 'আপনার সোশ্যাল প্রোফাইলগুলো কানেক্ট করুন',
    quantity: 'পরিমাণ',
    totalPrice: 'মোট দাম',
    noNotes: 'কোনো নোট নেই।',
    item: 'টি পণ্য',
    items: 'টি পণ্য',
    more: 'আরও',
    confirmStatusUpdate: 'আপনি কি নিশ্চিত যে আপনি স্ট্যাটাস পরিবর্তন করতে চান?',
    generateReport: 'রিপোর্ট তৈরি করুন',
    reports: 'রিপোর্ট',
    salesReport: 'সেলস রিপোর্ট',
    inventoryReport: 'ইনভেন্টরি রিপোর্ট',
    customerReport: 'কাস্টমার রিপোর্ট',
    taxReport: 'ট্যাক্স রিপোর্ট',
    dateRange: 'তারিখের পরিসর',
    startDate: 'শুরুর তারিখ',
    endDate: 'শেষের তারিখ',
    clearDates: 'তারিখ মুছুন',
    records: 'রেকর্ড',
    noSalesData: 'কোনো বিক্রির তথ্য পাওয়া যায়নি',
    noInventoryData: 'কোনো ইনভেন্টরি তথ্য পাওয়া যায়নি',
    noCustomerData: 'কোনো কাস্টমার তথ্য পাওয়া যায়নি',
    noTaxData: 'কোনো ট্যাক্স তথ্য পাওয়া যায়নি',
    exportCSV: 'CSV এক্সপোর্ট করুন',
    // Settings & Configuration
    settings: 'সেটিংস',
    storeSettings: 'স্টোর সেটিংস',
    storeName: 'স্টোর নাম',
    subdomain: 'সাবডোমেন',
    storeDescription: 'স্টোর বিবরণ',
    storeLogo: 'স্টোর লোগো',
    storeInformation: 'স্টোর তথ্য',
    storeInformationDesc: 'আপনার স্টোরের মৌলিক পরিচয়',
    settingsSubtitle: 'আপনার স্টোর কনফিগারেশন ম্যানেজ করুন',
    settingsSaved: 'সেটিংস সফলভাবে সেভ করা হয়েছে!',
    storeNameMinLength: 'স্টোরের নাম কমপক্ষে ২ অক্ষরের হতে হবে',
    storeModeUpgradeRequired: 'ফুল স্টোর মোড ব্যবহারের জন্য পেইড প্ল্যান প্রয়োজন। ফিচারটি আনলক করতে আপগ্রেড করুন।',
    faviconHint: '৩২x৩২ বা ১৬x১৬ পিএনজি',
    planManagement: 'প্ল্যান ম্যানেজমেন্ট',
    exitReasonLabel: 'ছেড়ে যাওয়ার কারণ',
    feedbackLabel: 'মতামত (ঐচ্ছিক)',
    // Currencies
    currencyBDT: '৳ BDT - বাংলাদেশী টাকা',
    currencyUSD: '$ USD - ইউএস ডলার',
    currencyEUR: '€ EUR - ইউরো',
    currencyGBP: '£ GBP - ব্রিটিশ পাউন্ড',
    currencyINR: '₹ INR - ভারতীয় রুপি',
    // Languages
    english: 'English',
    bengali: 'বাংলা (Bengali)',
    subdomainLabel: 'সাবডোমেন',
    currentPlanLabel: 'বর্তমান প্ল্যান',
    customDomainLabel: 'কাস্টম ডোমেন',
    branding: 'ব্র্যান্ডিং',
    brandingDesc: 'আপনার স্টোর লোগো এবং ব্র্যান্ডিং',
    logoHint: 'পরামর্শ: স্কয়ার ইমেজ, ২০০x২০০ পিক্সেল বা তার বেশি',
    storeNameLabel: 'স্টোর নাম',
    landingPageMode: 'ল্যান্ডিং পেজ মোড',
    landingPageModeActive: 'একটি হাই-কনভার্টিং সিঙ্গেল পেজ দেখাবে',
    fullStoreMode: 'ফুল স্টোর মোড',
    fullStoreModeLocked: 'প্রো প্ল্যান প্রয়োজন',
    storeFavicon: 'ফেভিকন',
    storeCurrency: 'কারেন্সি',
    storeTheme: 'থিম',
    accentColor: 'অ্যাকসেন্ট কালার',
    fontFamily: 'ফন্ট ফ্যামিলি',
    businessInformation: 'ব্যবসার তথ্য',
    businessAddress: 'ব্যবসার ঠিকানা',
    businessPhone: 'ব্যবসার ফোন',
    businessEmail: 'ব্যবসার ইমেইল',
    businessAddressLabel: 'ব্যবসার ঠিকানা',
    businessPhoneLabel: 'ব্যবসার ফোন',
    businessEmailLabel: 'ব্যবসার ইমেইল',
    seoSettings: 'SEO সেটিংস',
    legalSettings: 'গোপনীয়তা নীতিমালা',
    domainSettings: 'ডোমেন সেটিংস',
    courierSettings: 'কুরিয়ার সেটিংস',
    developerSettings: 'ডেভেলপার সেটিংস',
    whatsappCountryCodeHint: 'হোয়াটসঅ্যাপ লিংকের জন্য কান্ট্রি কোড যুক্ত করুন',
    contactDetailsInvoices: 'ইনভয়েস এবং কাস্টমারদের জন্য যোগাযোগের তথ্য',
    // Domain Settings
    domainSettingsDesc: 'আপনার স্টোরের ডোমেন এবং ইউআরএল ম্যানেজ করুন',
    yourStoreUrls: 'আপনার স্টোর ইউআরএল',
    freeSubdomainActive: 'ফ্রি সাবডোমেন (সবসময় সচল)',
    autoChecking: 'অটো-চেকিং...',
    completeDnsSetup: 'DNS সেটআপ সম্পন্ন করুন',
    nameHost: 'Name / Host',
    valueTarget: 'Value / Target',
    refreshStatus: 'স্ট্যাটাস রিফ্রেশ করুন',
    removeDomainBtn: 'ডোমেন সরান',
    addCnameRecord: 'আপনার ডোমেনের DNS সেটিংসে এই CNAME রেকর্ডটি যুক্ত করুন:',
    dnsSetupWaitMsg: 'DNS রেকর্ড যুক্ত করার পর, SSL সার্টিফিকেট স্বয়ংক্রিয়ভাবে ইস্যু করা হবে (সাধারণত ৫-১৫ মিনিট সময় লাগে)।',
    domainConnected: 'ডোমেন কানেক্টেড!',
    domainConnectedDesc: 'আপনার কাস্টম ডোমেন সচল এবং HTTPS এর মাধ্যমে স্টোর চলছে।',
    domainRequestPending: 'ডোমেন রিকোয়েস্ট পেন্ডিং',
    domainRequestReviewing: '{{domain}} এর জন্য আপনার রিকোয়েস্ট রিভিউ করা হচ্ছে।',
    willNotifyOnceApproved: 'আপনার ডোমেন কানেক্ট করার জন্য প্রস্তুত হলে আমরা আপনাকে জানাব।',
    cancelRequest: 'রিকোয়েস্ট বাতিল করুন',
    addCustomDomain: 'কাস্টম ডোমেন যুক্ত করুন',
    addCustomDomainDesc: 'আপনার স্টোরের সাথে নিজস্ব ডোমেন যুক্ত করুন।',
    premiumFeature: 'প্রিমিয়াম ফিচার',
    upgradeToStarter: 'পেইড প্ল্যানে আপগ্রেড করুন',
    upgradeToConnectDomain: 'নিজস্ব ডোমেন যুক্ত করতে (যেমন: myshop.com)।',
    freePlanSubdomainOnly: 'ফ্রি প্ল্যানে শুধুমাত্র সাবডোমেন ব্যবহার করা যায়। কাস্টম ডোমেনের জন্য পেইড সাবস্ক্রিপশন প্রয়োজন।',
    upgradeToStarterPlan: 'স্টার্টার প্ল্যানে আপগ্রেড করুন',
    yourDomain: 'আপনার ডোমেন',
    enterDomainYouOwn: 'আপনি যে ডোমেনটি ব্যবহার করতে চান সেটি লিখুন। ডোমেনটি অবশ্যই আপনার মালিকানাধীন হতে হবে।',
    addingDomain: 'ডোমেন যুক্ত হচ্ছে...',
    dnsInstructionsPreview: 'যুক্ত করার পর, আপনাকে এই DNS রেকর্ডটি যোগ করতে হবে:',
    invalidDomainFormat: 'ভুল ডোমেন ফরম্যাট। উদাহরণ: shop.example.com',
    domainAlreadyTaken: 'এই ডোমেনটি ইতিমধ্যে অন্য একটি স্টোর ব্যবহার করছে।',
    domainRequestSubmitted: 'ডোমেন রিকোয়েস্ট জমা দেওয়া হয়েছে। আমাদের টিম ২৪ ঘণ্টার মধ্যে এটি সেটআপ করে দিবে।',
    domainAddedSuccess: 'ডোমেন যুক্ত হয়েছে! এখন সেটআপ সম্পন্ন করতে আপনার DNS কনফিগার করুন।',
    ssl: 'SSL',
    dns: 'DNS',
    cnameNameHost: '@ (অথবা www)',
    domainPlaceholder: 'shop.yourdomain.com',
    domainAlreadyConfigured: 'আপনার ইতিমধ্যে একটি কাস্টম ডোমেন কনফিগার করা আছে। নতুন ডোমেন যুক্ত করার আগে এটি সরিয়ে ফেলুন।',
    hostnameRefreshSuccess: 'স্ট্যাটাস রিফ্রেশ করা হয়েছে!',
    hostnameRefreshFailed: 'স্ট্যাটাস রিফ্রেশ করতে ব্যর্থ হয়েছে',
    domainRemovalSuccess: 'ডোমেন সফলভাবে সরানো হয়েছে।',
    domainRemovalFailed: 'ডোমেন সরাতে ব্যর্থ হয়েছে',
    customDomain: 'কাস্টম ডোমেন',
    connectOwnDomain: 'নিজস্ব ডোমেন যুক্ত করুন',
    storeCurrentlyAt: 'আপনার স্টোর বর্তমানে এখানে পাওয়া যাচ্ছে:',
    customDomainOptional: 'কাস্টম ডোমেন (ঐচ্ছিক)',
    enterDomainWithoutHttps: 'https:// ছাড়া আপনার ডোমেন লিখুন',
    setupInstructions: 'সেটআপ নির্দেশনা:',
    dnsStep1: 'আপনার ডোমেন রেজিস্ট্রারের DNS সেটিংসে যান',
    dnsStep2: 'একটি CNAME রেকর্ড যুক্ত করুন:',
    dnsStep3: 'Cloudflare ড্যাশবোর্ডে ডোমেন যুক্ত করতে অ্যাডমিনের সাথে যোগাযোগ করুন',
    dnsStep4: 'DNS প্রচারের জন্য অপেক্ষা করুন (৪৮ ঘণ্টা পর্যন্ত সময় লাগতে পারে)',
    seoOptimizeDesc: 'সার্চ ইঞ্জিনের জন্য আপনার স্টোর অপ্টিমাইজ করুন',
    seoSearchPreview: 'সার্চ ইঞ্জিন প্রিভিউ',
    seoGoogleAppear: 'গুগল-এ আপনার স্টোর যেভাবে দেখাবে',
    seoAddDescription: 'সার্চ রেজাল্টে কাস্টমারদের আপনার স্টোর খুঁজে পেতে সাহায্য করার জন্য একটি বিবরণ যুক্ত করুন।',
    metaTitle: 'মেটা টাইটেল',
    metaDescription: 'মেটা ডেসক্রিপশন',
    characters: 'অক্ষর',
    seoDescPlaceholder: '১-২ বাক্যে আপনার স্টোরের বর্ণনা দিন...',
    keywordsLabel: 'কিওয়ার্ড (কমা দিয়ে আলাদা করুন)',
    keywordsPlaceholder: 'যেমন: অনলাইন স্টোর, ফ্যাশন, ইলেকট্রনিক্স',
    socialMediaImage: 'সোশ্যাল মিডিয়া ইমেজ',
    socialMediaImageDesc: 'ফেসবুক, টুইটার ইত্যাদিতে শেয়ার করার সময় দেখাবে।',
    uploadImage: 'ছবি আপলোড করুন',
    ogImageRecommend: 'পরামর্শ: ১২০০×৬৩০ পিক্সেল (১.৯১:১ অনুপাত)',
    seoTips: 'SEO টিপস',
    seoTip1: 'ভালোভাবে দেখানোর জন্য মেটা টাইটেল ৬০ অক্ষরের মধ্যে রাখুন',
    seoTip2: 'মেটা ডেসক্রিপশন ১৫০-১৬০ অক্ষরের হওয়া উচিত',
    seoTip3: 'টাইটেল-এ আপনার প্রধান প্রোডাক্ট বা সার্ভিসের নাম রাখুন',
    seoTip4: 'ডেসক্রিপশন-এ অ্যাকশন শব্দ ব্যবহার করুন (Shop, Discover, Buy)',
    saveSeoSettings: 'SEO সেটিংস সেভ করুন',
    seoSettingsSaved: 'SEO সেটিংস সফলভাবে সেভ করা হয়েছে!',
    uploading: 'আপলোড হচ্ছে...',
    // Billing & Plans
    billing: 'বিলিং',
    billingHistory: 'বিলিং হিস্টোরি',
    currentSubscription: 'বর্তমান সাবস্ক্রিপশন',
    nextBillingDate: 'পরবর্তী বিলিং তারিখ',
    billingPaymentMethod: 'পেমেন্ট মেথড',
    changePlan: 'প্ল্যান পরিবর্তন করুন',
    cancelSubscription: 'সাবস্ক্রিপশন বাতিল করুন',
    invoices: 'ইনভয়েস',
    managePlanAndUsage: 'আপনার প্ল্যান ম্যানেজ করুন এবং ব্যবহার মনিটর করুন',
    monthlyOrders: 'মাসিক অর্ডার',
    usage: 'ব্যবহার',
    activeProducts: 'সক্রিয় প্রোডাক্ট',
    monthlyVisitors: 'মাসিক ভিজিটর',
    unlimited: 'সীমাহীন',
    resetsOn1st: 'প্রতি মাসের ১ তারিখে রিসেট হয়',
    approachingLimit: 'আপনি সীমার কাছাকাছি পৌঁছেছেন। আপগ্রেড করার কথা ভাবুন।',
    highTrafficUpgrade: 'অধিক ট্রাফিক পাওয়া যাচ্ছে। আরও ভিজিটর হ্যান্ডেল করতে আপগ্রেড করুন।',
    publishedProducts: 'আপনার স্টোরের সক্রিয় প্রোডাক্ট সমূহ',
    freePlanLimit5Products: 'আপনি ৫টি প্রোডাক্টের সীমায় পৌঁছেছেন। আরও যুক্ত করতে আপগ্রেড করুন।',
    upgradeNow: 'এখনই আপগ্রেড করুন',
    readyToGrow: 'বড় কিছুর জন্য প্রস্তুত?',
    selectPlanBasedNeeds: 'আপনার প্রয়োজন অনুযায়ী একটি প্ল্যান বেছে নিন',
    startFreeUpgradeLater: 'ফ্রি প্ল্যান দিয়ে শুরু করুন এবং পরে আপগ্রেড করুন!',
    free: 'ফ্রি',
    starter: 'স্টার্টার',
    perMonth: '/মাস',
    unlockMoreFeatures: 'আরও ফিটার পেতে একটি প্ল্যান বেছে নিন',
    backToBilling: 'বিলিং-এ ফিরে যান',
    upgradePlan: 'প্ল্যান আপগ্রেড করুন',
    copyBtn: 'কপি করুন',
    manageCredits: 'ক্রেডিট ম্যানেজ করুন',
    upgradeTo: 'আপগ্রেড করুন',
    plan: 'প্ল্যান',
    planStatusActive: 'সক্রিয়',
    planStatusPastDue: 'পেমেন্ট বাকি',
    planStatusCanceled: 'বাতিল',
    upgradeToStarterDesc: 'সব ফিচার আনলক করুন এবং আপনার ব্যবসা বৃদ্ধি করুন।',
    businessPlan: 'বিজনেস প্ল্যান',
    customSolutionForLarge: 'বড় স্কেলের ব্যবসার জন্য কাস্টম সমাধান।',
    unlimitedProducts: 'সীমাহীন প্রোডাক্ট',
    unlimitedOrders: 'সীমাহীন অর্ডার',
    unlimitedVisitors: 'সীমাহীন ভিজিটর',
    dedicatedSupport: 'ডেডিকেটেড সাপোর্ট',
    everythingUnlimited: 'সবকিছু সীমাহীন যাতে আপনি কোনো বাধা ছাড়াই ব্যবসা বাড়াতে পারেন।',
    contactUs: 'যোগাযোগ করুন',
    needHelp: 'সাহায্য দরকার?',
    billingSupportContact: 'বিলিং সংক্রান্ত যেকোনো জিজ্ঞাসার জন্য আমাদের সাপোর্ট টিমে যোগাযোগ করুন।',
    bkashNagadPayment: 'বিকাশ / নগদ পেমেন্ট',
    sendMoneySubmitTrx: 'Send Money করুন এবং Transaction ID সাবমিট করুন',
    sendMoneyToNumber: 'এই নম্বরে Send Money করুন:',
    numberCopied: 'নম্বর কপি করা হয়েছে!',
    selectPlanFirst: '👇 প্রথমে নিচে থেকে একটি প্ল্যান বেছে নিন',
    haveCouponCode: 'কুপন কোড আছে?',
    discountApplied: 'ডিসকাউন্ট যুক্ত হয়েছে!',
    enterCouponCode: 'কুপন কোড লিখুন',
    checking: 'চেক করা হচ্ছে...',
    apply: 'প্রয়োগ করুন',
    selectPlanToApplyCoupon: 'কুপন প্রয়োগ করতে প্রথমে একটি প্ল্যান বেছে নিন',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    saveAmount: 'সাশ্রয়',
    selectThisPlan: 'এই প্ল্যানটি বেছে নিন',
    selected: 'নির্বাচিত',
    notAvailable: 'পাওয়া যাচ্ছে না',
    contactViaWhatsapp: 'হোয়াটসঅ্যাপে যোগাযোগ করুন',
    successfullySubmitted: 'সাফল্যের সাথে জমা দেওয়া হয়েছে!',
    paymentVerifyActivation: 'আমরা আপনার পেমেন্ট ভেরিফাই করব এবং ২৪ ঘণ্টার মধ্যে আপনার প্ল্যানটি চালু করব।',
    amountToSend: 'পাঠাতে হবে:',
    bkashNagadNumber: 'আপনার বিকাশ/নগদ নম্বর',
    revenueLabel: 'আয়',
    submitting: 'জমা দেওয়া হচ্ছে...',
    submitPayment: 'পেমেন্ট সাবমিট করুন',
    faqs: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)',
    faqBillingTitle: 'বিলিং কীভাবে কাজ করে?',
    faqBillingDesc: 'আপনাকে প্রতি মাসে চার্জ করা হবে। আপনি পরবর্তী রিনিউয়াল তারিখের আগে বাতিল না করলে আপনার সাবস্ক্রিপশন স্বয়ংক্রিয়ভাবে রিনিউ হবে।',
    faqUpgradeTitle: 'আমি কি পরে আপগ্রেড করতে পারি?',
    faqUpgradeDesc: 'হ্যাঁ! আপনি যেকোনো সময় একটি উচ্চতর প্ল্যানে আপগ্রেড করতে পারেন। আপনি শুধুমাত্র বাকি বিলিং পিরিয়ডের জন্য অতিরিক্ত ফি প্রদান করবেন।',
    faqDowngradeTitle: 'আমি ডাউনগ্রেড করলে আমার তথ্যের কী হবে?',
    faqDowngradeDesc: 'আপনার তথ্য নিরাপদ থাকবে। তবে, আপনি যদি নতুন প্ল্যানের সীমা অতিক্রম করেন, তবে আপনাকে কিছু প্রোডাক্ট সরিয়ে ফেলতে হতে পারে বা অর্ডারের জন্য পরবর্তী বিলিং সাইকেল পর্যন্ত অপেক্ষা করতে হতে পারে।',
    faqCouponTitle: 'কুপন কোড কীভাবে কাজ করে?',
    faqCouponDesc: 'কুপন কোড আপনাকে সাবস্ক্রিপশন ফি-তে ডিসকাউন্ট দেয়। একটি প্ল্যান সিলেক্ট করুন, আপনার কুপন কোড দিন এবং Apply বাটনে ক্লিক করুন। ডিসকাউন্টেড দাম দেখা যাবে।',
    teamSettings: 'টিম ম্যানেজমেন্ট',
    teamMembers: 'টিম মেম্বার',
    inviteTeamMember: 'টিম মেম্বার ইনভাইট করুন',
    // Inventory
    inventoryManageDesc: 'স্টক এবং ইনভেন্টরি ম্যানেজ করুন',
    importCsv: 'CSV ইমপোর্ট করুন',
    exportCsv: 'CSV এক্সপোর্ট করুন',
    totalUnits: 'মোট ইউনিট',
    importProducts: 'প্রোডাক্ট ইমপোর্ট করুন',
    bulkImportDesc: 'CSV ফাইলের মাধ্যমে একসাথে অনেক প্রোডাক্ট ইমপোর্ট করুন',
    csvFormatRequirements: 'CSV ফরম্যাটের রিকোয়ারমেন্ট',
    csvFormatInstructions: 'আপনার CSV ফাইলে নিচের কলামগুলো থাকা উচিত:',
    downloadTemplate: 'স্যাম্পল CSV টেমপ্লেট ডাউনলোড করুন',
    chooseCsvFile: 'CSV ফাইল নির্বাচন করুন',
    clickToUpload: 'আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন',
    csvFilesOnly: 'শুধুমাত্র CSV ফাইল',
    previewFirst5Rows: 'প্রিভিউ (প্রথম ৫টি সারি)',
    totalRows: 'মোট সারি',
    importing: 'ইমপোর্ট হচ্ছে...',
    importCompleteMessage: 'ইমপোর্ট সম্পন্ন: {{created}}টি তৈরি, {{updated}}টি আপডেট করা হয়েছে',
    invalidPriceRow: 'সারি {{row}}: ভুল দাম',
    missingFieldsRow: 'সারি {{row}}: প্রয়োজনীয় তথ্য (টাইটেল, দাম) নেই',
    rowCountMismatch: 'সারি {{row}}: কলামের সংখ্যা ঠিক নেই',
    noCsvData: 'কোনো CSV তথ্য প্রদান করা হয়নি',
    inStock: 'স্টকে আছে',
    lowStock: 'লো স্টক',
    outOfStockLabel: 'স্টক শেষ',
    lowStockAlertWithCount: '{{count}}টি প্রোডাক্টের স্টক কমে গেছে',
    lowStockThresholdDesc: 'স্টক লেভেল {{threshold}} ইউনিটের সমান বা নিচে',
    viewLowStock: 'লো স্টক দেখুন',
    searchInventoryPlaceholder: 'নাম বা SKU দিয়ে সার্চ করুন...',
    noProductsTitle: 'এখনও কোনো প্রোডাক্ট নেই',
    noProductsDesc: 'ইনভেন্টরি শুরু করতে প্রোডাক্ট যুক্ত করুন।',
    noProductsMatchFilters: 'ফিল্টারের সাথে কোনো প্রোডাক্ট মেলেনি।',
    productTableHeader: 'প্রোডাক্ট',
    skuTableHeader: 'SKU',
    priceTableHeader: 'মূল্য',
    stockLevelTableHeader: 'স্টক লেভেল',
    adjustTableHeader: 'অ্যাডজাস্ট',
    unitsLabel: 'ইউনিট',
    role: 'রোল',
    ownerRole: 'মালিক',
    adminRole: 'অ্যাডমিন',
    staffRole: 'স্টাফ',
    viewerRole: 'ভিউয়ার',
    // Discounts
    discountsManageDesc: 'বিক্রি বাড়াতে প্রোমো কোড তৈরি করুন',
    createCode: 'কোড তৈরি করুন',
    editDiscountCode: 'ডিসকাউন্ট কোড এডিট করুন',
    createDiscountCode: 'ডিসকাউন্ট কোড তৈরি করুন',
    discountCodeLabel: 'ডিসকাউন্ট কোড',
    discountTypeLabel: 'ডিসকাউন্ট টাইপ',
    percentage: 'শতকরা',
    fixed: 'নির্দিষ্ট',
    percentageOff: 'শতকরা ডিসকাউন্ট (%)',
    amountOff: 'ডিসকাউন্ট পরিমাণ',
    minOrderAmountLabel: 'নূন্যতম অর্ডার',
    maxDiscountCap: 'সর্বোচ্চ ডিসকাউন্ট সীমা',
    maxUsesLabel: 'সর্বোচ্চ ব্যবহার (মোট)',
    expiryDateLabel: 'মেয়াদ শেষ হওয়ার তারিখ',
    codeIsActive: 'কোডটি সচল আছে',
    saving: 'সেভ হচ্ছে...',
    updateCode: 'কোড আপডেট করুন',
    yourDiscountCodes: 'আপনার ডিসকাউন্ট কোডগুলো',
    offLabel: 'ছাড়',
    usedLabel: 'ব্যবহৃত',
    expiredLabel: 'মেয়াদ শেষ',
    expiresLabel: 'মেয়াদ শেষ হবে',
    activeLabel: 'সক্রিয়',
    inactiveLabel: 'নিষ্ক্রিয়',
    deleteConfirmDiscount: 'এই ডিসকাউন্ট কোডটি মুছে ফেলতে চান?',
    noDiscountsYet: 'এখনও কোনো ডিসকাউন্ট কোড নেই',
    createFirstCodeDesc: 'আরও কাস্টমার পেতে প্রোমো কোড তৈরি করুন',
    createFirstCodeBtn: 'আপনার প্রথম কোডটি তৈরি করুন',
    codeMinLength: 'কোড কমপক্ষে ৩ অক্ষরের হতে হবে',
    valueMin: 'ডিসকাউন্ট মান ০ এর বেশি হতে হবে',
    percentageMax: 'শতকরা ১০০% এর বেশি হতে পারবে না',
    codeExists: 'এই কোডটি ইতিমধ্যে ব্যবহার করা হয়েছে',
    failedProcessRequest: 'রিকোয়েস্ট প্রসেস করতে ব্যর্থ হয়েছে',
    // Developer
    developerApi: 'ডেভেলপার এপিআই',
    apiKeys: 'এপিআই কী',
    webhooks: 'ওয়েব হুকস',
    generateKey: 'কী তৈরি করুন',
    developerApiDesc: 'কাস্টম ইন্টিগ্রেশনের জন্য আপনার API কী এবং ওয়েব হুকস ম্যানেজ করুন',
    keysSecretWarning: 'সিক্রেট কী শুধুমাত্র একবার তৈরির সময় দেখা যাবে। এটি নিরাপদ রাখুন।',
    keyName: 'কী-এর নাম',
    keyPrefix: 'কী প্রিফিক্স',
    keyCreated: 'তৈরি হয়েছে',
    noApiKeys: 'কোনো API কী পাওয়া যায়নি',
    createWebhook: 'ওয়েব হুক তৈরি করুন',
    realtimeUpdates: 'রিয়েলটাইম আপডেট',
    webhooksDesc: 'আপনার স্টোরে কোনো ইভেন্ট ঘটলে নোটিফিকেশন পান।',
    signaturesValidVia: 'সিগনেচার ভ্যালিডেশন মাধ্যম',
    topics: 'টপিক',
    addWebhook: 'ওয়েব হুক যোগ করুন',
    adding: 'যোগ করা হচ্ছে...',
    noResults: 'কোনো ফলাফল পাওয়া যায়নি',
    deleteWebhookConfirm: 'আপনি কি নিশ্চিত যে আপনি এই ওয়েব হুকটি মুছে ফেলতে চান?',
    webhookSecretTitle: 'ওয়েব হুক সিক্রেট',
    webhookSecretDesc: 'ওয়েব হুক সিগনেচার ভেরিফাই করতে এই সিক্রেট ব্যবহার করুন',
    apiKeyCreatedTitle: 'API কী তৈরি হয়েছে',
    copyKeyNow: 'আপনার API কী এখনই কপি করুন। এটি আর দেখা যাবে না।',
    savedIt: 'সেভ করেছি',
    revokeConfirm: 'আপনি কি নিশ্চিত যে আপনি এই API কী টি রিভোক করতে চান?',
    revoked: 'বাতিল',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    url: 'URL',
    done: 'সম্পন্ন',
    name: 'নাম',
    // Tracking & Analytics Configuration
    trackingAnalyticsHeader: 'ট্র্যাকিং এবং অ্যানালিটিক্স',
    ffPixelDesc: 'ফেসবুক পিক্সেল এবং গুগল অ্যানালিটিক্স',
    configureTracking: 'ট্র্যাকিং কনফিগার করুন',
    notConfigured: 'কনফিগার করা নেই',
    fbPixelIdDesc: 'ফেসবুক ইভেন্টস ম্যানেজার থেকে ১৫-১৬ ডিজিটের পিক্সেল আইডি।',
    openEventsManager: 'ইভেন্টস ম্যানেজার খুলুন',
    capiToken: 'কনভার্সন এপিআই অ্যাক্সেস টোকেন',
    capiActive: 'CAPI সক্রিয়',
    howToGet: 'কীভাবে পাবেন:',
    capiStep1: '১. ফেসবুক বিজনেস ম্যানেজার → ইভেন্টস ম্যানাজারে যান',
    capiStep2: '২. আপনার পিক্সেল সিলেক্ট করুন',
    capiStep3: '৩. সেটিংস ট্যাবে ক্লিক করুন',
    capiStep4: '৪. "Conversions API" সেকশনে যান',
    capiStep5: '৫. "Generate Access Token" বাটনে ক্লিক করুন',
    capiStep6: '৬. টোকেনটি কপি করে এখানে পেস্ট করুন',
    capiSecretWarning: '⚠️ এই টোকেনটি গোপন রাখুন, কারো সাথে শেয়ার করবেন না।',
    capiBenefit: 'iOS 14+ এবং অ্যাড ব্লকারদের ট্র্যাকিং আরও ভালো করতে অ্যাক্সেস টোকেন যুক্ত করুন।',
    gaIdDesc: 'গুগল অ্যানালিটিক্স থেকে GA4 মেজারমেন্ট আইডি (G-XXXXXXXXXX)।',
    openGA: 'গুগল অ্যানালিটিক্স খুলুন',
    eventsTracked: 'যে ইভেন্টগুলো ট্র্যাক করা হবে',
    pageView: 'PageView',
    viewContent: 'ViewContent',
    initiateCheckout: 'InitiateCheckout',
    purchase: 'Purchase',
    lead: 'Lead',
    importantInfo: 'গুরুত্বপূর্ণ তথ্য',
    pixelWarning: 'আপনার পিক্সেল তথ্য ফেসবুক/গুগল দ্বারা সংরক্ষিত হয়। আপনি পিক্সেল ডিসকানেক্ট করলে এই তথ্যগুলো আর ব্যবহার করতে পারবেন না।',
    trackingSetupDesc: 'কাস্টমারদের আচরণ ট্র্যাক করতে ফেসবুক পিক্সেল এবং গুগল অ্যানালিটিক্স সেটআপ করুন।',
    everyPageLoad: 'প্রতিবার পেজ লোড হওয়া',
    productPage: 'প্রোডাক্ট পেজ',
    checkoutPage: 'চেকআউট পেজ',
    thankYouPage: 'থ্যাংক ইউ পেজ',
    contactForm: 'কন্টাক্ট ফর্ম',
    invalidPixelId: 'ভুল ফেসবুক পিক্সেল আইডি ফরম্যাট।',
    invalidGaId: 'ভুল GA4 মেজারমেন্ট আইডি ফরম্যাট।',
    trackingSaved: 'ট্র্যাকিং সেটিংস সফলভাবে সেভ করা হয়েছে!',
    // Store Design
    storeDesignTitle: 'স্টোর ডিজাইন',
    storeDesignDesc: 'আপনার স্টোরের চেহারা এবং সেটিংস কাস্টমাইজ করুন',
    viewLiveStore: 'লাইভ স্টোর দেখুন',
    openLiveEditor: 'লাইভ এডিটর খুলুন',
    storeModeRequired: 'স্টোর মোড প্রয়োজন',
    goToSettings: 'সেটিংসে যান',
    activeTemplate: 'সক্রিয় টেমপ্লেট',
    fullPreview: 'ফুল প্রিভিউ',
    quickPreview: 'কুইক প্রিভিউ',
    currentlyActive: 'বর্তমানে সক্রিয়',
    applying: 'প্রয়োগ হচ্ছে...',
    applyTemplate: 'টেমপ্লেট প্রয়োগ করুন',
    colorTheme: 'কালার থিম',
    colorThemeDesc: 'আপনার ব্র্যান্ডের সাথে মেলে এমন রং বেছে নিন।',
    quickPresets: 'কুইক প্রিসেটস',
    primaryColor: 'প্রাথমিক রং (Primary Color)',
    primaryColorDesc: 'বাটন, হেডার এবং অ্যাকসেন্টের জন্য ব্যবহৃত হয়',
    accentColorDesc: 'হাইলাইট এবং সেকেন্ডারি এলিমেন্টের জন্য ব্যবহৃত হয়',
    primaryButton: 'প্রাইমারি বাটন',
    accentButton: 'অ্যাকসেন্ট বাটন',
    saveColors: 'রং সেভ করুন',
    heroBanner: 'হিরো ব্যানার',
    bannerImage: 'ব্যানার ইমেজ',
    bannerSizeHint: 'পরামর্শ: ১৯২০x৬০০ পিক্সেল',
    bannerHeadline: 'ব্যানার হেডলাইন',
    bannerHeadlinePlaceholder: 'আমাদের স্টোরে স্বাগতম',
    announcementBar: 'অ্যানাউন্সমেন্ট বার',
    announcementBarDesc: 'আপনার স্টোরের একদম উপরে দেখাবে।',
    announcementText: 'অ্যানাউন্সমেন্ট টেক্সট',
    announcementPlaceholder: '🎉 ১০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং!',
    linkOptional: 'লিংক (ঐচ্ছিক)',
    saveBanner: 'ব্যানার সেভ করুন',
    storeLogoTitle: 'স্টোর লোগো',
    logoRecommendedSize: 'পরামর্শ: স্কয়ার ইমেজ, ২০০x২০০ পিক্সেল বা তার বেশি',
    contactInfo: 'যোগাযোগের তথ্য',
    phoneNumber: 'ফোন নম্বর',
    emailAddress: 'ইমেইল ঠিকানা',
    socialMediaLinks: 'সোশ্যাল মিডিয়া লিংক',
    socialMediaLinksDesc: 'আপনার স্টোরের ফুটারে সোশ্যাল প্রোফাইলগুলো দেখান।',
    facebookUrl: 'ফেসবুক ইউআরএল',
    instagramUrl: 'ইনস্টাগ্রাম ইউআরএল',
    whatsappNumber: 'হোয়াটসঅ্যাপ নম্বর',
    saveStoreInfo: 'স্টোর তথ্য সেভ করুন',
    advancedSaved: 'অ্যাডভান্সড সেটিংস সেভ করা হয়েছে!',
    templates: 'টেমপ্লেট',
    theme: 'থিম',
    banner: 'ব্যানার',
    info: 'তথ্য',
    advanced: 'অ্যাডভান্সড',
    colors: 'কালার',
    templateApplied: 'টেমপ্লেট প্রয়োগ করা হয়েছে!',
    themeSaved: 'থিম সেভ করা হয়েছে!',
    bannerSaved: 'ব্যানার সেভ করা হয়েছে!',
    infoSaved: 'স্টোর তথ্য সেভ করা হয়েছে!',
    customCss: 'কাস্টম CSS',
    customCssDesc: 'আপনার স্টোরের স্টাইলিং আরও কাস্টমাইজ করতে নিজস্ব CSS যুক্ত করুন।',
    saveAdvancedSettings: 'অ্যাডভান্সড সেটিংস সেভ করুন',
    cssWarning: '⚠️ CSS ব্যবহারের ক্ষেত্রে সতর্ক থাকুন - ভুল স্টাইল আপনার স্টোরের লেআউট নষ্ট করতে পারে।',
    catLuxury: 'লাক্সারি',
    catTech: 'টেক',
    catArtisan: 'আর্টিজান',
    catModern: 'মডার্ন',
    colorIndigo: 'ইন্ডিগো',
    colorEmerald: 'এমারেল্ড',
    colorRose: 'রোজ',
    colorAmber: 'অ্যাম্বার',
    colorSky: 'স্কাই',
    colorSlate: 'স্লেট',
    fontInterDesc: 'মডার্ন এবং ক্লিন',
    fontPoppinsDesc: 'জ্যামিতিক এবং ফ্রেন্ডলি',
    fontRobotoDesc: 'ইন্ডাস্ট্রিয়াল এবং নির্ভরযোগ্য',
    fontHindDesc: 'বাংলার জন্য অপ্টিমাইজড',
    fontPlayfairDesc: 'এলিগ্যান্ট এবং ক্লাসিক',
    fontMontserratDesc: 'স্টাইলিশ এবং ভার্সাটাইল',
    // Reviews
    reviewsSection: 'রিভিউ',
    reviewsSectionDesc: 'আপনার প্রোডাক্টের কাস্টমার রিভিউ ম্যানেজ করুন',
    pending: 'পেন্ডিং',
    published: 'প্রকাশিত',
    rejected: 'বাতিল',
    noReviewsTitle: 'কোনো {{status}} রিভিউ নেই',
    noReviewsPendingDesc: 'কাস্টমারদের নতুন রিভিউ মডারেশনের জন্য এখানে দেখা যাবে।',
    noReviewsOtherDesc: 'আপনার {{status}} করা রিভিউগুলো এখানে দেখা যাবে।',
    product: 'প্রোডাক্ট',
    rating: 'রেটিং',
    comment: 'মন্তব্য',
    approve: 'অনুমোদন করুন',
    reject: 'বাতিল করুন',
    approved: 'অনুমোদিত',
    unknownProduct: 'অজানা প্রোডাক্ট',
    // Others
    moreSettings: 'আরও সেটিংস',
    shippingZonesLink: 'শিপিং জোন',
    seoSettingsLink: 'SEO সেটিংস',
    teamMembersLink: 'টিম মেম্বার',
    activityLogLink: 'অ্যাক্টিভিটি লগ',
    landingModeLink: 'ল্যান্ডিং মোড',
    courierApiLink: 'কুরিয়ার এপিআই',
    developerApiLink: 'ডেভেলপার এপিআই',
    dangerZone: 'ডেঞ্জার জোন',
    irreversibleActions: 'অপরিবর্তনীয় পদক্ষেপ',
    deleteStore: 'স্টোর মুছে ফেলুন',
    deleteStoreConfirmTitle: 'স্টোর মুছবেন?',
    deleteStoreConfirmSubtitle: 'এই পরিবর্তন আর ফেরত আনা সম্ভব নয়',
    permanentlyDeleteWarning: 'আপনি স্থায়ীভাবে মুছে ফেলতে চলেছেন',
    dataLossWarning: 'আপনার স্টোরের সমস্ত তথ্য চিরতরে হারিয়ে যাবে। এর মধ্যে রয়েছে:',
    dataYouWillLose: 'যে তথ্যগুলো আপনি হারাবেন',
    whyLeaving: 'কেন আপনি ছেড়ে যাচ্ছেন?',
    selectReason: 'একটি কারণ বেছে নিন...',
    pricingTooHigh: 'মূল্য অনেক বেশি',
    missingFeatures: 'প্রয়োজনীয় ফিটারের অভাব',
    switchingCompetitor: 'অন্য প্ল্যাটফর্মে চলে যাচ্ছি',
    closingBusiness: 'ব্যবসা বন্ধ করে দিচ্ছি',
    takingBreak: 'সাময়িকভাবে বিরতি নিচ্ছি',
    otherReason: 'অন্যান্য কারণ',
    feedbackPlaceholder: 'অতিরিক্ত কোনো মতামত? (আমাদের আরও ভালো করতে সাহায্য করবে)',
    typeDeleteToConfirm: 'নিশ্চিত করতে DELETE লিখুন',
    typeDeleteHere: 'এখানে DELETE লিখুন...',
    cancelKeepStore: 'বাতিল করুন, স্টোর রাখুন',
    deleteForever: 'চিরতরে মুছে ফেলুন',
    deleting: 'মুছে ফেলা হচ্ছে...',
    lastChanceReminder: 'এটি আপনার শেষ সুযোগ। একবার মুছে ফেললে আর ফিরে পাওয়া যাবে না।',
    permanentlyDeleteStore: 'চিরতরে এই স্টোর এবং এর সব তথ্য মুছে ফেলুন',
    savingSettings: 'সেভ হচ্ছে...',
    saveSettings: 'সেটিংস সেভ করুন',
    liveEditor: 'লাইভ এডিটর',
    // Homepage Strategy
    homepageSettings: 'হোমপেজ সেটিংস',
    homepageDesc: 'আপনার স্টোরের হোমপেজ কাস্টমারদের কাছে কীভাবে দেখাবে তা বেছে নিন',
    landingPageSaved: 'আপনার ল্যান্ডিং পেজ সেভ করা হয়েছে!',
    landingPageSavedDesc: 'আপনার আগের হোমপেজটি এখন ক্যাম্পেইন লিংক হিসেবে পাওয়া যাবে।',
    campaignLink: 'ক্যাম্পেইন লিংক',
    currentHomepage: 'বর্তমান হোমপেজ',
    featuredProductLabel: 'ফিচারড প্রোডাক্ট',
    chooseStrategy: 'আপনার স্ট্র্যাটেজি বেছে নিন',
    funnelMode: 'ফ্যানেল মোড',
    funnelModeDesc: 'একটি নির্দিষ্ট প্রোডাক্টের ওপর ফোকাস করা হাই-কনভার্টিং ল্যান্ডিং পেজ।',
    storefrontMode: 'স্টোরফ্রন্ট মোড',
    storefrontModeDesc: 'ক্যাটাগরি, কার্ট এবং চেকআউট সহ পূর্ণাঙ্গ প্রোডাক্ট ক্যাটালগ।',
    landingSavedAuto: 'আপনার ল্যান্ডিং পেজ স্বয়ংক্রিয়ভাবে সেভ হবে',
    campaignLinkNotice: 'আমরা একটি ক্যাম্পেইন লিংক তৈরি করব যাতে আপনি এটি বিজ্ঞাপনের জন্য ব্যবহার করতে পারেন।',
    singleProductFocus: 'একটি প্রোডাক্টের ওপর ফোকাস করা ল্যান্ডিং পেজ',
    homepageStrategyUpdated: 'হোমপেজ স্ট্র্যাটেজি সফলভাবে আপডেট করা হয়েছে।',
    landingSavedAsCampaign: 'আপনার ল্যান্ডিং পেজটি ক্যাম্পেইন হিসেবে সেভ করা হয়েছে!',
    upgradeRequiredStoreMode: 'ফুল স্টোর মোডের জন্য পেইড প্ল্যান প্রয়োজন। অনুগ্রহ করে আপগ্রেড করুন।',
    homepageBackupName: 'হোমপেজ ব্যাকআপ - {{date}}',
    switching: 'পরিবর্তন হচ্ছে...',
    noChanges: 'কোনো পরিবর্তন নেই',
    applyStrategy: 'স্ট্র্যাটেজি প্রয়োগ করুন',
    unlockStorefrontModeStatus: 'স্টোরফ্রন্ট মোড আনলক করুন',
    upgradeToSwitchModes: 'মোড পরিবর্তন করতে পেইড প্ল্যানে আপগ্রেড করুন।',
    savedCampaignsCountMsg: 'আপনার কাছে {{count}}টি সেভ করা ক্যাম্পেইন রয়েছে।',
    // Page Builder
    pageBuilderTitle: 'ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার',
    pageBuilderDesc: 'ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার এর মাধ্যমে সহজেই সুন্দর এবং কাস্টম পেজ তৈরি করুন।',
    createNewPage: 'নতুন পেজ তৈরি করুন',
    newPageDetails: 'নতুন পেজের বিবরণ',
    internalPageName: 'অভ্যন্তরীণ পেজের নাম',
    urlSlug: 'URL স্ল্যাগ',
    urlSlugHint: 'উদাহরণ: yourstore.com/p/summer-offer',
    startBuilding: 'বিল্ডিং শুরু করুন',
    creating: 'তৈরি করা হচ্ছে...',
    noPagesCreated: 'এখনও কোনো পেজ তৈরি করা হয়নি',
    noPagesDesc: 'আজই আপনার প্রথম অ্যাডভান্সড ল্যান্ডিং পেজ তৈরি করুন!',
    editPage: 'পেজ এডিট করুন',
    live: 'লাইভ',
    draft: 'ড্রাফট',
    exitEditor: 'এডিটর থেকে বের হন',
    editingPage: 'পেজ এডিট করা হচ্ছে',
    viewPublished: 'লাইভ দেখুন',
    autoSaveActive: 'অটো-সেভ সক্রিয়',
    bootingCanvas: 'বিল্ডার ক্যানভাস চালু হচ্ছে...',
    pageSettings: 'পেজ সেটিংস',
    pageSettingsDesc: 'এই ল্যান্ডিং পেজের গ্লোবাল সেটিংস কনফিগার করুন।',
    selectProduct: 'প্রোডাক্ট সিলেক্ট করুন',
    chooseProduct: 'একটি প্রোডাক্ট বেছে নিন...',
    loadingProducts: 'স্টোর প্রোডাক্ট লোড হচ্ছে...',
    smartBlockTip: '* অর্ডার ফর্মের মতো স্মার্ট ব্লকগুলো স্বয়ংক্রিয়ভাবে নির্বাচিত প্রোডাক্টের নাম এবং মূল্য ব্যবহার করবে।',
    whatsappConfig: 'হোয়াটসঅ্যাপ কনফিগারেশন',
    defaultMessage: 'ডিফল্ট মেসেজ',
    whatsappPlaceholder: 'আমি এই প্রোডাক্টটি অর্ডার করতে চাই...',
    conversionTools: 'কনভার্সন টুলস',
    offerEndDate: 'অফারের শেষ তারিখ',
    socialProofCountLabel: 'সোশ্যাল প্রুফ কাউন্ট',
    socialProofHint: '"X জন এটি কিনেছেন" বা "Y টি বাকি আছে" এমন মেসেজ দেখানোর জন্য',
    templatesSelectDesc: 'একটি তৈরি টেমপ্লেট বেছে নিন এবং কাস্টমাইজ করুন',
    orderNow: 'অর্ডার করুন',
    blocks: 'ব্লক',
    templateTip: 'ক্যানভাসে লোড করার জন্য একটি টেমপ্লেট বেছে নিন। তারপর আপনার ব্র্যান্ড অনুযায়ী রং, ফন্ট এবং বিষয়বস্তু পরিবর্তন করুন।',
    loadingEditor: 'এডিটর লোড হচ্ছে...',
    savingDraft: 'ড্রাফট সেভ হচ্ছে...',
    draftSaved: 'ড্রাফট সফলভাবে সেভ করা হয়েছে!',
    saveDraftFailed: 'ড্রাফট সেভ করতে ব্যর্থ হয়েছে',
    publishingPage: 'পেজ পাবলিশ হচ্ছে...',
    pagePublished: 'পেজ সফলভাবে পাবলিশ করা হয়েছে!',
    publishFailed: 'পেজ পাবলিশ করতে ব্যর্থ হয়েছে',
    importSuccess: 'পেজ সফলভাবে ইমপোর্ট করা হয়েছে!',
    applyFailed: 'পরিবর্তনগুলো প্রয়োগ করতে ব্যর্থ হয়েছে। কোড সিনট্যাক্স চেক করুন।',
    initializingEditor: 'এডিটর চালু হচ্ছে...',
    templateNotFound: 'টেমপ্লেট পাওয়া যায়নি',
    loadTemplateBlocksError: 'টেমপ্লেট ব্লকগুলো লোড করা সম্ভব হয়নি',
    templateLoaded: 'টেমপ্লেট লোড হয়েছে!',
    loadTemplateError: 'টেমপ্লেট লোড করতে ব্যর্থ হয়েছে',
    connect: 'কানেক্ট',
    connectButtonsBackend: 'বাটনগুলো ব্যাকএন্ডের সাথে কানেক্ট করুন',
    buttonsConnectedCount: '{{count}}টি বাটন কানেক্ট করা হয়েছে!',
    savingForPreview: 'প্রিভিউ প্রস্তুত করা হচ্ছে...',
    previewFailed: 'প্রিভিউ প্রস্তুত করতে ব্যর্থ হয়েছে',
    confirmClearCanvas: 'আপনি কি নিশ্চিত যে আপনি ক্যানভাসটি মুছতে চান?',
    clearCanvas: 'ক্যানভাস মুছুন',
    desktopView: 'ডেস্কটপ ভিউ',
    tabletView: 'ট্যাবলেট ভিউ',
    mobileView: 'মোবাইল ভিউ',
    undo: 'পূর্বাবস্থায় ফেরান',
    redo: 'পুনরায় করুন',
    magicEditLabel: 'ম্যাজিক এডিট',
    magicAiLabel: 'ম্যাজিক এআই',
    proBadge: 'প্রো',
    magicEdit: 'ম্যাজিক এডিট',
    magicAi: 'ম্যাজিক এআই',
    addBlock: 'ব্লক যোগ করুন',
    code: 'কোড',
    preview: 'প্রিভিউ',
    saveDraft: 'ড্রাফট সেভ করুন',
    publish: 'পাবলিশ করুন',
    cancel: 'বাতিল',
    applyChanges: 'পরিবর্তন প্রয়োগ করুন',
    editElementHtml: 'এলিমেন্ট এইচটিএমএল এডিট করুন',
    editPageHtml: 'পেজ এইচটিএমএল এডিট করুন',
    editElementAi: 'AI দিয়ে নির্বাচিত এলিমেন্ট এডিট করুন',
    generateWithAi: 'AI দিয়ে পেজ তৈরি করুন',
    openPage: 'পেজ ওপেন করুন',
    widgets: 'উইজেট',
    design: 'ডিজাইন',
    structure: 'স্ট্রাকচার',
    availableWidgets: 'উপলব্ধ উইজেটসমূহ',
    uncategorized: 'অশ্রেণীবদ্ধ',
    styles: 'স্টাইল',
    presets: 'প্রিসেট',
    activeElement: 'সক্রিয় এলিমেন্ট',
    selectElementHint: 'স্টাইল শুরু করতে একটি এলিমেন্ট নির্বাচন করুন',
    attributes: 'অ্যাট্রিবিউটস',
    visualStyle: 'ভিজ্যুয়াল স্টাইল',
    documentStructure: 'ডকুমেন্ট স্ট্রাকচার',
    globalTheme: 'গ্লোবাল থিম',
    globalThemeDesc: 'পুরো পৃষ্ঠায় ব্র্যান্ডের রং এবং ফন্ট প্রয়োগ করুন।',
    brandColors: 'ব্র্যান্ড কালারস',
    pickPrimaryColor: 'প্রাথমিক রং বেছে নিন',
    pickSecondaryColor: 'মাধ্যমিক রং বেছে নিন',
    typography: 'টাইপোগ্রাফি',
    headingFont: 'হেডিং ফন্ট',
    bodyFont: 'বডি ফন্ট',
    themeNote: 'দ্রষ্টব্য: পরিবর্তনগুলো সব "স্মার্ট ব্লকে" সাথে সাথে প্রয়োগ হবে। কাস্টম এলিমেন্টের ক্ষেত্রে ম্যানুয়াল আপডেট প্রয়োজন হতে পারে।',
    magicAiEditor: 'ম্যাজিক AI এডিটর',
    magicPageGenerator: 'ম্যাজিক পেজ জেনারেটর',
    designingRequest: 'আপনার অনুরোধটি ডিজাইন করা হচ্ছে...',
    designReady: 'ডিজাইন প্রস্তুত!',
    appliedSuccess: 'সফলভাবে প্রয়োগ করা হয়েছে!',
    designApplied: 'ডিজাইন প্রয়োগ করা হয়েছে!',
    checkCanvas: 'আপনার ক্যানভাস চেক করুন',
    describeEditHint: 'এই সেকশনটি কীভাবে ডিজাইন করবেন তা AI-কে বলুন। (উদাঃ "হেডলাইনটি মাঝখানে আনুন", "রং গাঢ় সোনালি করুন")',
    describeProductHint: 'আপনার পণ্য সম্পর্কে বর্ণনা করুন, এবং AI একটি হাই-কনভার্টিং ল্যান্ডিং পেজ তৈরি করবে।',
    generatingHtml: 'AI উচ্চমানের HTML এবং Tailwind CSS তৈরি করছে...',
    designCompletedHint: 'AI আপনার ডিজাইন সম্পন্ন করেছে। আপনার পেজ আপডেট করতে Apply ক্লিক করুন।',
    updatingEditorHint: 'আপনার পেজ আপডেট করা হয়েছে। এডিটর পরিবর্তন লোড হচ্ছে...',
    premiumPro: 'Premium PRO',
    unlockMagicAi: 'ম্যাজিক AI আনলক করুন',
    magicAiFutureDesc: 'ল্যান্ডিং পেজ তৈরির ভবিষ্যৎ অভিজ্ঞতা নিন। আমাদের AI মডেলগুলো সেকেন্ডের মধ্যে হাই-কনভার্টিং, মোবাইল-পারফেক্ট ডিজাইন তৈরি করে।',
    customSectionRedesign: 'কাস্টম সেকশন রিডিজাইন',
    editInstantly: 'রং, লেআউট এবং কন্টেন্ট সাথে সাথে এডিট করুন।',
    landingPageGeneration: 'ল্যান্ডিং পেজ জেনারেটর',
    fullPageTemplates: 'ফুল-পেজ হাই-কনভার্টিং টেমপ্লেটস।',
    persuasiveCopy: 'আকর্ষণীয় বাংলা মার্কেটিং কপি',
    autoGeneratedBdMarket: 'বাংলাদেশের মার্কেটের জন্য অটো-জেনারেটেড।',
    startAiDesign: 'AI ডিজাইন শুরু করুন',
    generateFullPage: 'ফুল পেজ তৈরি করুন',
    processingMagic: 'ম্যাজিক প্রসেস হচ্ছে...',
    applyDesignToPage: 'ডিজাইন পেজে প্রয়োগ করুন',
    tryAgain: 'আবার চেষ্টা করুন',
    everythingSet: 'সবকিছু ঠিক আছে!',
    blockLibrary: 'ব্লক লাইব্রেরি',
    blockLibraryDesc: 'আপনার পেজের জন্য তৈরি উপাদানসমূহ',
    searchBlocks: 'ব্লক খুঁজুন...',
    categories: 'ক্যাটাগরি',
    all: 'সব',
    noBlocksFound: 'আপনার শর্ত অনুযায়ী কোনো ব্লক খুঁজে পাওয়া যায়নি।',
    insertBlock: 'ব্লক ইনসার্ট করুন',
    premiumBadge: 'প্রিমিয়াম',
    blocksAvailable: 'ব্লক উপলব্ধ',
    blockLibraryTip: 'পরামর্শ: ব্লকগুলো অটো-রেসপনসিভ এবং গ্লোবাল থিমের সাথে সামঞ্জস্যপূর্ণ।',
    // Campaigns
    campaignsDescription: 'মার্কেটিং ইমেল ক্যাম্পেইন তৈরি ও পরিচালনা করুন',
    campaignsSent: 'ক্যাম্পেইন পাঠানো হয়েছে',
    totalEmailsSent: 'মোট ইমেল পাঠানো হয়েছে',
    startEngagingDesc: 'আপনার প্রথম ইমেল ক্যাম্পেইন তৈরি করে কাস্টমারদের সাথে যোগাযোগ শুরু করুন।',
    noCampaignsYet: 'এখনও কোনো ক্যাম্পেইন নেই',
    createYourFirstCampaign: 'আপনার প্রথম ক্যাম্পেইন তৈরি করুন',
    campaign: 'ক্যাম্পেইন',
    newCampaign: 'নতুন ক্যাম্পেইন',
    recipients: 'প্রাপক',
    stats: 'পরিসংখ্যান',
    created: 'তৈরি করা হয়েছে',
    createCampaign: 'ক্যাম্পেইন তৈরি করুন',
    sendEmailToSubscribers: 'আপনার সাবস্ক্রাইবারদের ইমেইল পাঠান',
    noSubscribersYet: 'এখনও কোনো সাবস্ক্রাইবার নেই',
    addSubscribersTip: 'ক্যাম্পেইন পাঠানোর আগে আপনাকে সাবস্ক্রাইবার যুক্ত করতে হবে।',
    campaignName: 'ক্যাম্পেইনের নাম',
    subjectLine: 'সাবজেক্ট লাইন',
    previewText: 'প্রিভিউ টেক্সট',
    previewTextHint: 'সংক্ষিপ্ত প্রিভিউ যা ইমেইল ক্লায়েন্টে প্রদর্শিত হয়',
    emailContentHtml: 'ইমেইল কন্টেন্ট (HTML)',
    emailPreview: 'ইমেইল প্রিভিউ',
    campaignTargetCount: 'এই ক্যাম্পেইনটি {{count}} জন সাবস্ক্রাইবারকে পাঠানো হবে',
    saveAsDraft: 'ড্রাফট হিসেবে সেভ করুন',
    sendNow: 'এখনই পাঠান',
    sending: 'পাঠানো হচ্ছে...',
    campaignSentSuccess: 'ক্যাম্পেইন {{count}} জন সাবস্ক্রাইবারকে সফলভাবে পাঠানো হয়েছে!',
    clicks: 'ক্লিক',
    emailContent: 'ইমেইল কন্টেন্ট',
    failed: 'ব্যর্থ',
    favicon: 'ফেভিকন',
    noTransactionHistory: 'এখনও কোনো লেনদেনের ইতিহাস নেই।',
    opens: 'ওপেন',
    scheduled: 'নির্ধারিত',
    sendTo: 'প্রেরণ করুন',
    sent: 'পাঠানো হয়েছে',
    // AI Agent - General
    aiAgentManager: 'AI এজেন্ট ম্যানেজার',
    aiAgentDescription: 'আপনার ভার্চুয়াল অ্যাসিস্ট্যান্ট এবং সাপোর্ট অটোমেশন ম্যানেজ করুন।',
    overview: 'সারসংক্ষেপ',
    inbox: 'ইনবক্স',
    configuration: 'কনফিগারেশন',
    chatSimulator: 'চ্যাট সিমুলেটর',
    knowledgeBase: 'নলেজ বেস',
    premiumFeatureDesc: 'AI এজেন্ট একটি প্রিমিয়াম ফিচার। ২৪/৭ স্বয়ংক্রিয় কাস্টমার সাপোর্ট চালু করতে আপনার প্ল্যান আপগ্রেড করুন।',
    agentNotConfigured: 'এজেন্ট কনফিগার করা হয়নি।',
    noActiveAgentFound: 'কোনো সক্রিয় এজেন্ট পাওয়া যায়নি।',
    setupAgent: 'এজেন্ট সেটআপ করুন',
    // AI Agent - Metrics
    totalConversations: 'মোট কথোপকথন',
    leadsCaptured: 'লিড সংগ্রহ করা হয়েছে',
    activityOverview7Days: 'অ্যাক্টিভিটি ওভারভিউ (গত ৭ দিন)',
    // AI Agent - Inbox
    searchCustomers: 'কাস্টমার সার্চ করুন...',
    noConversationsYet: 'এখনও কোনো কথোপকথন নেই',
    guestUser: 'গেস্ট ইউজার',
    guest: 'গেস্ট',
    started: 'শুরু হয়েছে',
    readOnlyView: 'এটি AI কথোপকথনের একটি রিড-অনলি ভিউ।',
    selectConversation: 'ইতিহাস দেখতে একটি কথোপকথন নির্বাচন করুন',
    // AI Agent - Configuration
    agentConfiguration: 'এজেন্ট কনফিগারেশন',
    agentConfigDesc: 'আপনার AI অ্যাসিস্ট্যান্ট কীভাবে আচরণ করবে এবং কাস্টমারদের সাথে ইন্টারঅ্যাক্ট করবে তা কাস্টমাইজ করুন।',
    agentStatus: 'এজেন্ট স্ট্যাটাস',
    agentStatusDesc: 'আপনার স্টোরে AI অ্যাসিস্ট্যান্ট সক্রিয় বা নিষ্ক্রিয় করুন',
    agentName: 'এজেন্টের নাম',
    defaultAgentName: 'সেলস অ্যাসিস্ট্যান্ট',
    communicationTone: 'যোগাযোগের ধরন (Tone)',
    friendlyCasual: 'বন্ধুত্বপূর্ণ এবং অনানুষ্ঠানিক 😊',
    professionalFormal: 'পেশাদার এবং আনুষ্ঠানিক',
    directSales: 'সরাসরি এবং বিক্রয়-কেন্দ্রিক',
    primaryLanguage: 'প্রধান ভাষা',
    saveConfiguration: 'কনফিগারেশন সেভ করুন',
    failedToSave: 'সেটিংস সেভ করতে ব্যর্থ হয়েছে',
    // AI Agent - Simulator
    simulator: 'সিমুলেটর',
    online: 'অনলাইন',
    clearChat: 'চ্যাট মুছুন',
    testAgentDesc: 'আপনার এজেন্ট পরীক্ষা করতে একটি কথোপকথন শুরু করুন।',
    typeMessage: 'একটি মেসেজ লিখুন...',
    connectionError: 'সংযোগ ত্রুটি হয়েছে।',
    // AI Agent - Knowledge Base
    trainAgentDesc: 'কাস্টম ডেটা সোর্স দিয়ে আপনার এজেন্টকে প্রশিক্ষণ দিন।',
    addSource: 'সোর্স যোগ করুন',
    source: 'সোর্স',
    chunks: 'চাঙ্ক (Chunks)',
    lastSynced: 'শেষ সিঙ্ক হয়েছে',
    noSourcesFound: 'কোনো নলেজ সোর্স পাওয়া যায়নি। শুরু করতে একটি যোগ করুন।',
    indexed: 'ইনডেক্স হয়েছে',
    addKnowledgeSource: 'নলেজ সোর্স যোগ করুন',
    manualText: 'ম্যানুয়ালি টেক্সট',
    website: 'ওয়েবসাইট',
    fileUpload: 'ফাইল আপলোড',
    title: 'টাইটেল',
    content: 'কন্টেন্ট',
    enterContentPlaceholder: 'এখানে টেক্সট কন্টেন্ট লিখুন...',
    scraping: 'স্ক্র্যাপ হচ্ছে...',
    uploadFile: 'ফাইল আপলোড করুন',
    websiteUrl: 'ওয়েবসাইট URL',
    scrapeDesc: 'আমরা এই পৃষ্ঠা থেকে টেক্সট কনটেন্ট স্ক্র্যাপ করব।',
    confirmDelete: 'আপনি কি নিশ্চিত?',
    dragDrop: 'অথবা ড্র্যাগ অ্যান্ড ড্রপ করুন',
    fileLimit: 'TXT, MD, PDF, DOC, DOCX (সর্বোচ্চ ৫MB)',
    // AI Chat Widget
    dashboardChat_title: 'Ozzyl AI অ্যাসিস্ট্যান্ট',
    dashboardChat_online: 'অনলাইন',
    dashboardChat_welcome: 'হে {{userName}}! আমি ওজিল, আপনার AI বিজনেস অ্যাসিস্ট্যান্ট। আজ আপনার স্টোর বড় করতে আমি কীভাবে সাহায্য করতে পারি?',
    dashboardChat_unlockTitle: 'Ozzyl AI আনলক করুন',
    dashboardChat_unlockDesc: 'আমাদের প্রো প্ল্যানের সাথে বিজনেস ইনসাইট, স্বয়ংক্রিয় রেসপন্স এবং স্মার্ট পরামর্শ পান।',
    dashboardChat_upgradePro: 'প্রো-তে আপগ্রেড করুন',
    dashboardChat_maybeLater: 'পরে হবে',
    dashboardChat_thinking: 'Ozzyl ভাবছে...',
    dashboardChat_askAnything: 'আপনার স্টোর সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন...',
    analyzing: 'অ্যানালাইজিং',
    designing: 'ডিজাইনিং',
    generating: 'জেনারেটিং',
    analyzingPrompt: 'আপনার অনুরোধ বিশ্লেষণ করা হচ্ছে...',
    generatingDesign: 'চমৎকার ডিজাইন তৈরি করছি...',
    aiWorkingHint: 'AI তার জাদু (Magic) দেখাচ্ছে ✨',
    aiTip: 'টিপ: পার্সোনালাইজড টেক্সট পেতে আপনার প্রোডাক্টের সঠিক তথ্য দিন!',
    // Dashboard - Growth & Actions
    growthOpportunities: 'বৃদ্ধির সুযোগ',
    aiInsights: 'AI ইনসাইটস',
    revenueForecast: 'রাজস্ব পূর্বাভাস (৭ দিন)',
    revenueForecastDesc: 'সাম্প্রতিক ট্রেন্ডের ভিত্তিতে, আপনি আগামী সপ্তাহে এই পরিমাণ আয় করতে পারেন।',
    recommendedActions: 'প্রস্তাবিত পদক্ষেপ',
    launchRetentionCampaign: 'রিটেনশন ক্যাম্পেইন শুরু করুন',
    launchRetentionCampaignDesc: 'ক্রয়ের হার কম। ইনঅ্যাকটিভ কাস্টমারদের এসএমএস পাঠান।',
    enableOrderBumps: 'অর্ডার বাম্পস (Order Bumps) চালু করুন',
    enableOrderBumpsDesc: 'AOV প্রত্যাশিত মাত্রার চেয়ে কম। এটি বাড়াতে চেকআউট ক্রস-সেল যোগ করুন।',
    scaleAdSpend: 'বিজ্ঞাপন খরচ বাড়ান',
    scaleAdSpendDesc: 'সবকিছু ঠিকঠাক আছে! আরও কাস্টমার পেতে বিজ্ঞাপনে বাজেট বাড়ানো যেতে পারে।',
    viewFullAnalyticsReport: 'সম্পূর্ণ অ্যানালিটিক্স রিপোর্ট দেখুন',
    avgPerDay: 'গড়/দিন',
    totalSalesShort: 'মোট বিক্রি',
    allCaughtUp: 'সব কাজ শেষ!',
    noPendingActions: 'কোনো কাজ বাকি নেই।',
    pendingOrdersTitle: 'পেন্ডিং অর্ডার',
    pendingOrdersDesc: '{{count}}টি অর্ডার প্রসেস করা প্রয়োজন',
    lowStockTitle: 'স্টক অ্যালার্ট',
    lowStockDesc: '{{count}}টি প্রোডাক্টের স্টক কম',
    abandonedCartsTitle: 'পরিত্যক্ত কার্ট',
    abandonedCartsDesc: '{{count}}টি কার্ট রিকভার করা প্রয়োজন',
    // Customers
    customersTitle: 'কাস্টমারস',
    customersDescription: 'আপনার কাস্টমার বেস ম্যানেজ করুন এবং তাদের ইতিহাস দেখুন',
    totalCustomers: 'মোট কাস্টমার',
    newCustomers30Days: 'নতুন (৩০ দিন)',
    returningCustomers: 'পুরানো কাস্টমার',
    noCustomersTitle: 'এখনও কোনো কাস্টমার নেই',
    noCustomersDescription: 'কাস্টমাররা অর্ডার করলে তাদের তথ্য এখানে দেখা যাবে।',
    noCustomersMatchSearch: 'আপনার সার্চের সাথে কোনো কাস্টমার মেলেনি।',
    customerLabel: 'কাস্টমার',
    contactLabel: 'যোগাযোগ',
    customerOrdersLabel: 'অর্ডার',
    totalSpentLabel: 'মোট খরচ',
    lastActiveLabel: 'সর্বশেষ সক্রিয়',
    customerActionLabel: 'অ্যাকশন',
    guestLabel: 'গেস্ট',
    ordersCount: '{{count}}টি অর্ডার',
    backToCustomers: 'কাস্টমার তালিকায় ফিরে যান',
    guestCustomer: 'গেস্ট কাস্টমার',
    customerSince: '{{date}} থেকে কাস্টমার',
    customerOverview: 'সারসংক্ষেপ',
    customerContactInfo: 'যোগাযোগের তথ্য',
    noPhoneProvided: 'কোনো ফোন নম্বর দেওয়া হয়নি',
    primaryAddress: 'প্রধান ঠিকানা',
    noAddressOnFile: 'কোনো ঠিকানা পাওয়া যায়নি',
    orderHistory: 'অর্ডারের ইতিহাস',
    noOrdersFoundForCustomer: 'এই কাস্টমারের কোনো অর্ডার পাওয়া যায়নি।',
    customerAvgOrderValue: 'গড় অর্ডার মূল্য',
    // Analytics
    analyticsSubtitle: 'আপনার স্টোরের পারফরম্যান্স ট্র্যাক করুন',
    templatePerformanceReport: 'টেমপ্লেট পারফরম্যান্স রিপোর্ট',
    analyticsToday: 'আজ',
    analyticsThisWeek: 'এই সপ্তাহ',
    analyticsThisMonth: 'এই মাস',
    analyticsAllTime: 'সব সময়',
    revenueLast7Days: 'রাজস্ব - শেষ ৭ দিন',
    customerDemographics: 'কাস্টমার ডেমোগ্রাফিক্স',
    firstTimeLabel: 'প্রথমবার',
    returningLabel: 'পুরানো',
    topCities: 'সেরা শহরগুলো',
    noGeographicData: 'এখনও কোনো ভৌগোলিক তথ্য নেই',
    conversionMetrics: 'কনভারশন মেট্রিক্স',
    abandonedRate: 'পরিত্যক্ত কার্টের হার',
    abandonedSubtext: '{{abandoned}}টি পরিত্যক্ত, {{recovered}}টি রিকভার করা হয়েছে',
    avgOrderValueSubtext: 'প্রতি পেইড অর্ডার অনুযায়ী',
    quickInsights: 'কুইক ইনসাইটস',
    returningCustomerRate: '{{rate}}% পুরানো কাস্টমারের হার',
    recoveredCartsCount: '{{count}}টি রিকভার করা কার্ট',
    topSellingProducts: 'সবচেয়ে বেশি বিক্রি হওয়া পণ্য',
    noSalesDataYet: 'এখনও কোনো বিক্রির তথ্য নেই',
    amountLabel: 'পরিমাণ',
    visits: 'টি ভিজিট',
    orderStatus: 'অর্ডারের অবস্থা',
    sold: 'টি বিক্রি',
    revenue: 'রাজস্ব',
    homepageSettingsDesc: 'আপনার ভিজিটররা যখন আপনার সাইটে প্রবেশ করবে তখন তারা কী দেখবে তা কনফিগার করুন।',
    enableStoreRoutes: 'স্টোর রুট সক্রিয় করুন',
    enableStoreRoutesDesc: 'সক্রিয় থাকলে, /products, /cart, এবং /checkout রুটগুলো অ্যাক্সেসযোগ্য হবে।',
    storeRoutesDisabledWarning: 'স্টোর রুটগুলো নিষ্ক্রিয় করা হয়েছে। ভিজিটররা পণ্য ব্রাউজ বা চেকআউট করতে পারবে না।',
    homepageSelection: 'হোমপেজ নির্বাচন',
    homepageSelectionDesc: 'আপনার প্রধান ইউআরএল-এ ভিজিটররা কী দেখবে তা নির্বাচন করুন।',
    storeHome: 'স্টোর ক্যাটালগ',
    storeHomeDesc: 'বিভাগ এবং ফিচার আইটেম সহ আপনার পণ্যের ক্যাটালগ দেখান।',
    orSelectLandingPage: 'অথবা একটি ল্যান্ডিং পেজ নির্বাচন করুন',
    noPublishedPages: 'কোনো প্রকাশিত ল্যান্ডিং পেজ নেই। পেজ বিল্ডারে একটি তৈরি করুন।',
    createLandingPage: 'একটি ল্যান্ডিং পেজ তৈরি করুন',
    yourStoreUrl: 'আপনার স্টোর ইউআরএল',
    homepageSettingsUpdated: 'হোমপেজ সেটিংস সফলভাবে আপডেট করা হয়েছে!'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/landing.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "landing",
    ()=>landing
]);
const landing = {
    badge: 'বাংলাদেশে ৫০০+ মার্চেন্টের বিশ্বাস',
    heroTitle1: 'আপনার সম্পূর্ণ',
    heroTitle2: 'ই-কমার্স সলিউশন',
    heroSubtitle: 'মিনিটে আপনার প্রফেশনাল অনলাইন স্টোর তৈরি করুন। বিকাশ, নগদ ও ক্যাশ অন ডেলিভারি নিন। অর্ডার ম্যানেজ করুন, ইনভেন্টরি ট্র্যাক করুন - সব এক প্ল্যাটফর্মে।',
    getStarted: 'ফ্রি স্টোর তৈরি করুন',
    talkExpert: 'ডেমো দেখুন',
    noCreditCard: 'কোনো ক্রেডিট কার্ড লাগবে না • চিরকালের জন্য ফ্রি প্ল্যান',
    // Stats
    statsStores: 'সক্রিয় স্টোর',
    statsOrders: 'প্রসেসড অর্ডার',
    statsMerchants: 'সন্তুষ্ট মার্চেন্ট',
    statsUptime: 'আপটাইম',
    // Features Section
    featuresTitle: 'অনলাইনে বিক্রি করতে যা দরকার সব',
    featuresSubtitle: 'বাংলাদেশী ই-কমার্সের জন্য ডিজাইন করা শক্তিশালী ফিচার',
    // Pricing
    pricingTitle: 'সহজ, সৎ মূল্য',
    pricingSubtitle: 'ফ্রি শুরু করুন, বাড়লে আপগ্রেড করুন',
    perMonth: '/মাস',
    mostPopularTitle: 'সবচেয়ে জনপ্রিয়',
    getStartedCta: 'শুরু করুন',
    // How it works
    howTitle: '৩ ধাপে স্টোর চালু করুন',
    howSubtitle: 'সাইন আপ থেকে প্রথম বিক্রি ১০ মিনিটে',
    step1: 'অ্যাকাউন্ট তৈরি',
    step1Desc: 'ইমেইল দিয়ে সাইন আপ করুন ও সাবডোমেইন বাছুন (yourstore.ozzyl.com)',
    step2: 'প্রোডাক্ট যোগ',
    step2Desc: 'প্রোডাক্টের ছবি আপলোড করুন, BDT-তে দাম সেট করুন, বিবরণ লিখুন।',
    step3: 'বিক্রি শুরু',
    step3Desc: 'ফেসবুকে স্টোর লিংক শেয়ার করুন, বিকাশ/COD-তে অর্ডার নিন।',
    // Testimonials
    testimonialsTitle: 'মার্চেন্টদের ভালোবাসা',
    testimonialsSubtitle: 'সফল স্টোর মালিকদের সত্যিকারের গল্প',
    // FAQ
    faqBadge: 'প্রশ্ন আছে?',
    faqTitlePart1: 'সাধারণ',
    faqTitlePart2: 'জিজ্ঞাসা',
    faqSubtitle: 'আমাদের সম্পর্কে সবচেয়ে জনপ্রিয় প্রশ্নের উত্তর',
    faqStillQuestions: 'আরো প্রশ্ন আছে?',
    faqContactUs: 'আমাদের সাথে যোগাযোগ করুন',
    // CTA
    ctaTitle: 'আজই বিক্রি শুরু করুন',
    ctaSubtitle: '৫০০+ মার্চেন্ট ইতিমধ্যে Ozzyl দিয়ে ব্যবসা বাড়াচ্ছে',
    ctaButton: 'ফ্রি স্টোর তৈরি করুন',
    // Features
    featureGlobeTitle: 'নিজের স্টোর URL',
    featureGlobeDesc: 'yourstore.ozzyl.com তাৎক্ষণিক পান। প্রিমিয়াম ইউজাররা নিজের ডোমেইন কানেক্ট করতে পারেন।',
    featureSmartphoneTitle: 'বিকাশ ও নগদ রেডি',
    featureSmartphoneDesc: 'কোটি বাংলাদেশী কাস্টমারের কাছ থেকে মোবাইল পেমেন্ট নিন। ক্যাশ অন ডেলিভারিও সাপোর্ট করে।',
    featurePackageTitle: 'অর্ডার ম্যানেজমেন্ট',
    featurePackageDesc: 'সব অর্ডার এক ড্যাশবোর্ডে ট্র্যাক করুন। স্ট্যাটাস আপডেট, ইনভয়েস প্রিন্ট, COD কালেকশন ম্যানেজ করুন।',
    featureChartTitle: 'ইনভেন্টরি ট্র্যাকিং',
    featureChartDesc: 'কখনো ওভারসেল হবে না। অটো স্টক আপডেট, লো স্টক অ্যালার্ট এবং SKU ম্যানেজমেন্ট।',
    featureZapTitle: 'ল্যান্ডিং পেজ মোড',
    featureZapDesc: 'সিঙ্গেল প্রোডাক্ট সেলারদের জন্য পারফেক্ট। বিল্ট-ইন অর্ডার ফর্ম সহ হাই-কনভার্টিং সেলস পেজ।',
    featureTruckTitle: 'কুরিয়ার ইন্টিগ্রেশন',
    featureTruckDesc: 'পাঠাও, স্টেডফাস্ট ও রেডএক্স কানেক্ট করুন। অটো শিপমেন্ট তৈরি ও ডেলিভারি ট্র্যাক করুন।',
    // Plans
    planFreeDesc: 'টেস্টের জন্য পারফেক্ট',
    planStarterDesc: 'বাড়তে থাকা সেলারদের জন্য',
    planPremiumDesc: 'সিরিয়াস ব্যবসার জন্য',
    planCtaStartFree: 'ফ্রি শুরু',
    planCtaGetStarted: 'শুরু করুন',
    planCtaGoPremium: 'প্রিমিয়াম নিন',
    // Testimonials
    testimonial1Name: 'রহিম আহমেদ',
    testimonial1Role: 'ফ্যাশন স্টোর, ঢাকা',
    testimonial1Text: 'ফ্রি প্ল্যান দিয়ে শুরু করেছিলাম, এখন স্টার্টারে মাসে ২০০+ অর্ডার। বাংলাদেশী সেলারদের জন্য সেরা প্ল্যাটফর্ম!',
    testimonial2Name: 'ফাতিমা খান',
    testimonial2Role: 'কসমেটিক্স, চট্টগ্রাম',
    testimonial2Text: 'বিকাশ ইন্টিগ্রেশন অসাধারণ। কাস্টমাররা মোবাইলে অর্ডার করতে পছন্দ করে। ২ মাসে রেভিনিউ ১৫০% বেড়েছে।',
    testimonial3Name: 'করিম হোসেন',
    testimonial3Role: 'ইলেকট্রনিক্স, সিলেট',
    testimonial3Text: 'ল্যান্ডিং পেজ মোড আমার গ্যাজেট ব্যবসার জন্য পারফেক্ট। সহজ COD অর্ডার, দারুণ ড্যাশবোর্ড!',
    faq1Q: 'ওজিল (Ozzyl) কী?',
    faq1A: 'ওজিল হলো একটি পূর্ণাঙ্গ ই-কমার্স প্ল্যাটফর্ম যা বিশেষভাবে বাংলাদেশি মার্চেন্টদের জন্য ডিজাইন করা হয়েছে যাতে তারা খুব সহজে অনলাইন স্টোর তৈরি ও পরিচালনা করতে পারে।',
    faq2Q: 'আপনারা কি বিকাশ এবং নগদ সাপোর্ট করেন?',
    faq2A: 'হ্যাঁ! ওজিলে বিকাশ, নগদ এবং ক্যাশ অন ডেলিভারি পেমেন্ট নেওয়ার সুবিধা বিল্ট-িন দেওয়া আছে।',
    faq3Q: 'নিজের ডোমেইন ব্যবহার করতে পারব?',
    faq3A: 'হ্যাঁ! Starter Plan থেকে আপনি Custom Domain কানেক্ট করতে পারবেন। Free Plan এ আপনি yourstore.ozzyl.com সাবডোমেইন পাবেন।',
    faq3Q_custom: 'হ্যাঁ! Starter Plan থেকে আপনি Custom Domain কানেক্ট করতে পারবেন। Free Plan এ আপনি yourstore.ozzyl.com সাবডোমেইন পাবেন।',
    faq4Q: 'পেমেন্ট কিভাবে পাব?',
    faq4A: 'বিকাশ/নগদ পেমেন্ট সরাসরি আপনার অ্যাকাউন্টে যায়। COD-এর জন্য আপনি কাস্টমারের কাছ থেকে নেন। আমরা কখনো আপনার টাকা ধরে রাখি না।',
    faq5Q: 'Store Setup করতে কতক্ষণ লাগে?',
    faq5A: 'মাত্র ৫ মিনিট! Sign up করুন, Template বাছুন, Product Add করুন — ব্যস! আপনার Store Ready। কোনো Technical Knowledge লাগবে না।',
    faq6Q: 'কোনো সমস্যা হলে কার সাথে কথা বলব?',
    faq6A: 'আমাদের Bangla Support Team ২৪/৭ Available। WhatsApp, Phone বা Email — যেভাবে চান যোগাযোগ করুন। আমরা সবসময় সাহায্য করতে Ready!',
    // Footer
    footerAbout: 'বাংলাদেশি মার্চেন্টদের জন্য সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। তৈরি করুন, বিক্রি করুন, বড় হন।',
    footerProduct: 'প্রোডাক্ট',
    footerCompany: 'কোম্পানি',
    footerLegal: 'আইনি',
    footerLinkFeatures: 'ফিচার',
    footerLinkPricing: 'প্রাইসিং',
    footerLinkTemplates: 'টেমপ্লেট',
    footerLinkIntegrations: 'ইন্টিগ্রেশন',
    footerLinkAbout: 'সম্পর্কে',
    footerLinkBlog: 'ব্লগ',
    footerLinkCareers: 'ক্যারিয়ার',
    footerLinkContact: 'যোগাযোগ',
    footerLinkPrivacy: 'গোপনীয়তা',
    footerLinkTerms: 'শর্তাবলী',
    footerLinkRefund: 'রিফান্ড নীতি',
    copyright: '© ২০২৬ Ozzyl। বাংলাদেশে ❤️ দিয়ে তৈরি।',
    // AwardWinningHero
    heroSignupPrefix: 'ইতিমধ্যে',
    heroSignupSuffix: 'জন সাইন আপ করেছেন...',
    heroDemoTemplate: 'টেমপ্লেট বাছুন',
    heroDemoStoreName: 'ফ্যাশন হাউস বিডি',
    heroDemoStorePlaceholder: 'আপনার স্টোরের নাম',
    heroDemoStoreSlogan: 'সেরা মানের ফ্যাশন পণ্য',
    heroDemoSloganPlaceholder: 'এখানে স্লোগান লিখুন',
    heroDemoTheme: 'থিম',
    heroDemoContent: 'কনটেন্ট',
    heroDemoPublishing: 'পাবলিশ হচ্ছে...',
    heroDemoPublished: 'পাবলিশ হয়েছে!',
    heroDemoLive: 'আপনার স্টোর এখন লাইভ',
    heroDemoReady: '৫ মিনিটে রেডি!',
    heroDemoNoCoding: 'কোডিং লাগবে না',
    heroBadge: "বাংলাদেশের প্রথম বাংলা-ভিত্তিক বিল্ডার",
    heroSubtitle1: 'না কোডিং, না ঝামেলা।',
    heroSubtitle2: 'টেমপ্লেট বেছে নিন, কনটেন্ট দিন —',
    heroSubtitle3: '৫ মিনিটে অনলাইন।',
    heroCtaPrimary: 'ফ্রিতে শুরু করুন',
    heroTrust1: 'ক্রেডিট কার্ড লাগবে না',
    heroTrust2: '১ মিনিটে সাইন আপ',
    heroBetaNotice: 'বিটা ইউজার হিসেবে যোগ দিন — আর্লি অ্যাডাপ্টার সুবিধা পান',
    heroFooter: 'বাংলাদেশ থেকে, বাংলাদেশের জন্য',
    // AIHeroSection
    heroAiBadge: 'ই-কমার্সের ভবিষ্যৎ',
    heroAiTitle: 'AI সমৃদ্ধ স্টোর বিল্ডার',
    heroAiSubtitle: 'প্রোডাক্ট ডেসক্রিপশন থেকে কাস্টমার সাপোর্ট - আপনার সব কিছু সামলাবে আমাদের AI। আজই শুরু করুন আপনার অটোমেটিক স্টোর।',
    heroAiCta: 'আপনার AI স্টোর শুরু করুন',
    heroAiTrust1: 'বিকাশ/নগদ ইন্টিগ্রেটেড',
    heroAiTrust2: '২৪/৭ AI সাপোর্ট',
    heroAiVisualEditor: 'ড্র্যাগ এন্ড ড্রপ এডিটর',
    heroAiVisualUserMsg: 'এই প্রোডাক্ট এর দাম কত?',
    heroAiVisualAiReply: 'এটার দাম ৳৯৯৯, এম সাইজ অ্যাভেইলএবল',
    // ProblemSolutionSection
    problemHeaderTitle1: 'কেন',
    problemHeaderTitle2: 'কষ্ট',
    problemHeaderTitle3: 'করবেন, যখন আছে',
    problemHeaderTitle4: 'সহজ উপায়?',
    problemLeftTitle1: 'এখনো',
    problemLeftTitle2: 'এভাবে কষ্ট',
    problemLeftTitle3: 'করছেন?',
    problemPain1: 'Facebook এ Post করে করে ক্লান্ত',
    problemPain2: 'Developer এর পেছনে দৌড়ানো',
    problemPain3: 'Excel এ Order Track করা',
    problemPain4: 'Shopify র মাসে ৫০০০+ টাকা',
    problemPain5: 'ইংরেজি Platform এ বুঝতে না পারা',
    problemRightTitle1: 'এখন সব',
    problemRightTitle2: 'সহজ',
    problemStep1: 'Template বাছুন',
    problemStep2: 'Content দিন',
    problemStep3: 'Publish করুন',
    problemSuccess: 'আপনার Store Ready!',
    problemTag1: 'সব কিছু বাংলায়',
    problemTag2: 'Live Preview',
    problemTag3: 'ফ্রিতে শুরু',
    // AIShowcaseSection
    landingShowcase_suite: 'AI স্যুট',
    landingShowcase_title: '🤖 AI সব জায়গায় — আপনার জন্য, কাস্টমারের জন্য',
    landingShowcase_subtitle: 'একটা নয়, তিনটা AI — সবার জন্য সাহায্যকারী',
    landingShowcase_visitorTitle: 'ভিজিটর AI',
    landingShowcase_visitorRole: 'ক্রেতাদের জন্য',
    landingShowcase_visitorDesc: 'প্রত্যেক ভিজিটর পাবে পার্সোনাল শপিং অ্যাসিস্ট্যান্ট',
    landingShowcase_visitor_askAi: 'আপনার বিজনেস সম্পর্কে AI-কে যেকোনো কিছু জিজ্ঞাসা করুন',
    landingShowcase_visitor_feature1: 'প্রোডাক্ট নলেজ',
    landingShowcase_visitor_feature1_desc: 'আপনার ইনভেন্টরির প্রতিটি ডিটেইল AI জানে।',
    landingShowcase_visitor_feature2: 'ইনস্ট্যান্ট চেকআউট',
    landingShowcase_visitor_feature2_desc: 'কাস্টমাররা চ্যাটের মধ্যেই সরাসরি অর্ডার করতে পারে।',
    landingShowcase_visitor_feature3: 'স্মার্ট সাজেশন',
    landingShowcase_visitor_feature4: 'স্টোর পলিসি',
    landingShowcase_visitor_feature4_desc: 'শিপিং, রিটার্ন এবং অন্যান্য পলিসি সম্পর্কে উত্তর দেয়।',
    landingShowcase_visitor_feature5: 'সর্বদা সক্রিয়',
    landingShowcase_visitor_feature5_desc: 'AI আপনার কাস্টমারদের জন্য ২৪/৭ আছে।',
    landingShowcase_visitor_tip: 'ভিজিটর AI ব্যবহার করে সেলস ও সাপোর্ট স্টাফ খরচ ৮০% পর্যন্ত সাশ্রয় করুন।',
    landingShowcase_visitor_aiName: 'ভিজিটর অ্যাসিস্ট্যান্ট',
    landingShowcase_visitor_alwaysActive: 'সর্বদা সক্রিয়',
    landingShowcase_visitor_initialMsg: 'হ্যালো! আমি ওজিল (OZZYL) AI। আপনাকে আজ কীভাবে সাহায্য করতে পারি?',
    landingShowcase_visitor_userMsg1: 'আপনার কাছে কি ৪২ সাইজের লাল জুতা আছে?',
    landingShowcase_visitor_aiResponse1: 'হ্যাঁ, আছে! এখানে কিছু অপশন দেওয়া হলো:',
    landingShowcase_visitor_aiResponseBullet1: 'রেড স্পোর্ট প্রো - ৳২,৪৯৯',
    landingShowcase_visitor_aiResponseBullet2: 'এলিট রানার রেড - ৳৩,২০০',
    landingShowcase_visitor_aiResponseBullet3: 'ক্লাসিক রেড স্নিকার - ৳১,৮৫০',
    landingShowcase_visitor_typeMessage: 'মেসেজ লিখুন...',
    landingShowcase_merchantTitle: 'মার্চেন্ট AI',
    landingShowcase_merchantRole: 'আপনার জন্য',
    landingShowcase_merchantDesc: 'আপনার বুদ্ধিমান বিজনেস কো-পাইলট',
    landingShowcase_merchant_dashboard: 'ড্যাশবোর্ড',
    landingShowcase_merchant_products: 'প্রোডাক্ট',
    landingShowcase_merchant_orders: 'অর্ডার',
    landingShowcase_merchant_analytics: 'অ্যানালিটিক্স',
    landingShowcase_merchant_todaysSales: "আজকের বিক্রি",
    landingShowcase_merchant_visitors: 'ভিজিটর',
    landingShowcase_merchant_assistantName: 'বিজনেস কো-পাইলট',
    landingShowcase_merchant_userMsg1: 'আজ আমার ব্যবসার অবস্থা কেমন?',
    landingShowcase_merchant_aiSnippet: 'ম্যানেজমেন্ট ইনসাইট',
    landingShowcase_merchant_aiResponse1: 'আজ আপনার মোট বিক্রি {{total}}, যা গতকালের তুলনায় বেশি।',
    landingShowcase_merchant_aiResponse2: 'গত সপ্তাহের তুলনায় অর্ডার {{percent}}% বেড়েছে।',
    landingShowcase_merchant_suggested: 'এগুলো জিজ্ঞাসা করে দেখুন:',
    landingShowcase_merchant_suggested1: 'প্রোডাক্ট ডেসক্রিপশন তৈরি করো',
    landingShowcase_merchant_suggested2: 'আগামী মাসের স্টক প্রেডিকশন',
    landingShowcase_merchant_suggested3: 'সেরা প্রোডাক্টগুলো কী কী?',
    landingShowcase_customerTitle: 'রিটেনশন AI',
    landingShowcase_customerRole: 'বিক্রয়ের পরে',
    landingShowcase_customerDesc: 'অটোমেটেড সাপোর্ট এবং রিটেনশন সিস্টেম',
    landingShowcase_customer_storeTitle: 'আপনার স্টোর',
    landingShowcase_customer_assistantName: 'অর্ডার অ্যাসিস্ট্যান্ট',
    landingShowcase_customer_userMsg1: 'আমি কি আমার অর্ডার ট্র্যাক করতে পারি?',
    landingShowcase_customer_aiResponse1: 'অবশ্যই! আপনার অর্ডার #১২৩৪ পথে আছে। আপনার এটিও পছন্দ হতে পারে:',
    landingShowcase_customer_addToCartMsg: 'আপনি কি এটি আপনার পরবর্তী অর্ডারে যোগ করতে চান?',
    landingShowcase_customer_yes: 'হ্যাঁ, প্লিজ!',
    landingShowcase_customer_otherColor: 'অন্য রঙ দেখাও',
    landingShowcase_customer_canAsk: 'কাস্টমাররা জিজ্ঞাসা করতে পারে:',
    landingShowcase_customer_ask1: 'আমার অর্ডার কোথায়?',
    landingShowcase_customer_ask2: 'কীভাবে প্রোডাক্ট রিটার্ন করবো?',
    landingShowcase_customer_ask3: 'কোনো ডিসকাউন্ট আছে?',
    // DragDropBuilderShowcase
    landingDragDrop_title: 'ড্র্যাগ এন্ড ড্রপ বিল্ডার',
    landingDragDrop_customizeAsYouWish: 'আপনার ইচ্ছামত সাজান',
    landingDragDrop_builderDesc: 'ডিজাইন স্কিল নেই? কোন সমস্যা নেই। আমাদের ড্র্যাগ এন্ড ড্রপ বিল্ডার ব্যবহার করে খুব সহজে আপনার মনের মত স্টোর তৈরি করুন।',
    landingDragDrop_widgets: 'উইজেটস',
    landingDragDrop_dropHere: 'এখানে ফেলুন',
    landingDragDrop_widgetText: 'টেক্সট',
    landingDragDrop_widgetImage: 'ছবি',
    landingDragDrop_widgetButton: 'বাটন',
    landingDragDrop_widgetForm: 'ফর্ম',
    landingDragDrop_widgetChart: 'চার্ট',
    landingDragDrop_widgetVideo: 'ভিডিও',
    landingDragDrop_widgetReview: 'রিভিউ',
    landingDragDrop_pixelPerfect: 'পিক্সেল পারফেক্ট',
    landingDragDrop_placeAnywhere: 'যেকোনো এলিমেন্ট যেকোনো জায়গায় বসান।',
    landingDragDrop_responsive: 'ফুললি রেসপনসিভ',
    landingDragDrop_perfectEverywhere: 'মোবাইল, ট্যাবলেট এবং ডেসকটপে সমান সুন্দর।',
    landingDragDrop_livePreview: 'লাইভ প্রিভিউ',
    landingDragDrop_seeRealTime: 'তাত্ক্ষণিক পরিবর্তন দেখুন।',
    landingDragDrop_autoSave: 'অটো সেভ',
    landingDragDrop_nothingLost: 'প্রতিটি পরিবর্তন অটোমেটিক সেভ হয়।',
    landingDragDrop_undoRedo: 'আনডু/রিডু',
    landingDragDrop_backToPrevious: 'সহজেই এক ক্লিকে ভুল সংশোধন করুন।',
    landingDragDrop_copyPaste: 'কপি পেস্ট',
    landingDragDrop_sectionCopyPaste: 'সেকশন ডুপ্লিকেট করার সুবিধা।',
    // EditorModeComparison
    landingEditorMode_flexibleWorkflow: 'ফ্লেক্সিবল ওয়ার্কফ্লো',
    landingEditorMode_yourChoice: 'আপনার পছন্দ, আপনার উপায়',
    landingEditorMode_comparisonDesc: 'আপনার স্টাইল অনুযায়ী মোড বেছে নিন। সিম্পল থেকে প্রো মোডে যেকোনো সময় সুইচ করুন।',
    landingEditorMode_simpleMode: 'সিম্পল মোড',
    landingEditorMode_fastEasy: 'খুব দ্রুত এবং সহজ',
    landingEditorMode_templateSelect: 'টেমপ্লেট বাছুন',
    landingEditorMode_fillContent: 'কনটেন্ট দিন',
    landingEditorMode_publish: 'পাবলিশ করুন',
    landingEditorMode_ready5Mins: '৫ মিনিটে রেডি',
    landingEditorMode_noCoding: 'কোডিং এর প্রয়োজন নেই',
    landingEditorMode_noLearning: 'শিখতে হবে না কিছু',
    landingEditorMode_preMade: 'তৈরি করা কম্পোনেন্টস',
    landingEditorMode_tempChangeEasy: 'সহজে টেমপ্লেট পরিবর্তন',
    landingEditorMode_oneClickDesign: 'এক ক্লিকে নতুন ডিজাইন',
    landingEditorMode_forBeginners: 'নতুনদের জন্য সেরা',
    landingEditorMode_easiestWay: 'শুর করার সবচেয়ে সহজ উপায়',
    landingEditorMode_bestFor: 'যাদের জন্য সেরা',
    landingEditorMode_launchFast: 'আমি কোনো ঝামেলা ছাড়া দ্রুত স্টোর শুরু করতে চাই',
    landingEditorMode_startSimple: 'সিম্পল মোড এ শুরু করুন',
    landingEditorMode_proMode: 'প্রো মোড',
    landingEditorMode_fullControl: 'ফুল ক্রিয়েটিভ কন্ট্রোল',
    landingEditorMode_dragDrop: 'ড্র্যাগ এন্ড ড্রপ',
    landingEditorMode_customization: 'ডিপ কাস্টমাইজেশন',
    landingEditorMode_ppDesign: 'পিক্সেল পারফেক্ট ডিজাইন',
    landingEditorMode_controlEveryPixel: 'প্রতিটি পিক্সেল কন্ট্রোল করুন',
    landingEditorMode_unlimitedWidgets: 'আনলিমিটেড উইজেটস',
    landingEditorMode_widgetCollection: 'আমাদের সব উইজেটস ব্যবহার করুন',
    landingEditorMode_completeFreedom: 'সম্পূর্ণ স্বাধীনতা',
    landingEditorMode_arrangeAsYouWish: 'যেকোনো কিছু যেখানে খুশি সাজান',
    landingEditorMode_advancedUsers: 'অ্যাডভান্সড ইউজারদের জন্য',
    landingEditorMode_proFinishing: 'আপনার স্টোরকে দিন প্রো ফিনিশিং',
    landingEditorMode_customizeMyWay: 'আমি আমার স্টোরের প্রতিটি ডিটেইল কাস্টমাইজ করতে চাই',
    landingEditorMode_tryProMode: 'প্রো মোড ট্রাই করুন',
    landingEditorMode_simple: 'সিম্পল',
    landingEditorMode_pro: 'প্রো',
    landingEditorMode_anywhere: 'যেকোনো জায়গায়',
    landingEditorMode_switchModeHint: 'আপনি যেকোনো সময় মোড পরিবর্তন করতে পারবেন',
    // AIMagicSection
    landingMagic_title: 'আমাদের AI ২৪/৭ কাজ করে আপনার বিজনেস বড় করতে, যাতে আপনি গুরুত্বপূর্ণ কাজে মনোযোগ দিতে পারেন।',
    landingMagic_step1: 'ধাপ ১',
    landingMagic_step2: 'ধাপ ২',
    landingMagic_step3: 'ধাপ ৩',
    landingMagic_build: 'তৈরি',
    landingMagic_automate: 'অটোমেট',
    landingMagic_sell: 'বিক্রি',
    landingMagic_sleeping: 'আপনি ঘুমাচ্ছেন',
    landingMagic_morning: 'ম্যানেজমেন্ট মনিং',
    landingMagic_totalSales: 'মোট বিক্রি',
    landingMagic_chatOnline: 'চ্যাটবট অনলাইন',
    landingMagic_chatUserMsg: 'আমি XL সাইজের প্রিমিয়াম ব্ল্যাক জ্যাকেট টা কিনতে চাই। অ্যাভেইলেবল আছে?',
    landingMagic_chatAiMsg: 'হ্যাঁ, এটি অ্যাভেইলেবল আছে! আমি এটি আপনার কার্টে যোগ করেছি। আপনি এখানে চেকআউট করতে পারেন।',
    landingMagic_productConfirmed: 'প্রোডাক্ট কনফার্ম করা হয়েছে',
    landingMagic_notificationTitle: 'নতুন অর্ডার পাওয়া গেছে',
    landingMagic_notificationBody: 'রাহীমের থেকে ২,৪৯৯ টাকার অর্ডার',
    landingMagic_notificationDesc: 'AI চ্যাটবট রাত ২:০৫ এ সেলটি করেছে',
    landingMagic_captionSleepAi: 'আপনি যখন ঘুমান AI তখন কাজ করে',
    landingMagic_captionMorningReport: 'ঘুম থেকে উঠে নতুন অর্ডার এবং সেল রিপোর্ট পান',
    // AISocialProofSection
    landingSocialProof_firstInBD: 'বাংলাদেশে প্রথম',
    landingSocialProof_title: 'কেন ওজিল (OZZYL) আলাদা',
    landingSocialProof_platformCol: 'প্ল্যাটফর্ম',
    landingSocialProof_allThree: 'একমাত্র এই প্ল্যাটফর্মে তিনটিই আছে',
    landingSocialProof_saveStaffCost: 'স্টাফ খরচ কমান',
    landingSocialProof_noSupportNeeded: 'সাপোর্ট স্টাফ রাখার প্রয়োজন নেই',
    landingSocialProof_available247: '২৪/৭ অ্যাভেইলেবল',
    landingSocialProof_someoneIsThere: 'কাস্টমারের জন্য AI সবসময় আছে',
    landingSocialProof_scaleNoHiring: 'নিয়োগ ছাড়াই বড় করুন',
    landingSocialProof_handle1000Customers: 'একসাথে ১০০০ কাস্টমার হ্যান্ডেল করুন',
    landingSocialProof_happyCustomers: 'খুশি কাস্টমার',
    landingSocialProof_instantResponseTrust: 'তাত্ক্ষণিক উত্তর ভরসা বাড়ায়',
    landingSocialProof_poweredBy: 'ওয়ার্ল্ড-ক্লাস AI দ্বারা পরিচালিত',
    landingSocialProof_bestTech: 'আমরা আপনার বিজনেসের জন্য সেরা প্রযুক্তি ব্যবহার করি',
    // InfrastructureSection
    infraBadge: 'এন্টারপ্রাইজ ইনফ্রাস্ট্রাকচার',
    infraTitle: 'বড় বিজনেসের জন্য তৈরি',
    infraSubtitle: 'আপনার স্টোর সেই ইনফ্রাস্ট্রাকচারে চলে যা পৃথিবীর সবচেয়ে বড় ই-কমার্স সাইটগুলো ব্যবহার করে।',
    infraCard1Title: 'গ্লোবাল এজ নেটওয়ার্ক',
    infraCard1Desc: 'সারা বিশ্বে ৩ ২০১০+ সার্ভার নিশ্চিত করে আপনার স্টোর বাংলাদেশের যেকোনো প্রান্ত থেকে দ্রুত লোড হবে।',
    infraCard2Title: 'অভেদ্য নিরাপত্তা',
    infraCard2Desc: 'DDoS অ্যাটাক এবং বট থেকে এন্টারপ্রাইজ-গ্রেড সুরক্ষা। আপনার ডেটা সবসময় নিরাপদ।',
    infraCard3Title: 'অটোমেটিক স্কেলিং',
    infraCard3Desc: '১ থেকে ১ মিলিয়ন ভিজিটর - যেকোনো ট্রাফিক স্পাইক হ্যান্ডেল করতে আমাদের ইনফ্রাস্ট্রাকচার একা সক্ষম।',
    infraTrustBar: 'সারা বিশ্বের আধুনিক ডিজিটাল ব্র্যান্ডগুলোর কাছে বিশ্বস্ত',
    infraLabelLocation: 'আপনার অবস্থান (BD)',
    infraLabelEdge: 'এজ সার্ভার',
    infraLabelNearest: 'নিকটতম',
    infraDhakaEdge: 'ঢাকা এজ (~৫ms) 🇧🇩',
    infraLiveLatency: 'লাইভ ল্যাটেন্সি',
    infraGlobalServers: 'গ্লোবাল সার্ভার',
    infraLoadingTime: 'লোডিং টাইম',
    infraUptime: 'আপটাইম গ্যারান্টি',
    infraEnterpriseRel: 'এন্টারপ্রাইজ রিলায়েবিলিটি',
    infraSixContinents: '৬ মহাদেশে ছড়িয়ে',
    infraFromDhaka: 'ঢাকা এজ সার্ভার থেকে',
    infraWhoUses: 'যারা Cloudflare ব্যবহার করে:',
    infraAndMillionsMore: 'এবং আরো ৪০+ মিলিয়ন ওয়েবসাইট',
    infraLatency: '<১০ms ল্যাটেন্সি',
    infraSecurity: 'এন্টারপ্রাইজ সিকিউরিটি',
    // InfrastructureCTA
    infraCtaBadge: 'Shopify যে Infrastructure এ চলে, আপনার Store ও',
    infraCtaTitlePart1: 'যে Technology তে',
    infraCtaTitlePart2: 'বড়রা Millions খরচ করে',
    infraCtaTitlePart3: 'সেটা আপনার জন্য',
    infraCtaSubtitle: 'Facebook, Google, Shopify যে Infrastructure ব্যবহার করে — সেই একই Cloudflare Technology আপনার Store এ আজই Activate করুন।',
    infraCtaPrimary: 'ফ্রিতে শুরু করুন',
    infraCtaSecondary: 'ডেমো দেখুন',
    // AIPoweredFinalCTA
    landingFinalCTA_chatPrompt: 'হাই! আমি ওজিল (OZZYL) AI। আপনাকে আজ কীভাবে সাহায্য করতে পারি?',
    landingFinalCTA_chatResponse1: ' ওজিল (OZZYL) বাংলাদেশের প্রথম AI সমৃদ্ধ ই-কমার্স প্ল্যাটফর্ম। আপনি ফ্রিতে শুরু করতে পারেন!',
    landingFinalCTA_chatResponse2: 'আমাদের ফ্রি প্ল্যান ০ টাকা থেকে শুরু। স্টার্টার প্ল্যান মাত্র ৪৯০ টাকা/মাস।',
    landingFinalCTA_chatResponse3: 'আমাদের আছে AI চ্যাটবট, অর্ডার ম্যানেজমেন্ট, বিকাশ/নগদ পেমেন্ট এবং আরো অনেক কিছু!',
    landingFinalCTA_chatResponse4: 'দারুণ! আপনি মাত্র ১ মিনিটে রেজিস্ট্রেশন করতে পারেন। কোনো ক্রেডিট কার্ড লাগবে না।',
    landingFinalCTA_limitedOffer: 'স্পেশাল বিটা অফার',
    landingFinalCTA_ctaMainTitle: 'আপনার অটোমেটিক স্টোর তৈরি করতে প্রস্তুত?',
    landingFinalCTA_ctaSubtitle: '১০০+ ব্যবসায়ীদের সাথে যোগ দিন এবং AI এর শক্তি দিয়ে আপনার ই-কমার্স যাত্রা শুরু করুন।',
    landingFinalCTA_startFreeBtn: 'ফ্রিতে শুরু করুন',
    landingFinalCTA_aiIncluded: 'AI অন্তর্ভুক্ত',
    landingFinalCTA_noCardNeeded: 'ক্রেডিট কার্ড প্রয়োজন নেই',
    landingFinalCTA_setupOneMin: '১ মিনিটে সেটআপ',
    landingFinalCTA_aiFreeAllPlans: 'সব প্ল্যানে AI আছে',
    landingFinalCTA_orSeparator: 'অথবা',
    landingFinalCTA_callUs: 'কল করুন: +৮৮০১৫৭০২৬০১১৮',
    landingFinalCTA_typeQuestion: 'যেকোনো কিছু জিজ্ঞাসা করুন...',
    landingFinalCTA_tryAiHint: 'ফিচার বা দাম সম্পর্কে জিজ্ঞাসা করে দেখুন',
    // FinalCTA
    finalCtaTitlePart1: 'আজই শুরু করুন,',
    finalCtaTitlePart2: 'Future Build',
    finalCtaTitlePart3: 'করুন',
    finalCtaMission: 'আমরা Bangladesh এর প্রথম সত্যিকারের বাংলা E-commerce Platform বানাচ্ছি।',
    finalCtaJourney: 'আপনি কি আমাদের সাথে এই Journey তে থাকতে চান?',
    finalCtaPrimary: 'ফ্রিতে শুরু করুন',
    finalCtaLive: 'লাইভ',
    finalCtaFrom: 'থেকে',
    finalCtaJustSignedUp: 'মাত্র জয়েন করেছেন!',
    finalCtaSecondaryCall: 'আমাদের সাথে কথা বলুন',
    finalCtaSecondaryMail: 'প্রশ্ন আছে?',
    finalCtaEarlyBird: 'লাইফটাইম আরলি বার্ড প্রাইসিং',
    finalCtaOr: 'অথবা',
    landingSocialProof_advancedNLP: 'অ্যাডভান্সড NLP',
    landingMagic_nightTime: 'রাত ০২:০০',
    landingMagic_morningTime: 'সকাল ০৮:০০',
    landingMagic_productName: 'প্রিমিয়াম জ্যাকেট',
    landingMagic_productDetails: 'সাইজ: XL • কালো',
    landingMagic_salesValueFlat: '৳০',
    landingMagic_salesValueUp: '৳২,৪৯৯',
    landingFinalCTA_aiAssistantName: 'ওজিল (OZZYL) AI অ্যাসিস্ট্যান্ট',
    landingFinalCTA_onlineNow: 'অনলাইন',
    landingOzzylChat_identifyYourself: 'আপনার পরিচয় দিন',
    landingOzzylChat_identifyDesc: 'কথা শুরু করতে দয়া করে আপনার তথ্য দিন।',
    landingOzzylChat_yourName: 'আপনার নাম',
    landingOzzylChat_phone: 'মোবাইল নম্বর',
    landingOzzylChat_namePlaceholder: 'আপনার নাম লিখুন',
    landingOzzylChat_phonePlaceholder: '01XXXXXXXXX',
    landingOzzylChat_startChat: 'চ্যাট শুরু করুন',
    landingOzzylChat_typeMessage: 'আপনার মেসেজ লিখুন...',
    landingOzzylChat_createFreeStore: 'আপনার ফ্রি স্টোর তৈরি করুন',
    landingOzzylChat_alwaysHelp: 'আপনার সেবায় সর্বদা প্রস্তুত',
    landingOzzylChat_initialMsg: 'হ্যালো! আমি ওজিল (OZZYL) AI। আপনাকে আজ কীভাবে সাহায্য করতে পারি?',
    landingOzzylChat_greetingMsg: 'হাই! AI কীভাবে আপনার বিজনেস বাড়াতে পারে জানতে চান?',
    landingOzzylChat_suggestWhatIs: 'Ozzyl AI কী?',
    landingOzzylChat_suggestPricing: 'দাম কত?',
    landingOzzylChat_suggestBkash: 'বিকাশ কি সাপোর্ট করে?',
    landingOzzylChat_suggestHowToStart: 'শুরু করবো কীভাবে?',
    landingOzzylChat_errorMsg: 'কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।',
    landingOzzylChat_phoneInvalidError: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)',
    landingOzzylChat_betaBadge: 'বিটা',
    landingVisitorAi_newFeature: 'নতুন ফিচার',
    landingVisitorAi_askAiTitle: 'আপনার বিজনেস সম্পর্কে AI-কে যেকোনো কিছু জিজ্ঞাসা করুন',
    landingVisitorAi_askAiSubtitle: 'আমাদের AI আপনার স্টোর ডাটা, প্রোডক্ট এবং পলিসি সম্পর্কে জানে, তাই এটি সঠিক তথ্য দিতে পারে।',
    landingVisitorAi_feature1Title: 'প্রোডাক্ট নলেজ',
    landingVisitorAi_feature1Desc: 'আপনার ইনভেন্টরির প্রতিটি ডিটেইল AI জানে।',
    landingVisitorAi_feature2Title: 'ইনস্ট্যান্ট চেকআউট',
    landingVisitorAi_feature2Desc: 'কাস্টমাররা চ্যাটের মধ্যেই সরাসরি অর্ডার করতে পারে।',
    landingVisitorAi_feature3Title: 'স্মার্ট সাজেশন',
    landingVisitorAi_feature3Desc: 'কাস্টমারের পছন্দ অনুযায়ী AI প্রোডাক্ট সাজেস্ট করে।',
    landingVisitorAi_feature4Title: 'স্টোর পলিসি',
    landingVisitorAi_feature4Desc: 'শিপিং, রিটার্ন এবং অন্যান্য পলিসি সম্পর্কে উত্তর দেয়।',
    landingVisitorAi_saveSalesCostDesc: 'সেলস ও সাপোর্ট স্টাফ খরচ ৮০% পর্যন্ত সাশ্রয় করুন।',
    landingVisitorAi_aiAssistantName: 'AI অ্যাসিস্ট্যান্ট',
    landingVisitorAi_alwaysActive: 'সর্বদা সক্রিয়',
    landingProduct_whatsappOrder: 'WhatsApp-এ অর্ডার করুন',
    landingProduct_selected: 'সিলেক্ট করা হয়েছে:',
    landingProduct_selectOption: 'একটি অপশন বেছে নিন',
    landingProduct_outOfStock: '(স্টক শেষ)',
    landingProduct_orderMsg_greeting: 'হ্যালো! আমি কিছু প্রোডাক্ট অর্ডার করতে চাই।',
    landingProduct_orderMsg_iWantToOrder: 'প্রোডাক্ট: {{productName}}',
    landingProduct_orderMsg_quantity: 'পরিমাণ: {{quantity}}',
    landingProduct_orderMsg_price: 'মোট দাম: {{total}}',
    landingProduct_orderMsg_myInfo: 'আমার তথ্য:',
    landingProduct_orderMsg_name: 'নাম:',
    landingProduct_orderMsg_address: 'ঠিকানা:',
    landingProduct_orderMsg_mobile: 'মোবাইল:',
    landingProduct_orderMsg_thanks: 'ধন্যবাদ!',
    landingConversion_days: 'দিন',
    landingConversion_hours: 'ঘণ্টা',
    landingConversion_minutes: 'মিনিট',
    landingConversion_seconds: 'সেকেন্ড',
    landingConversion_offerExpired: 'অফার শেষ!',
    landingConversion_offerEnding: 'অফার শেষ হতে বাকি:',
    landingConversion_stockOut: 'স্টক আউট',
    landingConversion_onlyStockLeft: 'দ্রুত করুন! মাত্র {{stock}}টি বাকি!',
    landingConversion_onlyXInStock: 'মাত্র {{stock}}টি স্টকে আছে',
    landingConversion_xInStock: '{{stock}}টি স্টকে আছে',
    landingConversion_justNow: 'এইমাত্র',
    landingConversion_minutesAgo: '{{randomMinutes}} মিনিট আগে',
    landingConversion_orderedText: 'অর্ডার করেছেন',
    landingOrderBump_specialOffer: 'স্পেশাল অফার',
    landingOrderBump_yesIWant: 'হ্যাঁ, আমি এটি চাই!',
    landingOrderBump_offDiscount: '{{discount}}% ছাড়',
    landingOrderBump_youAreSaving: 'আপনি {{savings}} সাশ্রয় করছেন!',
    landingOrderBump_addAndSave: 'আরো সাশ্রয় করতে এগুলো যোগ করুন!',
    // BentoFeaturesSection
    bentoBadge: 'ফিচার',
    bentoMainTitle_part1: 'শক্তিশালী ফিচার,',
    bentoMainTitle_part2: 'সহজ ইন্টারফেস',
    bentoTemplateLibrary_title: 'টেমপ্লেট লাইব্রেরি',
    bentoTemplateLibrary_desc: 'প্রফেশনাল টেমপ্লেটস একটা ক্লিকে',
    bentoLivePreview_title: 'লাইভ প্রিভিউ',
    bentoLivePreview_desc: 'রিয়েল-টাইম এডিটিং',
    bentoDragDrop_title: 'ড্র্যাগ অ্যান্ড ড্রপ',
    bentoDragDrop_desc: 'সেকশন রিঅ্যারেঞ্জ',
    bentoBanglaSupport_title: '🇧🇩 বাংলা সাপোর্ট',
    bentoBanglaSupport_main: 'সম্পূর্ণ বাংলায়',
    bentoBanglaSupport_sub: 'ইন্টারফেস এবং সাপোর্ট',
    bentoMobileReady_title: 'মোবাইল রেডি',
    bentoAllInOne_title: 'অল-ইন-ওয়ান প্ল্যাটফর্ম',
    bentoAllInOne_desc: 'E-commerce এবং Landing Page - একই সাথে',
    bentoAllInOne_badge: 'একটি সাবস্ক্রিপশন',
    bentoComingSoon_badge: 'শীঘ্রই আসছে',
    bentoComingSoon_desc: 'ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার, AI কন্টেন্ট, পেমেন্ট গেটওয়ে এবং আরও অনেক কিছু...',
    bentoComingSoon_placeholder: 'আপডেটের জন্য ইমেইল দিন'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/chat.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chat",
    ()=>chat
]);
const chat = {
    // Ozzyl AI Chat Widget (Landing)
    landingOzzylChat_greetingMsg: '👋 আসসালামু আলাইকুম! অনলাইনে ব্যবসা করতে সাহায্য লাগবে?',
    landingOzzylChat_initialMsg: 'আসসালামু আলাইকুম! 👋 আমি Ozzyl AI - Ozzyl এর official assistant। আপনার অনলাইন বিজনেস নিয়ে কিভাবে সাহায্য করতে পারি?',
    landingOzzylChat_suggestWhatIs: 'Ozzyl কি?',
    landingOzzylChat_suggestPricing: 'Pricing জানতে চাই',
    landingOzzylChat_suggestBkash: 'বিকাশ পেমেন্ট নেওয়া যায়?',
    landingOzzylChat_suggestHowToStart: 'কিভাবে শুরু করব?',
    landingOzzylChat_alwaysHelp: 'সহায়তার জন্য সবসময় প্রস্তুত',
    landingOzzylChat_identifyYourself: 'আপনার পরিচয় দিন',
    landingOzzylChat_identifyDesc: 'চ্যাট শুরু করার আগে দয়া করে আপনার নাম এবং ফোন নাম্বারটি দিন।',
    landingOzzylChat_yourName: 'আপনার নাম',
    landingOzzylChat_namePlaceholder: 'উদাহরণ: মিস্টার রহিম',
    landingOzzylChat_phone: 'ফোন নাম্বার',
    landingOzzylChat_phonePlaceholder: 'উদাহরণ: 017XXXXXXXX',
    landingOzzylChat_startChat: 'চ্যাট শুরু করুন',
    landingOzzylChat_typeMessage: 'আপনার প্রশ্ন লিখুন...',
    landingOzzylChat_createFreeStore: 'ফ্রি স্টোর তৈরি করুন',
    landingOzzylChat_errorMsg: 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    // Landing AI Chat (Variant)
    landingAiChat_greetingTitle: 'Ozzyl AI',
    landingAiChat_greetingMsg: '👋 আসসালামু আলাইকুম! অনলাইনে ব্যবসা করতে সাহায্য লাগবে?',
    landingAiChat_initialMsg: 'আসসালামু আলাইকুম! 👋 আমি Ozzyl AI - Ozzyl এর অফিসিয়াল অ্যাসিস্ট্যান্ট। আপনার অনলাইন বিজনেস নিয়ে কিভাবে সাহায্য করতে পারি?',
    landingAiChat_suggest1: 'Ozzyl কি?',
    landingAiChat_suggest2: 'Pricing জানতে চাই',
    landingAiChat_suggest3: 'বিকাশ পেমেন্ট নেওয়া যায়?',
    landingAiChat_suggest4: 'কিভাবে শুরু করব?',
    landingAiChat_errorMsg: 'দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    landingAiChat_placeholder: 'আপনার প্রশ্ন লিখুন...',
    landingAiChat_createFreeStore: 'ফ্রি স্টোর তৈরি করুন',
    // Storefront Chat Widget
    chatWidget_merchantTitle: 'AI সহকারী',
    chatWidget_customerTitle: 'সেলস সহায়তা',
    chatWidget_repliesInSeconds: 'সাধারণত কয়েক সেকেন্ডে উত্তর দেয়',
    chatWidget_merchantWelcome: 'আসসালামু আলাইকুম! 👋 আমি আপনার AI সহকারী। কিভাবে সাহায্য করতে পারি?',
    chatWidget_customerWelcome: 'আসসালামু আলাইকুম! 👋 কিভাবে সাহায্য করতে পারি?',
    chatWidget_thinking: 'চিন্তা করছি...',
    chatWidget_placeholder: 'আপনার প্রশ্ন লিখুন...',
    chatWidget_clearChat: 'চ্যাট মুছে ফেলুন',
    chatWidget_errorConnection: 'AI সার্ভিসের সাথে কানেক্ট করতে ব্যর্থ হয়েছে',
    // Dashboard Chat Widget
    dashboardChat_welcome: 'আসসালামু আলাইকুম {{userName}}! আমি আপনার স্টোর সহকারী। আপনার বিক্রি, অর্ডার বা সেটিংস সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।',
    dashboardChat_title: 'স্টোর সহকারী',
    dashboardChat_online: 'অনলাইন',
    dashboardChat_unlockTitle: 'স্টোর সহকারী আনলক করুন',
    dashboardChat_unlockDesc: 'আপনার স্টোর ম্যানেজমেন্টে সাহায্য এবং রিয়েল-টাইম তথ্য পান। শুধুমাত্র প্রো প্ল্যানে উপলব্ধ।',
    dashboardChat_upgradePro: 'প্রো-তে আপগ্রেড করুন',
    dashboardChat_maybeLater: 'পরে করব',
    dashboardChat_askAnything: 'যেকোনো কিছু জিজ্ঞেস করুন...',
    // Page Builder AI Chat
    builderChat_intro: 'আসসালামু আলাইকুম! আমি আপনার AI ডিজাইন সহকারী। যেকোনো এলিমেন্ট সিলেক্ট করুন এবং আমাকে বলুন সেটি কিভাবে পরিবর্তন করতে হবে। (যেমন: "নীল রঙ করুন", "এখানে একটি বাটন দিন")',
    builderChat_title: 'লাভেবল AI',
    builderChat_subtitle: 'ডিজাইন সহকারী',
    builderChat_unlockTitle: 'AI সহকারী আনলক করুন',
    builderChat_unlockDesc: 'তাতক্ষণাৎ ডিজাইন করার জন্য আপনার এডিটরের সাথে চ্যাট করুন। শুধুমাত্র প্রো প্ল্যানে উপলব্ধ।',
    builderChat_describeChange: 'পরিবর্তনটি ব্যাখ্যা করুন...',
    builderChat_doneMessage: "হয়ে গেছে! আমি ডিজাইনটি আপডেট করেছি।"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/admin.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "admin",
    ()=>admin
]);
const admin = {
    // Super Admin & Merchant Admin Common
    adminPanel: 'অ্যাডমিন প্যানেল',
    store: 'স্টোর',
    stores: 'স্টোরসমূহ',
    action: 'অ্যাকশন',
    actions: 'অ্যাকশনসমূহ',
    status: 'স্ট্যাটাস',
    update: 'আপডেট',
    created: 'তৈরির তারিখ',
    noResults: 'কোনো ফলাফল পাওয়া হয়নি',
    // Plan Management
    planManagement: 'প্ল্যান ম্যানেজমেন্ট',
    planManagementDesc: 'ম্যানুয়ালি স্টোর প্ল্যান আপগ্রেড বা ডাউনগ্রেড করুন',
    currentPlan: 'বর্তমান প্ল্যান',
    freeStores: 'ফ্রি স্টোর',
    starterStores: 'স্টার্টার স্টোর',
    premiumStores: 'প্রিমিয়াম স্টোর',
    searchStores: 'নাম বা সাবডোমেইন দিয়ে স্টোর খুঁজুন...',
    planUpdatedSuccess: 'প্ল্যান সফলভাবে আপডেট হয়েছে!',
    planNotes: 'প্ল্যান ম্যানেজমেন্ট নোট',
    planFreeNote: 'ফ্রি: ১০টি প্রোডাক্ট, শুধুমাত্র ল্যান্ডিং পেজ, বেসিক ফিচার',
    planStarterNote: 'স্টার্টার (৳৯৯৯/মাস): ৫০টি প্রোডাক্ট, ফুল স্টোর মোড, কাস্টম ডোমেইন',
    planPremiumNote: 'প্রিমিয়াম (৳২৯৯৯/মাস): ৫০০টি প্রোডাক্ট, প্রায়োরিটি সাপোর্ট, সব ফিচার',
    plansEffectImmediate: 'আপডেটের পর প্ল্যান তাৎক্ষণিক কার্যকর হয়',
    // Merchants & Payouts
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
    pending: 'পেন্ডিং',
    processing: 'প্রসেসিং',
    shipped: 'শিপড',
    delivered: 'ডেলিভার্ড',
    cancelled: 'বাতিল',
    paid: 'পেইড',
    failed: 'ব্যর্থ',
    refunded: 'রিফান্ড করা হয়েছে',
    noMerchantsFound: 'কোনো মার্চেন্ট পাওয়া যায়নি',
    // Domain Management
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
    // Payments
    pendingPayments: 'পেন্ডিং পেমেন্টস',
    pendingPaymentsDesc: 'আনভেরিফাইড বিকাশ পেমেন্ট সহ স্টোর',
    noPendingPayments: 'কোনো পেন্ডিং পেমেন্ট নেই',
    verifyPayment: 'ভেরিফাই',
    rejectPayment: 'রিজেক্ট',
    contactUser: 'যোগাযোগ',
    downgradeToFree: 'ফ্রিতে ডাউনগ্রেড',
    // Discount Codes (Merchant)
    discounts: 'ডিসকাউন্ট কোড',
    discountsDesc: 'আপনার কাস্টমারদের জন্য প্রোমো কোড তৈরি করুন',
    addCode: 'কোড যোগ করুন',
    editDiscountCode: 'ডিসকাউন্ট কোড এডিট করুন',
    newDiscountCode: 'নতুন ডিসকাউন্ট কোড',
    codeLabel: 'কোড',
    discountValue: 'ভ্যালু',
    minOrder: 'সর্বনিম্ন অর্ডার',
    maxDiscount: 'সর্বোচ্চ ডিসকাউন্ট',
    maxUses: 'সর্বোচ্চ ব্যবহার',
    expiresAt: 'মেয়াদ শেষ',
    updateCode: 'কোড আপডেট করুন',
    createCode: 'কোড তৈরি করুন',
    noDiscountCodes: 'এখনো কোনো ডিসকাউন্ট কোড নেই',
    createFirstCode: 'আপনার প্রথম কোড তৈরি করুন',
    deleteCodeConfirm: 'এই কোডটি কি মুছে ফেলবেন?',
    percentageOff: '{{value}}% ছাড়',
    fixedOff: '{{value}} ছাড়',
    disabled: 'নিষ্ক্রিয়',
    expired: 'মেয়াদ শেষ',
    enable: 'সক্রিয় করুন',
    disable: 'নিষ্ক্রিয় করুন',
    // Marketing Coupons
    couponCodeLabel: 'কুপন কোড *',
    couponCodePlaceholder: 'যেমন: START50',
    discountTypeLabel: 'ডিসকাউন্ট টাইপ *',
    percentage: 'শতাংশ',
    fixed: 'ফিক্সড',
    discountPercentLabel: 'ডিসকাউন্ট (%)',
    discountAmountLabel: 'ডিসকাউন্ট অ্যামাউন্ট',
    discountExample50: 'যেমন: ৫০',
    discountExample500: 'যেমন: ৫০০',
    maxUsesOptional: 'সর্বোচ্চ ব্যবহার (ঐচ্ছিক)',
    expiryDateOptional: 'মেয়াদ শেষ (ঐচ্ছিক)',
    createCouponBtn: 'কুপন তৈরি করুন',
    creatingBtn: 'তৈরি করা হচ্ছে...',
    deleteCouponConfirm: 'আপনি কি নিশ্চিত যে আপনি এই কুপনটি ডিলিট করতে চান?',
    noCoupons: 'এখনও কোনো কুপন নেই',
    createFirstCouponDesc: 'সাবস্ক্রিপশনে ডিসকাউন্ট দিতে আপনার প্রথম কুপন তৈরি করুন',
    marketingCouponsTitle: 'মার্কেটিং - কুপন',
    marketingCouponsDesc: 'প্ল্যান আপগ্রেডে ডিসকাউন্টের জন্য কুপন তৈরি করুন',
    newCouponBtn: 'নতুন কুপন',
    statusInactive: 'নিষ্ক্রিয়',
    statusExpired: 'মেয়াদোত্তীর্ণ',
    statusExhausted: 'শেষ',
    statusActive: 'সক্রিয়',
    leaveEmptyUnlimited: 'আনলিমিটেডের জন্য খালি রাখুন',
    // Storage
    storageManagement: 'স্টোরেজ ম্যানেজমেন্ট',
    storageManagementDesc: 'R2 স্টোরেজ ম্যানেজ করুন এবং অপ্রয়োজনীয় ফাইল ক্লিন করুন',
    totalStorage: 'মোট স্টোরেজ',
    totalFiles: 'মোট ফাইল',
    orphaned: 'অরফ্যানড',
    searchFilesPlaceholder: 'ফাইল খুঁজুন...',
    orphanedOnly: 'শুধুমাত্র অরফ্যানড',
    deleteFilesBtn: '{{count}}টি ফাইল ডিলিট করুন',
    selectAllOrphaned: 'সব অরফ্যানড সিলেক্ট করুন ({{count}})',
    clearSelection: 'সিলেকশন মুছুন',
    colFile: 'ফাইল',
    colStatus: 'স্ট্যাটাস',
    colSize: 'সাইজ',
    colUploaded: 'আপলোড',
    colActions: 'অ্যাকশন',
    noOrphanedFiles: 'কোনো অরফ্যানড ফাইল পাওয়া যায়নি',
    noFiles: 'কোনো ফাইল পাওয়া যায়নি',
    inUse: 'ব্যবহৃত',
    viewFile: 'ফাইল দেখুন',
    deleteFile: 'ফাইল ডিলিট করুন',
    orphanedFilesNoticeTitle: 'অরফ্যানড ফাইল',
    orphanedFilesNoticeDesc: 'অরফ্যানড ফাইলগুলো কোনো প্রোডাক্ট, স্টোর বা ল্যান্ডিং পেজে ব্যবহৃত হচ্ছে না। ডিলিট করার আগে সাবধানে চেক করুন কারণ কিছু ফাইল অটোমেটিক ডিটেক্ট নাও হতে পারে।'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/onboarding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "onboarding",
    ()=>onboarding
]);
const onboarding = {
    // Onboarding Steps & Titles
    stepAccount: 'অ্যাকাউন্ট',
    stepBusiness: 'ব্যবসা',
    stepPlan: 'প্ল্যান',
    stepDone: 'সম্পন্ন',
    createAccount: 'অ্যাকাউন্ট তৈরি',
    setupYourStore: 'আপনার স্টোর সেটআপ করুন',
    choosePlan: 'আপনার প্ল্যান বেছে নিন',
    createStoreIn2Min: 'মাত্র ২ মিনিটে আপনার স্টোর তৈরি করুন',
    canChangeLater: 'আপনি পরে সবকিছু পরিবর্তন করতে পারবেন',
    selectPlanBasedNeeds: 'আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন',
    // Form Labels & Progress
    storeLink: 'স্টোর লিংক',
    createMyStore: 'আমার স্টোর তৈরি করুন',
    proceedWithPayment: 'আমি পেমেন্ট করেছি, এগিয়ে যান',
    // Category Templates
    categoryFashionHeadline: 'প্রিমিয়াম ফ্যাশন কালেকশন',
    categoryFashionSubheadline: 'ট্রেন্ডি ও স্টাইলিশ পোশাক',
    featurePremiumQuality: 'প্রিমিয়াম কোয়ালিটি',
    descBestFabric: 'সেরা মানের ফেব্রিক',
    featureFastDelivery: 'দ্রুত ডেলিভারি',
    descTwoThreeDays: '২-৩ দিনে ডেলিভারি',
    featureCashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    descPayOnReceive: 'পণ্য হাতে পেয়ে টাকা দিন',
    descStylishFashion: 'স্টাইলিশ ও ট্রেন্ডি ফ্যাশন আইটেম',
    categoryElectronicsHeadline: 'সেরা ইলেকট্রনিক্স প্রোডাক্ট',
    categoryElectronicsSubheadline: 'অরিজিনাল গ্যাজেট ও এক্সেসরিজ',
    featureOriginal: '১০০% অরিজিনাল',
    descWarranty: 'ওয়ারেন্টি সহ',
    featureAfterSales: 'আফটার সেলস সার্ভিস',
    descTechnicalSupport: 'ফ্রি টেকনিক্যাল সাপোর্ট',
    descPremiumElectronics: 'প্রিমিয়াম ইলেকট্রনিক্স আইটেম',
    categoryBeautyHeadline: 'বিউটি ও স্কিনকেয়ার সলিউশন',
    categoryBeautySubheadline: 'গ্লো করুন নিজেকে',
    featureAuthentic: 'অথেনটিক প্রোডাক্ট',
    descGenuine: '১০০% জেনুইন',
    featureNatural: 'ন্যাচারাল ইনগ্রিডিয়েন্ট',
    descSkinFriendly: 'স্কিন ফ্রেন্ডলি',
    featureFreeGift: 'ফ্রি গিফট',
    descSurprise: 'প্রতি অর্ডারে সারপ্রাইজ',
    descPremiumBeauty: 'প্রিমিয়াম বিউটি প্রোডাক্ট',
    categoryFoodHeadline: 'সুস্বাদু খাবার ও স্ন্যাক্স',
    categoryFoodSubheadline: 'ফ্রেশ ও হাইজিনিক',
    featureFresh: 'ফ্রেশ প্রোডাক্ট',
    descDaily: 'প্রতিদিন তৈরি',
    featureHotDelivery: 'হট ডেলিভারি',
    descHot: 'গরম গরম পৌঁছে যাবে',
    featureTasteGuarantee: 'টেস্ট গ্যারান্টি',
    descDelicious: 'মুখে লেগে যাবে',
    descDeliciousFood: 'সুস্বাদু খাবার',
    categoryHomeHeadline: 'হোম ও লাইফস্টাইল প্রোডাক্ট',
    categoryHomeSubheadline: 'আপনার ঘরকে সাজান',
    featureQuality: 'কোয়ালিটি প্রোডাক্ট',
    descLongLasting: 'লং লাস্টিং',
    featureSafePackaging: 'সেফ প্যাকেজিং',
    descCorrectCondition: 'সঠিক কন্ডিশনে ডেলিভারি',
    featureEasyReturn: 'ইজি রিটার্ন',
    descSevenDays: '৭ দিনে রিটার্ন',
    descHomeDecor: 'হোম ডেকোর আইটেম',
    categoryServicesHeadline: 'প্রফেশনাল সার্ভিস',
    categoryServicesSubheadline: 'এক্সপার্ট সলিউশন',
    featureExpertTeam: 'এক্সপার্ট টিম',
    descExperienced: 'অভিজ্ঞ প্রফেশনাল',
    featureOnTime: 'সময়মত ডেলিভারি',
    descDeadline: 'ডেডলাইন মেইনটেইন',
    featureSatisfaction: 'সন্তুষ্টির গ্যারান্টি',
    descBestQuality: 'বেস্ট কোয়ালিটি সার্ভিস',
    descProfessionalService: 'প্রফেশনাল সার্ভিস প্যাকেজ',
    categoryOtherHeadline: 'কোয়ালিটি প্রোডাক্ট',
    categoryOtherSubheadline: 'বেস্ট সিলেকশন',
    descBestQualityItem: 'সেরা মানের পণ্য',
    descPremiumProduct: 'প্রিমিয়াম প্রোডাক্ট',
    // Landing Config Defaults
    orderNow: 'এখনই অর্ডার করুন',
    cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    satisfiedCustomer: 'সন্তুষ্ট ক্রেতা',
    satisfiedCustomerText: 'অনেক ভালো প্রোডাক্ট, দ্রুত ডেলিভারি!',
    limitedTimeOffer: '🔥 সীমিত সময়ের অফার!',
    satisfactionGuarantee: '১০০% সন্তুষ্টির গ্যারান্টি',
    // Onboarding Payment
    bkashPayment: 'বিকাশ পেমেন্ট',
    sendMoneyTo: 'এই নম্বরে সেন্ড মানি করুন',
    bkashNumber: 'বিকাশ নম্বর',
    amount: 'পরিমাণ',
    afterSendMoney: 'টাকা পাঠানোর পর নিচের বক্সে TRX ID দিন',
    enterTrxId: 'ট্রানজেকশন আইডি (TRX ID) দিন',
    trxIdPlaceholder: 'যেমন: TRX123ABC456',
    paymentPhoneUsed: 'পেমেন্ট করতে যে নম্বর ব্যবহার করেছেন',
    orContinueFree: 'অথবা ফ্রি প্ল্যান নিয়ে এগিয়ে যান',
    startFreeUpgradeLater: 'ফ্রি প্ল্যান দিয়ে শুরু করুন এবং পরে আপগ্রেড করুন!',
    paymentPending: 'পেমেন্ট ভেরিফিকেশন পেন্ডিং',
    paymentVerificationNotice: 'আপনার পেমেন্ট যাচাই করা হবে। ২৪ ঘণ্টার মধ্যে আপনার প্ল্যান সক্রিয় হবে।',
    // Validation
    trxIdRequired: 'অনুগ্রহ করে TRX ID দিন',
    storeNameRequired: 'স্টোরের নাম আবশ্যক',
    emailRequired: 'ইমেল আবশ্যক',
    passwordRequired: 'পাসওয়ার্ড আবশ্যক',
    // Plan Features
    feature1Product: '৫টি প্রোডাক্ট',
    feature50Orders: '৫০টি অর্ডার/মাস',
    featureLandingPageMode: 'ল্যান্ডিং পেজ মোড',
    featureBasicSupport: 'বেসিক সাপোর্ট',
    feature50Products: '৫০টি প্রোডাক্ট',
    feature500Orders: '৫০০টি অর্ডার/মাস',
    featureFullStoreMode: 'ফুল স্টোর মোড',
    featureCustomDomain: 'কাস্টম ডোমেইন',
    featureBkashNagad: 'বিকাশ/নগদ পেমেন্ট',
    feature200Products: '২০০টি প্রোডাক্ট',
    feature3000Orders: '৩০০০টি অর্ডার/মাস',
    featureFbApi: 'ফেসবুক কনভার্সন API',
    featurePrioritySupport: 'প্রায়োরিটি সাপোর্ট',
    feature247Support: '২৪/৭ সাপোর্ট',
    // Placeholders & Meta
    placeholderName: 'রহিম উদ্দিন',
    placeholderEmail: 'you@example.com',
    placeholderStoreName: 'আমার দারুন স্টোর',
    placeholderSubdomain: 'my-store',
    metaTitle: 'আপনার স্টোর তৈরি করুন - Ozzyl',
    // Errors
    emailAlreadyRegistered: 'এই ইমেইল আগেই রেজিস্টার করা হয়েছে। অনুগ্রহ করে লগইন করুন।',
    failedToCreateStore: 'স্টোর তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    invalidStep: 'অবৈধ ধাপ'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/bn/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bn",
    ()=>bn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/dashboard.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$landing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/landing.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/chat.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/admin.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$onboarding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/onboarding.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
const bn = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["common"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$dashboard$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["dashboard"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$landing$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["landing"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$chat$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["chat"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$admin$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["admin"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$onboarding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onboarding"]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * i18n Types and Constants
 */ __turbopack_context__.s([
    "DEFAULT_LANGUAGE",
    ()=>DEFAULT_LANGUAGE,
    "LANGUAGES",
    ()=>LANGUAGES,
    "LANGUAGE_STORAGE_KEY",
    ()=>LANGUAGE_STORAGE_KEY
]);
const LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        direction: 'ltr'
    },
    {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        flag: '🇧🇩',
        direction: 'ltr'
    }
];
const DEFAULT_LANGUAGE = 'bn';
const LANGUAGE_STORAGE_KEY = 'preferred-language';
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/utils/i18n/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LANGUAGE_STORAGE_KEY",
    ()=>LANGUAGE_STORAGE_KEY,
    "addLanguageToUrl",
    ()=>addLanguageToUrl,
    "createTranslator",
    ()=>createTranslator,
    "getLanguageConfig",
    ()=>getLanguageConfig,
    "getLanguageFromUrl",
    ()=>getLanguageFromUrl,
    "isValidLanguage",
    ()=>isValidLanguage,
    "t",
    ()=>t,
    "translations",
    ()=>translations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/en/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/bn/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/types.ts [app-client] (ecmascript)");
;
;
;
const translations = {
    en: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$en$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["en"],
    bn: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$bn$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bn"]
};
function t(key, lang = 'en', params) {
    const dict = translations[lang];
    const enDict = translations.en;
    let text = dict[key] || enDict[key] || key;
    if (params) {
        Object.entries(params).forEach(([k, v])=>{
            // Support both {{key}} and {key}
            const regex = new RegExp(`{{?${k}}}?`, 'g');
            text = text.replace(regex, String(v));
        });
    }
    return text;
}
function createTranslator(lang) {
    return (key)=>t(key, lang);
}
function getLanguageConfig(code) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANGUAGES"].find((lang)=>lang.code === code);
}
function isValidLanguage(code) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LANGUAGES"].some((lang)=>lang.code === code);
}
function getLanguageFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const lang = urlObj.searchParams.get('lang');
        if (lang && isValidLanguage(lang)) {
            return lang;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LANGUAGE"];
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_LANGUAGE"];
    }
}
function addLanguageToUrl(url, lang) {
    try {
        const urlObj = new URL(url, 'http://localhost');
        urlObj.searchParams.set('lang', lang);
        return urlObj.pathname + urlObj.search;
    } catch  {
        return `${url}${url.includes('?') ? '&' : '?'}lang=${lang}`;
    }
}
const LANGUAGE_STORAGE_KEY = 'preferred-language';
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/app/contexts/LanguageContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useFormatPrice",
    ()=>useFormatPrice,
    "useTranslation",
    ()=>useTranslation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/landing/utils/i18n/index.ts [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    t: (key)=>key,
    lang: 'en',
    setLang: ()=>{}
});
function LanguageProvider({ children }) {
    _s();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('en');
    const t = (key, options)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$utils$2f$i18n$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["t"])(key, lang, options);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            t,
            lang,
            setLang
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/landing/app/contexts/LanguageContext.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(LanguageProvider, "3SAFWOAEFwr4n9Xzl+qKKYmrg6c=");
_c = LanguageProvider;
function useTranslation() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
}
_s1(useTranslation, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function useFormatPrice() {
    _s2();
    const { lang } = useTranslation();
    return (amount, currency = 'BDT')=>{
        if (lang === 'bn') {
            return `৳${amount.toLocaleString('bn-BD')}`;
        }
        return `${currency} ${amount.toLocaleString('en-US')}`;
    };
}
_s2(useFormatPrice, "3R8/lk6/qrGMX5O9QubM3R5B5OU=", false, function() {
    return [
        useTranslation
    ];
});
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/components/LazySection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ClientOnly",
    ()=>ClientOnly,
    "LazySection",
    ()=>LazySection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * LazySection - Intersection Observer based lazy loading wrapper
 *
 * Only renders children when the section enters viewport.
 * This dramatically reduces initial JS parsing and execution time.
 *
 * SSR-SAFE: Always renders fallback on server and during initial hydration,
 * then switches to real content after mount + intersection.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
/**
 * Default skeleton that matches common section styling
 */ function DefaultSkeleton({ minHeight }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full animate-pulse bg-gradient-to-b from-transparent to-gray-900/5",
        style: {
            minHeight: minHeight || '400px'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-4 py-16",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8"
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/LazySection.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                    children: [
                        1,
                        2,
                        3
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-48 bg-gray-800/10 rounded-xl"
                        }, i, false, {
                            fileName: "[project]/apps/landing/components/LazySection.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/LazySection.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/landing/components/LazySection.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/LazySection.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_c = DefaultSkeleton;
function LazySection({ children, fallback, rootMargin = '200px', minHeight = '400px', className = '' }) {
    _s();
    // Start with false to match SSR output (skeleton)
    const [shouldRender, setShouldRender] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasMounted, setHasMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LazySection.useEffect": ()=>{
            setHasMounted(true);
            // Server-side rendering check
            if (("TURBOPACK compile-time value", "object") === 'undefined' || !ref.current) return;
            // Check if IntersectionObserver is supported
            if (!('IntersectionObserver' in window)) {
                // Fallback: just render immediately
                setShouldRender(true);
                return;
            }
            const observer = new IntersectionObserver({
                "LazySection.useEffect": ([entry])=>{
                    if (entry.isIntersecting) {
                        setShouldRender(true);
                        // Once visible, stop observing
                        observer.disconnect();
                    }
                }
            }["LazySection.useEffect"], {
                rootMargin,
                threshold: 0.01
            });
            observer.observe(ref.current);
            return ({
                "LazySection.useEffect": ()=>observer.disconnect()
            })["LazySection.useEffect"];
        }
    }["LazySection.useEffect"], [
        rootMargin
    ]);
    // Always show fallback until we've mounted AND section is in view
    const showChildren = hasMounted && shouldRender;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: className,
        style: {
            minHeight: showChildren ? 'auto' : minHeight
        },
        children: showChildren ? children : fallback || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DefaultSkeleton, {
            minHeight: minHeight
        }, void 0, false, {
            fileName: "[project]/apps/landing/components/LazySection.tsx",
            lineNumber: 96,
            columnNumber: 46
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/LazySection.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(LazySection, "08x/jiYU/u/2VMbdu26wradKEGs=");
_c1 = LazySection;
function ClientOnly({ children, fallback = null }) {
    _s1();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClientOnly.useEffect": ()=>{
            setMounted(true);
        }
    }["ClientOnly.useEffect"], []);
    return mounted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: fallback
    }, void 0, false);
}
_s1(ClientOnly, "LrrVfNW3d1raFE0BNzCTILYmIfo=");
_c2 = ClientOnly;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "DefaultSkeleton");
__turbopack_context__.k.register(_c1, "LazySection");
__turbopack_context__.k.register(_c2, "ClientOnly");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/components/animations/MagneticButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnimatedButton",
    ()=>AnimatedButton,
    "MagneticButton",
    ()=>MagneticButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Magnetic Button Component
 * Button that follows cursor when hovering nearby for premium interaction
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function MagneticButton({ children, className = '', magnetStrength = 0.3 }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const springConfig = {
        stiffness: 300,
        damping: 20
    };
    const xSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(x, springConfig);
    const ySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(y, springConfig);
    const handleMouseMove = (e)=>{
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = (e.clientX - centerX) * magnetStrength;
        const distanceY = (e.clientY - centerY) * magnetStrength;
        x.set(distanceX);
        y.set(distanceY);
    };
    const handleMouseLeave = ()=>{
        x.set(0);
        y.set(0);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: ref,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: {
            x: xSpring,
            y: ySpring
        },
        className: `inline-block ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/animations/MagneticButton.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(MagneticButton, "VRPEGlJRbYgu96FZj2dLRetTPzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c = MagneticButton;
function AnimatedButton({ children, className = '', onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MagneticButton, {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
            onClick: onClick,
            className: className,
            whileHover: {
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)'
            },
            whileTap: {
                scale: 0.98
            },
            transition: {
                duration: 0.2
            },
            children: children
        }, void 0, false, {
            fileName: "[project]/apps/landing/components/animations/MagneticButton.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/animations/MagneticButton.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_c1 = AnimatedButton;
var _c, _c1;
__turbopack_context__.k.register(_c, "MagneticButton");
__turbopack_context__.k.register(_c1, "AnimatedButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/components/MarketingHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarketingHeader",
    ()=>MarketingHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$animations$2f$MagneticButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/components/animations/MagneticButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/app/contexts/LanguageContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function MarketingHeader({ showBackToHome = false }) {
    _s();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { lang, setLang, t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const isActive = (path)=>pathname === path;
    const toggleLang = ()=>setLang(lang === 'en' ? 'bn' : 'en');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-0 shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "flex items-center gap-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: "/brand/logo-white.webp",
                                alt: "Ozzyl",
                                className: "h-12 w-auto",
                                width: "123",
                                height: "48"
                            }, void 0, false, {
                                fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                lineNumber: 24,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                !showBackToHome ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        !isActive('/pricing') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/pricing",
                                            className: `hidden md:block font-medium text-sm px-4 py-2 transition ${isActive('/pricing') ? 'text-[#00875F]' : 'text-white/60 hover:text-[#00875F]'}`,
                                            children: t('navBilling')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 37,
                                            columnNumber: 19
                                        }, this),
                                        !isActive('/tutorials') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/tutorials",
                                            className: `hidden md:block font-medium text-sm px-4 py-2 transition ${isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/60 hover:text-[#00875F]'}`,
                                            children: t('navTutorials')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 47,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: toggleLang,
                                            className: "flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm font-medium transition border border-white/10",
                                            title: lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন',
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                                    lineNumber: 64,
                                                    columnNumber: 19
                                                }, this),
                                                lang === 'en' ? 'EN' : 'BN'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 59,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/login",
                                            className: "hidden sm:block text-white/60 hover:text-white font-medium text-sm px-5 py-2 transition",
                                            children: t('login')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 67,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$animations$2f$MagneticButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MagneticButton"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/register",
                                                className: "hidden sm:inline-block px-6 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25",
                                                children: t('register')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                                lineNumber: 74,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 73,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true) : // Back to Home mode (for specific pages if needed, though usually standard nav is better)
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/",
                                            className: "hidden sm:flex items-center gap-2 text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 19
                                                }, this),
                                                t('backToHome')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 85,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: toggleLang,
                                            className: "flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] hover:bg-[#EBEDF0] rounded-xl text-sm font-medium transition text-[#475569] border border-[#EBEDF0]",
                                            title: lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন',
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 19
                                                }, this),
                                                lang === 'en' ? 'EN' : 'BN'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 93,
                                            columnNumber: 17
                                        }, this),
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$animations$2f$MagneticButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MagneticButton"], {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/register",
                                                className: "px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25",
                                                children: t('register')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                                lineNumber: 102,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 101,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsMobileMenuOpen(!isMobileMenuOpen),
                                    className: "sm:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition",
                                    "aria-label": "Toggle menu",
                                    children: isMobileMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-5 h-5 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                        className: "w-5 h-5 text-white"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                        lineNumber: 121,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                            lineNumber: 33,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                    lineNumber: 22,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                    children: isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            height: 0
                        },
                        animate: {
                            opacity: 1,
                            height: 'auto'
                        },
                        exit: {
                            opacity: 0,
                            height: 0
                        },
                        className: "sm:hidden mt-4 pt-4 border-t border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-2",
                            children: [
                                !showBackToHome ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/pricing",
                                            className: `font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${isActive('/pricing') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'}`,
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: t('navBilling')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 139,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/tutorials",
                                            className: `font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'}`,
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: t('navTutorials')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 150,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/about",
                                            className: `font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${isActive('/about') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'}`,
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: t('sidebarSettings')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 161,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/contact",
                                            className: `font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${isActive('/contact') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'}`,
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: t('contactSupport')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 170,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/auth/login",
                                            className: "text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition",
                                            onClick: ()=>setIsMobileMenuOpen(false),
                                            children: t('login')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                            lineNumber: 181,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition",
                                    onClick: ()=>setIsMobileMenuOpen(false),
                                    children: t('backToHome')
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                    lineNumber: 190,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/auth/register",
                                    className: "px-4 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-semibold rounded-xl text-sm text-center shadow-lg shadow-[#006A4E]/25",
                                    onClick: ()=>setIsMobileMenuOpen(false),
                                    children: t('register')
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                                    lineNumber: 199,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                            lineNumber: 136,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                        lineNumber: 130,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
                    lineNumber: 128,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/MarketingHeader.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_s(MarketingHeader, "EsCybrDYJ3yKk93aFCS527U7M1g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c = MarketingHeader;
var _c;
__turbopack_context__.k.register(_c, "MarketingHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/hooks/useIsMobile.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useIsMobile",
    ()=>useIsMobile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useIsMobile(breakpoint = 768) {
    _s();
    // Always start with false for SSR consistency
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasMounted, setHasMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsMobile.useEffect": ()=>{
            // Mark as mounted
            setHasMounted(true);
            // Check initial window size
            const checkMobile = {
                "useIsMobile.useEffect.checkMobile": ()=>{
                    setIsMobile(window.innerWidth < breakpoint);
                }
            }["useIsMobile.useEffect.checkMobile"];
            // Initial check after mount
            checkMobile();
            // Add event listener
            window.addEventListener('resize', checkMobile);
            // Cleanup
            return ({
                "useIsMobile.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["useIsMobile.useEffect"];
        }
    }["useIsMobile.useEffect"], [
        breakpoint
    ]);
    // Return false until mounted to ensure SSR/hydration consistency
    return hasMounted ? isMobile : false;
}
_s(useIsMobile, "IMzRADpC5CRC8DTFFWz4tAyFm2c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/components/AwardWinningHero.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AwardWinningHero",
    ()=>AwardWinningHero,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mouse-pointer-2.js [app-client] (ecmascript) <export default as MousePointer2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/type.js [app-client] (ecmascript) <export default as Type>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rocket.js [app-client] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$hooks$2f$useIsMobile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/hooks/useIsMobile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/app/contexts/LanguageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/components/LazySection.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
/**
 * Award-Winning Hero Section - Bangladesh Edition
 *
 * Design: Bangladesh's First Bangla-Native E-commerce Builder
 * Theme: Dark mode with Bangladesh-inspired accent colors
 *        Deep Green (#006A4E) + Golden (#F9A825)
 *
 * Features:
 * - Split screen layout (messaging + builder demo)
 * - Gradient mesh background (green to deep blue)
 * - Floating Bengali typography elements
 * - Staggered headline animation (word by word)
 * - Magnetic hover effects on CTAs
 * - Live signup counter
 * - Builder interface mockup with animations
 */ 'use client';
;
;
;
;
;
;
;
// ============================================================================
// DESIGN TOKENS - Theme-Aware Bangladesh Theme
// ============================================================================
const DARK_COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    primaryDark: '#004D38',
    accent: '#F9A825',
    accentLight: '#FFB74D',
    background: '#0A0F0D',
    backgroundAlt: '#0D1512',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardShadow: 'none'
};
const LIGHT_COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    primaryDark: '#005740',
    accent: '#D97706',
    accentLight: '#F59E0B',
    background: '#FAFBFC',
    backgroundAlt: '#F4F5F7',
    text: '#0F172A',
    textMuted: '#475569',
    textSubtle: '#94A3B8',
    cardBg: '#FFFFFF',
    cardBorder: '#EBEDF0',
    cardShadow: '0 4px 6px rgba(0,0,0,0.04), 0 10px 25px rgba(0,0,0,0.06)'
};
const getColors = (theme)=>theme === 'light' ? LIGHT_COLORS : DARK_COLORS;
// Keep COLORS for backward compatibility in child components
const COLORS = DARK_COLORS;
// ============================================================================
// GRAIN TEXTURE OVERLAY
// ============================================================================
const GrainOverlay = ({ isLight = false })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `pointer-events-none fixed inset-0 z-50 ${isLight ? 'opacity-[0.02]' : 'opacity-[0.03]'}`,
        style: {
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 89,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = GrainOverlay;
// ============================================================================
// FLOATING BENGALI TYPOGRAPHY ELEMENTS
// ============================================================================
const FloatingBengaliText = ({ isMobile = false })=>{
    const bengaliChars = [
        'অ',
        'আ',
        'ই',
        'ক',
        'খ',
        'গ',
        'ব',
        'ম',
        'স',
        'হ',
        'ড',
        'ন'
    ];
    if (isMobile) return null; // Disable floating text on mobile for performance
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 overflow-hidden pointer-events-none",
        children: bengaliChars.map((char, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                className: "absolute text-6xl md:text-8xl font-bold select-none",
                style: {
                    left: `${10 + i % 4 * 25}%`,
                    top: `${15 + Math.floor(i / 4) * 30}%`,
                    color: 'rgba(0, 106, 78, 0.07)',
                    fontFamily: "'Noto Sans Bengali', sans-serif"
                },
                initial: {
                    opacity: 0,
                    y: 20
                },
                animate: {
                    opacity: [
                        0.03,
                        0.08,
                        0.03
                    ],
                    y: [
                        0,
                        -10,
                        0
                    ],
                    rotate: [
                        -2,
                        2,
                        -2
                    ]
                },
                transition: {
                    duration: 8 + i * 0.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                },
                children: char
            }, i, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c1 = FloatingBengaliText;
// ============================================================================
// GRADIENT MESH BACKGROUND (Dark Theme - Liquid Glass)
// ============================================================================
const GradientMeshBackground = ({ isMobile = false })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] rounded-full mix-blend-screen opacity-40 blur-[100px]",
                style: {
                    background: `radial-gradient(circle, ${COLORS.primary} 0%, transparent 70%)`
                },
                animate: isMobile ? {} : {
                    scale: [
                        1,
                        1.2,
                        0.9,
                        1
                    ],
                    x: [
                        0,
                        100,
                        -50,
                        0
                    ],
                    y: [
                        0,
                        50,
                        100,
                        0
                    ]
                },
                transition: {
                    duration: 25,
                    repeat: Infinity,
                    ease: 'linear'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 143,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full mix-blend-screen opacity-30 blur-[120px]",
                style: {
                    background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)'
                },
                animate: isMobile ? {} : {
                    scale: [
                        1.1,
                        0.9,
                        1.2,
                        1.1
                    ],
                    x: [
                        0,
                        -70,
                        30,
                        0
                    ],
                    y: [
                        0,
                        -100,
                        50,
                        0
                    ]
                },
                transition: {
                    duration: 30,
                    repeat: Infinity,
                    ease: 'linear'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 161,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute bottom-0 left-[20%] w-[600px] h-[600px] rounded-full mix-blend-screen opacity-20 blur-[90px]",
                style: {
                    background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`
                },
                animate: isMobile ? {} : {
                    scale: [
                        0.9,
                        1.1,
                        0.9
                    ],
                    opacity: [
                        0.2,
                        0.4,
                        0.2
                    ]
                },
                transition: {
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 179,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 196,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0",
                style: {
                    background: `radial-gradient(circle at center, transparent 0%, #0A0F0D 90%)`
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 199,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 141,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c2 = GradientMeshBackground;
// ============================================================================
// LIGHT GRADIENT BACKGROUND (Light Theme)
// ============================================================================
const LightGradientBackground = ({ isMobile = false })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 overflow-hidden",
        style: {
            backgroundColor: LIGHT_COLORS.background
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute -top-1/4 left-1/4 w-[900px] h-[900px] rounded-full",
                style: {
                    background: 'radial-gradient(ellipse at center, rgba(0,106,78,0.06) 0%, transparent 60%)'
                },
                animate: isMobile ? {} : {
                    scale: [
                        1,
                        1.1,
                        1
                    ],
                    x: [
                        0,
                        30,
                        0
                    ]
                },
                transition: {
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 217,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full",
                style: {
                    background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)'
                },
                animate: isMobile ? {} : {
                    scale: [
                        1.05,
                        1,
                        1.05
                    ],
                    opacity: [
                        0.4,
                        0.6,
                        0.4
                    ]
                },
                transition: {
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 234,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full",
                style: {
                    background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 60%)'
                },
                animate: isMobile ? {} : {
                    scale: [
                        1,
                        1.15,
                        1
                    ],
                    y: [
                        0,
                        -20,
                        0
                    ]
                },
                transition: {
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 251,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-[0.03]",
                style: {
                    backgroundImage: 'radial-gradient(circle, rgba(0,106,78,0.4) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 268,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1/4 right-1/4 w-[500px] h-[400px] rounded-full",
                style: {
                    background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 277,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 212,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = LightGradientBackground;
const Magnetic = ({ children, className = '' })=>{
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const springConfig = {
        stiffness: 150,
        damping: 15
    };
    const xSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(x, springConfig);
    const ySpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(y, springConfig);
    const handleMouseMove = (e)=>{
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.35);
        y.set((e.clientY - centerY) * 0.35);
    };
    const handleMouseLeave = ()=>{
        x.set(0);
        y.set(0);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: ref,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: {
            x: xSpring,
            y: ySpring
        },
        className: className,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 319,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Magnetic, "VRPEGlJRbYgu96FZj2dLRetTPzs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c4 = Magnetic;
// ============================================================================
// STAGGERED TEXT REVEAL
// ============================================================================
const StaggeredText = ({ text, className = '', delay = 0 })=>{
    const words = text.split(' ');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: className,
        children: words.map((word, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                className: "inline-block",
                initial: {
                    opacity: 0,
                    y: 30,
                    rotateX: -40
                },
                animate: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0
                },
                transition: {
                    duration: 0.6,
                    delay: delay + i * 0.12,
                    ease: [
                        0.25,
                        0.46,
                        0.45,
                        0.94
                    ]
                },
                children: [
                    word,
                    i < words.length - 1 ? '\u00A0' : ''
                ]
            }, i, true, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 348,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 346,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c5 = StaggeredText;
// ============================================================================
// LIVE SIGNUP COUNTER
// ============================================================================
const LiveSignupCounter = ({ count = 0 })=>{
    _s1();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        transition: {
            delay: 1.5
        },
        className: "flex items-center gap-2 text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "w-2 h-2 rounded-full bg-green-400",
                animate: {
                    scale: [
                        1,
                        1.2,
                        1
                    ]
                },
                transition: {
                    duration: 1.5,
                    repeat: Infinity
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 379,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-white/50",
                children: [
                    t('heroSignupPrefix'),
                    ' ',
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white font-semibold",
                        children: count.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                        lineNumber: 386,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    ' ',
                    t('heroSignupSuffix')
                ]
            }, void 0, true, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 384,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 373,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s1(LiveSignupCounter, "zlIdU9EjM2llFt74AbE2KsUJXyM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c6 = LiveSignupCounter;
// ============================================================================
// BUILDER MOCKUP - PREMIUM GLASS & 3D
// ============================================================================
const BuilderMockup = ()=>{
    _s2();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isPublished, setIsPublished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mouseX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const mouseY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    // Cycle through builder demo steps
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BuilderMockup.useEffect": ()=>{
            // ... (existing timer logic)
            const timer = setTimeout({
                "BuilderMockup.useEffect.timer": ()=>{
                    if (step < 4) {
                        setStep(step + 1);
                    } else {
                        setIsPublished(true);
                        setTimeout({
                            "BuilderMockup.useEffect.timer": ()=>{
                                setStep(0);
                                setIsPublished(false);
                            }
                        }["BuilderMockup.useEffect.timer"], 3000);
                    }
                }
            }["BuilderMockup.useEffect.timer"], step === 0 ? 1500 : 2000);
            return ({
                "BuilderMockup.useEffect": ()=>clearTimeout(timer)
            })["BuilderMockup.useEffect"];
        }
    }["BuilderMockup.useEffect"], [
        step
    ]);
    const handleMouseMove = (e)=>{
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x * 10); // Rotate max 5 deg
        mouseY.set(y * 10);
    };
    const handleMouseLeave = ()=>{
        mouseX.set(0);
        mouseY.set(0);
    };
    const rotateX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(mouseY, {
        stiffness: 100,
        damping: 20
    });
    const rotateY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(mouseX, {
        stiffness: 100,
        damping: 20
    });
    const templates = [
        {
            name: 'মডার্ন স্টোর',
            color: '#006A4E',
            active: step >= 1
        },
        {
            name: 'প্রোডাক্ট শোকেস',
            color: '#3B82F6',
            active: false
        },
        {
            name: 'ফ্ল্যাশ সেল',
            color: '#EF4444',
            active: false
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: containerRef,
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        initial: {
            opacity: 0,
            scale: 0.9,
            rotateX: 10
        },
        animate: {
            opacity: 1,
            scale: 1,
            rotateX: 0
        },
        transition: {
            duration: 1,
            delay: 0.4,
            ease: 'circOut'
        },
        className: "relative perspective-[2000px] group",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                style: {
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformStyle: 'preserve-3d'
                },
                className: "relative transition-shadow duration-500",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[24px] shadow-2xl overflow-hidden ring-1 ring-white/5 group-hover:ring-white/10 transition-all duration-500",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20"
                        }, void 0, false, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 465,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 470,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 471,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 472,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 469,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 px-4 py-1.5 bg-black/40 rounded-full text-[10px] text-white/40 border border-white/5 shadow-inner min-w-[200px] justify-center font-mono",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                            className: "w-3 h-3 opacity-50"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 475,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "store.bikrimart.com"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 476,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 474,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16"
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 478,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 468,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 min-h-[420px] bg-gradient-to-b from-transparent to-black/40 relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    mode: "wait",
                                    children: [
                                        step === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                scale: 0.95
                                            },
                                            animate: {
                                                opacity: 1,
                                                scale: 1
                                            },
                                            exit: {
                                                opacity: 0,
                                                scale: 1.05
                                            },
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-1.5 bg-amber-500/10 rounded-lg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                className: "w-4 h-4 text-amber-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                lineNumber: 495,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 494,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-white/80 font-medium",
                                                            children: t('heroDemoTemplate')
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 497,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 493,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-3 gap-4",
                                                    children: templates.map((tmpl, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            className: `relative p-3 rounded-2xl border transition-all duration-300 ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'} cursor-pointer group/card`,
                                                            whileHover: {
                                                                y: -5
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-full h-32 rounded-xl mb-3 overflow-hidden relative",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 z-10"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                            lineNumber: 507,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                background: tmpl.color
                                                                            },
                                                                            className: "w-full h-full opacity-30 group-hover/card:opacity-50 transition-opacity"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                            lineNumber: 508,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 506,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-white/70 font-medium text-center",
                                                                    children: tmpl.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 513,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                i === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                    initial: {
                                                                        scale: 0
                                                                    },
                                                                    animate: {
                                                                        scale: 1
                                                                    },
                                                                    className: "absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0A0F0D] shadow-lg",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                        className: "w-3 h-3 text-white"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                        lineNumber: 520,
                                                                        columnNumber: 29
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 515,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 501,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    className: "absolute z-50 pointer-events-none",
                                                    initial: {
                                                        left: '80%',
                                                        top: '80%',
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        left: '20%',
                                                        top: '40%',
                                                        opacity: 1
                                                    },
                                                    transition: {
                                                        delay: 0.5,
                                                        duration: 1,
                                                        ease: 'circOut'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                                        className: "w-6 h-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] fill-black/20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 534,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 528,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, "templates", true, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 486,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        step >= 1 && step < 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: 10
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    className: "rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-[#050505]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-6 transition-all duration-700",
                                                            style: {
                                                                background: step >= 2 ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)` : '#111'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h3, {
                                                                    className: "text-xl font-bold text-white mb-1",
                                                                    initial: {
                                                                        opacity: 0,
                                                                        x: -10
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        x: 0
                                                                    },
                                                                    children: step >= 3 ? t('heroDemoStoreName') : t('heroDemoStorePlaceholder')
                                                                }, step, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 557,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-white/60",
                                                                    children: step >= 3 ? t('heroDemoStoreSlogan') : t('heroDemoSloganPlaceholder')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 565,
                                                                    columnNumber: 23
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 548,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-4 bg-[#0A0A0A] grid grid-cols-3 gap-3",
                                                            children: [
                                                                1,
                                                                2,
                                                                3
                                                            ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                                    className: "aspect-[4/5] rounded-lg bg-white/[0.03] border border-white/5 relative overflow-hidden group/product",
                                                                    initial: {
                                                                        opacity: 0
                                                                    },
                                                                    animate: {
                                                                        opacity: step >= 3 ? 1 : 0.3,
                                                                        y: step >= 3 ? 0 : 10
                                                                    },
                                                                    transition: {
                                                                        delay: i * 0.1
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/product:opacity-100 transition-opacity"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                            lineNumber: 580,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute bottom-2 left-2 w-12 h-1.5 bg-white/20 rounded-full"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                            lineNumber: 581,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                            lineNumber: 582,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, i, true, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 573,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)))
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 571,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 542,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2",
                                                    children: [
                                                        'Themes',
                                                        'Content',
                                                        'Layout'
                                                    ].map((tool, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            initial: {
                                                                x: 20,
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                x: 0,
                                                                opacity: 1
                                                            },
                                                            transition: {
                                                                delay: 0.2 + idx * 0.1
                                                            },
                                                            className: `p-2 rounded-lg backdrop-blur-md border border-white/10 shadow-lg ${step === 2 && idx === 0 || step === 3 && idx === 1 ? 'bg-emerald-500 text-white' : 'bg-black/40 text-white/40'}`,
                                                            children: [
                                                                idx === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 602,
                                                                    columnNumber: 39
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                idx === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__["Type"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 603,
                                                                    columnNumber: 39
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                idx === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                    lineNumber: 604,
                                                                    columnNumber: 39
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, tool, true, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 591,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0)))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 589,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                step >= 2 && step < 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                    className: "absolute z-50 pointer-events-none",
                                                    initial: {
                                                        left: '90%',
                                                        top: '40%'
                                                    },
                                                    animate: {
                                                        left: step === 3 ? '90%' : '90%',
                                                        top: step === 3 ? '55%' : '45%'
                                                    },
                                                    transition: {
                                                        duration: 0.8,
                                                        ease: 'easeInOut'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mouse$2d$pointer$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MousePointer2$3e$__["MousePointer2"], {
                                                        className: "w-6 h-6 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] fill-black/20"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 620,
                                                        columnNumber: 23
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 611,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, "editing", true, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 540,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        step === 4 && !isPublished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0
                                            },
                                            animate: {
                                                opacity: 1
                                            },
                                            exit: {
                                                opacity: 0
                                            },
                                            className: "flex flex-col items-center justify-center h-[340px] gap-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            className: "w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500",
                                                            animate: {
                                                                rotate: 360
                                                            },
                                                            transition: {
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: 'linear'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 635,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "absolute inset-0 flex items-center justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"], {
                                                                className: "w-8 h-8 text-emerald-500 animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                                lineNumber: 641,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 640,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 634,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white/60 text-sm font-mono tracking-widest uppercase",
                                                    children: [
                                                        t('heroDemoPublishing'),
                                                        "..."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 644,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, "publishing", true, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 627,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 484,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    children: isPublished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            scale: 0.9
                                        },
                                        animate: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        exit: {
                                            opacity: 0,
                                            scale: 0.9
                                        },
                                        className: "absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 rounded-[24px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    scale: 0,
                                                    rotate: -180
                                                },
                                                animate: {
                                                    scale: 1,
                                                    rotate: 0
                                                },
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 200,
                                                    damping: 15
                                                },
                                                className: "w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                    className: "w-12 h-12 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                    lineNumber: 666,
                                                    columnNumber: 21
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 660,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].h3, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 20
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: 0.2
                                                },
                                                className: "text-3xl font-bold text-white mb-2",
                                                children: t('heroDemoPublished')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 668,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                                initial: {
                                                    opacity: 0
                                                },
                                                animate: {
                                                    opacity: 1
                                                },
                                                transition: {
                                                    delay: 0.4
                                                },
                                                className: "text-white/60",
                                                children: [
                                                    t('heroDemoLive'),
                                                    " 🚀"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 676,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 654,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 652,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 482,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                    lineNumber: 463,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 458,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    opacity: 0,
                    x: 50
                },
                animate: {
                    opacity: 1,
                    x: 0
                },
                transition: {
                    delay: 1.5,
                    type: 'spring'
                },
                className: "absolute -right-8 top-16 z-30 hidden md:block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    animate: {
                        y: [
                            0,
                            -10,
                            0
                        ]
                    },
                    transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    },
                    className: "backdrop-blur-xl bg-white/[0.05] border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                className: "w-5 h-5 text-white"
                            }, void 0, false, {
                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                lineNumber: 704,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 703,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white text-sm font-bold",
                                    children: t('heroDemoReady')
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 707,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-white/50 text-xs",
                                    children: t('heroDemoNoCoding')
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 708,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 706,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                    lineNumber: 698,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 692,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 448,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s2(BuilderMockup, "nMq9gJPjf2Syz1dboTZqYMcjIco=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c7 = BuilderMockup;
function AwardWinningHero({ theme = 'dark', totalUsers = 0 }) {
    _s3();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    const colors = getColors(theme);
    const isLight = theme === 'light';
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$hooks$2f$useIsMobile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsMobile"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative min-h-screen overflow-hidden flex items-center",
        style: {
            backgroundColor: colors.background
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GrainOverlay, {
                isLight: isLight
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 732,
                columnNumber: 7
            }, this),
            isLight ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LightGradientBackground, {
                isMobile: isMobile
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 734,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GradientMeshBackground, {
                isMobile: isMobile
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 736,
                columnNumber: 9
            }, this),
            !isLight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FloatingBengaliText, {
                isMobile: isMobile
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 738,
                columnNumber: 20
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `absolute inset-0 ${isLight ? 'opacity-[0.015]' : 'opacity-[0.02]'}`,
                style: {
                    backgroundImage: isLight ? `linear-gradient(${colors.text}10 1px, transparent 1px),
               linear-gradient(90deg, ${colors.text}10 1px, transparent 1px)` : `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px'
                }
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 741,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 w-full max-w-7xl mx-auto px-3 md:px-4 py-24 md:py-32",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid lg:grid-cols-2 gap-8 lg:gap-12 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            duration: 0.6
                                        },
                                        className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8",
                                        style: {
                                            backgroundColor: isLight ? 'rgba(0,106,78,0.08)' : `${colors.primary}10`,
                                            borderColor: isLight ? 'rgba(0,106,78,0.15)' : `${colors.primary}30`,
                                            boxShadow: isLight ? '0 2px 8px rgba(0,106,78,0.1)' : 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                animate: {
                                                    rotate: [
                                                        0,
                                                        10,
                                                        -10,
                                                        0
                                                    ]
                                                },
                                                transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    repeatDelay: 3
                                                },
                                                children: "🇧🇩"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 769,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: colors.textMuted
                                                },
                                                className: "text-sm",
                                                children: t('heroBadge')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 775,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 758,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.4] tracking-tight mb-6",
                                        style: {
                                            fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StaggeredText, {
                                                text: t('heroTitle1'),
                                                className: `block ${isLight ? 'text-[#0F172A]' : 'text-white'}`
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 785,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StaggeredText, {
                                                text: t('heroTitle2'),
                                                className: "block bg-clip-text text-transparent",
                                                delay: 0.4
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 789,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 781,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                                        children: `
              h1 .block:nth-child(2) {
                background-image: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${isLight ? '#8B5CF6' : colors.accent} 100%);
                background-size: 200% 100%;
                animation: gradientShift 4s ease infinite;
              }
              @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
            `
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 797,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].p, {
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            duration: 0.6,
                                            delay: 0.6
                                        },
                                        className: "text-lg md:text-xl mb-10 max-w-xl leading-relaxed",
                                        style: {
                                            color: colors.textMuted,
                                            fontFamily: "'Noto Sans Bengali', sans-serif"
                                        },
                                        children: [
                                            t('heroSubtitle1'),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 818,
                                                columnNumber: 15
                                            }, this),
                                            t('heroSubtitle2'),
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: colors.text,
                                                    fontWeight: 600
                                                },
                                                children: t('heroSubtitle3')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 820,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 810,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            duration: 0.6,
                                            delay: 0.8
                                        },
                                        className: "flex flex-wrap gap-4 mb-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Magnetic, {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/register",
                                                className: "group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden flex items-center gap-2 transition-all hover:scale-[1.02] hover:-translate-y-0.5",
                                                style: {
                                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                                                    boxShadow: isLight ? '0 4px 14px rgba(0,106,78,0.3), 0 1px 3px rgba(0,0,0,0.1)' : `0 0 30px ${colors.primary}60, 0 0 60px ${colors.primary}30`,
                                                    fontFamily: "'Noto Sans Bengali', sans-serif"
                                                },
                                                children: [
                                                    !isLight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        className: "absolute inset-0 rounded-xl",
                                                        style: {
                                                            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.accent} 100%)`
                                                        },
                                                        animate: {
                                                            opacity: [
                                                                0,
                                                                0.3,
                                                                0
                                                            ]
                                                        },
                                                        transition: {
                                                            duration: 2,
                                                            repeat: Infinity
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 845,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "relative z-10",
                                                        children: t('heroCtaPrimary')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 854,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                                        className: "relative z-10",
                                                        animate: {
                                                            x: [
                                                                0,
                                                                4,
                                                                0
                                                            ]
                                                        },
                                                        transition: {
                                                            duration: 1.5,
                                                            repeat: Infinity
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                            lineNumber: 860,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 855,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 832,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 831,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 824,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 1
                                        },
                                        className: "flex flex-wrap items-center gap-4 text-sm mb-8",
                                        style: {
                                            color: colors.textSubtle
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-4 h-4",
                                                        style: {
                                                            color: colors.primary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 875,
                                                        columnNumber: 17
                                                    }, this),
                                                    t('heroTrust1')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 874,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-4 h-4",
                                                        style: {
                                                            color: colors.primary
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                        lineNumber: 879,
                                                        columnNumber: 17
                                                    }, this),
                                                    t('heroTrust2')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 878,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 867,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveSignupCounter, {
                                        count: totalUsers
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 885,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                        initial: {
                                            opacity: 0,
                                            y: 10
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: 1.8
                                        },
                                        className: "mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
                                        style: {
                                            backgroundColor: isLight ? 'rgba(217,119,6,0.08)' : `${colors.accent}10`,
                                            borderColor: isLight ? 'rgba(217,119,6,0.2)' : `${colors.accent}30`,
                                            boxShadow: isLight ? '0 2px 8px rgba(217,119,6,0.1)' : 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                className: "w-4 h-4",
                                                style: {
                                                    color: colors.accent
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 899,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm",
                                                style: {
                                                    color: colors.accent
                                                },
                                                children: t('heroBetaNotice')
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                                lineNumber: 900,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 888,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                lineNumber: 756,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden lg:block",
                                children: isLight ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-2xl p-1 bg-white",
                                    style: {
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClientOnly"], {
                                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-[600px] w-full bg-white/5 animate-pulse rounded-2xl"
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 918,
                                            columnNumber: 21
                                        }, void 0),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BuilderMockup, {}, void 0, false, {
                                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                            lineNumber: 921,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 916,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 910,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClientOnly"], {
                                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-[600px] w-full bg-white/5 animate-pulse rounded-2xl"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 926,
                                        columnNumber: 27
                                    }, void 0),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BuilderMockup, {}, void 0, false, {
                                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                        lineNumber: 928,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                    lineNumber: 925,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                                lineNumber: 907,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                        lineNumber: 754,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 2
                        },
                        className: "text-center mt-20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm",
                            style: {
                                color: colors.textSubtle
                            },
                            children: [
                                t('heroFooter'),
                                " 🇧🇩"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                            lineNumber: 941,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                        lineNumber: 935,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
                lineNumber: 753,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/AwardWinningHero.tsx",
        lineNumber: 727,
        columnNumber: 5
    }, this);
}
_s3(AwardWinningHero, "G9NbXBBUCTEMp/y4UBp/VebmBps=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$hooks$2f$useIsMobile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useIsMobile"]
    ];
});
_c8 = AwardWinningHero;
const __TURBOPACK__default__export__ = AwardWinningHero;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "GrainOverlay");
__turbopack_context__.k.register(_c1, "FloatingBengaliText");
__turbopack_context__.k.register(_c2, "GradientMeshBackground");
__turbopack_context__.k.register(_c3, "LightGradientBackground");
__turbopack_context__.k.register(_c4, "Magnetic");
__turbopack_context__.k.register(_c5, "StaggeredText");
__turbopack_context__.k.register(_c6, "LiveSignupCounter");
__turbopack_context__.k.register(_c7, "BuilderMockup");
__turbopack_context__.k.register(_c8, "AwardWinningHero");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/landing/components/MarketingLanding.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MarketingLanding",
    ()=>MarketingLanding
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * SaaS Marketing Landing Page - PERFORMANCE OPTIMIZED VERSION
 *
 * Performance optimizations:
 * - Lazy loading for below-the-fold sections
 * - React.lazy() for heavy components
 * - Intersection Observer based rendering
 * - Reduced initial JS bundle
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rocket.js [app-client] (ecmascript) <export default as Rocket>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/app/contexts/LanguageContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/components/LazySection.tsx [app-client] (ecmascript)");
// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$MarketingHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/components/MarketingHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$AwardWinningHero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/landing/components/AwardWinningHero.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// ============================================================================
// LAZY - Load when user scrolls (below the fold)
// These components are heavy and not needed immediately
// ============================================================================
// Hero sections (loaded after first hero)
const AIHeroSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/AIHeroSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AIHeroSection
        })));
_c = AIHeroSection;
// Problem/Solution
const ProblemSolutionSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/ProblemSolutionSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.ProblemSolutionSection
        })));
_c1 = ProblemSolutionSection;
// AI Showcase sections (heavy - 31KB+)
const AIShowcaseSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AIShowcaseSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AIShowcaseSection
        })));
_c2 = AIShowcaseSection;
// Builder sections
const DragDropBuilderShowcase = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/DragDropBuilderShowcase.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.DragDropBuilderShowcase
        })));
_c3 = DragDropBuilderShowcase;
const EditorModeComparison = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/EditorModeComparison.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.EditorModeComparison
        })));
_c4 = EditorModeComparison;
const AIMagicSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AIMagicSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AIMagicSection
        })));
_c5 = AIMagicSection;
const AISocialProofSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AISocialProofSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AISocialProofSection
        })));
_c6 = AISocialProofSection;
// Features
const BentoFeaturesSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/BentoFeaturesSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.BentoFeaturesSection
        })));
_c7 = BentoFeaturesSection;
// Infrastructure sections
const InfrastructureSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/InfrastructureSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.InfrastructureSection
        })));
_c8 = InfrastructureSection;
const SpeedComparison = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/SpeedComparison.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.SpeedComparison
        })));
_c9 = SpeedComparison;
const CDNExplainer = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/CDNExplainer.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.CDNExplainer
        })));
_c10 = CDNExplainer;
const SpeedImpact = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/SpeedImpact.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.SpeedImpact
        })));
_c11 = SpeedImpact;
const CloudflareBenefitsCards = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/CloudflareBenefitsCards.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.CloudflareBenefitsCards
        })));
_c12 = CloudflareBenefitsCards;
const TechnicalSpecs = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/TechnicalSpecs.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.TechnicalSpecs
        })));
_c13 = TechnicalSpecs;
const LiveDashboard = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/LiveDashboard.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.LiveDashboard
        })));
_c14 = LiveDashboard;
const InfrastructureCTA = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/InfrastructureCTA.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.InfrastructureCTA
        })));
_c15 = InfrastructureCTA;
// Trust & Comparison
const TrustSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/TrustSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.TrustSection
        })));
_c16 = TrustSection;
const ComparisonSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/ComparisonSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.ComparisonSection
        })));
_c17 = ComparisonSection;
// Interactive demo
const InteractiveStoreDemo = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/InteractiveStoreDemo.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.InteractiveStoreDemo
        })));
_c18 = InteractiveStoreDemo;
// FAQ & CTA
const FAQSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/FAQSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.FAQSection
        })));
_c19 = FAQSection;
const AIPoweredFinalCTA = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AIPoweredFinalCTA.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AIPoweredFinalCTA
        })));
_c20 = AIPoweredFinalCTA;
const FinalCTA = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/FinalCTA.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.FinalCTA
        })));
_c21 = FinalCTA;
// AI Chat Widget - Only load on user interaction (very heavy - 25KB)
const OzzylAIChatWidget = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/OzzylAIChatWidget.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.OzzylAIChatWidget
        })));
_c22 = OzzylAIChatWidget;
// New Award-Winning Sections (Extra Features)
const AllInOneSolution = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AllInOneSolution.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AllInOneSolution
        })));
_c23 = AllInOneSolution;
const PaymentIntegrationSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/PaymentIntegrationSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.PaymentIntegrationSection
        })));
_c24 = PaymentIntegrationSection;
const InventoryOrderManagement = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/InventoryOrderManagement.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.InventoryOrderManagement
        })));
_c25 = InventoryOrderManagement;
const StorefrontUXShowcase = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/StorefrontUXShowcase.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.StorefrontUXShowcase
        })));
_c26 = StorefrontUXShowcase;
const CRMMarketingGrowth = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/CRMMarketingGrowth.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.CRMMarketingGrowth
        })));
_c27 = CRMMarketingGrowth;
const BanglaNativeLocalization = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/BanglaNativeLocalization.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.BanglaNativeLocalization
        })));
_c28 = BanglaNativeLocalization;
const SecuritySpeedInfrastructure = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/SecuritySpeedInfrastructure.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.SecuritySpeedInfrastructure
        })));
_c29 = SecuritySpeedInfrastructure;
const PricingSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/PricingSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.PricingSection
        })));
_c30 = PricingSection;
// New Feature Sections (Project 10 Features)
const MarketingAutomationSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/MarketingAutomationSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.MarketingAutomationSection
        })));
_c31 = MarketingAutomationSection;
const LogisticsOperationsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/LogisticsOperationsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.LogisticsOperationsSection
        })));
_c32 = LogisticsOperationsSection;
const BusinessManagementSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/BusinessManagementSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.BusinessManagementSection
        })));
_c33 = BusinessManagementSection;
const CustomerExperienceSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/CustomerExperienceSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.CustomerExperienceSection
        })));
_c34 = CustomerExperienceSection;
// NEW EXTRA SECTIONS (From Prompts 16, 21, 22)
const AnalyticsInsightsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/AnalyticsInsightsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.AnalyticsInsightsSection
        })));
_c35 = AnalyticsInsightsSection;
const UseCaseScenariosSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/UseCaseScenariosSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.UseCaseScenariosSection
        })));
_c36 = UseCaseScenariosSection;
const FeatureMatrixSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/FeatureMatrixSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.FeatureMatrixSection
        })));
_c37 = FeatureMatrixSection;
// POWER FEATURES (Project 10+ Features from Prompt 23-32)
const CourierIntegrationSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/CourierIntegrationSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.CourierIntegrationSection
        })));
_c38 = CourierIntegrationSection;
const WhatsAppSMSAutomationSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/WhatsAppSMSAutomationSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.WhatsAppSMSAutomationSection
        })));
_c39 = WhatsAppSMSAutomationSection;
const EmailMarketingSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/EmailMarketingSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.EmailMarketingSection
        })));
_c40 = EmailMarketingSection;
const TeamManagementSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/TeamManagementSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.TeamManagementSection
        })));
_c41 = TeamManagementSection;
const ActivityLogsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/ActivityLogsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.ActivityLogsSection
        })));
_c42 = ActivityLogsSection;
const ProductReviewsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/ProductReviewsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.ProductReviewsSection
        })));
_c43 = ProductReviewsSection;
const ReturnsRefundsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/ReturnsRefundsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.ReturnsRefundsSection
        })));
_c44 = ReturnsRefundsSection;
const MessengerIntegrationSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/MessengerIntegrationSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.MessengerIntegrationSection
        })));
_c45 = MessengerIntegrationSection;
const TaxReportsSection = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/TaxReportsSection.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.TaxReportsSection
        })));
_c46 = TaxReportsSection;
const UnifiedCommunicationHub = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lazy"])(()=>__turbopack_context__.A("[project]/apps/landing/components/landing/UnifiedCommunicationHub.tsx [app-client] (ecmascript, async loader)").then((m)=>({
            default: m.UnifiedCommunicationHub
        })));
_c47 = UnifiedCommunicationHub;
// ============================================================================
// Simple Section Skeleton
// ============================================================================
function SectionSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full py-16 animate-pulse",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8"
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 257,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-3 gap-6",
                    children: [
                        1,
                        2,
                        3
                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-48 bg-gray-800/10 rounded-xl"
                        }, i, false, {
                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                            lineNumber: 260,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 258,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
            lineNumber: 256,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
        lineNumber: 255,
        columnNumber: 5
    }, this);
}
_c48 = SectionSkeleton;
function MarketingLanding() {
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"])();
    // Mock marketing stats for static landing page
    const marketingStats = {
        totalUsers: 15420,
        totalStores: 850,
        totalRevenue: 1250000,
        uptime: 99.99
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen overflow-hidden bg-[#0A0A0F]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$MarketingHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MarketingHeader"], {}, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 287,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$AwardWinningHero$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AwardWinningHero"], {
                theme: "dark",
                totalUsers: marketingStats?.totalUsers
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 297,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIHeroSection, {
                        theme: "dark",
                        totalUsers: marketingStats?.totalUsers
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 298,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 297,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 296,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 304,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProblemSolutionSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 305,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 304,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 311,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIShowcaseSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 312,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 311,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 318,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DragDropBuilderShowcase, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 319,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 318,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 317,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 324,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EditorModeComparison, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 325,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 324,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 323,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 330,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIMagicSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 331,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 330,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 329,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 336,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AISocialProofSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 337,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 336,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 335,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 343,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BentoFeaturesSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 344,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 343,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 342,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 350,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MarketingAutomationSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 351,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 350,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 349,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 357,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogisticsOperationsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 358,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 357,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 356,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 364,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomerExperienceSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 364,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 363,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 371,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BusinessManagementSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 372,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 371,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 370,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 378,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnalyticsInsightsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 379,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 378,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 377,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 385,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InfrastructureSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 386,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 385,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 384,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 391,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SpeedComparison, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 392,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 391,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 390,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 397,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CDNExplainer, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 398,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 397,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 396,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 403,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SpeedImpact, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 404,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 403,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 402,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 409,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CloudflareBenefitsCards, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 410,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 409,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 408,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 415,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TechnicalSpecs, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 416,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 415,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 414,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 421,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LiveDashboard, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 422,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 421,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 420,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "300px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 427,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InfrastructureCTA, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 428,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 427,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 434,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TrustSection, {
                        stats: marketingStats
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 435,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 434,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 433,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 440,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ComparisonSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 441,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 440,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 439,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 447,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FeatureMatrixSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 448,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 454,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InteractiveStoreDemo, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 455,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 454,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 453,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 463,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AllInOneSolution, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 464,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 463,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 462,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 469,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaymentIntegrationSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 470,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 469,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 468,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 476,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CourierIntegrationSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 477,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 476,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 475,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 482,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InventoryOrderManagement, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 483,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 482,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 481,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 489,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WhatsAppSMSAutomationSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 490,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 489,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 488,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 496,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EmailMarketingSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 497,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 496,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 495,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "700px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 502,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StorefrontUXShowcase, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 503,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 502,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 501,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 508,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CRMMarketingGrowth, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 509,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 508,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 507,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "700px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 515,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TeamManagementSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 516,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 515,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 514,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 522,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ActivityLogsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 523,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 522,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 521,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 529,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProductReviewsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 530,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 529,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 528,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 536,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReturnsRefundsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 537,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 536,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 535,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 543,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MessengerIntegrationSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 544,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 543,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 542,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 550,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TaxReportsSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 551,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 550,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 549,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "700px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 557,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UnifiedCommunicationHub, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 558,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 557,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 556,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 563,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BanglaNativeLocalization, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 564,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 563,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 562,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "600px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 569,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SecuritySpeedInfrastructure, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 570,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 569,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 568,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "700px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 576,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UseCaseScenariosSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 577,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 576,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 575,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "800px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 582,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PricingSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 583,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 582,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 581,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "500px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 589,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FAQSection, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 590,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 589,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 588,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 596,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AIPoweredFinalCTA, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 597,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 596,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 595,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LazySection"], {
                minHeight: "400px",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionSkeleton, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 602,
                        columnNumber: 29
                    }, void 0),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FinalCTA, {
                        stats: marketingStats
                    }, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 603,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 602,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 601,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sm:col-span-2 md:col-span-1 text-center sm:text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center sm:justify-start gap-3 mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "/brand/logo-white.webp",
                                                alt: "Ozzyl",
                                                className: "h-10 w-auto",
                                                width: "103",
                                                height: "40",
                                                loading: "lazy"
                                            }, void 0, false, {
                                                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                lineNumber: 615,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 613,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-white/50",
                                            children: t('footerAbout')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 624,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 612,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center sm:text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-[#006A4E] font-semibold mb-4",
                                            children: t('footerProduct')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 629,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/#features",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkFeatures')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 632,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 631,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/pricing",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkPricing')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 640,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 639,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/tutorials",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkTemplates')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 648,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 647,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/templates",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkIntegrations')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 655,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 630,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 628,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center sm:text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-[#006A4E] font-semibold mb-4",
                                            children: t('footerCompany')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 668,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/about",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkAbout')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 671,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 670,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/contact",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkContact')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 679,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 678,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 669,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 667,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center sm:text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-[#006A4E] font-semibold mb-4",
                                            children: t('footerLegal')
                                        }, void 0, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 691,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/privacy",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkPrivacy')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 694,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 693,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/terms",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkTerms')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 702,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 701,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/refund",
                                                        className: "text-white/50 hover:text-[#00875F] transition text-sm",
                                                        children: t('footerLinkRefund')
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                        lineNumber: 710,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                                    lineNumber: 709,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 692,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 690,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                            lineNumber: 610,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-8 border-t border-[#006A4E]/20 flex flex-col md:flex-row justify-between items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/40",
                                    children: t('copyright')
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 722,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        {
                                            icon: '💬',
                                            label: 'WhatsApp'
                                        },
                                        {
                                            icon: '📘',
                                            label: 'Facebook'
                                        },
                                        {
                                            icon: '📸',
                                            label: 'Instagram'
                                        }
                                    ].map((social, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "#",
                                            className: "w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition",
                                            title: social.label,
                                            children: social.icon
                                        }, i, false, {
                                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                            lineNumber: 729,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                                    lineNumber: 723,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                            lineNumber: 721,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 609,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 608,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sm:hidden fixed bottom-4 left-4 z-40",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/auth/register",
                    className: "flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#006A4E]/40 active:scale-[0.95] transition-transform",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rocket$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Rocket$3e$__["Rocket"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                            lineNumber: 749,
                            columnNumber: 11
                        }, this),
                        t('getStarted')
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 745,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 744,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$components$2f$LazySection$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ClientOnly"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: null,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OzzylAIChatWidget, {}, void 0, false, {
                        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                        lineNumber: 757,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                    lineNumber: 756,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
                lineNumber: 755,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/landing/components/MarketingLanding.tsx",
        lineNumber: 283,
        columnNumber: 5
    }, this);
}
_s(MarketingLanding, "zlIdU9EjM2llFt74AbE2KsUJXyM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$landing$2f$app$2f$contexts$2f$LanguageContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslation"]
    ];
});
_c49 = MarketingLanding;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19, _c20, _c21, _c22, _c23, _c24, _c25, _c26, _c27, _c28, _c29, _c30, _c31, _c32, _c33, _c34, _c35, _c36, _c37, _c38, _c39, _c40, _c41, _c42, _c43, _c44, _c45, _c46, _c47, _c48, _c49;
__turbopack_context__.k.register(_c, "AIHeroSection");
__turbopack_context__.k.register(_c1, "ProblemSolutionSection");
__turbopack_context__.k.register(_c2, "AIShowcaseSection");
__turbopack_context__.k.register(_c3, "DragDropBuilderShowcase");
__turbopack_context__.k.register(_c4, "EditorModeComparison");
__turbopack_context__.k.register(_c5, "AIMagicSection");
__turbopack_context__.k.register(_c6, "AISocialProofSection");
__turbopack_context__.k.register(_c7, "BentoFeaturesSection");
__turbopack_context__.k.register(_c8, "InfrastructureSection");
__turbopack_context__.k.register(_c9, "SpeedComparison");
__turbopack_context__.k.register(_c10, "CDNExplainer");
__turbopack_context__.k.register(_c11, "SpeedImpact");
__turbopack_context__.k.register(_c12, "CloudflareBenefitsCards");
__turbopack_context__.k.register(_c13, "TechnicalSpecs");
__turbopack_context__.k.register(_c14, "LiveDashboard");
__turbopack_context__.k.register(_c15, "InfrastructureCTA");
__turbopack_context__.k.register(_c16, "TrustSection");
__turbopack_context__.k.register(_c17, "ComparisonSection");
__turbopack_context__.k.register(_c18, "InteractiveStoreDemo");
__turbopack_context__.k.register(_c19, "FAQSection");
__turbopack_context__.k.register(_c20, "AIPoweredFinalCTA");
__turbopack_context__.k.register(_c21, "FinalCTA");
__turbopack_context__.k.register(_c22, "OzzylAIChatWidget");
__turbopack_context__.k.register(_c23, "AllInOneSolution");
__turbopack_context__.k.register(_c24, "PaymentIntegrationSection");
__turbopack_context__.k.register(_c25, "InventoryOrderManagement");
__turbopack_context__.k.register(_c26, "StorefrontUXShowcase");
__turbopack_context__.k.register(_c27, "CRMMarketingGrowth");
__turbopack_context__.k.register(_c28, "BanglaNativeLocalization");
__turbopack_context__.k.register(_c29, "SecuritySpeedInfrastructure");
__turbopack_context__.k.register(_c30, "PricingSection");
__turbopack_context__.k.register(_c31, "MarketingAutomationSection");
__turbopack_context__.k.register(_c32, "LogisticsOperationsSection");
__turbopack_context__.k.register(_c33, "BusinessManagementSection");
__turbopack_context__.k.register(_c34, "CustomerExperienceSection");
__turbopack_context__.k.register(_c35, "AnalyticsInsightsSection");
__turbopack_context__.k.register(_c36, "UseCaseScenariosSection");
__turbopack_context__.k.register(_c37, "FeatureMatrixSection");
__turbopack_context__.k.register(_c38, "CourierIntegrationSection");
__turbopack_context__.k.register(_c39, "WhatsAppSMSAutomationSection");
__turbopack_context__.k.register(_c40, "EmailMarketingSection");
__turbopack_context__.k.register(_c41, "TeamManagementSection");
__turbopack_context__.k.register(_c42, "ActivityLogsSection");
__turbopack_context__.k.register(_c43, "ProductReviewsSection");
__turbopack_context__.k.register(_c44, "ReturnsRefundsSection");
__turbopack_context__.k.register(_c45, "MessengerIntegrationSection");
__turbopack_context__.k.register(_c46, "TaxReportsSection");
__turbopack_context__.k.register(_c47, "UnifiedCommunicationHub");
__turbopack_context__.k.register(_c48, "SectionSkeleton");
__turbopack_context__.k.register(_c49, "MarketingLanding");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_landing_83d0dbd0._.js.map