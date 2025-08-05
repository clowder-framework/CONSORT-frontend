CREATE TABLE "users" (
  "useruuid" integer PRIMARY KEY,
  "name" varchar,
  "email" varchar,
  "role" varchar,
  "createtime" timestamp,
  "lastlogin" timestamp
);

CREATE TABLE "publication" (
  "publicationuuid" integer PRIMARY KEY,
  "source" varchar DEFAULT 'clowder',
  "fileid" varchar,
  "datasetid" varchar,
  "fileformat" varchar,
  "journalname" varchar,
  "statement" varchar DEFAULT 'consort',
  "fileuploadtime" timestamp,
  "pagewidth" float,
  "pageheight" float,
  "inferencetime" timestamp,
  "nummissed" integer,
  "useruuid" integer NOT NULL
);

CREATE TABLE "section" (
  "sectionuuid" SERIAL PRIMARY KEY,
  "publicationuuid" integer NOT NULL,
  "sectionname" varchar
);

CREATE TABLE "sentence" (
  "sentenceuuid" SERIAL PRIMARY KEY,
  "publicationuuid" integer NOT NULL,
  "sectionuuid" integer NOT NULL,
  "sentenceno" integer NOT NULL,
  "sentencetext" varchar NOT NULL,
  "coordinates" varchar,
  "beginpage" integer,
  "endpage" integer
);

CREATE TABLE "annotation" (
  "annuuid" SERIAL PRIMARY KEY,
  "sentenceuuid" integer NOT NULL,
  "publicationuuid" integer NOT NULL,
  "statementtopicuuid" integer NOT NULL,
  "label" varchar,
  "labelscore" float,
  "modelname" varchar,
  "statementsectionname" varchar,
  "statementtopicname" varchar
);

CREATE TABLE "statement_section" (
  "statementsectionuuid" SERIAL PRIMARY KEY,
  "publicationuuid" integer NOT NULL,
  "statementsectionname" varchar,
  "statementsectionnummissed" integer
);

CREATE TABLE "statement_topic" (
  "statementtopicuuid" SERIAL PRIMARY KEY,
  "statementsectionuuid" integer NOT NULL,
  "publicationuuid" integer NOT NULL,
  "statementtopicname" varchar,
  "statementtopicfound" bool
);

CREATE TABLE "annotationfeedback" (
  "feedbackuuid" SERIAL PRIMARY KEY,
  "annuuid" integer NOT NULL,
  "useruuid" integer NOT NULL,
  "publicationuuid" integer NOT NULL,
  "delete" bool,
  "newlabel" varchar,
  "time" timestamp
);

COMMENT ON COLUMN "publication"."publicationuuid" IS 'added from frontend';

COMMENT ON COLUMN "publication"."source" IS 'added from frontend';

COMMENT ON COLUMN "publication"."fileid" IS 'fileID in clowder, updated from frontend';

COMMENT ON COLUMN "publication"."datasetid" IS 'datasetID in clowder, updated from frontend';

COMMENT ON COLUMN "publication"."fileformat" IS 'pdf/docx etc, updated from frontend';

COMMENT ON COLUMN "publication"."journalname" IS 'filename, added from frontend';

COMMENT ON COLUMN "publication"."statement" IS 'spirit or consort, added from frontend';

COMMENT ON COLUMN "publication"."fileuploadtime" IS 'file upload time from frontend';

COMMENT ON COLUMN "publication"."pagewidth" IS 'page width from s2orc grobid extractor';

COMMENT ON COLUMN "publication"."pageheight" IS 'page height from s2orc grobid extractor';

COMMENT ON COLUMN "publication"."inferencetime" IS 'inference completion time, added from backend extractor';

COMMENT ON COLUMN "publication"."nummissed" IS 'num of labels missed in this publication, added from backend extractor';

COMMENT ON COLUMN "publication"."useruuid" IS 'foreign key for users table';

COMMENT ON COLUMN "section"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "sentence"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "sentence"."sectionuuid" IS 'foreign key for section table';

COMMENT ON COLUMN "sentence"."sentenceno" IS 'sentenceID in report_df';

COMMENT ON COLUMN "sentence"."sentencetext" IS 'sentence text. should it be stored?';

COMMENT ON COLUMN "sentence"."coordinates" IS 'sentence coordinates';

COMMENT ON COLUMN "sentence"."beginpage" IS 'begining page from sentence coordinates';

COMMENT ON COLUMN "sentence"."endpage" IS 'ending page from sentence coordinatees';

COMMENT ON COLUMN "annotation"."sentenceuuid" IS 'foreign key for sentence table';

COMMENT ON COLUMN "annotation"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "annotation"."statementtopicuuid" IS 'foreign key for statement_topic table';

COMMENT ON COLUMN "annotation"."label" IS 'predicted label for sentence for the statement - same as item number from the spirit/consort statement';

COMMENT ON COLUMN "annotation"."labelscore" IS 'score for the predicted label';

COMMENT ON COLUMN "annotation"."modelname" IS 'name of the model used for predcition';

COMMENT ON COLUMN "annotation"."statementsectionname" IS 'section name from the spirit/consort checklist';

COMMENT ON COLUMN "annotation"."statementtopicname" IS 'topic name from the spirit/consort checklist';

COMMENT ON COLUMN "statement_section"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "statement_section"."statementsectionname" IS 'section name from the spirit/consort checklist';

COMMENT ON COLUMN "statement_section"."statementsectionnummissed" IS 'num of labels missed in each section';

COMMENT ON COLUMN "statement_topic"."statementsectionuuid" IS 'foreign key for statement_section table';

COMMENT ON COLUMN "statement_topic"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "statement_topic"."statementtopicname" IS 'topic name from the spirit/consort checklist';

COMMENT ON COLUMN "statement_topic"."statementtopicfound" IS 'Yes/ no whether the topic is found or not';

COMMENT ON COLUMN "annotationfeedback"."annuuid" IS 'foreign key for annotation table';

COMMENT ON COLUMN "annotationfeedback"."useruuid" IS 'foreign key for users table';

COMMENT ON COLUMN "annotationfeedback"."publicationuuid" IS 'foreign key for publication table';

COMMENT ON COLUMN "annotationfeedback"."delete" IS 'current label deleted or not Yes/no';

COMMENT ON COLUMN "annotationfeedback"."newlabel" IS 'new label assigned by user, use 0 if deleting label';

COMMENT ON COLUMN "annotationfeedback"."time" IS 'time of feedback from user';

ALTER TABLE "publication" ADD CONSTRAINT "user_publication" FOREIGN KEY ("useruuid") REFERENCES "users" ("useruuid");

ALTER TABLE "section" ADD CONSTRAINT "publication_section" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");

ALTER TABLE "sentence" ADD CONSTRAINT "section_sentence" FOREIGN KEY ("sectionuuid") REFERENCES "section" ("sectionuuid");

ALTER TABLE "sentence" ADD CONSTRAINT "publication_sentence" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");

ALTER TABLE "statement_section" ADD CONSTRAINT "publication_statementsection" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");

ALTER TABLE "statement_topic" ADD CONSTRAINT "publication_statementtopic" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");

ALTER TABLE "statement_topic" ADD CONSTRAINT "statementsection_statementtopic" FOREIGN KEY ("statementsectionuuid") REFERENCES "statement_section" ("statementsectionuuid");

ALTER TABLE "annotation" ADD CONSTRAINT "sentence_annotation" FOREIGN KEY ("sentenceuuid") REFERENCES "sentence" ("sentenceuuid");

ALTER TABLE "annotation" ADD CONSTRAINT "publication_annotation" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");

ALTER TABLE "annotation" ADD CONSTRAINT "statementtopic_annotation" FOREIGN KEY ("statementtopicuuid") REFERENCES "statement_topic" ("statementtopicuuid");

ALTER TABLE "annotationfeedback" ADD CONSTRAINT "user_annotationfeedback" FOREIGN KEY ("useruuid") REFERENCES "users" ("useruuid");

ALTER TABLE "annotationfeedback" ADD CONSTRAINT "annotation_annotationfeedback" FOREIGN KEY ("annuuid") REFERENCES "annotation" ("annuuid");

ALTER TABLE "annotationfeedback" ADD CONSTRAINT "publication_annotationfeedback" FOREIGN KEY ("publicationuuid") REFERENCES "publication" ("publicationuuid");
