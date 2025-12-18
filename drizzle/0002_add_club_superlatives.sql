CREATE TABLE "club_superlatives" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" varchar NOT NULL,
	"slot_key" text NOT NULL,
	"title" text NOT NULL,
	"member_name" text NOT NULL,
	"icon_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_superlatives" ADD CONSTRAINT "club_superlatives_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "club_superlatives_club_slot_unique" ON "club_superlatives" USING btree ("club_id","slot_key");