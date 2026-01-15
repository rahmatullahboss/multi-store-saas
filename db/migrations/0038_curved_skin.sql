CREATE TABLE `webhook_delivery_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`payload` text NOT NULL,
	`status_code` integer,
	`response_body` text,
	`success` integer DEFAULT false,
	`error_message` text,
	`attempt_count` integer DEFAULT 1,
	`delivered_at` integer,
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `webhook_logs_webhook_idx` ON `webhook_delivery_logs` (`webhook_id`);--> statement-breakpoint
CREATE INDEX `webhook_logs_event_idx` ON `webhook_delivery_logs` (`event_type`);