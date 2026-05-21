CREATE TABLE `ai_rate_limits` (
  `user_id` text NOT NULL,
  `day` text NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  PRIMARY KEY(`user_id`, `day`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
