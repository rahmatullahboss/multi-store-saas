---
name: "multi-tenant-check"
description: "Verify tenant isolation and prevent data leakage"
when_to_use: "Before deploying any API endpoint or DB query"
allowed-tools: ["Read", "Write", "Grep", "Bash"]
---

# Tenant Isolation Check Process

## Step 1: Search for Vulnerabilities

1. Run `scripts/scan-leaks.sh` to find potentially dangerous patterns.
2. Look for `req.params` usage without `storeId` validation.

## Step 2: Check Every Query

1. Verify all `where` clauses include `storeId`.
   - Good: `.where(and(eq(products.storeId, currentStoreId), ...))`
   - Bad: `.where(eq(products.id, params.id))` (Leakage risk!)

## Step 3: Test Access Control

1. Attempt to access Store B resource with Store A token.
2. Expect `403 Forbidden` or `404 Not Found`.

## Step 4: Check Cache Keys

- Good: `cache.get("store:${storeId}:products")`
- Bad: `cache.get("products")` (Shared cache risk!)
