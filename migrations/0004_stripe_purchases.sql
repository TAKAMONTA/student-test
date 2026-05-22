CREATE TABLE `stripe_purchases` (
  `session_id` text PRIMARY KEY NOT NULL,
  `event_id` text NOT NULL,
  `user_id` text,
  `payment_intent_id` text,
  `amount_total` integer,
  `currency` text,
  `purchase_email` text,
  `email_send_status` text DEFAULT 'skipped' NOT NULL,
  `webhook_received_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `stripe_purchases_event_id_unique`
ON `stripe_purchases` (`event_id`);
