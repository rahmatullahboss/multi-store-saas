# Support Ticket System Implementation Plan

## Overview
Add a support ticket system that allows:
- Merchants to create and view support tickets from their dashboard
- Super admins to manage (view, reply, resolve) tickets from admin panel

---

## Phase 1: Database Schema

### New Table: `support_tickets`
**File**: `packages/database/src/schema.ts`

```typescript
export const supportTickets = sqliteTable('support_tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  storeId: integer('store_id').notNull(),
  userId: integer('user_id').notNull(),
  
  // Ticket details
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  category: text('category').$type<'billing' | 'technical' | 'account' | 'feature' | 'other'>().default('other'),
  priority: text('priority').$type<'low' | 'medium' | 'high' | 'urgent'>().default('medium'),
  
  // Status tracking
  status: text('status').$type<'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'>().default('open'),
  
  // Admin response
  assignedTo: integer('assigned_to'), // admin user_id
  adminResponse: text('admin_response'),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  
  // Metadata
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_support_tickets_store').on(table.storeId),
  index('idx_support_tickets_status').on(table.status),
  index('idx_support_tickets_priority').on(table.priority),
]);
```

### Migration
**File**: `apps/web/migrations/0009_support_tickets.sql`

---

## Phase 2: Merchant Dashboard

### 2.1 Add Sidebar Navigation
**File**: `apps/web/app/routes/app.tsx`

Add "Support" option in the sidebar navigation (similar to Leads).

### 2.2 Create Ticket List Page
**File**: `apps/web/app/routes/app.support._index.tsx`

Features:
- List all tickets with status filters
- Create new ticket button
- View ticket details
- Status badges (open, in_progress, resolved, closed)

### 2.3 Create New Ticket Page
**File**: `apps/web/app/routes/app.support.new.tsx`

Form fields:
- Subject (required)
- Category dropdown (billing, technical, account, feature, other)
- Priority (low, medium, high, urgent)
- Description (textarea)

### 2.4 Ticket Detail Page
**File**: `apps/web/app/routes/app.support.$id.tsx`

View ticket and admin responses.

---

## Phase 3: Super Admin Panel

### 3.1 Add Tickets Tab in Admin
**File**: `apps/web/app/routes/admin.tsx`

Add navigation to `/admin/tickets`

### 3.2 Admin Ticket Management Page
**File**: `apps/web/app/routes/admin.tickets.tsx`

Features:
- List all tickets from all stores
- Filter by status, priority, store
- Assign to self
- Add admin response
- Change status (resolve, close)
- Link to store details

---

## Phase 4: API Routes

### 4.1 Create Ticket
**File**: `apps/web/app/routes/api.tickets.ts` (or inline in action)

### 4.2 Update Ticket (Merchant)
- Add more details to ticket

### 4.3 Admin Update Ticket
- Add response
- Change status
- Assign

---

## File Structure Summary

```
apps/web/app/routes/
├── app.support._index.tsx      # Ticket list (merchant)
├── app.support.new.tsx         # Create ticket (merchant)
├── app.support.$id.tsx         # View ticket (merchant)
├── admin.tickets.tsx           # Admin ticket management
└── api.tickets.ts             # Ticket API (if needed)
```

---

## Implementation Order

1. Add schema to `packages/database/src/schema.ts`
2. Create migration file
3. Create merchant routes (app.support.*)
4. Add sidebar navigation
5. Create admin route (admin.tickets.tsx)
6. Add admin navigation
7. Test end-to-end
