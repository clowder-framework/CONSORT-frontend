CREATE TABLE IF NOT EXISTS "users" (
	"useruuid" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar DEFAULT 'author',
	"createtime" timestamp DEFAULT now(),
	"lastlogin" timestamp DEFAULT now(),
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publication" (
	"publicationuuid" serial PRIMARY KEY NOT NULL,
	"source" varchar DEFAULT 'clowder',
	"sourcefileid" varchar NOT NULL,
	"sourcefileformat" varchar NOT NULL,
	"sourcefilename" varchar NOT NULL,
	"sourcefileuploadtime" timestamp NOT NULL,
	"datasetid" varchar NOT NULL,
	"datasetname" varchar NOT NULL,
	"statement" varchar DEFAULT 'consort' NOT NULL,
	"pagewidth" real DEFAULT 500,
	"pageheight" real DEFAULT 799,
	"extractedpdffileid" varchar,
	"extractedxmlfileid" varchar,
	"extractedjsonfileid" varchar,
	"extractedcsvfileid" varchar,
	"inferencetime" timestamp,
	"predictioncsvfileid" varchar,
	"predictioncsvfilename" varchar,
	"highlightsjsonfileid" varchar,
	"highlightsjsonfilename" varchar,
	"reportcsvfileid" varchar,
	"reportcsvfilename" varchar,
	"reportpdffileid" varchar,
	"reportpdffilename" varchar,
	"nummissed" integer,
	"useruuid" integer NOT NULL,
	"othermetadata" varchar,
	CONSTRAINT "publication_datasetid_unique" UNIQUE("datasetid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "section" (
	"sectionuuid" serial PRIMARY KEY NOT NULL,
	"publicationuuid" integer NOT NULL,
	"sectionname" varchar DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sentence" (
	"sentenceuuid" serial PRIMARY KEY NOT NULL,
	"publicationuuid" integer NOT NULL,
	"sectionuuid" integer NOT NULL,
	"sentenceno" integer NOT NULL,
	"sentencetext" varchar NOT NULL,
	"coordinates" varchar,
	"beginpage" integer,
	"endpage" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "statement_section" (
	"statementsectionuuid" serial PRIMARY KEY NOT NULL,
	"publicationuuid" integer NOT NULL,
	"statementsectionname" varchar,
	"statementsectionnummissed" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "statement_topic" (
	"statementtopicuuid" serial PRIMARY KEY NOT NULL,
	"statementsectionuuid" integer NOT NULL,
	"publicationuuid" integer NOT NULL,
	"statementtopicname" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotation" (
	"annuuid" serial PRIMARY KEY NOT NULL,
	"sentenceuuid" integer NOT NULL,
	"publicationuuid" integer NOT NULL,
	"statementtopicuuid" integer NOT NULL,
	"label" varchar,
	"labelscore" real DEFAULT 0,
	"modelname" varchar,
	"statementsectionname" varchar,
	"statementtopicname" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "annotationfeedback" (
	"feedbackuuid" serial PRIMARY KEY NOT NULL,
	"annuuid" integer NOT NULL,
	"useruuid" integer NOT NULL,
	"publicationuuid" integer NOT NULL,
	"delete" boolean DEFAULT false,
	"newlabel" varchar,
	"time" timestamp
);
--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_useruuid_users_useruuid_fk" FOREIGN KEY ("useruuid") REFERENCES "public"."users"("useruuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentence" ADD CONSTRAINT "sentence_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentence" ADD CONSTRAINT "sentence_sectionuuid_section_sectionuuid_fk" FOREIGN KEY ("sectionuuid") REFERENCES "public"."section"("sectionuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statement_section" ADD CONSTRAINT "statement_section_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statement_topic" ADD CONSTRAINT "statement_topic_statementsectionuuid_statement_section_statementsectionuuid_fk" FOREIGN KEY ("statementsectionuuid") REFERENCES "public"."statement_section"("statementsectionuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statement_topic" ADD CONSTRAINT "statement_topic_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_sentenceuuid_sentence_sentenceuuid_fk" FOREIGN KEY ("sentenceuuid") REFERENCES "public"."sentence"("sentenceuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotation" ADD CONSTRAINT "annotation_statementtopicuuid_statement_topic_statementtopicuuid_fk" FOREIGN KEY ("statementtopicuuid") REFERENCES "public"."statement_topic"("statementtopicuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotationfeedback" ADD CONSTRAINT "annotationfeedback_annuuid_annotation_annuuid_fk" FOREIGN KEY ("annuuid") REFERENCES "public"."annotation"("annuuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotationfeedback" ADD CONSTRAINT "annotationfeedback_useruuid_users_useruuid_fk" FOREIGN KEY ("useruuid") REFERENCES "public"."users"("useruuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "annotationfeedback" ADD CONSTRAINT "annotationfeedback_publicationuuid_publication_publicationuuid_fk" FOREIGN KEY ("publicationuuid") REFERENCES "public"."publication"("publicationuuid") ON DELETE no action ON UPDATE no action;