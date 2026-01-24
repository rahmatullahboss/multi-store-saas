# Findings: Turborepo Migration TypeScript Errors

## Root Cause Analysis

### 1. Session Type Access Pattern Issue
- **Problem**: `getSession()` returns Remix `Session<SessionData, SessionFlashData>` object
- **Wrong**: `session.storeId` (accessing property directly)
- **Correct**: `session.get('storeId')` (using Session API)
- **Files Affected**: 35+ occurrences across API routes and server files
- **SessionData type** (from `auth.server.ts`):
  ```typescript
  type SessionData = {
    userId: number;
    storeId: number;
    originalAdminId?: number;
  };
  ```

### 2. Drizzle ORM Query Chaining Issue
- **Problem**: Calling `.where()` on already-assigned query variable
- **Wrong**:
  ```typescript
  let query = db.select().from(customers).where(eq(customers.storeId, storeId));
  query.where(and(...)); // Error: .where() doesn't exist on result type
  ```
- **Correct**: Use `$dynamic()` or build conditions array first
  ```typescript
  const conditions = [eq(customers.storeId, storeId)];
  if (search) conditions.push(like(customers.name, searchLower));
  const results = await db.select().from(customers).where(and(...conditions));
  ```

### 3. Component Prop Type Mismatches
- **realData undefined**: Missing null check before access
- **editor prop**: Component doesn't accept this prop
- **ThemeConfig | null**: Cannot assign to `Record<string, unknown>`
- **Invalid CSS properties**: `ringColor`, `focusRing` not valid React CSS

### 4. Unknown Type Issues
- **body parsing**: `request.json()` returns `unknown`
- **unknown[]**: Cannot assign to `Record<string, unknown>[]`

## Decisions
- Fix Session access pattern consistently across all files
- Use Drizzle's recommended dynamic query pattern
- Add proper null checks and type guards
- Use `as` assertions only where type is certain

## Context7 References Used
- Turborepo: `/websites/turborepo` - workspace package references
- Drizzle ORM: `/drizzle-team/drizzle-orm-docs` - type-safe queries with where clauses
