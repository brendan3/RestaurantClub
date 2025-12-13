-- Incremental migration: Date Polls (planning step before creating an event)
-- NOTE: This repo historically used drizzle-kit push without committed migrations,
-- so we keep this migration focused only on the new date-poll tables.

CREATE TYPE "public"."date_poll_status" AS ENUM('open', 'closed');--> statement-breakpoint

CREATE TABLE "date_polls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" varchar NOT NULL,
	"created_by_id" varchar NOT NULL,
	"title" text NOT NULL,
	"restaurant_name" text,
	"status" date_poll_status DEFAULT 'open' NOT NULL,
	"closes_at" timestamp with time zone DEFAULT now() + interval '24 hours' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);--> statement-breakpoint

CREATE TABLE "date_poll_options" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" varchar NOT NULL,
	"option_date" timestamp with time zone NOT NULL,
	"order" integer
);--> statement-breakpoint

CREATE TABLE "date_poll_votes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"option_id" varchar NOT NULL,
	"can_attend" boolean DEFAULT true NOT NULL
);--> statement-breakpoint

ALTER TABLE "date_polls"
	ADD CONSTRAINT "date_polls_club_id_clubs_id_fk"
	FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id")
	ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "date_polls"
	ADD CONSTRAINT "date_polls_created_by_id_users_id_fk"
	FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id")
	ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "date_poll_options"
	ADD CONSTRAINT "date_poll_options_poll_id_date_polls_id_fk"
	FOREIGN KEY ("poll_id") REFERENCES "public"."date_polls"("id")
	ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "date_poll_votes"
	ADD CONSTRAINT "date_poll_votes_poll_id_date_polls_id_fk"
	FOREIGN KEY ("poll_id") REFERENCES "public"."date_polls"("id")
	ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "date_poll_votes"
	ADD CONSTRAINT "date_poll_votes_user_id_users_id_fk"
	FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
	ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "date_poll_votes"
	ADD CONSTRAINT "date_poll_votes_option_id_date_poll_options_id_fk"
	FOREIGN KEY ("option_id") REFERENCES "public"."date_poll_options"("id")
	ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "date_poll_votes_unique"
	ON "date_poll_votes" USING btree ("poll_id","user_id","option_id");