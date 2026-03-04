/**
 * Multi-tenant E-commerce Database Schema
 *
 * All tables include store_id for data isolation between tenants.
 * This ensures each store can only access their own data.
 */

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
export * from './schema_agent';
export * from './schema_templates';

export type CustomerSegment = 'vip' | 'churn_risk' | 'window_shopper' | 'new' | 'regular';

// ============================================================================
// SHOPIFY INSTALLATIONS TABLE — Phase 4: Shopify App Integration
// Stores OAuth access tokens (AES-GCM encrypted) per shop domain.
// ============================================================================
export const shopifyInstallations = sqliteTable(
  'shopify_installations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    /** myshopify.com domain of the installed shop (e.g. my-store.myshopify.com) */
    shopDomain: text('shop_domain').notNull().unique(),
    /** Linked Ozzyl store (optional — set when merchant connects their account) */
    storeId: integer('store_id').references(() => stores.id),
    /** AES-GCM encrypted Shopify access token (base64) */
    accessTokenEncrypted: text('access_token_encrypted').notNull(),
    /** AES-GCM IV used for token encryption (base64) */
    accessTokenIv: text('access_token_iv').notNull(),
    /** Comma-separated OAuth scopes granted by the merchant */
    scopes: text('scopes').notNull(),
    /** When the app was installed / last re-installed */
    installedAt: integer('installed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    /** Set when the merchant uninstalls the app */
    uninstalledAt: integer('uninstalled_at', { mode: 'timestamp' }),
    /** Whether mandatory Shopify webhooks have been registered */
    webhooksRegistered: integer('webhooks_registered', { mode: 'boolean' }).default(false),
  },
  (table) => [
    index('idx_shopify_shop_domain').on(table.shopDomain),
    index('idx_shopify_store_id').on(table.storeId),
  ]
);

// ============================================================================
// STORES TABLE - Core tenant table with Hybrid Mode support
// ============================================================================
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  customDomain: text('custom_domain').unique(),
  // Custom Domain Request System
  customDomainRequest: text('custom_domain_request'), // Pending domain request
  customDomainStatus: text('custom_domain_status')
    .$type<'none' | 'pending' | 'approved' | 'rejected'>()
    .default('none'),
  customDomainRequestedAt: integer('custom_domain_requested_at', { mode: 'timestamp' }),
  // Cloudflare for SaaS Integration
  cloudflareHostnameId: text('cloudflare_hostname_id'), // Cloudflare custom hostname ID
  sslStatus: text('ssl_status').$type<'pending' | 'active' | 'failed'>().default('pending'), // SSL certificate status
  dnsVerified: integer('dns_verified', { mode: 'boolean' }).default(false), // DNS verification status
  planType: text('plan_type')
    .$type<'free' | 'starter' | 'premium' | 'business' | 'custom'>()
    .default('free'),
  subscriptionStatus: text('subscription_status')
    .$type<'active' | 'past_due' | 'canceled'>()
    .default('active'),
  usageLimits: text('usage_limits'), // JSON: { max_products, max_orders, allow_store_mode, fee_rate }

  // === ONBOARDING TRACKING ===
  onboardingStatus: text('onboarding_status')
    .$type<'pending_plan' | 'pending_info' | 'completed'>()
    .default('pending_plan'),
  setupStep: integer('setup_step').default(0), // Current step in onboarding wizard

  // === HYBRID MODE FIELDS ===
  // All users (including free) have access to both store + landing pages
  // Limits are enforced via usage_limits (products, orders per month)
  // When true, /products, /cart, /checkout routes are enabled
  storeEnabled: integer('store_enabled', { mode: 'boolean' }).default(true),
  // Homepage entry point - 'store_home' or 'page:{pageId}' format
  homeEntry: text('home_entry').default('store_home'),
  // Featured product for landing mode (direct checkout)
  featuredProductId: integer('featured_product_id'),
  // Landing page config: { headline, subheadline, videoUrl, ctaText, testimonials }
  landingConfig: text('landing_config'),
  // Draft landing config (auto-saved, not visible to public until published)
  landingConfigDraft: text('landing_config_draft'),
  // Lead generation config JSON: { enabled, themeId, ...settings }
  leadGenConfig: text('lead_gen_config'),
  // Full store theme: { primaryColor, accentColor, bannerUrl, collections[] }
  themeConfig: text('theme_config'),
  // Business info: { phone, email, address, city, country }
  businessInfo: text('business_info'),

  // === BRANDING ===
  logo: text('logo'),
  tagline: text('tagline'), // Store tagline/slogan e.g., "বাংলাদেশের সেরা ফ্যাশন স্টোর"
  description: text('description'), // Store description for SEO and about page
  bannerUrl: text('banner_url'), // Dedicated banner image URL (Cloudinary)
  theme: text('theme').default('default'),
  currency: text('currency').default('USD'),
  defaultLanguage: text('default_language').$type<'en' | 'bn'>().default('en'),

  // === PHASE 3: Theme & Customization ===
  favicon: text('favicon'), // Cloudinary URL for favicon
  socialLinks: text('social_links'), // JSON: { facebook?, instagram?, whatsapp?, twitter? }
  fontFamily: text('font_family').default('inter'), // Selected font name
  footerConfig: text('footer_config'), // JSON: { description?, links[], showPoweredBy }

  // === LEGAL POLICIES (Custom Overrides) ===
  customPrivacyPolicy: text('custom_privacy_policy'), // Override auto-generated privacy policy
  customTermsOfService: text('custom_terms_of_service'), // Override auto-generated terms
  customRefundPolicy: text('custom_refund_policy'), // Override auto-generated refund policy
  customShippingPolicy: text('custom_shipping_policy'), // Override auto-generated shipping policy
  customSubscriptionPolicy: text('custom_subscription_policy'), // Override auto-generated subscription policy
  customLegalNotice: text('custom_legal_notice'), // Override auto-generated legal notice

  // === NOTIFICATION SETTINGS ===
  notificationEmail: text('notification_email'), // Override email for alerts
  emailNotificationsEnabled: integer('email_notifications_enabled', { mode: 'boolean' }).default(
    true
  ),
  lowStockThreshold: integer('low_stock_threshold').default(10),

  // === SIMPLIFIED SHIPPING CONFIG (BD SME Friendly) ===
  // JSON: { insideDhaka: 60, outsideDhaka: 120, freeShippingAbove: 1000, enabled: true }
  shippingConfig: text('shipping_config'),

  // === FACEBOOK PIXEL TRACKING ===
  facebookPixelId: text('facebook_pixel_id'), // e.g., "123456789012345"
  facebookAccessToken: text('facebook_access_token'), // CAPI Access Token from Events Manager

  // === GOOGLE ANALYTICS TRACKING ===
  googleAnalyticsId: text('google_analytics_id'), // GA4 Measurement ID (e.g., "G-XXXXXXXXXX")

  // === USAGE TRACKING ===
  monthlyVisitorCount: integer('monthly_visitor_count').default(0), // Unique visitors this month
  visitorCountResetAt: integer('visitor_count_reset_at', { mode: 'timestamp' }), // Last reset timestamp

  // === COURIER SETTINGS ===
  courierSettings: text('courier_settings'), // JSON: { provider, pathao?, redx?, steadfast?, isConnected }

  // === MANUAL PAYMENT CONFIG (bKash/Nagad Personal/Merchant) ===
  manualPaymentConfig: text('manual_payment_config'), // JSON: { bkashPersonal, bkashMerchant, nagadPersonal, ... }
  gatewayConfig: text('gateway_config'), // JSON: per-store payment gateway credentials

  // === AI CHATBOT SETTINGS ===
  isCustomerAiEnabled: integer('is_customer_ai_enabled', { mode: 'boolean' }).default(true), // Available to all stores via credit system
  aiBotPersona: text('ai_bot_persona'), // Custom AI personality e.g., "You are a friendly fashion expert"
  // AI Agent Activation Request System
  aiAgentRequestStatus: text('ai_agent_request_status')
    .$type<'none' | 'pending' | 'approved' | 'rejected'>()
    .default('none'),
  aiAgentRequestedAt: integer('ai_agent_requested_at', { mode: 'timestamp' }),
  // aiPlan removed
  aiCredits: integer('ai_credits').default(50), // Default 50 credits for new stores

  // === CUSTOM GOOGLE OAUTH (Premium/Business only) ===
  // Free/Starter use shared platform OAuth, Premium can set their own
  customGoogleClientId: text('custom_google_client_id'), // Store's own Google OAuth Client ID
  customGoogleClientSecret: text('custom_google_client_secret'), // Store's own Google OAuth Secret (encrypted)

  // === MARKETING & LOYALTY CONFIG (Phase 14) ===
  marketingConfig: text('marketing_config'), // JSON: { sslWireless: {...}, meta: {...} }
  loyaltyConfig: text('loyalty_config'), // JSON: { pointsPerUnit: 1, tiers: {...} }

  // === SUBSCRIPTION PAYMENT TRACKING (bKash Manual Verification) ===
  paymentTransactionId: text('payment_transaction_id'), // bKash TRX ID
  paymentStatus: text('payment_status')
    .$type<'pending_verification' | 'verified' | 'rejected' | 'none'>()
    .default('none'),
  paymentSubmittedAt: integer('payment_submitted_at', { mode: 'timestamp' }),
  paymentAmount: real('payment_amount'), // Amount paid in BDT
  paymentPhone: text('payment_phone'), // Phone number used for payment

  // === SUBSCRIPTION BILLING (Super Admin Manual Approval) ===
  subscriptionPaymentMethod: text('subscription_payment_method').$type<'stripe' | 'manual'>(),
  subscriptionStartDate: integer('subscription_start_date', { mode: 'timestamp' }),
  subscriptionEndDate: integer('subscription_end_date', { mode: 'timestamp' }),
  adminNote: text('admin_note'), // Super Admin notes for the subscription

  // === NEW PAGE BUILDER HOMEPAGE LINK ===
  // Links to a new builder page (builder_pages.id) to use as homepage in funnel mode
  homepageBuilderPageId: text('homepage_builder_page_id'),

  // === NEW: UNIFIED STOREFRONT SETTINGS (Canonical Source) ===
  // Single source of truth for storefront settings (MVP v2)
  // JSON: { version, theme, branding, business, social, announcement, seo, checkout, flags, updatedAt }
  storefrontSettings: text('storefront_settings'),

  // === FRAUD DETECTION SETTINGS ===
  // JSON: { enabled, thresholds: { verify: 30, hold: 60, block: 80 }, autoHideCOD: false,
  //   requireOTPForCOD: false, maxCODAmount: null }
  fraudSettings: text('fraud_settings'),

  // === SOFT DELETE & TIMESTAMPS ===
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete timestamp (null = not deleted)
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// USERS TABLE - Merchant authentication
// ============================================================================
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    phone: text('phone'), // Merchant mobile number (BD format: 01XXXXXXXXX)
    storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }),
    role: text('role').$type<'admin' | 'merchant' | 'staff' | 'super_admin'>().default('merchant'),
    // Granular permissions for team members
    // JSON: { products: true, orders: true, customers: true, analytics: true, settings: false, team: false, billing: false, coupons: true }
    permissions: text('permissions'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('users_email_idx').on(table.email),
    index('users_store_id_idx').on(table.storeId),
  ]
);

// ============================================================================
// PRODUCTS TABLE - Store products with store_id isolation
// ============================================================================
export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    price: real('price').notNull(),
    compareAtPrice: real('compare_at_price'),
    inventory: integer('inventory').default(0),
    sku: text('sku'),
    imageUrl: text('image_url'),
    images: text('images'), // JSON array of image URLs
    category: text('category'),
    tags: text('tags'), // JSON array of tags
    isPublished: integer('is_published', { mode: 'boolean' }).default(true),
    // SEO Fields (auto-generated if empty, editable by merchant)
    seoTitle: text('seo_title'), // Custom meta title (auto: "{title} | {storeName}")
    seoDescription: text('seo_description'), // Custom meta description (auto: first 155 chars of description)
    seoKeywords: text('seo_keywords'), // Comma-separated keywords
    // Bundle/Combo Pricing for landing pages
    // JSON: [{ qty: 1, price: 1490, label: '১ পিস' }, { qty: 2, price: 2780, label: '২ পিস', savings: 200 }]
    bundlePricing: text('bundle_pricing'),
    // === P&L TRACKING (2026-03-03) ===
    // Purchase/manufacturing cost in BDT. Optional. Never shown to customers.
    // Used to calculate COGS and profit margin.
    costPrice: real('cost_price'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('products_store_id_idx').on(table.storeId),
    index('products_category_idx').on(table.storeId, table.category),
    index('products_store_published_idx').on(table.storeId, table.isPublished),
  ]
);

// ============================================================================
// COLLECTIONS TABLE - New Relational Categories
// ============================================================================
export const collections = sqliteTable(
  'collections',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('collections_store_id_idx').on(table.storeId),
    index('collections_slug_idx').on(table.storeId, table.slug),
  ]
);

export const productCollections = sqliteTable(
  'product_collections',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // Lookup all collections a product belongs to (product detail page, related products)
    index('idx_product_collections_product_id').on(table.productId),
    // Lookup all products in a collection (collection page, storefront listing)
    index('idx_product_collections_collection_id').on(table.collectionId),
  ]
);

// ============================================================================
// CUSTOMERS TABLE - Store customers with store_id isolation
// ============================================================================
export const customers = sqliteTable(
  'customers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    email: text('email'), // Optional - BD customers usually only provide phone
    name: text('name'),
    phone: text('phone'),
    address: text('address'), // Legacy JSON object, migrating to customer_addresses table

    // New Fields for CRM
    tags: text('tags'), // JSON array of strings e.g. ["VIP", "Wholesale"]
    status: text('status').$type<'active' | 'inactive' | 'banned' | 'archived'>().default('active'),
    notes: text('notes'), // Internal notes (legacy simple field)

    // === CUSTOMER AUTHENTICATION (Premium/Business only) ===
    passwordHash: text('password_hash'), // For email/password login
    googleId: text('google_id'), // Google OAuth subject ID
    authProvider: text('auth_provider').$type<'email' | 'google'>(), // How customer signed up
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }), // Last login timestamp
    // Fraud check cache
    riskScore: integer('risk_score'), // 0-100 (higher = more risky)
    riskCheckedAt: integer('risk_checked_at', { mode: 'timestamp' }), // Last check time

    // === SEGMENTATION FIELDS (AI Marketing) ===
    totalOrders: integer('total_orders').default(0), // Auto-calculated from orders
    totalSpent: real('total_spent').default(0), // Auto-calculated from orders total
    lastOrderAt: integer('last_order_at', { mode: 'timestamp' }), // Last purchase date
    // Segment: vip (>3 orders OR >10k spent), churn_risk (>60 days inactive),
    // window_shopper (has abandoned carts, 0 orders), new (0 orders), regular (default)
    segment: text('segment').$type<CustomerSegment>().default('new'),

    // === LOYALTY FIELDS (Phase 10) ===
    loyaltyPoints: integer('loyalty_points').default(0),
    loyaltyTier: text('loyalty_tier')
      .$type<'bronze' | 'silver' | 'gold' | 'platinum'>()
      .default('bronze'),
    referredBy: integer('referred_by'), // ID of existing customer who referred this user

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('customers_store_id_idx').on(table.storeId),
    index('customers_email_idx').on(table.storeId, table.email),
    index('customers_segment_idx').on(table.storeId, table.segment),
    index('customers_google_id_idx').on(table.storeId, table.googleId),
  ]
);

// ============================================================================
// ORDERS TABLE - Store orders with store_id isolation
// ============================================================================
export const orders = sqliteTable(
  'orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id').references(() => customers.id),
    orderNumber: text('order_number').notNull(),
    customerEmail: text('customer_email'), // Optional for COD orders
    customerPhone: text('customer_phone'), // Required for COD orders
    customerName: text('customer_name'),
    shippingAddress: text('shipping_address'), // JSON object
    billingAddress: text('billing_address'), // JSON object
    status: text('status')
      .$type<
        'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
      >()
      .default('pending'),
    // Payment Information
    paymentStatus: text('payment_status')
      .$type<'pending' | 'paid' | 'failed' | 'refunded' | 'reversed'>()
      .default('pending'),
    paymentMethod: text('payment_method').default('cod'), // 'cod' | 'bkash' | 'nagad' | 'rocket'
    transactionId: text('transaction_id'), // For manual payments
    manualPaymentDetails: text('manual_payment_details'), // JSON: { senderNumber, method, ... }
    // Courier tracking
    courierProvider: text('courier_provider').$type<'pathao' | 'redx' | 'steadfast' | null>(),
    courierConsignmentId: text('courier_consignment_id'), // Tracking ID from courier
    courierStatus: text('courier_status'), // Latest status from courier
    subtotal: real('subtotal').notNull(),
    tax: real('tax').default(0),
    shipping: real('shipping').default(0),
    total: real('total').notNull(),
    pricingJson: text('pricing_json'), // Detailed breakdown: { subtotal, tax, shipping, discounts, ... }
    notes: text('notes'),
    // Marketing Automation (Phase 11)
    reviewRequestSent: integer('review_request_sent', { mode: 'boolean' }).default(false),
    reviewRequestSentAt: integer('review_request_sent_at', { mode: 'timestamp' }),

    // Attribution Tracking (Analytics)
    landingPageId: integer('landing_page_id').references(() => savedLandingConfigs.id), // Campaign Page ID
    utmSource: text('utm_source'), // e.g. "facebook", "google"
    utmMedium: text('utm_medium'), // e.g. "cpc", "email"
    utmCampaign: text('utm_campaign'), // e.g. "summer_sale"

    // === P&L TRACKING (2026-03-03) ===
    // What the merchant actually paid the courier (in paisa = BDT × 100).
    // DIFFERENT from orders.shipping (what customer paid for shipping).
    // e.g., merchant pays Pathao ৳75 → store 7500 paisa
    // Default 0 = not yet entered by merchant.
    courierCharge: integer('courier_charge').notNull().default(0),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('orders_store_id_idx').on(table.storeId),
    index('orders_customer_id_idx').on(table.customerId),
    index('orders_status_idx').on(table.storeId, table.status),
    index('orders_store_created_idx').on(table.storeId, table.createdAt),
  ]
);

// ============================================================================
// ORDER ITEMS TABLE - Individual items in an order
// ============================================================================
export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    variantTitle: text('variant_title'), // e.g., "Red / Large"
    quantity: integer('quantity').notNull(),
    price: real('price').notNull(),
    total: real('total').notNull(),
    // === P&L TRACKING (2026-03-03) ===
    // Cost price snapshot at time of order. Write-once — never updated after creation.
    // Resolved as: variant.costPrice ?? product.costPrice ?? NULL
    // NULL = product had no cost price set at order time → excluded from COGS
    costPriceSnapshot: real('cost_price_snapshot'),
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)]
);

// ============================================================================
// PRODUCT VARIANTS TABLE - Size, color, and other variations
// ============================================================================
export const productVariants = sqliteTable(
  'product_variants',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    // Variant options (could be size, color, material, etc.)
    option1Name: text('option1_name'), // e.g., "Size"
    option1Value: text('option1_value'), // e.g., "Large"
    option2Name: text('option2_name'), // e.g., "Color"
    option2Value: text('option2_value'), // e.g., "Red"
    option3Name: text('option3_name'), // Optional third option
    option3Value: text('option3_value'),
    // Pricing
    price: real('price'), // Override product price if set
    compareAtPrice: real('compare_at_price'),
    // Inventory
    sku: text('sku'),
    inventory: integer('inventory').default(0),
    // Inventory Reserve System (P1) - Prevents overselling
    available: integer('available').default(0), // Can be sold
    reserved: integer('reserved').default(0), // In checkout, not yet paid
    // Variant-specific image
    imageUrl: text('image_url'),
    // Status
    isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
    // === P&L TRACKING (2026-03-03) ===
    // Per-variant cost override. NULL = inherit parent product.costPrice.
    // e.g., XL size costs ৳240 to source, S size costs ৳200
    costPrice: real('cost_price'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('product_variants_product_id_idx').on(table.productId),
    index('product_variants_product_available_idx').on(table.productId, table.isAvailable),
  ]
);

// ============================================================================
// RELATIONS - Drizzle ORM relations for type-safe queries
// ============================================================================
export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  customers: many(customers),
  orders: many(orders),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  store: one(stores, {
    fields: [users.storeId],
    references: [stores.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  orderItems: many(orderItems),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  store: one(stores, {
    fields: [customers.storeId],
    references: [stores.id],
  }),
  orders: many(orders),
  addresses: many(customerAddresses),
  notes: many(customerNotes),
}));

// ============================================================================
// CUSTOMER ADDRESSES TABLE - Multiple addresses per customer
// ============================================================================
export const customerAddresses = sqliteTable(
  'customer_addresses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    type: text('type').$type<'shipping' | 'billing'>().default('shipping'),

    firstName: text('first_name'),
    lastName: text('last_name'),
    company: text('company'),
    address1: text('address1'),
    address2: text('address2'),
    city: text('city'),
    province: text('province'), // State/Division
    zip: text('zip'),
    country: text('country'),
    phone: text('phone'),

    isDefault: integer('is_default', { mode: 'boolean' }).default(false),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('idx_customer_addresses_customer').on(table.customerId)]
);

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, {
    fields: [customerAddresses.customerId],
    references: [customers.id],
  }),
}));

// ============================================================================
// CUSTOMER NOTES TABLE - Timeline/CRM notes
// ============================================================================
export const customerNotes = sqliteTable(
  'customer_notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    authorName: text('author_name'), // Name of the staff member who added the note
    isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('idx_customer_notes_customer').on(table.customerId)]
);

export const customerNotesRelations = relations(customerNotes, ({ one }) => ({
  customer: one(customers, {
    fields: [customerNotes.customerId],
    references: [customers.id],
  }),
}));

// ============================================================================
// CUSTOMER SEGMENTS TABLE - Saved searches/groups
// ============================================================================
export const customerSegments = sqliteTable(
  'customer_segments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    query: text('query').notNull(), // JSON criteria e.g. { totalSpent: { gt: 1000 } }

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('idx_customer_segments_store').on(table.storeId)]
);

export const customerSegmentsRelations = relations(customerSegments, ({ one }) => ({
  store: one(stores, {
    fields: [customerSegments.storeId],
    references: [stores.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  orderItems: many(orderItems),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  store: one(stores, {
    fields: [collections.storeId],
    references: [stores.id],
  }),
  products: many(productCollections),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));

// ============================================================================
// PAYOUTS TABLE - Track merchant payouts
// ============================================================================
export const payouts = sqliteTable('payouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id')
    .references(() => stores.id, { onDelete: 'cascade' })
    .notNull(),

  // Period
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),

  // Amounts
  grossAmount: real('gross_amount').notNull(), // Total sales
  platformFee: real('platform_fee').default(0), // Commission
  netAmount: real('net_amount').notNull(), // Amount to pay merchant

  // Status
  status: text('status').$type<'pending' | 'processing' | 'paid' | 'failed'>().default('pending'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),

  // Payment info
  paymentMethod: text('payment_method'), // bkash, nagad, bank
  paymentReference: text('payment_reference'), // Transaction ID

  // Notes
  notes: text('notes'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const payoutsRelations = relations(payouts, ({ one }) => ({
  store: one(stores, {
    fields: [payouts.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// SHIPPING ZONES TABLE - Delivery areas and rates
// ============================================================================
export const shippingZones = sqliteTable(
  'shipping_zones',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // "Dhaka City", "Outside Dhaka"
    regions: text('regions'), // JSON array of regions/districts
    rate: real('rate').notNull().default(0), // Shipping cost
    freeAbove: real('free_above'), // Free shipping threshold
    estimatedDays: text('estimated_days'), // "2-3 days"
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('shipping_zones_store_id_idx').on(table.storeId)]
);

export const shippingZonesRelations = relations(shippingZones, ({ one }) => ({
  store: one(stores, {
    fields: [shippingZones.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// SHIPMENTS TABLE - Order tracking
// ============================================================================
export const shipments = sqliteTable(
  'shipments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    courier: text('courier'), // "pathao", "redx", "manual"
    trackingNumber: text('tracking_number'),
    status: text('status')
      .$type<
        'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned'
      >()
      .default('pending'),
    courierData: text('courier_data'), // JSON response from courier API
    shippedAt: integer('shipped_at', { mode: 'timestamp' }),
    deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('shipments_order_id_idx').on(table.orderId)]
);

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
}));

// ============================================================================
// PHONE BLACKLIST TABLE - Global + per-store fraud blacklist
// ============================================================================
export const phoneBlacklist = sqliteTable(
  'phone_blacklist',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    phone: text('phone').notNull(),
    storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }),
    reason: text('reason'),
    addedBy: text('added_by').$type<'system' | 'merchant' | 'admin'>().default('merchant'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_phone_blacklist_phone').on(table.phone),
    index('idx_phone_blacklist_store').on(table.storeId),
  ]
);

export const phoneBlacklistRelations = relations(phoneBlacklist, ({ one }) => ({
  store: one(stores, {
    fields: [phoneBlacklist.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// FRAUD EVENTS TABLE - Audit trail for fraud decisions
// ============================================================================
export const fraudEvents = sqliteTable(
  'fraud_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
    phone: text('phone').notNull(),
    riskScore: integer('risk_score').notNull(), // 0-100
    decision: text('decision')
      .$type<'allow' | 'verify' | 'hold' | 'block'>()
      .notNull(),
    signals: text('signals'), // JSON: { factors contributing to score }
    resolvedBy: text('resolved_by'), // 'auto' | 'otp_verified' | user email/id
    resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_fraud_events_store').on(table.storeId),
    index('idx_fraud_events_phone').on(table.phone),
    index('idx_fraud_events_order').on(table.orderId),
  ]
);

export const fraudEventsRelations = relations(fraudEvents, ({ one }) => ({
  store: one(stores, {
    fields: [fraudEvents.storeId],
    references: [stores.id],
  }),
  order: one(orders, {
    fields: [fraudEvents.orderId],
    references: [orders.id],
  }),
}));

// ============================================================================
// FRAUD IP EVENTS TABLE — IP velocity & device tracking (Phase 1C)
// Records IP → phone mappings to detect fraud rings (same IP, many phones).
// Also stores Cloudflare edge signals: country, device type.
// Auto-purge policy: keep 30 days only (run DELETE WHERE created_at < now-30d via cron).
// ============================================================================
export const fraudIpEvents = sqliteTable(
  'fraud_ip_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    phone: text('phone').notNull(),
    ipAddress: text('ip_address').notNull(),
    cfCountry: text('cf_country'),       // CF-IPCountry (e.g. 'BD', 'IN', 'US')
    cfDeviceType: text('cf_device_type'), // CF-Device-Type (e.g. 'mobile', 'desktop')
    userAgent: text('user_agent'),        // User-Agent (first 512 chars)
    riskScore: integer('risk_score'),     // Score at time of event (0-100)
    decision: text('decision').$type<'allow' | 'verify' | 'hold' | 'block'>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_fraud_ip_events_ip').on(table.ipAddress),
    index('idx_fraud_ip_events_store').on(table.storeId),
    index('idx_fraud_ip_events_phone').on(table.phone),
    index('idx_fraud_ip_events_ip_created').on(table.ipAddress, table.createdAt),
  ]
);

export const fraudIpEventsRelations = relations(fraudIpEvents, ({ one }) => ({
  store: one(stores, {
    fields: [fraudIpEvents.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// FDAAS API KEYS TABLE — Fraud Detection as a Service (Phase 2)
// External merchants (WordPress, Shopify, custom) pay to use Ozzyl Guard API.
// ============================================================================
export const fdaasApiKeys = sqliteTable(
  'fdaas_api_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    keyHash: text('key_hash').notNull().unique(),      // SHA-256 of raw key
    keyPrefix: text('key_prefix').notNull(),            // First 8 chars for display
    name: text('name').notNull(),                       // "My WooCommerce Store"
    ownerEmail: text('owner_email').notNull(),
    plan: text('plan').$type<'free' | 'starter' | 'pro' | 'enterprise'>().notNull().default('free'),
    monthlyLimit: integer('monthly_limit').notNull().default(100),   // free=100/mo
    callsThisMonth: integer('calls_this_month').notNull().default(0),
    callsTotal: integer('calls_total').notNull().default(0),
    lastResetAt: integer('last_reset_at', { mode: 'timestamp' }),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    isActive: integer('is_active').notNull().default(1),
    metadata: text('metadata'),                         // JSON: webhook_url, etc.
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_fdaas_api_keys_hash').on(table.keyHash),
    index('idx_fdaas_api_keys_email').on(table.ownerEmail),
    index('idx_fdaas_api_keys_prefix').on(table.keyPrefix),
  ]
);

export const fdaasUsageLog = sqliteTable(
  'fdaas_usage_log',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    apiKeyId: integer('api_key_id')
      .notNull()
      .references(() => fdaasApiKeys.id, { onDelete: 'cascade' }),
    phoneHash: text('phone_hash').notNull(),   // SHA-256 of normalized phone (privacy)
    riskScore: integer('risk_score'),
    decision: text('decision').$type<'allow' | 'verify' | 'hold' | 'block'>(),
    responseMs: integer('response_ms'),
    ipAddress: text('ip_address'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_fdaas_usage_key').on(table.apiKeyId),
    index('idx_fdaas_usage_created').on(table.createdAt),
  ]
);

export const fdaasUsageLogRelations = relations(fdaasUsageLog, ({ one }) => ({
  apiKey: one(fdaasApiKeys, {
    fields: [fdaasUsageLog.apiKeyId],
    references: [fdaasApiKeys.id],
  }),
}));

// ============================================================================
// DISCOUNTS TABLE - Promo codes and coupons
// ============================================================================
export const discounts = sqliteTable(
  'discounts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    type: text('type').$type<'percentage' | 'fixed'>().default('percentage'),
    ruleType: text('rule_type').$type<'standard' | 'segment' | 'behavior'>().default('standard'), // Changed for Advanced Rules
    value: real('value').notNull(), // Percentage (0-100) or fixed amount
    minOrderAmount: real('min_order_amount'), // Minimum order to apply
    maxDiscountAmount: real('max_discount_amount'), // Cap for percentage discounts
    maxUses: integer('max_uses'), // Total uses allowed (null = unlimited)
    usedCount: integer('used_count').default(0),
    perCustomerLimit: integer('per_customer_limit').default(1), // Uses per customer
    startsAt: integer('starts_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    // Flash Sale fields
    isFlashSale: integer('is_flash_sale', { mode: 'boolean' }).default(false),
    flashSaleEndTime: integer('flash_sale_end_time', { mode: 'timestamp' }),
    showOnHomepage: integer('show_on_homepage', { mode: 'boolean' }).default(false),
    flashSaleTitle: text('flash_sale_title'), // e.g., "Flash Sale! 50% OFF"
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('discounts_store_id_idx').on(table.storeId),
    index('discounts_code_idx').on(table.storeId, table.code),
  ]
);

export const discountsRelations = relations(discounts, ({ one }) => ({
  store: one(stores, {
    fields: [discounts.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// STAFF INVITES TABLE - Team member invitations
// ============================================================================
export const staffInvites = sqliteTable(
  'staff_invites',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role').$type<'admin' | 'staff' | 'viewer'>().default('staff'),
    token: text('token').notNull().unique(),
    invitedBy: integer('invited_by').references(() => users.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('staff_invites_store_id_idx').on(table.storeId),
    index('staff_invites_token_idx').on(table.token),
  ]
);

export const staffInvitesRelations = relations(staffInvites, ({ one }) => ({
  store: one(stores, {
    fields: [staffInvites.storeId],
    references: [stores.id],
  }),
  inviter: one(users, {
    fields: [staffInvites.invitedBy],
    references: [users.id],
  }),
}));

// ============================================================================
// ACTIVITY LOGS TABLE - Audit trail
// ============================================================================
export const activityLogs = sqliteTable(
  'activity_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id),
    action: text('action').notNull(), // "product_created", "order_updated", "settings_changed"
    entityType: text('entity_type'), // "product", "order", "settings"
    entityId: integer('entity_id'), // ID of the affected entity
    details: text('details'), // JSON with before/after or additional info
    ipAddress: text('ip_address'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('activity_logs_store_id_idx').on(table.storeId),
    index('activity_logs_user_id_idx').on(table.userId),
  ]
);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  store: one(stores, {
    fields: [activityLogs.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// ABANDONED CARTS TABLE - Cart recovery tracking
// ============================================================================
export const abandonedCarts = sqliteTable(
  'abandoned_carts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').notNull(), // Browser session ID
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    customerName: text('customer_name'),
    cartItems: text('cart_items').notNull(), // JSON array of cart items
    totalAmount: real('total_amount').notNull(),
    currency: text('currency').default('BDT'),
    abandonedAt: integer('abandoned_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    recoveredAt: integer('recovered_at', { mode: 'timestamp' }),
    recoveryEmailSent: integer('recovery_email_sent', { mode: 'boolean' }).default(false),
    recoveryEmailSentAt: integer('recovery_email_sent_at', { mode: 'timestamp' }),
    status: text('status').$type<'abandoned' | 'recovered' | 'expired'>().default('abandoned'),
  },
  (table) => [
    index('abandoned_carts_store_id_idx').on(table.storeId),
    index('abandoned_carts_session_idx').on(table.sessionId),
    index('abandoned_carts_status_idx').on(table.storeId, table.status),
    index('abandoned_carts_store_created_idx').on(table.storeId, table.abandonedAt),
  ]
);

export const abandonedCartsRelations = relations(abandonedCarts, ({ one }) => ({
  store: one(stores, {
    fields: [abandonedCarts.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// EMAIL SUBSCRIBERS TABLE - Store email list
// ============================================================================
export const emailSubscribers = sqliteTable(
  'email_subscribers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    name: text('name'),
    status: text('status').$type<'subscribed' | 'unsubscribed'>().default('subscribed'),
    source: text('source'), // 'checkout', 'popup', 'manual', 'import'
    tags: text('tags'), // JSON array of tags for segmentation
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('email_subscribers_store_id_idx').on(table.storeId),
    index('email_subscribers_email_idx').on(table.storeId, table.email),
  ]
);

export const emailSubscribersRelations = relations(emailSubscribers, ({ one }) => ({
  store: one(stores, {
    fields: [emailSubscribers.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// EMAIL CAMPAIGNS TABLE - Marketing campaigns
// ============================================================================
export const emailCampaigns = sqliteTable(
  'email_campaigns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    previewText: text('preview_text'), // Email preview text
    content: text('content').notNull(), // HTML content
    status: text('status')
      .$type<'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'>()
      .default('draft'),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
    sentAt: integer('sent_at', { mode: 'timestamp' }),
    recipientCount: integer('recipient_count').default(0),
    sentCount: integer('sent_count').default(0),
    openCount: integer('open_count').default(0),
    clickCount: integer('click_count').default(0),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('email_campaigns_store_id_idx').on(table.storeId),
    index('email_campaigns_status_idx').on(table.storeId, table.status),
  ]
);

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  store: one(stores, {
    fields: [emailCampaigns.storeId],
    references: [stores.id],
  }),
  creator: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id],
  }),
}));

// ============================================================================
// SAVED LANDING CONFIGS TABLE - Preserve landing pages when switching to Store mode
// ============================================================================
export const savedLandingConfigs = sqliteTable(
  'saved_landing_configs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
    name: text('name').notNull(), // e.g., "Homepage Backup - Jan 2026"
    landingConfig: text('landing_config').notNull(), // Full JSON config
    offerSlug: text('offer_slug'), // Custom slug like "old-home"
    isHomepageBackup: integer('is_homepage_backup', { mode: 'boolean' }).default(false),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    viewCount: integer('view_count').default(0),
    orders: integer('orders').default(0),
    revenue: real('revenue').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('saved_landing_configs_store_id_idx').on(table.storeId),
    index('saved_landing_configs_slug_idx').on(table.storeId, table.offerSlug), // Added index for slug lookup
  ]
);

export const savedLandingConfigsRelations = relations(savedLandingConfigs, ({ one }) => ({
  store: one(stores, {
    fields: [savedLandingConfigs.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [savedLandingConfigs.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// PUBLISHED PAGES TABLE - Pre-rendered HTML cache for landing pages
// ============================================================================
export const publishedPages = sqliteTable(
  'published_pages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Page identification
    pageType: text('page_type').$type<'landing' | 'product'>().default('landing'),
    productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }), // For product-specific landing pages

    // Cached content
    htmlContent: text('html_content').notNull(), // Full rendered HTML
    cssContent: text('css_content'), // Extracted/bundled CSS
    metaTags: text('meta_tags'), // JSON: { title, description, ogImage }

    // Cache metadata
    templateId: text('template_id'), // Template used for rendering
    configHash: text('config_hash'), // Hash of landingConfig for cache invalidation

    // Timestamps
    publishedAt: integer('published_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }), // Optional expiry
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('published_pages_store_id_idx').on(table.storeId),
    index('published_pages_config_hash_idx').on(table.storeId, table.configHash),
  ]
);

export const publishedPagesRelations = relations(publishedPages, ({ one }) => ({
  store: one(stores, {
    fields: [publishedPages.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [publishedPages.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// LANDING PAGES TABLE - GrapesJS Custom Pages
// ============================================================================
export const landingPages = sqliteTable(
  'landing_pages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    projectData: text('project_data'), // GrapesJS Internal JSON
    htmlContent: text('html_content'),
    cssContent: text('css_content'),
    pageConfig: text('page_config'), // JSON configuration for featured product, WhatsApp, etc.
    isPublished: integer('is_published', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('landing_pages_store_id_idx').on(table.storeId),
    index('landing_pages_slug_idx').on(table.storeId, table.slug),
  ]
);

export const landingPagesRelations = relations(landingPages, ({ one }) => ({
  store: one(stores, {
    fields: [landingPages.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// REVIEWS TABLE - Product reviews with moderation (Paid plans only)
// ============================================================================
export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    customerName: text('customer_name').notNull(),
    rating: integer('rating').notNull(), // 1-5 stars
    comment: text('comment'),
    status: text('status').$type<'pending' | 'approved' | 'rejected'>().default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('reviews_store_product_idx').on(table.storeId, table.productId),
    index('reviews_status_idx').on(table.storeId, table.status),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  store: one(stores, {
    fields: [reviews.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// WISHLISTS TABLE - Customer wishlists for saving products
// ============================================================================
export const wishlists = sqliteTable(
  'wishlists',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('wishlists_store_id_idx').on(table.storeId),
    index('wishlists_customer_id_idx').on(table.customerId),
    index('wishlists_store_customer_idx').on(table.storeId, table.customerId),
  ]
);

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  store: one(stores, {
    fields: [wishlists.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [wishlists.customerId],
    references: [customers.id],
  }),
  items: many(wishlistItems),
}));

// ============================================================================
// WISHLIST ITEMS TABLE - Individual items in a wishlist
// ============================================================================
export const wishlistItems = sqliteTable(
  'wishlist_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    wishlistId: integer('wishlist_id')
      .notNull()
      .references(() => wishlists.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    addedAt: integer('added_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    notes: text('notes'), // Optional customer notes
  },
  (table) => [
    index('wishlist_items_wishlist_id_idx').on(table.wishlistId),
    index('wishlist_items_product_id_idx').on(table.productId),
    index('wishlist_items_unique_item').on(table.wishlistId, table.productId, table.variantId),
  ]
);

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [wishlistItems.variantId],
    references: [productVariants.id],
  }),
}));

// ============================================================================
// SYSTEM NOTIFICATIONS TABLE - Global announcements from Super Admin
// ============================================================================
export const systemNotifications = sqliteTable('system_notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  message: text('message').notNull(),
  type: text('type').$type<'info' | 'warning' | 'critical'>().default('info'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// SAAS COUPONS TABLE - Platform-level subscription coupons
// ============================================================================
export const saasCoupons = sqliteTable(
  'saas_coupons',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(), // e.g., "START50", "LAUNCH20"
    discountType: text('discount_type').$type<'percentage' | 'fixed'>().notNull(),
    discountAmount: real('discount_amount').notNull(), // 50 for 50% or 500 for ৳500 off
    maxUses: integer('max_uses'), // null = unlimited
    usedCount: integer('used_count').default(0),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('saas_coupons_code_idx').on(table.code)]
);

// ============================================================================
// ORDER BUMPS TABLE - Add-on offers during checkout
// ============================================================================
export const orderBumps = sqliteTable(
  'order_bumps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Main product
    bumpProductId: integer('bump_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Bump offer
    title: text('title').notNull(), // e.g., "Add Express Shipping"
    description: text('description'), // e.g., "Get your order faster!"
    discount: real('discount').default(0), // Percentage discount on bump product
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    displayOrder: integer('display_order').default(0),
    // Stats
    views: integer('views').default(0),
    conversions: integer('conversions').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('order_bumps_store_product_idx').on(table.storeId, table.productId)]
);

export const orderBumpsRelations = relations(orderBumps, ({ one }) => ({
  store: one(stores, {
    fields: [orderBumps.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [orderBumps.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// UPSELL OFFERS TABLE - Post-purchase upsell/downsell offers
// ============================================================================
export const upsellOffers = sqliteTable(
  'upsell_offers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Trigger product
    offerProductId: integer('offer_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }), // Upsell product
    type: text('type').$type<'upsell' | 'downsell'>().default('upsell'),
    headline: text('headline').notNull(), // "Wait! Special Offer!"
    subheadline: text('subheadline'), // "Add this to your order for just ৳499"
    description: text('description'),
    discount: real('discount').default(0), // Percentage off original price
    displayOrder: integer('display_order').default(0),
    // Sequence: which offer to show if this is declined
    nextOfferId: integer('next_offer_id'), // Next upsell/downsell in sequence
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    // Stats
    views: integer('views').default(0),
    conversions: integer('conversions').default(0),
    revenue: real('revenue').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('upsell_offers_store_product_idx').on(table.storeId, table.productId)]
);

export const upsellOffersRelations = relations(upsellOffers, ({ one }) => ({
  store: one(stores, {
    fields: [upsellOffers.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [upsellOffers.productId],
    references: [products.id],
  }),
}));

// ============================================================================
// UPSELL TOKENS TABLE - One-click purchase tokens (no re-enter payment)
// ============================================================================
export const upsellTokens = sqliteTable(
  'upsell_tokens',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    offerId: integer('offer_id').references(() => upsellOffers.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('upsell_tokens_token_idx').on(table.token)]
);

export const upsellTokensRelations = relations(upsellTokens, ({ one }) => ({
  order: one(orders, {
    fields: [upsellTokens.orderId],
    references: [orders.id],
  }),
  offer: one(upsellOffers, {
    fields: [upsellTokens.offerId],
    references: [upsellOffers.id],
  }),
}));

// ============================================================================
// A/B TESTS TABLE - Split testing for landing pages
// ============================================================================
export const abTests = sqliteTable(
  'ab_tests',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    testKey: text('test_key').notNull(),
    variantA: text('variant_a').notNull(),
    variantB: text('variant_b').notNull(),
    trafficSplit: integer('traffic_split').default(50),
    status: text('status').$type<'active' | 'paused' | 'concluded'>().default('active'),
    viewsA: integer('views_a').default(0),
    conversionsA: integer('conversions_a').default(0),
    viewsB: integer('views_b').default(0),
    conversionsB: integer('conversions_b').default(0),
    winner: text('winner'), // 'A' or 'B'
    startedAt: integer('started_at', { mode: 'timestamp' }),
    endedAt: integer('ended_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('ab_tests_store_key_idx').on(table.storeId, table.testKey),
    index('ab_tests_status_idx').on(table.storeId, table.status),
  ]
);

// ============================================================================
// PUSH SUBSCRIPTIONS TABLE - Web Push Notifications
// ============================================================================
export const pushSubscriptions = sqliteTable(
  'push_subscriptions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    userId: integer('user_id').references(() => users.id), // Optional: link to specific user (e.g. Admin)
    endpoint: text('endpoint').notNull().unique(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('push_subscriptions_store_id_idx').on(table.storeId),
    index('push_subscriptions_user_id_idx').on(table.userId),
  ]
);

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  store: one(stores, {
    fields: [pushSubscriptions.storeId],
    references: [stores.id],
  }),
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// A/B TEST VARIANTS TABLE - Individual test variants
// ============================================================================
export const abTestVariants = sqliteTable(
  'ab_test_variants',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    testId: integer('test_id')
      .notNull()
      .references(() => abTests.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // "Control", "Variant A", "Variant B"
    landingConfig: text('landing_config'), // JSON config for this variant
    trafficWeight: integer('traffic_weight').default(50), // Percentage of traffic (0-100)
    // Stats
    visitors: integer('visitors').default(0),
    conversions: integer('conversions').default(0),
    revenue: real('revenue').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('ab_test_variants_test_idx').on(table.testId)]
);

export const abTestVariantsRelations = relations(abTestVariants, ({ one, many }) => ({
  test: one(abTests, {
    fields: [abTestVariants.testId],
    references: [abTests.id],
  }),
  assignments: many(abTestAssignments),
}));

// ============================================================================
// A/B TEST ASSIGNMENTS TABLE - Visitor to variant assignments
// ============================================================================
export const abTestAssignments = sqliteTable(
  'ab_test_assignments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    testId: integer('test_id')
      .notNull()
      .references(() => abTests.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id')
      .notNull()
      .references(() => abTestVariants.id, { onDelete: 'cascade' }),
    visitorId: text('visitor_id').notNull(), // Cookie-based visitor ID
    assignedAt: integer('assigned_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    convertedAt: integer('converted_at', { mode: 'timestamp' }),
    orderAmount: real('order_amount'),
  },
  (table) => [index('ab_test_assignments_visitor_idx').on(table.testId, table.visitorId)]
);

export const abTestAssignmentsRelations = relations(abTestAssignments, ({ one }) => ({
  test: one(abTests, {
    fields: [abTestAssignments.testId],
    references: [abTests.id],
  }),
  variant: one(abTestVariants, {
    fields: [abTestAssignments.variantId],
    references: [abTestVariants.id],
  }),
}));

// ============================================================================
// EMAIL AUTOMATIONS TABLE - Trigger-based email workflows
// ============================================================================
export const emailAutomations = sqliteTable(
  'email_automations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    trigger: text('trigger')
      .$type<'order_placed' | 'order_delivered' | 'cart_abandoned' | 'signup'>()
      .notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    // Stats
    totalSent: integer('total_sent').default(0),
    totalOpened: integer('total_opened').default(0),
    totalClicked: integer('total_clicked').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('email_automations_store_idx').on(table.storeId)]
);

export const emailAutomationsRelations = relations(emailAutomations, ({ one, many }) => ({
  store: one(stores, {
    fields: [emailAutomations.storeId],
    references: [stores.id],
  }),
  steps: many(emailAutomationSteps),
}));

// ============================================================================
// EMAIL AUTOMATION STEPS TABLE - Individual steps in automation
// ============================================================================
export const emailAutomationSteps = sqliteTable(
  'email_automation_steps',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    automationId: integer('automation_id')
      .notNull()
      .references(() => emailAutomations.id, { onDelete: 'cascade' }),
    delayMinutes: integer('delay_minutes').default(0), // 0 = immediate, 60 = 1 hour, 1440 = 1 day
    subject: text('subject').notNull(),
    previewText: text('preview_text'),
    content: text('content').notNull(), // HTML template with variables
    stepOrder: integer('step_order').default(0),
    // Stats per step
    sentCount: integer('sent_count').default(0),
    openCount: integer('open_count').default(0),
    clickCount: integer('click_count').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('email_automation_steps_automation_idx').on(table.automationId)]
);

export const emailAutomationStepsRelations = relations(emailAutomationSteps, ({ one }) => ({
  automation: one(emailAutomations, {
    fields: [emailAutomationSteps.automationId],
    references: [emailAutomations.id],
  }),
}));

// ============================================================================
// EMAIL QUEUE TABLE - Scheduled emails to be sent
// ============================================================================
export const emailQueue = sqliteTable(
  'email_queue',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    stepId: integer('step_id').references(() => emailAutomationSteps.id, { onDelete: 'set null' }),
    recipientEmail: text('recipient_email').notNull(),
    recipientName: text('recipient_name'),
    subject: text('subject').notNull(),
    content: text('content').notNull(), // Rendered HTML
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
    sentAt: integer('sent_at', { mode: 'timestamp' }),
    status: text('status').$type<'pending' | 'sent' | 'failed'>().default('pending'),
    errorMessage: text('error_message'),
    metadata: text('metadata'), // JSON with order info, customer name, etc.
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('email_queue_scheduled_idx').on(table.scheduledAt, table.status),
    index('email_queue_store_idx').on(table.storeId),
  ]
);

export const emailQueueRelations = relations(emailQueue, ({ one }) => ({
  store: one(stores, {
    fields: [emailQueue.storeId],
    references: [stores.id],
  }),
  step: one(emailAutomationSteps, {
    fields: [emailQueue.stepId],
    references: [emailAutomationSteps.id],
  }),
}));

// ============================================================================
// PAGE VIEWS TABLE - Visitor analytics for Super Admin
// ============================================================================
export const pageViews = sqliteTable(
  'page_views',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    path: text('path').notNull(), // Page path visited
    visitorId: text('visitor_id').notNull(), // Cookie-based anonymous ID
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    referrer: text('referrer'), // Where visitor came from
    country: text('country'), // From IP geolocation
    city: text('city'),
    deviceType: text('device_type').$type<'mobile' | 'desktop' | 'tablet'>(), // Parsed from user-agent
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('page_views_store_idx').on(table.storeId),
    index('page_views_date_idx').on(table.storeId, table.createdAt),
    index('page_views_visitor_idx').on(table.storeId, table.visitorId),
    index('page_views_store_created_idx').on(table.storeId, table.createdAt),
  ]
);

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  store: one(stores, {
    fields: [pageViews.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// ADMIN AUDIT LOGS TABLE - Track all Super Admin actions
// ============================================================================
export const adminAuditLogs = sqliteTable(
  'admin_audit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    // actor_id remains NOT NULL with FK to users for 'user' type actors.
    // For system/api_key/webhook actors, pass sentinel value 0 and set
    // actorType + actorName. See 0096_audit_actor_field.sql for rationale.
    actorId: integer('actor_id')
      .notNull()
      .references(() => users.id), // Who performed the action
    // Added by 0096_audit_actor_field.sql — discriminates actor origin.
    actorType: text('actor_type')
      .$type<'user' | 'api_key' | 'system' | 'webhook'>()
      .notNull()
      .default('user'),
    // Denormalized display label — survives user deletion / key rotation.
    // 'user'    → users.email  (e.g. "rahmatullahzisan@gmail.com")
    // 'api_key' → key name + prefix (e.g. "My WooCommerce Store (ak_••••abcd)")
    // 'system'  → cron/worker name (e.g. "cron/courier-sync")
    // 'webhook' → topic slug (e.g. "wc/order.created")
    actorName: text('actor_name'),
    action: text('action').notNull(), // e.g., "update_settings", "delete_user"
    resource: text('resource').notNull(), // e.g., "settings", "users"
    resourceId: text('resource_id'), // ID of the affected resource
    diff: text('diff'), // JSON object highlighting changes {before, after}
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('admin_audit_logs_store_idx').on(table.storeId),
    index('admin_audit_logs_actor_idx').on(table.actorId),
    index('admin_audit_logs_action_idx').on(table.storeId, table.action),
    // Added by 0096: filter by actor type in /admin/audit-logs UI
    index('idx_audit_logs_actor_type').on(table.actorType),
    index('idx_audit_logs_store_actor_type').on(table.storeId, table.actorType),
  ]
);

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  store: one(stores, {
    fields: [adminAuditLogs.storeId],
    references: [stores.id],
  }),
  actor: one(users, {
    fields: [adminAuditLogs.actorId],
    references: [users.id],
  }),
}));

// ============================================================================
// ADMIN ROLES TABLE - Role-Based Access Control for Admin Team
// ============================================================================
export const adminRoles = sqliteTable(
  'admin_roles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().$type<'super_admin' | 'support' | 'finance' | 'developer'>(),
    permissions: text('permissions'), // JSON: { canSuspend, canDelete, canBilling, canImpersonate }
    createdBy: integer('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('admin_roles_user_idx').on(table.userId)]
);

export const adminRolesRelations = relations(adminRoles, ({ one }) => ({
  user: one(users, {
    fields: [adminRoles.userId],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [adminRoles.createdBy],
    references: [users.id],
  }),
}));

// ============================================================================
// STORE TAGS TABLE - Tagging system for stores (VIP, Problematic, etc.)
// ============================================================================
export const storeTags = sqliteTable(
  'store_tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(), // VIP, Problematic, HighValue, Churning, etc.
    note: text('note'), // Admin note about this tag
    createdBy: integer('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('store_tags_store_idx').on(table.storeId),
    index('store_tags_tag_idx').on(table.tag),
  ]
);

// ============================================================================
// MARKETING LEADS TABLE - Platform-level email collection (homepage)
// ============================================================================
export const marketingLeads = sqliteTable(
  'marketing_leads',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    source: text('source').default('homepage'), // 'homepage', 'pricing', 'footer'
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('marketing_leads_email_idx').on(table.email)]
);

// ============================================================================
// TYPE EXPORTS - For use throughout the application
// ============================================================================
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type NewShippingZone = typeof shippingZones.$inferInsert;
export type Shipment = typeof shipments.$inferSelect;
export type NewShipment = typeof shipments.$inferInsert;
export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
export type StaffInvite = typeof staffInvites.$inferSelect;
export type NewStaffInvite = typeof staffInvites.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type AbandonedCart = typeof abandonedCarts.$inferSelect;
export type NewAbandonedCart = typeof abandonedCarts.$inferInsert;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type NewEmailSubscriber = typeof emailSubscribers.$inferInsert;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type NewEmailCampaign = typeof emailCampaigns.$inferInsert;
export type SavedLandingConfig = typeof savedLandingConfigs.$inferSelect;
export type NewSavedLandingConfig = typeof savedLandingConfigs.$inferInsert;
export type PublishedPage = typeof publishedPages.$inferSelect;
export type NewPublishedPage = typeof publishedPages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type SystemNotification = typeof systemNotifications.$inferSelect;
export type NewSystemNotification = typeof systemNotifications.$inferInsert;
export type SaasCoupon = typeof saasCoupons.$inferSelect;
export type NewSaasCoupon = typeof saasCoupons.$inferInsert;
// New ClickFunnels-like features
export type OrderBump = typeof orderBumps.$inferSelect;
export type NewOrderBump = typeof orderBumps.$inferInsert;
export type UpsellOffer = typeof upsellOffers.$inferSelect;
export type NewUpsellOffer = typeof upsellOffers.$inferInsert;
export type UpsellToken = typeof upsellTokens.$inferSelect;
export type NewUpsellToken = typeof upsellTokens.$inferInsert;
export type AbTest = typeof abTests.$inferSelect;
export type NewAbTest = typeof abTests.$inferInsert;
export type AbTestVariant = typeof abTestVariants.$inferSelect;
export type NewAbTestVariant = typeof abTestVariants.$inferInsert;
export type AbTestAssignment = typeof abTestAssignments.$inferSelect;
export type NewAbTestAssignment = typeof abTestAssignments.$inferInsert;
export type EmailAutomation = typeof emailAutomations.$inferSelect;
export type NewEmailAutomation = typeof emailAutomations.$inferInsert;
export type EmailAutomationStep = typeof emailAutomationSteps.$inferSelect;
export type NewEmailAutomationStep = typeof emailAutomationSteps.$inferInsert;
export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type NewEmailQueueItem = typeof emailQueue.$inferInsert;
// Visitor Analytics
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
// Admin Audit & RBAC
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;
export type AdminRole = typeof adminRoles.$inferSelect;
export type NewAdminRole = typeof adminRoles.$inferInsert;
export type StoreTag = typeof storeTags.$inferSelect;
export type NewStoreTag = typeof storeTags.$inferInsert;
export type MarketingLead = typeof marketingLeads.$inferSelect;
export type NewMarketingLead = typeof marketingLeads.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type NewPasswordReset = typeof passwordResets.$inferInsert;

// ============================================================================
// PAYMENTS TABLE - Historical Subscription Records
// ============================================================================
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id')
    .notNull()
    .references(() => stores.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('BDT'),
  status: text('status').$type<'pending' | 'paid' | 'failed' | 'refunded'>().default('pending'),
  method: text('method').$type<'manual' | 'bkash' | 'nagad' | 'stripe'>().default('manual'),
  transactionId: text('transaction_id'),
  planType: text('plan_type'), // Snapshot of plan
  periodStart: integer('period_start', { mode: 'timestamp' }),
  periodEnd: integer('period_end', { mode: 'timestamp' }),
  adminNote: text('admin_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  store: one(stores, {
    fields: [payments.storeId],
    references: [stores.id],
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ============================================================================
// PHASE 6: SYSTEM HEALTH (Logs)
// ============================================================================
export const systemLogs = sqliteTable('system_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  level: text('level').$type<'info' | 'warn' | 'error' | 'fatal'>().notNull(),
  message: text('message').notNull(),
  stack: text('stack'), // Optional stack trace
  context: text('context'), // JSON context (path, user_id, etc)
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;

// ============================================================================
// PHASE 6: DEVELOPER TOOLS (API Keys)
// ============================================================================
// ============================================================================
// API KEYS TABLE — WooCommerce Power Layer integration
// ============================================================================
// Plan/scope system for WC Power Layer:
// free:    'analytics' — read-only analytics & order sync
// starter: 'analytics,fraud,tracking,courier,abandoned_cart' — full tracking
// pro:     'analytics,fraud,tracking,courier,abandoned_cart,sms,automation' — with SMS + automation
export const apiKeys = sqliteTable(
  'api_keys',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id),
    name: text('name').notNull(), // e.g. "Production Key"
    keyPrefix: text('key_prefix').notNull(), // First 12 chars for display
    keyHash: text('key_hash').notNull(), // HMAC-SHA256 hash of full key
    scopes: text('scopes').default('analytics'), // Comma-separated: analytics,fraud,tracking,courier,abandoned_cart,sms,automation
    plan: text('plan').default('free'), // 'free' | 'starter' | 'pro'
    planId: integer('plan_id'), // References api_plans(id) — added in migration 0016
    wcWebhookSecret: text('wc_webhook_secret'), // HMAC secret for WC webhook signature verification
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }), // Optional key expiry
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_api_keys_store').on(table.storeId),
    index('idx_api_keys_plan').on(table.plan),
  ]
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  store: one(stores, {
    fields: [apiKeys.storeId],
    references: [stores.id],
  }),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

// ============================================================================
// WC_CART_SESSIONS TABLE — Abandoned cart tracking for WooCommerce
// ============================================================================
export const wcCartSessions = sqliteTable(
  'wc_cart_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').notNull(), // WC session ID or cart key
    customerPhone: text('customer_phone'), // Normalized phone (01XXXXXXXXX)
    customerEmail: text('customer_email'), // Customer email (optional)
    items: text('items').notNull(), // JSON array: [{sku, name, qty, price}]
    total: real('total').notNull().default(0), // Cart total amount
    converted: integer('converted', { mode: 'boolean' }).notNull().default(false), // Boolean: true if converted to order
    convertedAt: integer('converted_at', { mode: 'timestamp' }), // When converted
    lastReminderAt: integer('last_reminder_at', { mode: 'timestamp' }), // Last reminder sent
    reminderCount: integer('reminder_count').notNull().default(0), // Number of reminders
    source: text('source').default('woocommerce'), // 'woocommerce' | 'ozzyl'
    updatedAt: integer('updated_at', { mode: 'timestamp' }), // Last update
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_wc_cart_store_session').on(table.storeId, table.sessionId),
    index('idx_wc_cart_store_converted').on(table.storeId, table.converted),
    index('idx_wc_cart_updated').on(table.updatedAt),
  ]
);

export const wcCartSessionsRelations = relations(wcCartSessions, ({ one }) => ({
  store: one(stores, {
    fields: [wcCartSessions.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// SMS_SUPPRESSION_LIST TABLE — SMS opt-out management
// ============================================================================
export const smsSuppression = sqliteTable(
  'sms_suppression_list',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    phoneNormalized: text('phone_normalized').notNull(), // Normalized BD format: 01XXXXXXXXX
    optedOutAt: integer('opted_out_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    source: text('source').default('customer'), // 'customer' | 'admin' | 'bounce'
  },
  (table) => [index('idx_sms_suppression_store_phone').on(table.storeId, table.phoneNormalized)]
);

export const smsSuppressionRelations = relations(smsSuppression, ({ one }) => ({
  store: one(stores, {
    fields: [smsSuppression.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// WC_WEBHOOK_EVENTS TABLE — Async webhook processing queue
// ============================================================================
export const wcWebhookEvents = sqliteTable(
  'wc_webhook_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    topic: text('topic').notNull(), // WC webhook topic: 'order.created', 'order.updated', etc.
    wcResourceId: text('wc_resource_id'), // WooCommerce resource ID
    payload: text('payload').notNull(), // Full webhook payload as JSON
    processed: integer('processed', { mode: 'boolean' }).notNull().default(false), // Boolean: true if processed
    processedAt: integer('processed_at', { mode: 'timestamp' }), // When processed
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_wc_webhook_store_processed').on(table.storeId, table.processed),
    index('idx_wc_webhook_created').on(table.createdAt),
  ]
);

export const wcWebhookEventsRelations = relations(wcWebhookEvents, ({ one }) => ({
  store: one(stores, {
    fields: [wcWebhookEvents.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// PHASE 4: APP ECOSYSTEM & WEBHOOKS
// ============================================================================

export const apps = sqliteTable('apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  handle: text('handle').notNull().unique(), // unique identifier for the app
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret').notNull(), // Encrypted/Hashed
  redirectUrl: text('redirect_url').notNull(),
  scopes: text('scopes'), // JSON array of allowed scopes ['read_products', 'write_orders']
  developerId: integer('developer_id'), // User ID of the developer
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const appInstallations = sqliteTable(
  'app_installations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    appId: integer('app_id')
      .notNull()
      .references(() => apps.id, { onDelete: 'cascade' }),
    accessToken: text('access_token').notNull(),
    refreshToken: text('refresh_token'),
    scopes: text('scopes'), // Granted scopes
    status: text('status').$type<'active' | 'suspended'>().default('active'),
    installedAt: integer('installed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('app_installations_store_id_idx').on(table.storeId),
    index('app_installations_app_id_idx').on(table.appId),
  ]
);

// ============================================================================
// WEBHOOKS
// ============================================================================
export const webhooks = sqliteTable(
  'webhooks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    appInstallationId: integer('app_installation_id').references(() => appInstallations.id, {
      onDelete: 'cascade',
    }), // Nullable for manual webhooks
    topic: text('topic').notNull(), // 'orders/create', 'products/update'
    url: text('url').notNull(),
    secret: text('secret'), // HMAC secret
    format: text('format').$type<'json' | 'xml'>().default('json'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    failureCount: integer('failure_count').default(0),
    events: text('events'), // JSON array: ["order/created","product/updated"] — added migration 0016
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('webhooks_store_id_idx').on(table.storeId),
    index('webhooks_topic_idx').on(table.storeId, table.topic),
  ]
);

// Relations
export const appsRelations = relations(apps, ({ many }) => ({
  installations: many(appInstallations),
}));

export const appInstallationsRelations = relations(appInstallations, ({ one, many }) => ({
  store: one(stores, { fields: [appInstallations.storeId], references: [stores.id] }),
  app: one(apps, { fields: [appInstallations.appId], references: [apps.id] }),
  webhooks: many(webhooks),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  store: one(stores, { fields: [webhooks.storeId], references: [stores.id] }),
  appInstallation: one(appInstallations, {
    fields: [webhooks.appInstallationId],
    references: [appInstallations.id],
  }),
}));

export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;

export type AppInstallation = typeof appInstallations.$inferSelect;
export type NewAppInstallation = typeof appInstallations.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

// ============================================================================
// WEBHOOK DELIVERY LOGS - Track delivery attempts
// ============================================================================
export const webhookDeliveryLogs = sqliteTable(
  'webhook_delivery_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    webhookId: integer('webhook_id')
      .notNull()
      .references(() => webhooks.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(), // order.created, order.updated, etc.
    payload: text('payload').notNull(), // JSON payload sent
    statusCode: integer('status_code'), // HTTP response code
    responseBody: text('response_body'), // Response from endpoint
    success: integer('success', { mode: 'boolean' }).default(false),
    errorMessage: text('error_message'),
    attemptCount: integer('attempt_count').default(1),
    deliveredAt: integer('delivered_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('webhook_logs_webhook_idx').on(table.webhookId),
    index('webhook_logs_event_idx').on(table.eventType),
  ]
);

export const webhookDeliveryLogsRelations = relations(webhookDeliveryLogs, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveryLogs.webhookId],
    references: [webhooks.id],
  }),
}));

export type WebhookDeliveryLog = typeof webhookDeliveryLogs.$inferSelect;
export type NewWebhookDeliveryLog = typeof webhookDeliveryLogs.$inferInsert;
// ============================================================================
// VISITOR CHAT & LEAD CAPTURE
// ============================================================================
export const visitors = sqliteTable('visitors', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// PASSWORD RESETS TABLE - Forgot Password Tokens
// ============================================================================
export const passwordResets = sqliteTable(
  'password_resets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(), // Hashed token for security
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('password_resets_token_idx').on(table.token),
    index('password_resets_user_idx').on(table.userId),
  ]
);

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const visitorMessages = sqliteTable(
  'visitor_messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    visitorId: integer('visitor_id')
      .notNull()
      .references(() => visitors.id, { onDelete: 'cascade' }),
    role: text('role').$type<'user' | 'assistant'>().notNull(),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('visitor_messages_visitor_id_idx').on(table.visitorId)]
);

export const visitorsRelations = relations(visitors, ({ many }) => ({
  messages: many(visitorMessages),
}));

export const visitorMessagesRelations = relations(visitorMessages, ({ one }) => ({
  visitor: one(visitors, {
    fields: [visitorMessages.visitorId],
    references: [visitors.id],
  }),
}));

// ============================================================================
// MARKETPLACE THEMES TABLE - Shared community themes
// ============================================================================
export const marketplaceThemes = sqliteTable('marketplace_themes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  thumbnail: text('thumbnail'),
  config: text('config').notNull(), // JSON: ThemeConfig
  createdBy: integer('created_by').references(() => stores.id, { onDelete: 'set null' }),
  authorName: text('author_name'),
  status: text('status').$type<'pending' | 'approved' | 'rejected'>().default('pending'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const marketplaceThemesRelations = relations(marketplaceThemes, ({ one }) => ({
  creator: one(stores, {
    fields: [marketplaceThemes.createdBy],
    references: [stores.id],
  }),
}));

// ============================================================================
// STORE THEMES TABLE - User's installed/purchased theme collection
// ============================================================================
export const storeThemes = sqliteTable(
  'store_themes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Source: either a system template ID or a marketplace theme ID
    templateId: text('template_id'), // e.g., 'luxe-boutique', 'tech-modern' (from STORE_TEMPLATES)
    marketplaceThemeId: integer('marketplace_theme_id').references(() => marketplaceThemes.id, {
      onDelete: 'set null',
    }),

    // Saved config snapshot (allows customization without losing original)
    name: text('name').notNull(), // User's name for this theme (e.g., "My Custom Luxe")
    config: text('config').notNull(), // JSON: Full ThemeConfig snapshot
    thumbnail: text('thumbnail'), // Custom screenshot or original thumbnail

    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(false), // Currently applied theme

    // Timestamps
    installedAt: integer('installed_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('store_themes_store_id_idx').on(table.storeId),
    index('store_themes_active_idx').on(table.storeId, table.isActive),
  ]
);

export const storeThemesRelations = relations(storeThemes, ({ one }) => ({
  store: one(stores, {
    fields: [storeThemes.storeId],
    references: [stores.id],
  }),
  marketplaceTheme: one(marketplaceThemes, {
    fields: [storeThemes.marketplaceThemeId],
    references: [marketplaceThemes.id],
  }),
}));

// ============================================================================
// CREDIT USAGE LOGS - Track every credit transaction
// ============================================================================
export const creditUsageLogs = sqliteTable('credit_usage_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id')
    .notNull()
    .references(() => stores.id),
  amount: integer('amount').notNull(), // Positive for add, Negative for deduct
  type: text('type').$type<'purchase' | 'usage' | 'bonus' | 'refund' | 'adjustment'>().notNull(),
  description: text('description'), // E.g. "Generated Landing Page", "Purchased Starter Pack"
  metadata: text('metadata'), // JSON: { feature: 'ai_chat', relatedId: 'order_123' }
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const creditUsageLogsRelations = relations(creditUsageLogs, ({ one }) => ({
  store: one(stores, {
    fields: [creditUsageLogs.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// MERCHANT AI AGENTS TABLE - Store's AI chatbot configuration
// ============================================================================
export const agents = sqliteTable(
  'agents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // Agent display name e.g. "সাহায্যকারী বট"

    // AI Configuration
    agentSettings: text('agent_settings'), // JSON: AgentConfig from agent.prompts.ts
    systemPrompt: text('system_prompt'), // Custom system prompt override
    tone: text('tone').$type<'friendly' | 'formal' | 'urgent'>().default('friendly'),
    language: text('language').$type<'bn' | 'en' | 'banglish'>().default('bn'),
    objectives: text('objectives'), // JSON array: ['answer_only', 'lead_gen', 'order']

    // RAG Knowledge Base
    knowledgeBaseId: text('knowledge_base_id'), // Vectorize namespace

    // Channel Settings
    enabledChannels: text('enabled_channels'), // JSON: ['web', 'whatsapp', 'messenger']
    whatsappPhoneId: text('whatsapp_phone_id'), // WhatsApp Business Phone ID
    messengerPageId: text('messenger_page_id'), // Facebook Page ID

    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(true),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('agents_store_id_idx').on(table.storeId)]
);

export const agentsRelations = relations(agents, ({ one, many }) => ({
  store: one(stores, {
    fields: [agents.storeId],
    references: [stores.id],
  }),
  conversations: many(aiConversations),
}));

// ============================================================================
// AI CONVERSATIONS TABLE - Chat sessions with customers
// ============================================================================
export const aiConversations = sqliteTable(
  'ai_conversations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    agentId: integer('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Customer Identification
    customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    visitorId: text('visitor_id'), // Anonymous visitor tracking
    customerPhone: text('customer_phone'),
    customerName: text('customer_name'),

    // Channel
    channel: text('channel').$type<'web' | 'whatsapp' | 'messenger'>().default('web'),
    externalId: text('external_id'), // WhatsApp/Messenger conversation ID

    // Status
    status: text('status').$type<'active' | 'closed' | 'transferred'>().default('active'),
    lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('ai_conversations_agent_idx').on(table.agentId),
    index('ai_conversations_store_idx').on(table.storeId),
    index('ai_conversations_customer_idx').on(table.customerId),
  ]
);

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  agent: one(agents, {
    fields: [aiConversations.agentId],
    references: [agents.id],
  }),
  store: one(stores, {
    fields: [aiConversations.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [aiConversations.customerId],
    references: [customers.id],
  }),
  messages: many(messages),
  leadsData: many(leadsData),
}));

// ============================================================================
// MESSAGES TABLE - Individual chat messages
// ============================================================================
export const messages = sqliteTable(
  'messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    conversationId: integer('conversation_id')
      .notNull()
      .references(() => aiConversations.id, { onDelete: 'cascade' }),

    role: text('role').$type<'user' | 'assistant' | 'system'>().notNull(),
    content: text('content').notNull(),

    // Function calls (if AI called a tool)
    functionName: text('function_name'),
    functionArgs: text('function_args'), // JSON
    functionResult: text('function_result'),

    // Metadata
    metadata: text('metadata'),
    tokensUsed: integer('tokens_used'),
    creditsUsed: integer('credits_used').default(1), // Each message costs 1 credit

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('messages_conversation_idx').on(table.conversationId)]
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [messages.conversationId],
    references: [aiConversations.id],
  }),
}));

// ============================================================================
// LEADS DATA TABLE - Information captured by AI during conversations
// ============================================================================
export const leadsData = sqliteTable(
  'leads_data',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    conversationId: integer('conversation_id')
      .notNull()
      .references(() => aiConversations.id, { onDelete: 'cascade' }),

    key: text('key').notNull(), // 'phone', 'name', 'budget', 'product_interest'
    value: text('value').notNull(),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('leads_data_conversation_idx').on(table.conversationId)]
);

export const leadsDataRelations = relations(leadsData, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [leadsData.conversationId],
    references: [aiConversations.id],
  }),
}));

// ============================================================================
// LOYALTY TRANSACTIONS - History of points earned/redeemed
// ============================================================================
export const loyaltyTransactions = sqliteTable(
  'loyalty_transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),

    points: integer('points').notNull(), // Positive = Earned, Negative = Redeemed
    type: text('type')
      .$type<
        | 'purchase'
        | 'referral'
        | 'signup'
        | 'redemption'
        | 'manual_adjustment'
        | 'tier_bonus'
        | 'review_reward'
      >()
      .notNull(),
    referenceId: text('reference_id'), // Link to order_id or other entity
    description: text('description'), // "Order #1234", "Referral Bonus"

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('loyalty_tx_customer_idx').on(table.customerId),
    index('loyalty_tx_store_idx').on(table.storeId),
    index('loyalty_tx_type_idx').on(table.storeId, table.type),
  ]
);

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
  store: one(stores, {
    fields: [loyaltyTransactions.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [loyaltyTransactions.customerId],
    references: [customers.id],
  }),
}));
// ============================================================================
// A/B TESTS TABLE - Split testing framework
// ============================================================================

// ============================================================================
// PRODUCT RECOMMENDATIONS CACHE TABLE - Pre-calculated recommendations
// ============================================================================
export const productRecommendations = sqliteTable(
  'product_recommendations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    sourceProductId: integer('source_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    recommendedProductId: integer('recommended_product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    score: real('score').default(0), // Relevance score
    reason: text('reason').default('similar_category'), // 'bought_together', 'similar_category'
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('prod_recs_source_idx').on(table.storeId, table.sourceProductId)]
);

export const productRecommendationsRelations = relations(productRecommendations, ({ one }) => ({
  store: one(stores, {
    fields: [productRecommendations.storeId],
    references: [stores.id],
  }),
  sourceProduct: one(products, {
    fields: [productRecommendations.sourceProductId],
    references: [products.id],
  }),
  recommendedProduct: one(products, {
    fields: [productRecommendations.recommendedProductId],
    references: [products.id],
  }),
}));

// ============================================================================
// CACHE STORE - Performance critical key-value storage
// ============================================================================
export const cacheStore = sqliteTable(
  'cache_store',
  {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => [index('idx_cache_expires').on(table.expiresAt)]
);

// ============================================================================
// AI CACHE - AI generated responses cache
// ============================================================================
export const aiCache = sqliteTable(
  'ai_cache',
  {
    key: text('key').primaryKey(),
    response: text('response').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => [index('idx_ai_cache_expires').on(table.expiresAt)]
);

// ============================================================================
// PAGE VERSIONS TABLE - Version history for landing pages
// ============================================================================
export const pageVersions = sqliteTable(
  'page_versions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    configJson: text('config_json').notNull(), // Full landingConfig snapshot
    versionLabel: text('version_label'), // Optional label like "v1.0" or "Before redesign"
    createdBy: integer('created_by').references(() => users.id),
    publishedAt: integer('published_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('page_versions_store_id_idx').on(table.storeId)]
);

export const pageVersionsRelations = relations(pageVersions, ({ one }) => ({
  store: one(stores, {
    fields: [pageVersions.storeId],
    references: [stores.id],
  }),
  creator: one(users, {
    fields: [pageVersions.createdBy],
    references: [users.id],
  }),
}));

// ============================================================================
// TEMPLATE ANALYTICS TABLE - Track template conversion performance
// ============================================================================
export const templateAnalytics = sqliteTable(
  'template_analytics',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    templateId: text('template_id').notNull(), // e.g., "modern-dark", "quick-start"
    pageViews: integer('page_views').default(0),
    uniqueVisitors: integer('unique_visitors').default(0),
    ordersGenerated: integer('orders_generated').default(0),
    revenueGenerated: real('revenue_generated').default(0),
    conversionRate: real('conversion_rate').default(0), // orders / pageViews * 100
    // Time period
    periodStart: integer('period_start', { mode: 'timestamp' }),
    periodEnd: integer('period_end', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('template_analytics_store_id_idx').on(table.storeId),
    index('template_analytics_template_idx').on(table.storeId, table.templateId),
  ]
);

export const templateAnalyticsRelations = relations(templateAnalytics, ({ one }) => ({
  store: one(stores, {
    fields: [templateAnalytics.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// CARTS TABLE - Server-side shopping cart
// ============================================================================
// Enables: Cross-device sync, abandoned cart with items, server-side stock validation
export const carts = sqliteTable(
  'carts',
  {
    id: text('id').primaryKey(), // UUID
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Customer/Visitor identification
    customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    visitorId: text('visitor_id'), // Anonymous visitor tracking (localStorage ID)
    sessionId: text('session_id'), // Server session ID

    // Currency for price consistency
    currency: text('currency').default('BDT'),

    // Status and expiration
    status: text('status')
      .$type<'active' | 'converted' | 'abandoned' | 'merged'>()
      .default('active'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }), // For cleanup

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_carts_store').on(table.storeId),
    index('idx_carts_customer').on(table.customerId),
    index('idx_carts_visitor').on(table.visitorId),
    index('idx_carts_status').on(table.storeId, table.status),
  ]
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  store: one(stores, {
    fields: [carts.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  items: many(cartItems),
}));

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

// ============================================================================
// CART ITEMS TABLE - Individual items in a cart
// ============================================================================
export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey(), // UUID
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Product reference
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

    // Quantity
    quantity: integer('quantity').notNull().default(1),

    // Price snapshot at add time (for comparison / discount detection)
    unitPriceSnapshot: real('unit_price_snapshot'),
    titleSnapshot: text('title_snapshot'),
    imageSnapshot: text('image_snapshot'),
    variantTitleSnapshot: text('variant_title_snapshot'),

    // Metadata
    addedAt: integer('added_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_cart_items_cart').on(table.cartId),
    index('idx_cart_items_product').on(table.productId),
  ]
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  store: one(stores, {
    fields: [cartItems.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

// ============================================================================
// CHECKOUT SESSIONS TABLE - Server-side checkout with stock reservation
// ============================================================================
// Enables: Stock reservation, abandoned checkout recovery, server-side pricing, idempotent order creation
export const checkoutSessions = sqliteTable(
  'checkout_sessions',
  {
    id: text('id').primaryKey(), // UUID
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Cart snapshot (items, quantities, prices at checkout time)
    cartJson: text('cart_json').notNull(), // JSON: [{ variantId, qty, price, title, image }]

    // Customer info
    customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    email: text('email'),
    phone: text('phone'),
    customerName: text('customer_name'),

    // Addresses
    shippingAddressJson: text('shipping_address_json'), // JSON: { name, phone, address, district, upazila, postcode }
    billingAddressJson: text('billing_address_json'), // JSON: same structure

    // Server-calculated pricing (prevents client-side manipulation)
    pricingJson: text('pricing_json'), // JSON: { subtotal, shipping, discount, tax, total }
    discountCode: text('discount_code'),

    // Payment method selection
    paymentMethod: text('payment_method')
      .$type<'cod' | 'bkash' | 'nagad' | 'rocket' | 'stripe' | 'sslcommerz' | 'bkash_gateway' | 'nagad_gateway'>()
      .default('cod'),

    // Status tracking
    status: text('status')
      .$type<'pending' | 'processing' | 'completed' | 'abandoned' | 'expired'>()
      .default('pending'),

    // Idempotency (prevents duplicate order creation)
    idempotencyKey: text('idempotency_key').unique(),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }), // Created order if completed

    // Expiration for stock release
    expiresAt: integer('expires_at', { mode: 'timestamp' }),

    // Attribution
    landingPageId: integer('landing_page_id'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_checkout_sessions_store').on(table.storeId),
    index('idx_checkout_sessions_status').on(table.storeId, table.status),
    index('idx_checkout_sessions_expires').on(table.expiresAt),
  ]
);

export const checkoutSessionsRelations = relations(checkoutSessions, ({ one }) => ({
  store: one(stores, {
    fields: [checkoutSessions.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [checkoutSessions.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [checkoutSessions.orderId],
    references: [orders.id],
  }),
}));

export type CheckoutSession = typeof checkoutSessions.$inferSelect;
export type NewCheckoutSession = typeof checkoutSessions.$inferInsert;

// ============================================================================
// WEBHOOK EVENTS TABLE - Idempotent Webhook Processing (P0 Critical)
// ============================================================================
// Prevents duplicate processing of webhooks from Stripe, bKash, couriers, etc.
export const webhookEvents = sqliteTable(
  'webhook_events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(), // 'stripe', 'bkash', 'steadfast', 'pathao', 'redx'
    eventId: text('event_id').notNull(), // Provider's unique event ID
    eventType: text('event_type'), // e.g., 'payment_intent.succeeded'
    payloadJson: text('payload_json'), // Full webhook payload for debugging
    status: text('status').$type<'processed' | 'failed' | 'skipped'>().default('processed'),
    processedAt: integer('processed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [index('idx_webhook_events_store').on(table.storeId, table.createdAt)]
);

export const webhookEventsRelations = relations(webhookEvents, ({ one }) => ({
  store: one(stores, {
    fields: [webhookEvents.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// SHOP DOMAINS TABLE - Multi-domain support per store
// ============================================================================
export const shopDomains = sqliteTable(
  'shop_domains',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    domain: text('domain').notNull().unique(),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
    sslStatus: text('ssl_status')
      .$type<'pending' | 'provisioning' | 'active' | 'failed'>()
      .default('pending'),
    verifiedAt: integer('verified_at', { mode: 'timestamp' }),
    dnsVerified: integer('dns_verified', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_shop_domains_store').on(table.storeId),
    index('idx_shop_domains_domain').on(table.domain),
  ]
);

export const shopDomainsRelations = relations(shopDomains, ({ one }) => ({
  store: one(stores, {
    fields: [shopDomains.storeId],
    references: [stores.id],
  }),
}));

export type ShopDomain = typeof shopDomains.$inferSelect;
export type NewShopDomain = typeof shopDomains.$inferInsert;

// ============================================================================
// LOCATIONS TABLE - Multi-warehouse inventory management
// ============================================================================
export const locations = sqliteTable(
  'locations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code'), // Short code like "DHK-1"
    address: text('address'),
    city: text('city'),
    district: text('district'),
    phone: text('phone'),
    isDefault: integer('is_default', { mode: 'boolean' }).default(false),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    fulfillmentPriority: integer('fulfillment_priority').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_locations_store').on(table.storeId),
    index('idx_locations_active').on(table.storeId, table.isActive),
  ]
);

export const locationsRelations = relations(locations, ({ one, many }) => ({
  store: one(stores, {
    fields: [locations.storeId],
    references: [stores.id],
  }),
  inventory: many(locationInventory),
}));

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

// ============================================================================
// LOCATION INVENTORY TABLE - Per-location stock levels
// ============================================================================
export const locationInventory = sqliteTable(
  'location_inventory',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    locationId: integer('location_id')
      .notNull()
      .references(() => locations.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity').notNull().default(0),
    reorderPoint: integer('reorder_point').default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_location_inventory_location').on(table.locationId),
    index('idx_location_inventory_product').on(table.productId),
    index('idx_location_inventory_variant').on(table.variantId),
  ]
);

export const locationInventoryRelations = relations(locationInventory, ({ one }) => ({
  location: one(locations, {
    fields: [locationInventory.locationId],
    references: [locations.id],
  }),
  product: one(products, {
    fields: [locationInventory.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [locationInventory.variantId],
    references: [productVariants.id],
  }),
}));

export type LocationInventory = typeof locationInventory.$inferSelect;
export type NewLocationInventory = typeof locationInventory.$inferInsert;

// ============================================================================
// MVP THEME SETTINGS TABLE - Simple theme configuration for MVP
// ============================================================================
// This is a simplified theme configuration system for MVP launch.
// Instead of complex Shopify OS 2.0 sections, we store just 5 customizable
// settings as JSON: storeName, logo, primaryColor, accentColor, announcementText
//
// @see AGENTS.md - MVP Simple Theme System section
// ============================================================================
export const storeMvpSettings = sqliteTable(
  'store_mvp_settings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    themeId: text('theme_id').notNull().default('starter-store'), // Active theme template ID
    settingsJson: text('settings_json').notNull(), // JSON: { storeName, logo, primaryColor, accentColor, announcementText, showAnnouncement, favicon }
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_mvp_settings_store').on(table.storeId),
    index('idx_mvp_settings_theme').on(table.storeId, table.themeId),
  ]
);

export const storeMvpSettingsRelations = relations(storeMvpSettings, ({ one }) => ({
  store: one(stores, {
    fields: [storeMvpSettings.storeId],
    references: [stores.id],
  }),
}));

export type StoreMvpSettings = typeof storeMvpSettings.$inferSelect;
export type NewStoreMvpSettings = typeof storeMvpSettings.$inferInsert;

// ============================================================================
// UNIFIED STOREFRONT SETTINGS ARCHIVE TABLE
// Archives legacy settings snapshots for rollback and audit
// ============================================================================
export const storeSettingsArchives = sqliteTable(
  'store_settings_archives',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    source: text('source').notNull(), // 'theme_config', 'mvp_settings', 'social_links', 'business_info', 'legacy_columns'
    snapshotJson: text('snapshot_json').notNull(), // JSON snapshot of settings at archive time
    schemaVersion: integer('schema_version').notNull().default(1), // Canonical schema version
    releaseTag: text('release_tag').notNull(), // e.g., 'v2.0', 'v2.1' for rollback reference
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_settings_archives_store').on(table.storeId),
    index('idx_settings_archives_source').on(table.storeId, table.source),
  ]
);

export const storeSettingsArchivesRelations = relations(storeSettingsArchives, ({ one }) => ({
  store: one(stores, {
    fields: [storeSettingsArchives.storeId],
    references: [stores.id],
  }),
}));

export type StoreSettingsArchive = typeof storeSettingsArchives.$inferSelect;
export type NewStoreSettingsArchive = typeof storeSettingsArchives.$inferInsert;

// ============================================================================
// CREDIT PURCHASES TABLE - Manual bKash Payment for AI Credits
// ============================================================================
// Merchants submit bKash transaction IDs, Super Admin reviews and approves credits
export const creditPurchases = sqliteTable(
  'credit_purchases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Package info
    packageId: text('package_id').notNull(), // 'starter', 'pro', 'business'
    credits: integer('credits').notNull(),
    amount: integer('amount').notNull(), // Amount in BDT (taka)

    // Payment info (bKash)
    transactionId: text('transaction_id'), // bKash Transaction ID
    phone: text('phone'), // bKash phone number

    // Approval status
    status: text('status').$type<'pending' | 'approved' | 'rejected'>().default('pending'),
    adminNotes: text('admin_notes'), // Reason for rejection or notes
    reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_credit_purchases_store').on(table.storeId),
    index('idx_credit_purchases_status').on(table.status),
    index('idx_credit_purchases_created').on(table.createdAt),
  ]
);

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  store: one(stores, {
    fields: [creditPurchases.storeId],
    references: [stores.id],
  }),
  reviewer: one(users, {
    fields: [creditPurchases.reviewedBy],
    references: [users.id],
  }),
}));

export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type NewCreditPurchase = typeof creditPurchases.$inferInsert;

// ============================================================================
// LEAD SUBMISSIONS TABLE - Lead Generation System
// ============================================================================
export const leadSubmissions = sqliteTable(
  'lead_submissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    // Contact Information
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    company: text('company'),

    // Form Data (flexible JSON for custom fields)
    formData: text('form_data'), // JSON: { message, budget, service_interest, etc. }

    // Metadata
    source: text('source').default('contact_form'), // 'contact_form', 'popup', 'footer', 'chat'
    formId: text('form_id').notNull(), // Which form was submitted
    pageUrl: text('page_url'), // URL where form was submitted

    // Status Tracking
    status: text('status')
      .$type<'new' | 'contacted' | 'qualified' | 'converted' | 'lost'>()
      .default('new'),
    assignedTo: integer('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    notes: text('notes'), // Merchant's private notes

    // Marketing Attribution
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    referrer: text('referrer'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // AI Enrichment (optional)
    aiScore: real('ai_score'), // Lead quality score (0-1)
    aiInsights: text('ai_insights'), // JSON: { intent, budget_estimate, urgency }

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    contactedAt: integer('contacted_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_lead_submissions_store').on(table.storeId),
    index('idx_lead_submissions_status').on(table.storeId, table.status),
    index('idx_lead_submissions_created').on(table.storeId, table.createdAt),
    index('idx_lead_submissions_email').on(table.email),
    index('idx_lead_submissions_phone').on(table.phone),
    index('idx_lead_submissions_source').on(table.storeId, table.source),
  ]
);

// Relations
export const leadSubmissionsRelations = relations(leadSubmissions, ({ one }) => ({
  store: one(stores, {
    fields: [leadSubmissions.storeId],
    references: [stores.id],
  }),
  assignedUser: one(users, {
    fields: [leadSubmissions.assignedTo],
    references: [users.id],
  }),
}));

// Type Exports
export type LeadSubmission = typeof leadSubmissions.$inferSelect;
export type NewLeadSubmission = typeof leadSubmissions.$inferInsert;

// ============================================================================
// STUDENT DOCUMENTS TABLE - Student portal uploads
// ============================================================================
export const studentDocuments = sqliteTable(
  'student_documents',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    fileUrl: text('file_url').notNull(),
    fileKey: text('file_key').notNull(),
    fileName: text('file_name').notNull(),
    fileType: text('file_type').notNull(),
    fileSize: integer('file_size').notNull(),
    documentType: text('document_type').default('other'),
    status: text('status')
      .$type<'uploaded' | 'reviewed' | 'approved' | 'rejected'>()
      .default('uploaded'),
    notes: text('notes'),
    reviewedBy: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_student_documents_store').on(table.storeId),
    index('idx_student_documents_customer').on(table.customerId),
    index('idx_student_documents_type').on(table.storeId, table.documentType),
    index('idx_student_documents_status').on(table.storeId, table.status),
    index('idx_student_documents_created').on(table.storeId, table.createdAt),
  ]
);

export const studentDocumentsRelations = relations(studentDocuments, ({ one }) => ({
  store: one(stores, {
    fields: [studentDocuments.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [studentDocuments.customerId],
    references: [customers.id],
  }),
  reviewer: one(users, {
    fields: [studentDocuments.reviewedBy],
    references: [users.id],
  }),
}));

export type StudentDocument = typeof studentDocuments.$inferSelect;
export type NewStudentDocument = typeof studentDocuments.$inferInsert;

// ============================================================================
// SUPPORT TICKETS TABLE
// ============================================================================
export const supportTickets = sqliteTable(
  'support_tickets',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id').notNull(),
    userId: integer('user_id').notNull(),

    // Ticket details
    subject: text('subject').notNull(),
    description: text('description').notNull(),
    category: text('category')
      .$type<'billing' | 'technical' | 'account' | 'feature' | 'other'>()
      .default('other'),
    priority: text('priority').$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium'),

    // Status tracking
    status: text('status')
      .$type<'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'>()
      .default('open'),

    // Admin response
    assignedTo: integer('assigned_to'),
    adminResponse: text('admin_response'),
    resolvedAt: integer('resolved_at', { mode: 'timestamp' }),

    // Metadata
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('idx_support_tickets_store').on(table.storeId),
    index('idx_support_tickets_status').on(table.status),
    index('idx_support_tickets_priority').on(table.priority),
  ]
);

// Support Tickets Relations
export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  store: one(stores, {
    fields: [supportTickets.storeId],
    references: [stores.id],
  }),
  assignedUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
  }),
}));

// Type Exports
export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;

// ============================================================================
// LEAD GEN TABLES - Forms and Submissions
// ============================================================================
export const leadGenForms = sqliteTable(
  'lead_gen_forms',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    fields: text('fields').default('[]'), // JSON array of field definitions
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('lead_gen_forms_store_id_idx').on(table.storeId),
    index('lead_gen_forms_slug_idx').on(table.storeId, table.slug),
  ]
);

export const leadGenSubmissions = sqliteTable(
  'lead_gen_submissions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    formId: integer('form_id')
      .notNull()
      .references(() => leadGenForms.id, { onDelete: 'cascade' }),
    customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    data: text('data').notNull(), // JSON submission data
    status: text('status')
      .$type<'pending' | 'in_review' | 'approved' | 'rejected' | 'completed'>()
      .default('pending'),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('lead_gen_submissions_form_id_idx').on(table.formId),
    index('lead_gen_submissions_customer_id_idx').on(table.customerId),
  ]
);

export const leadGenFormsRelations = relations(leadGenForms, ({ one, many }) => ({
  store: one(stores, {
    fields: [leadGenForms.storeId],
    references: [stores.id],
  }),
  submissions: many(leadGenSubmissions),
}));

export const leadGenSubmissionsRelations = relations(leadGenSubmissions, ({ one }) => ({
  form: one(leadGenForms, {
    fields: [leadGenSubmissions.formId],
    references: [leadGenForms.id],
  }),
  customer: one(customers, {
    fields: [leadGenSubmissions.customerId],
    references: [customers.id],
  }),
}));
