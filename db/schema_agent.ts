import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { stores } from './schema';

// ============================================================================
// AGENTS TABLE - AI Agents configuration per store
// ============================================================================
export const agents = sqliteTable('agents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Sales Assistant"
  type: text('type').$type<'ecommerce' | 'support' | 'sales'>().default('ecommerce'),
  
  // Platform Configuration (WhatsApp, Messenger)
  platformConfig: text('platform_config'), // JSON: { whatsapp_phone_id, whatsapp_token, fb_page_id }
  
  // Agent Persona & Behavior
  agentSettings: text('agent_settings'), // JSON: { tone, greeting, primary_color, working_hours }
  
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('agents_store_id_idx').on(table.storeId),
]);

export const agentsRelations = relations(agents, ({ one, many }) => ({
  store: one(stores, {
    fields: [agents.storeId],
    references: [stores.id],
  }),
  conversations: many(conversations),
  knowledgeSources: many(knowledgeSources),
  faqs: many(faqs),
}));

// ============================================================================
// CONVERSATIONS TABLE - Chat sessions
// ============================================================================
export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  
  // Customer Identity
  customerPhone: text('customer_phone'), // WhatsApp
  customerFbId: text('customer_fb_id'), // Messenger PSID
  sessionId: text('session_id'), // Web Widget Session
  customerName: text('customer_name'),
  
  status: text('status').$type<'active' | 'archived' | 'blocked'>().default('active'),
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('conversations_agent_id_idx').on(table.agentId),
  index('conversations_phone_idx').on(table.customerPhone),
  index('conversations_session_idx').on(table.sessionId),
]);

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
  leadsData: many(leadsData),
}));

// ============================================================================
// MESSAGES TABLE - Chat history
// ============================================================================
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  
  role: text('role').$type<'user' | 'assistant' | 'system'>().notNull(),
  content: text('content').notNull(),
  
  // Metadata for function calls or rich messages
  metadata: text('metadata'), // JSON
  
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('messages_conversation_id_idx').on(table.conversationId),
]);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// ============================================================================
// LEADS DATA TABLE - Extracted info (Budget, Location, etc.)
// ============================================================================
export const leadsData = sqliteTable('leads_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  
  key: text('key').notNull(), // e.g., "customer_budget"
  value: text('value'), // e.g., "5000"
  
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('leads_data_conversation_id_idx').on(table.conversationId),
]);

export const leadsDataRelations = relations(leadsData, ({ one }) => ({
  conversation: one(conversations, {
    fields: [leadsData.conversationId],
    references: [conversations.id],
  }),
}));

// ============================================================================
// KNOWLEDGE SOURCES TABLE - RAG Documents
// ============================================================================
export const knowledgeSources = sqliteTable('knowledge_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  
  name: text('name').notNull(),
  type: text('type').$type<'text' | 'file' | 'url' | 'product_sync'>().notNull(),
  content: text('content'), // Raw text or URL
  
  // Vectorize Status
  status: text('status').$type<'pending' | 'processing' | 'indexed' | 'failed'>().default('pending'),
  vectorId: text('vector_id'), // ID in Cloudflare Vectorize
  
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('knowledge_sources_agent_id_idx').on(table.agentId),
]);

export const knowledgeSourcesRelations = relations(knowledgeSources, ({ one }) => ({
  agent: one(agents, {
    fields: [knowledgeSources.agentId],
    references: [agents.id],
  }),
}));

// ============================================================================
// FAQS TABLE - Simple Q&A
// ============================================================================
export const faqs = sqliteTable('faqs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('faqs_agent_id_idx').on(table.agentId),
]);

export const faqsRelations = relations(faqs, ({ one }) => ({
  agent: one(agents, {
    fields: [faqs.agentId],
    references: [agents.id],
  }),
}));
