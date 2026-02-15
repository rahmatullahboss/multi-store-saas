-- Legacy mismatch fix intentionally set to no-op.
-- This migration previously attempted schema operations that are not safe
-- across all deployed environments.
SELECT 1;
