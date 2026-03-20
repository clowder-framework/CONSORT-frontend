ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_name_unique";--> statement-breakpoint
ALTER TABLE "publication" DROP CONSTRAINT IF EXISTS "publication_datasetid_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createtime" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "lastlogin" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "publication" ALTER COLUMN "source" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_uidx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "publication_datasetid_uidx" ON "publication" USING btree ("datasetid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "publication_useruuid_idx" ON "publication" USING btree ("useruuid");