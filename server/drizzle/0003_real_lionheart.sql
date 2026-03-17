ALTER TABLE "publication" ALTER COLUMN "statement" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "publication" ALTER COLUMN "statement" SET DEFAULT 'consort';--> statement-breakpoint
ALTER TABLE "annotationfeedback" ADD COLUMN IF NOT EXISTS "feedback" varchar DEFAULT null;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_annotation_annuuid_publicationuuid') THEN
    ALTER TABLE "annotation" ADD CONSTRAINT "uq_annotation_annuuid_publicationuuid" UNIQUE("annuuid","publicationuuid");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_annotationfeedback_annotation_publication') THEN
    ALTER TABLE "annotationfeedback" ADD CONSTRAINT "fk_annotationfeedback_annotation_publication" FOREIGN KEY ("annuuid","publicationuuid") REFERENCES "public"."annotation"("annuuid","publicationuuid") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publication_statement_check') THEN
    ALTER TABLE "publication" ADD CONSTRAINT "publication_statement_check" CHECK ("publication"."statement" IN ('consort', 'spirit'));
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'annotationfeedback_feedback_check') THEN
    ALTER TABLE "annotationfeedback" ADD CONSTRAINT "annotationfeedback_feedback_check" CHECK ("annotationfeedback"."feedback" IN ('positive', 'negative'));
  END IF;
END $$;
