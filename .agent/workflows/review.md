---
description: Code review workflow for Ozzyl
---

# Code Review Workflow

## Prerequisites

- **Design**: Review `.agent/skills/web-design-guidelines/SKILL.md`
- **Database**: Review `.agent/skills/database-design/SKILL.md`
- **Backend**: Review `.agent/skills/hono/SKILL.md`

## Pre-Review Checklist

Before reviewing, ensure:

- [ ] Code compiles: `npm run typecheck`
- [ ] Tests pass: `npm run test`
- [ ] Lint clean: `npm run lint`

## Review Categories

### 🔒 Security (Critical)

- [ ] **Multi-tenancy**: All DB queries filtered by `storeId`
- [ ] **Input Validation**: Zod schemas for all user input
- [ ] **SQL Injection**: Using parameterized queries (Drizzle ORM)
- [ ] **Auth**: Protected routes have auth checks
- [ ] **Authz**: User can only access their own resources
- [ ] **Secrets**: No API keys in code (use env vars)
- [ ] **Error Messages**: Don't leak internal details

### 📝 Code Quality

- [ ] **Types**: No `any` types, explicit return types
- [ ] **Error Handling**: Proper try/catch with user-friendly errors
- [ ] **DRY**: No duplicate code, extract shared logic
- [ ] **Naming**: Clear, descriptive variable/function names
- [ ] **Comments**: Complex logic explained
- [ ] **File Size**: Files under 300 lines (split if larger)

### 🏗️ Architecture

- [ ] **Patterns**: Follows existing project patterns
- [ ] **Separation**: Business logic in services, not routes
- [ ] **Remix Patterns**: Using loader/action, not useEffect for data
- [ ] **Edge Compatibility**: Code works on Cloudflare Workers

### 🧪 Testing

- [ ] **Coverage**: New code has tests
- [ ] **Happy Path**: Normal use case tested
- [ ] **Error Cases**: Error handling tested
- [ ] **Edge Cases**: Boundary conditions tested

### ⚡ Performance

- [ ] **N+1 Queries**: Batched/joined queries used
- [ ] **Caching**: KV cache for hot data
- [ ] **Bundle Size**: No unnecessary imports
- [ ] **Streaming**: Using `defer()` for non-critical data

## Review Output Format

```markdown
## 🔍 Code Review Summary

### Files Reviewed

- `path/to/file1.ts`
- `path/to/file2.tsx`

### 🔴 Critical Issues (Must Fix)

1. **[Security]** Missing storeId filter in query
   - File: `routes/api.products.ts:45`
   - Fix: Add `.where(eq(products.storeId, storeId))`

### 🟡 Warnings (Should Fix)

1. **[Types]** Using `any` type
   - File: `services/order.ts:23`
   - Fix: Define proper interface

### 🟢 Suggestions (Nice to Have)

1. **[Performance]** Could use `defer()` for reviews
   - File: `routes/products.$id.tsx:15`

### ✅ What's Good

- Proper Zod validation
- Good error handling
- Clean component structure

### 📊 Overall Assessment

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] ⚠️ **NEEDS WORK** - Fix critical/warnings first
- [ ] ❌ **BLOCKED** - Major issues found
```

## Quick Review Commands

```bash
cd apps/web

# Check types
npm run typecheck

# Check lint
npm run lint

# Run tests
npm run test

# Full check
npm run test:all
```
