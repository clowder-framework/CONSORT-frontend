const { pgTable, serial, integer, varchar, timestamp, real, boolean } = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

// Users table
const users = pgTable('users', {
  useruuid: serial('useruuid').primaryKey(),
  name: varchar('name').notNull().unique(), // All anonymous users will have a name of "Anonymous" and a role of "author" and one useruuid
  email: varchar('email').notNull().unique(),
  role: varchar('role').default('author'),
  createtime: timestamp('createtime').default(sql`now()`),
  lastlogin: timestamp('lastlogin').default(sql`now()`)
});

// Publication table
const publication = pgTable('publication', {
  publicationuuid: serial('publicationuuid').primaryKey(),
  source: varchar('source').default('clowder'),
  sourcefileid: varchar('sourcefileid').notNull(), // uploaded fileID from clowder
  sourcefileformat: varchar('sourcefileformat').notNull(), // uploadedfile format from clowder
  sourcefilename: varchar('sourcefilename').notNull(), // uploaded file name from clowder
  sourcefileuploadtime: timestamp('sourcefileuploadtime').notNull(), // time of file upload to clowder
  datasetid: varchar('datasetid').notNull().unique(), // datasetID from clowder
  datasetname: varchar('datasetname').notNull(), // dataset name from clowder. This is the name of the uploaded file without the extension.
  
  statement: varchar('statement').notNull().default('consort'), // statement type from clowder. spirit or consort
  pagewidth: real('pagewidth').default(500), // page width from grobid output
  pageheight: real('pageheight').default(799), // page height from grobid output
  extractedpdffileid: varchar('extractedpdffileid'), // extracted pdf fileID from sOffice extractor
  extractedxmlfileid: varchar('extractedxmlfileid'), // extracted xml fileID from pdf2text extractor
  extractedjsonfileid: varchar('extractedjsonfileid'), // extracted json fileID from pdf2text extractor
  extractedcsvfileid: varchar('extractedcsvfileid'), // extracted csv fileID from pdf2text or pymupdf extractor
  inferencetime: timestamp('inferencetime'), // time of inference completion from model
  predictioncsvfileid: varchar('predictioncsvfileid'), // prediction csv fileID from rct extractor
  highlightsjsonfileid: varchar('highlightsjsonfileid'), // highlights json fileID from rct extractor
  reportcsvfileid: varchar('reportcsvfileid'), // report csv fileID from rct extractor
  reportpdffileid: varchar('reportpdffileid'), // report pdf fileID from rct extractor
  nummissed: integer('nummissed'), // number of missed checklist items from model
  useruuid: integer('useruuid').notNull().references(() => users.useruuid), // useruuid from users table
  othermetadata: varchar('othermetadata') // other metadata from clowder
});

// Section table
const section = pgTable('section', {
  sectionuuid: serial('sectionuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  sectionname: varchar('sectionname').default('')
});

// Sentence table
const sentence = pgTable('sentence', {
  sentenceuuid: serial('sentenceuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid), 
  sectionuuid: integer('sectionuuid').notNull().references(() => section.sectionuuid),
  sentenceno: integer('sentenceno').notNull(),
  sentencetext: varchar('sentencetext').notNull(),
  coordinates: varchar('coordinates'),
  beginpage: integer('beginpage'),
  endpage: integer('endpage')
});

// Statement section table
const statementSection = pgTable('statement_section', {
  statementsectionuuid: serial('statementsectionuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  statementsectionname: varchar('statementsectionname'),
  statementsectionnummissed: integer('statementsectionnummissed')
});

// Statement topic table
const statementTopic = pgTable('statement_topic', {
  statementtopicuuid: serial('statementtopicuuid').primaryKey(),
  statementsectionuuid: integer('statementsectionuuid').notNull().references(() => statementSection.statementsectionuuid),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  statementtopicname: varchar('statementtopicname'),
});

// Annotation table
const annotation = pgTable('annotation', {
  annuuid: serial('annuuid').primaryKey(),
  sentenceuuid: integer('sentenceuuid').notNull().references(() => sentence.sentenceuuid),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  statementtopicuuid: integer('statementtopicuuid').notNull().references(() => statementTopic.statementtopicuuid),
  label: varchar('label'),
  labelscore: real('labelscore').default(0.0),
  modelname: varchar('modelname'),
  statementsectionname: varchar('statementsectionname'),
  statementtopicname: varchar('statementtopicname')
});

// Annotation feedback table
const annotationFeedback = pgTable('annotationfeedback', {
  feedbackuuid: serial('feedbackuuid').primaryKey(),
  annuuid: integer('annuuid').notNull().references(() => annotation.annuuid),
  useruuid: integer('useruuid').notNull().references(() => users.useruuid),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  delete: boolean('delete').default(false),
  newlabel: varchar('newlabel'),
  time: timestamp('time')
});

module.exports = {
  users,
  publication,
  section,
  sentence,
  statementSection,
  statementTopic,
  annotation,
  annotationFeedback
}; 