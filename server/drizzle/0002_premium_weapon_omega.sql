ALTER TABLE "sentence" DROP CONSTRAINT IF EXISTS "sentence_sectionuuid_section_sectionuuid_fk";
--> statement-breakpoint
ALTER TABLE "annotation" DROP CONSTRAINT IF EXISTS "annotation_sentenceuuid_sentence_sentenceuuid_fk";
--> statement-breakpoint
ALTER TABLE "annotation" DROP CONSTRAINT IF EXISTS "annotation_statementtopicuuid_statement_topic_statementtopicuuid_fk";
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_section_sectionuuid_publicationuuid') THEN
    ALTER TABLE "section" ADD CONSTRAINT "uq_section_sectionuuid_publicationuuid" UNIQUE("sectionuuid","publicationuuid");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_sentence_sentenceuuid_publicationuuid') THEN
    ALTER TABLE "sentence" ADD CONSTRAINT "uq_sentence_sentenceuuid_publicationuuid" UNIQUE("sentenceuuid","publicationuuid");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_statementtopic_topicuuid_publicationuuid') THEN
    ALTER TABLE "statement_topic" ADD CONSTRAINT "uq_statementtopic_topicuuid_publicationuuid" UNIQUE("statementtopicuuid","publicationuuid");
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sentence_section_publication') THEN
    ALTER TABLE "sentence" ADD CONSTRAINT "fk_sentence_section_publication" FOREIGN KEY ("sectionuuid","publicationuuid") REFERENCES "public"."section"("sectionuuid","publicationuuid") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_annotation_sentence_publication') THEN
    ALTER TABLE "annotation" ADD CONSTRAINT "fk_annotation_sentence_publication" FOREIGN KEY ("sentenceuuid","publicationuuid") REFERENCES "public"."sentence"("sentenceuuid","publicationuuid") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_annotation_statementtopic_publication') THEN
    ALTER TABLE "annotation" ADD CONSTRAINT "fk_annotation_statementtopic_publication" FOREIGN KEY ("statementtopicuuid","publicationuuid") REFERENCES "public"."statement_topic"("statementtopicuuid","publicationuuid") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "publication" DROP COLUMN IF EXISTS "reportcsvfileid";--> statement-breakpoint
ALTER TABLE "publication" DROP COLUMN IF EXISTS "reportcsvfilename";--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publication_datasetid_unique') THEN
    ALTER TABLE "publication" ADD CONSTRAINT "publication_datasetid_unique" UNIQUE("datasetid");
  END IF;
END $$;