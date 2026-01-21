# Technical Specifications

Detailed technical specs for upcoming Shopify-parity features.

## Documents

| File | Feature | Phase | Status |
|------|---------|-------|--------|
| [BLOCK_SYSTEM.md](BLOCK_SYSTEM.md) | Blocks inside sections | Phase 1 | ⏳ Pending |
| [SCHEMA_VALIDATION.md](SCHEMA_VALIDATION.md) | Zod input validation | Phase 1 | ⏳ Pending |
| [METAFIELDS.md](METAFIELDS.md) | Universal custom fields | Phase 2 | ⏳ Pending |

## Architecture Decisions

- **Blocks:** Stored in `blocksJson` column (already exists)
- **Validation:** Zod for runtime schema validation
- **Metafields:** Polymorphic table with `owner_type` + `owner_id`

## Implementation Order

1. Block System → enables section content customization
2. Schema Validation → prevents invalid data
3. Metafields → enables custom product/store attributes
