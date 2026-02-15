-- Ensure lead gen forms table exists in environments
-- where schema changes were applied without corresponding migration files.

CREATE TABLE IF NOT EXISTS `lead_gen_forms` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `store_id` integer NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `fields` text DEFAULT '[]',
  `is_active` integer DEFAULT 1,
  `created_at` integer,
  `updated_at` integer,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `lead_gen_forms_store_id_idx` ON `lead_gen_forms` (`store_id`);
CREATE INDEX IF NOT EXISTS `lead_gen_forms_slug_idx` ON `lead_gen_forms` (`store_id`, `slug`);
