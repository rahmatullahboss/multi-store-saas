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
  planType: text('plan_type').$type<'free' | 'starter' | 'premium' | 'custom'>().default('free'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'past_due' | 'canceled'>().default('active'),
  usageLimits: text('usage_limits'), // JSON: { max_products, max_orders, allow_store_mode, fee_rate }
  
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
  
  // === NOTIFICATION SETTINGS ===
  notificationEmail: text('notification_email'), // Override email for alerts
  emailNotificationsEnabled: integer('email_notifications_enabled', { mode: 'boolean' }).default(true),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
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
  storeId: integer('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  role: text('role').$type<'admin' | 'merchant' | 'staff'>().default('merchant'),
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
  status: text('status').$type<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>().default('pending'),
  paymentStatus: text('payment_status').$type<'pending' | 'paid' | 'failed' | 'refunded'>().default('pending'),
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
