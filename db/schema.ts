/**
 * Multi-tenant E-commerce Database Schema
 * 
 * All tables include store_id for data isolation between tenants.
 * This ensures each store can only access their own data.
 */

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

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
  customDomainStatus: text('custom_domain_status').$type<'none' | 'pending' | 'approved' | 'rejected'>().default('none'),
  customDomainRequestedAt: integer('custom_domain_requested_at', { mode: 'timestamp' }),
  // Cloudflare for SaaS Integration
  cloudflareHostnameId: text('cloudflare_hostname_id'), // Cloudflare custom hostname ID
  sslStatus: text('ssl_status').$type<'pending' | 'active' | 'failed'>().default('pending'), // SSL certificate status
  dnsVerified: integer('dns_verified', { mode: 'boolean' }).default(false), // DNS verification status
  planType: text('plan_type').$type<'free' | 'starter' | 'premium' | 'business' | 'custom'>().default('free'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'past_due' | 'canceled'>().default('active'),
  usageLimits: text('usage_limits'), // JSON: { max_products, max_orders, allow_store_mode, fee_rate }
  
  // === ONBOARDING TRACKING ===
  onboardingStatus: text('onboarding_status').$type<'pending_plan' | 'pending_info' | 'completed'>().default('pending_plan'),
  setupStep: integer('setup_step').default(0), // Current step in onboarding wizard
  
  // === HYBRID MODE FIELDS ===
  // 'landing' = Single product sales page, 'store' = Full e-commerce
  mode: text('mode').$type<'landing' | 'store'>().default('store'),
  // Featured product for landing mode (direct checkout)
  featuredProductId: integer('featured_product_id'),
  // Landing page config: { headline, subheadline, videoUrl, ctaText, testimonials }
  landingConfig: text('landing_config'),
  // Full store theme: { primaryColor, accentColor, bannerUrl, collections[] }
  themeConfig: text('theme_config'),
  // Business info: { phone, email, address, city, country }
  businessInfo: text('business_info'),
  
  // === BRANDING ===
  logo: text('logo'),
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
  
  // === NOTIFICATION SETTINGS ===
  notificationEmail: text('notification_email'), // Override email for alerts
  emailNotificationsEnabled: integer('email_notifications_enabled', { mode: 'boolean' }).default(true),
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
  
  // === AI CHATBOT SETTINGS ===
  isCustomerAiEnabled: integer('is_customer_ai_enabled', { mode: 'boolean' }).default(false), // Paid add-on
  aiBotPersona: text('ai_bot_persona'), // Custom AI personality e.g., "You are a friendly fashion expert"
  // AI Agent Activation Request System
  aiAgentRequestStatus: text('ai_agent_request_status').$type<'none' | 'pending' | 'approved' | 'rejected'>().default('none'),
  aiAgentRequestedAt: integer('ai_agent_requested_at', { mode: 'timestamp' }),
  
  // === SUBSCRIPTION PAYMENT TRACKING (bKash Manual Verification) ===
  paymentTransactionId: text('payment_transaction_id'), // bKash TRX ID
  paymentStatus: text('payment_status').$type<'pending_verification' | 'verified' | 'rejected' | 'none'>().default('none'),
  paymentSubmittedAt: integer('payment_submitted_at', { mode: 'timestamp' }),
  paymentAmount: real('payment_amount'), // Amount paid in BDT
  paymentPhone: text('payment_phone'), // Phone number used for payment
  
  // === SUBSCRIPTION BILLING (Super Admin Manual Approval) ===
  subscriptionPaymentMethod: text('subscription_payment_method').$type<'stripe' | 'manual'>(),
  subscriptionStartDate: integer('subscription_start_date', { mode: 'timestamp' }),
  subscriptionEndDate: integer('subscription_end_date', { mode: 'timestamp' }),
  adminNote: text('admin_note'), // Super Admin notes for the subscription
  
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete timestamp (null = not deleted)
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// USERS TABLE - Merchant authentication
// ============================================================================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  phone: text('phone'), // Merchant mobile number (BD format: 01XXXXXXXXX)
  storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  role: text('role').$type<'admin' | 'merchant' | 'staff' | 'super_admin'>().default('merchant'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_store_id_idx').on(table.storeId),
]);

// ============================================================================
// PRODUCTS TABLE - Store products with store_id isolation
// ============================================================================
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
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
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('products_store_id_idx').on(table.storeId),
  index('products_category_idx').on(table.storeId, table.category),
]);

// ============================================================================
// CUSTOMERS TABLE - Store customers with store_id isolation
// ============================================================================
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  address: text('address'), // JSON object with address details
  // Fraud check cache
  riskScore: integer('risk_score'), // 0-100 (higher = more risky)
  riskCheckedAt: integer('risk_checked_at', { mode: 'timestamp' }), // Last check time
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('customers_store_id_idx').on(table.storeId),
  index('customers_email_idx').on(table.storeId, table.email),
]);

// ============================================================================
// ORDERS TABLE - Store orders with store_id isolation
// ============================================================================
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  customerId: integer('customer_id').references(() => customers.id),
  orderNumber: text('order_number').notNull(),
  customerEmail: text('customer_email'), // Optional for COD orders
  customerPhone: text('customer_phone'), // Required for COD orders
  customerName: text('customer_name'),
  shippingAddress: text('shipping_address'), // JSON object
  billingAddress: text('billing_address'), // JSON object
  status: text('status').$type<'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>().default('pending'),
  // Payment Information
  paymentStatus: text('payment_status').$type<'pending' | 'paid' | 'failed' | 'refunded'>().default('pending'),
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
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('orders_store_id_idx').on(table.storeId),
  index('orders_customer_id_idx').on(table.customerId),
  index('orders_status_idx').on(table.storeId, table.status),
]);

// ============================================================================
// ORDER ITEMS TABLE - Individual items in an order
// ============================================================================
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  title: text('title').notNull(),
  variantTitle: text('variant_title'), // e.g., "Red / Large"
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  total: real('total').notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
]);

// ============================================================================
// PRODUCT VARIANTS TABLE - Size, color, and other variations
// ============================================================================
export const productVariants = sqliteTable('product_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
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
  // Variant-specific image
  imageUrl: text('image_url'),
  // Status
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('product_variants_product_id_idx').on(table.productId),
]);

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

// ============================================================================
// PAYOUTS TABLE - Track merchant payouts
// ============================================================================
export const payouts = sqliteTable('payouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }).notNull(),
  
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
export const shippingZones = sqliteTable('shipping_zones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Dhaka City", "Outside Dhaka"
  regions: text('regions'), // JSON array of regions/districts
  rate: real('rate').notNull().default(0), // Shipping cost
  freeAbove: real('free_above'), // Free shipping threshold
  estimatedDays: text('estimated_days'), // "2-3 days"
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('shipping_zones_store_id_idx').on(table.storeId),
]);

export const shippingZonesRelations = relations(shippingZones, ({ one }) => ({
  store: one(stores, {
    fields: [shippingZones.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// SHIPMENTS TABLE - Order tracking
// ============================================================================
export const shipments = sqliteTable('shipments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  courier: text('courier'), // "pathao", "redx", "manual"
  trackingNumber: text('tracking_number'),
  status: text('status').$type<'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned'>().default('pending'),
  courierData: text('courier_data'), // JSON response from courier API
  shippedAt: integer('shipped_at', { mode: 'timestamp' }),
  deliveredAt: integer('delivered_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('shipments_order_id_idx').on(table.orderId),
]);

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
}));

// ============================================================================
// DISCOUNTS TABLE - Promo codes and coupons
// ============================================================================
export const discounts = sqliteTable('discounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  type: text('type').$type<'percentage' | 'fixed'>().default('percentage'),
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
}, (table) => [
  index('discounts_store_id_idx').on(table.storeId),
  index('discounts_code_idx').on(table.storeId, table.code),
]);

export const discountsRelations = relations(discounts, ({ one }) => ({
  store: one(stores, {
    fields: [discounts.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// STAFF INVITES TABLE - Team member invitations
// ============================================================================
export const staffInvites = sqliteTable('staff_invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').$type<'admin' | 'staff' | 'viewer'>().default('staff'),
  token: text('token').notNull().unique(),
  invitedBy: integer('invited_by').references(() => users.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('staff_invites_store_id_idx').on(table.storeId),
  index('staff_invites_token_idx').on(table.token),
]);

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
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(), // "product_created", "order_updated", "settings_changed"
  entityType: text('entity_type'), // "product", "order", "settings"
  entityId: integer('entity_id'), // ID of the affected entity
  details: text('details'), // JSON with before/after or additional info
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('activity_logs_store_id_idx').on(table.storeId),
  index('activity_logs_user_id_idx').on(table.userId),
]);

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
export const abandonedCarts = sqliteTable('abandoned_carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
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
}, (table) => [
  index('abandoned_carts_store_id_idx').on(table.storeId),
  index('abandoned_carts_session_idx').on(table.sessionId),
  index('abandoned_carts_status_idx').on(table.storeId, table.status),
]);

export const abandonedCartsRelations = relations(abandonedCarts, ({ one }) => ({
  store: one(stores, {
    fields: [abandonedCarts.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// EMAIL SUBSCRIBERS TABLE - Store email list
// ============================================================================
export const emailSubscribers = sqliteTable('email_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name'),
  status: text('status').$type<'subscribed' | 'unsubscribed'>().default('subscribed'),
  source: text('source'), // 'checkout', 'popup', 'manual', 'import'
  tags: text('tags'), // JSON array of tags for segmentation
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('email_subscribers_store_id_idx').on(table.storeId),
  index('email_subscribers_email_idx').on(table.storeId, table.email),
]);

export const emailSubscribersRelations = relations(emailSubscribers, ({ one }) => ({
  store: one(stores, {
    fields: [emailSubscribers.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// EMAIL CAMPAIGNS TABLE - Marketing campaigns
// ============================================================================
export const emailCampaigns = sqliteTable('email_campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  previewText: text('preview_text'), // Email preview text
  content: text('content').notNull(), // HTML content
  status: text('status').$type<'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'>().default('draft'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  recipientCount: integer('recipient_count').default(0),
  sentCount: integer('sent_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('email_campaigns_store_id_idx').on(table.storeId),
  index('email_campaigns_status_idx').on(table.storeId, table.status),
]);

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
export const savedLandingConfigs = sqliteTable('saved_landing_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id),
  name: text('name').notNull(), // e.g., "Homepage Backup - Jan 2026"
  landingConfig: text('landing_config').notNull(), // Full JSON config
  offerSlug: text('offer_slug'), // Custom slug like "old-home"
  isHomepageBackup: integer('is_homepage_backup', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('saved_landing_configs_store_id_idx').on(table.storeId),
]);

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
// REVIEWS TABLE - Product reviews with moderation (Paid plans only)
// ============================================================================
export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  comment: text('comment'),
  status: text('status').$type<'pending' | 'approved' | 'rejected'>().default('pending'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('reviews_store_product_idx').on(table.storeId, table.productId),
  index('reviews_status_idx').on(table.storeId, table.status),
]);

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
export const saasCoupons = sqliteTable('saas_coupons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // e.g., "START50", "LAUNCH20"
  discountType: text('discount_type').$type<'percentage' | 'fixed'>().notNull(),
  discountAmount: real('discount_amount').notNull(), // 50 for 50% or 500 for ৳500 off
  maxUses: integer('max_uses'), // null = unlimited
  usedCount: integer('used_count').default(0),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('saas_coupons_code_idx').on(table.code),
]);

// ============================================================================
// ORDER BUMPS TABLE - Add-on offers during checkout
// ============================================================================
export const orderBumps = sqliteTable('order_bumps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), // Main product
  bumpProductId: integer('bump_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), // Bump offer
  title: text('title').notNull(), // e.g., "Add Express Shipping"
  description: text('description'), // e.g., "Get your order faster!"
  discount: real('discount').default(0), // Percentage discount on bump product
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  displayOrder: integer('display_order').default(0),
  // Stats
  views: integer('views').default(0),
  conversions: integer('conversions').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('order_bumps_store_product_idx').on(table.storeId, table.productId),
]);

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
export const upsellOffers = sqliteTable('upsell_offers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), // Trigger product
  offerProductId: integer('offer_product_id').notNull().references(() => products.id, { onDelete: 'cascade' }), // Upsell product
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
}, (table) => [
  index('upsell_offers_store_product_idx').on(table.storeId, table.productId),
]);

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
export const upsellTokens = sqliteTable('upsell_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  offerId: integer('offer_id').references(() => upsellOffers.id),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('upsell_tokens_token_idx').on(table.token),
]);

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
export const abTests = sqliteTable('ab_tests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }), // For landing page tests
  name: text('name').notNull(),
  status: text('status').$type<'draft' | 'running' | 'paused' | 'completed'>().default('draft'),
  winningVariantId: integer('winning_variant_id'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('ab_tests_store_idx').on(table.storeId),
  index('ab_tests_status_idx').on(table.storeId, table.status),
]);

export const abTestsRelations = relations(abTests, ({ one, many }) => ({
  store: one(stores, {
    fields: [abTests.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [abTests.productId],
    references: [products.id],
  }),
  variants: many(abTestVariants),
}));

// ============================================================================
// A/B TEST VARIANTS TABLE - Individual test variants
// ============================================================================
export const abTestVariants = sqliteTable('ab_test_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  testId: integer('test_id').notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Control", "Variant A", "Variant B"
  landingConfig: text('landing_config'), // JSON config for this variant
  trafficWeight: integer('traffic_weight').default(50), // Percentage of traffic (0-100)
  // Stats
  visitors: integer('visitors').default(0),
  conversions: integer('conversions').default(0),
  revenue: real('revenue').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('ab_test_variants_test_idx').on(table.testId),
]);

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
export const abTestAssignments = sqliteTable('ab_test_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  testId: integer('test_id').notNull().references(() => abTests.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').notNull().references(() => abTestVariants.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id').notNull(), // Cookie-based visitor ID
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  convertedAt: integer('converted_at', { mode: 'timestamp' }),
  orderAmount: real('order_amount'),
}, (table) => [
  index('ab_test_assignments_visitor_idx').on(table.testId, table.visitorId),
]);

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
export const emailAutomations = sqliteTable('email_automations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  trigger: text('trigger').$type<'order_placed' | 'order_delivered' | 'cart_abandoned' | 'signup'>().notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  // Stats
  totalSent: integer('total_sent').default(0),
  totalOpened: integer('total_opened').default(0),
  totalClicked: integer('total_clicked').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('email_automations_store_idx').on(table.storeId),
]);

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
export const emailAutomationSteps = sqliteTable('email_automation_steps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  automationId: integer('automation_id').notNull().references(() => emailAutomations.id, { onDelete: 'cascade' }),
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
}, (table) => [
  index('email_automation_steps_automation_idx').on(table.automationId),
]);

export const emailAutomationStepsRelations = relations(emailAutomationSteps, ({ one }) => ({
  automation: one(emailAutomations, {
    fields: [emailAutomationSteps.automationId],
    references: [emailAutomations.id],
  }),
}));

// ============================================================================
// EMAIL QUEUE TABLE - Scheduled emails to be sent
// ============================================================================
export const emailQueue = sqliteTable('email_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
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
}, (table) => [
  index('email_queue_scheduled_idx').on(table.scheduledAt, table.status),
  index('email_queue_store_idx').on(table.storeId),
]);

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
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  path: text('path').notNull(), // Page path visited
  visitorId: text('visitor_id').notNull(), // Cookie-based anonymous ID
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'), // Where visitor came from
  country: text('country'), // From IP geolocation
  city: text('city'),
  deviceType: text('device_type').$type<'mobile' | 'desktop' | 'tablet'>(), // Parsed from user-agent
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('page_views_store_idx').on(table.storeId),
  index('page_views_date_idx').on(table.storeId, table.createdAt),
  index('page_views_visitor_idx').on(table.storeId, table.visitorId),
]);

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  store: one(stores, {
    fields: [pageViews.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// ADMIN AUDIT LOGS TABLE - Track all Super Admin actions
// ============================================================================
export const adminAuditLogs = sqliteTable('admin_audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  adminId: integer('admin_id').notNull().references(() => users.id),
  action: text('action').notNull().$type<
    | 'store_suspend' 
    | 'store_unsuspend' 
    | 'store_delete' 
    | 'store_restore'
    | 'store_impersonate'
    | 'payment_approve'
    | 'payment_reject'
    | 'domain_approve'
    | 'domain_reject'
    | 'ai_approve'
    | 'ai_reject'
    | 'coupon_create'
    | 'coupon_delete'
    | 'broadcast_send'
    | 'plan_change'
    | 'bulk_action'
    | 'other'
  >(),
  targetType: text('target_type').$type<'store' | 'user' | 'payment' | 'domain' | 'coupon' | 'broadcast' | 'other'>(),
  targetId: integer('target_id'), // Store ID, User ID, etc.
  targetName: text('target_name'), // Store name, user email, etc.
  details: text('details'), // JSON with additional context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('audit_logs_admin_idx').on(table.adminId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_target_idx').on(table.targetType, table.targetId),
  index('audit_logs_date_idx').on(table.createdAt),
]);

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminId],
    references: [users.id],
  }),
}));

// ============================================================================
// ADMIN ROLES TABLE - Role-Based Access Control for Admin Team
// ============================================================================
export const adminRoles = sqliteTable('admin_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().$type<'super_admin' | 'support' | 'finance' | 'developer'>(),
  permissions: text('permissions'), // JSON: { canSuspend, canDelete, canBilling, canImpersonate }
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('admin_roles_user_idx').on(table.userId),
]);

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
export const storeTags = sqliteTable('store_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(), // VIP, Problematic, HighValue, Churning, etc.
  note: text('note'), // Admin note about this tag
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('store_tags_store_idx').on(table.storeId),
  index('store_tags_tag_idx').on(table.tag),
]);

// ============================================================================
// MARKETING LEADS TABLE - Platform-level email collection (homepage)
// ============================================================================
export const marketingLeads = sqliteTable('marketing_leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  source: text('source').default('homepage'), // 'homepage', 'pricing', 'footer'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('marketing_leads_email_idx').on(table.email),
]);

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

// ============================================================================
// PAYMENTS TABLE - Historical Subscription Records
// ============================================================================
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id),
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
