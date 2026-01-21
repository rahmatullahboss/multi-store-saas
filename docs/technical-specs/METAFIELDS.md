## Implementation Status: COMPLETED ✅

**Files:**
- `db/schema_metafields.ts` - Drizzle schema + types
- `db/migrations/0006_add_metafields.sql` - Migration
- `app/routes/api.metafield-definitions.ts` - Definitions API
- `app/routes/api.metafields.ts` - Values API
- `app/routes/app.settings.metafields.tsx` - Admin UI
- `app/lib/metafields.server.ts` - Server utilities

**Features:**
- 14+ metafield types (Shopify-aligned)
- Metafield definitions (templates)
- Admin UI for management
- Server utilities for hydration
- Section binding support

---

# Metafields Technical Specification

## Overview
Universal custom fields for products, collections, stores (like Shopify metafields).
Enables merchants to add custom data without code changes.

## Metafield Types (Shopify-aligned)
```typescript
// Single value types
type MetafieldType =
  | 'single_line_text_field'   // Short text
  | 'multi_line_text_field'    // Long text
  | 'rich_text_field'          // HTML content
  | 'number_integer'           // Whole number
  | 'number_decimal'           // Decimal number
  | 'boolean'                  // True/false
  | 'date'                     // Date only
  | 'date_time'                // Date + time
  | 'url'                      // URL link
  | 'color'                    // Hex color
  | 'json'                     // Raw JSON
  | 'file_reference'           // File/image URL
  | 'product_reference'        // Product ID
  | 'collection_reference'     // Collection ID
  // List types (arrays)
  | 'list.single_line_text_field'
  | 'list.number_integer'
  | 'list.product_reference'
  | 'list.file_reference';
```

## Database Schema
```sql
-- Metafield Definitions (templates for metafields)
CREATE TABLE metafield_definitions (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,           -- Display name
  description TEXT,
  type TEXT NOT NULL,
  owner_type TEXT NOT NULL,     -- 'product', 'collection', 'store', 'page'
  validations TEXT,             -- JSON: min, max, regex etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_type)
);

-- Metafield Values
CREATE TABLE metafields (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  definition_id TEXT,           -- Optional link to definition
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, namespace, key, owner_id, owner_type),
  FOREIGN KEY (definition_id) REFERENCES metafield_definitions(id)
);
```

## TypeScript Types
```typescript
interface MetafieldDefinition {
  id: string;
  storeId: number;
  namespace: string;      // e.g., 'custom', 'product_info'
  key: string;            // e.g., 'warranty_years'
  name: string;           // e.g., 'Warranty Period'
  description?: string;
  type: MetafieldType;
  ownerType: 'product' | 'collection' | 'store' | 'page';
  validations?: {
    min?: number;
    max?: number;
    regex?: string;
    choices?: string[];   // For restricted values
  };
}

interface Metafield {
  id: string;
  storeId: number;
  definitionId?: string;
  namespace: string;
  key: string;
  value: string;          // JSON stringified for complex types
  type: MetafieldType;
  ownerId: string;        // Product ID, Collection ID, etc.
  ownerType: 'product' | 'collection' | 'store' | 'page';
}
```

## API Endpoints

### Definitions API
```
GET    /api/metafield-definitions?ownerType=product
POST   /api/metafield-definitions
PUT    /api/metafield-definitions/:id
DELETE /api/metafield-definitions/:id
```

### Values API
```
GET    /api/metafields?ownerId=xxx&ownerType=product
GET    /api/metafields/:ownerId/:namespace/:key
POST   /api/metafields
PUT    /api/metafields/:id
DELETE /api/metafields/:id
```

## Section Binding (Dynamic Content)
```typescript
// In section settings - reference metafield
{
  type: 'metafield',
  id: 'warranty_display',
  label: 'Warranty Info Source',
  ownerType: 'product',
  namespace: 'custom',
  key: 'warranty_years',
}

// In section renderer - access value
const warrantyYears = product.metafields?.custom?.warranty_years;
```

## Product Data with Metafields
```typescript
// Extended product type
interface ProductWithMetafields extends Product {
  metafields: {
    [namespace: string]: {
      [key: string]: string | number | boolean | string[];
    };
  };
}

// Usage in storefront
<p>Warranty: {product.metafields.custom.warranty_years} years</p>
```

## Files to Create
- `db/schema_metafields.ts` (NEW) - Drizzle schema
- `db/migrations/xxx_add_metafields.sql` (NEW) - Migration
- `app/routes/api.metafield-definitions.ts` (NEW)
- `app/routes/api.metafields.ts` (NEW)
- `app/lib/metafields.server.ts` (NEW) - Server utilities
- `app/hooks/useMetafields.ts` (NEW) - Client hook
