import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const visitors = sqliteTable('visitors', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const visitorMessages = sqliteTable('visitor_messages', {
  id: integer('id').primaryKey(),
  visitorId: integer('visitor_id').references(() => visitors.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
