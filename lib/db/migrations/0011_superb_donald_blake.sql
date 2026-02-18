CREATE TABLE IF NOT EXISTS "Itinerary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"tripName" text,
	"destination" text,
	"startDate" date,
	"endDate" date,
	"adults" integer DEFAULT 0,
	"children" integer DEFAULT 0,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "Itinerary_chatId_unique" UNIQUE("chatId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ItineraryItem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"itineraryId" uuid NOT NULL,
	"day" date NOT NULL,
	"timeBlock" varchar NOT NULL,
	"type" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" text,
	"imageUrl" text,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Poll" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"itineraryId" uuid NOT NULL,
	"question" text NOT NULL,
	"type" varchar DEFAULT 'multiple_choice' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PollOption" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pollId" uuid NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"sortOrder" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PollVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pollOptionId" uuid NOT NULL,
	"voterName" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_itineraryId_Itinerary_id_fk" FOREIGN KEY ("itineraryId") REFERENCES "public"."Itinerary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Poll" ADD CONSTRAINT "Poll_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Poll" ADD CONSTRAINT "Poll_itineraryId_Itinerary_id_fk" FOREIGN KEY ("itineraryId") REFERENCES "public"."Itinerary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_Poll_id_fk" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pollOptionId_PollOption_id_fk" FOREIGN KEY ("pollOptionId") REFERENCES "public"."PollOption"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
