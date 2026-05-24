CREATE TABLE `apple_purchases` (
  `transaction_id` text PRIMARY KEY NOT NULL,
  `original_transaction_id` text,
  `web_order_line_item_id` text,
  `user_id` text NOT NULL,
  `product_id` text NOT NULL,
  `environment` text NOT NULL,
  `purchase_date` integer NOT NULL,
  `revocation_date` integer,
  `revocation_reason` integer,
  `signed_transaction_info` text NOT NULL,
  `source` text NOT NULL,
  `notification_type` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `apple_purchases_user_id_idx`
ON `apple_purchases` (`user_id`);

CREATE INDEX `apple_purchases_original_transaction_id_idx`
ON `apple_purchases` (`original_transaction_id`);
