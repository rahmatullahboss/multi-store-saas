/**
 * Multi-tenant E-commerce Database Schema
 * 
 * All tables include store_id for data isolation between tenants.
 * This ensures each store can only access their own data.
 */

import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// STORES TABLE - Core tenant table
// ============================================================================
export const stores = sqliteTable('stores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  customDomain: text('custom_domain').unique(),
  planType: text('plan_type').$type<'free' | 'starter' | 'pro' | 'enterprise'>().default('free'),
  logo: text('logo'),
  theme: text('theme').default('default'),
  currency: text('currency').default('USD'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

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
  customerEmail: text('customer_email').notNull(),
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
  title: text('title').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  total: real('total').notNull(),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
]);

// ============================================================================
// RELATIONS - Drizzle ORM relations for type-safe queries
// ============================================================================
export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  customers: many(customers),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  orderItems: many(orderItems),
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
}));

// ============================================================================
// TYPE EXPORTS - For use throughout the application
// ============================================================================
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
