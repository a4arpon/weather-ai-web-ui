ALTER TABLE "broker_agencies" RENAME TO "wp_sites";--> statement-breakpoint
ALTER TABLE "wp_sites" ADD COLUMN "wp_domain" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "user_role_enums";--> statement-breakpoint
CREATE TYPE "user_role_enums" AS ENUM('unassigned', 'user-admin', 'system-admin');--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "role" SET DATA TYPE "user_role_enums" USING "role"::"user_role_enums";--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "role" SET DEFAULT 'unassigned'::"user_role_enums";