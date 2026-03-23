DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_annotation_annuuid_publicationuuid') THEN
    ALTER TABLE "annotation" ADD CONSTRAINT "uq_annotation_annuuid_publicationuuid" UNIQUE("annuuid","publicationuuid");
  END IF;
END $$;