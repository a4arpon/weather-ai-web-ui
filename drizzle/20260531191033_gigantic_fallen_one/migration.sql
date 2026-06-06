CREATE TABLE "integrations_creds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"wp_site_id" uuid NOT NULL,
	"wo_commerce_credentials" jsonb
);
--> statement-breakpoint
ALTER TABLE "integrations_creds" ADD CONSTRAINT "integrations_creds_wp_site_id_wp_sites_id_fkey" FOREIGN KEY ("wp_site_id") REFERENCES "wp_sites"("id") ON DELETE CASCADE;