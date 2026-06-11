CREATE TABLE `activity_logs` (
	`id` varchar(64) NOT NULL,
	`text` text NOT NULL,
	`time` varchar(64) NOT NULL,
	`board` varchar(64) NOT NULL,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` varchar(64) NOT NULL,
	`board` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`status` varchar(128) NOT NULL,
	`contact_name` varchar(255),
	`email` varchar(255),
	`value` varchar(64),
	`phone` varchar(64),
	`pricing_method` varchar(128),
	`total_rate` varchar(64),
	`start_date` varchar(32),
	`quote_description` text,
	`details` text,
	`description` text,
	`amount` varchar(64),
	`due_date` varchar(32),
	`priority` varchar(64),
	`assignee` varchar(128),
	`monthly_fee` varchar(64),
	`end_date` varchar(32),
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `org_members` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`role` varchar(128) NOT NULL,
	CONSTRAINT `org_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sub_tasks` (
	`id` varchar(64) NOT NULL,
	`card_id` varchar(64),
	`description` varchar(255) NOT NULL,
	`details` text,
	`owner` varchar(128),
	`start_date` varchar(32),
	`due_date` varchar(32),
	`completed` boolean DEFAULT false,
	CONSTRAINT `sub_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(64) DEFAULT 'Lead Operator',
	`avatar` varchar(128) DEFAULT 'silhouette',
	`approved` boolean DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sub_tasks` ADD CONSTRAINT `sub_tasks_card_id_cards_id_fk` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE cascade ON UPDATE no action;