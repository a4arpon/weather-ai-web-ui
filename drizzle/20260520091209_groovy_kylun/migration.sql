CREATE TABLE "broker_agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"key" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
