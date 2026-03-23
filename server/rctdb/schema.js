const {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  real,
  boolean,
  index,
  uniqueIndex,
  unique,
  foreignKey,
  check
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');


// Users table
const users = pgTable('users', {
  useruuid: serial('useruuid').primaryKey(),
  name: varchar('name').notNull(), // Anonymous users have a name of "Anonymous"
  email: varchar('email').notNull(), // Anonymous users have an email of "anonymous@example.com"
  role: varchar('role').notNull().default('author'),
  createtime: timestamp('createtime').notNull().default(sql`now()`),
  lastlogin: timestamp('lastlogin').notNull().default(sql`now()`)
}, (table) => ({
  emailUnique: uniqueIndex('users_email_uidx').on(table.email)
}));


// Publication table
const publication = pgTable('publication', {
  publicationuuid: serial('publicationuuid').primaryKey(),
  source: varchar('source').notNull().default('clowder'),
  sourcefileid: varchar('sourcefileid').notNull(), // uploaded fileID from clowder
  sourcefileformat: varchar('sourcefileformat').notNull(), // uploadedfile format from clowder
  sourcefilename: varchar('sourcefilename').notNull(), // uploaded file name from clowder
  sourcefileuploadtime: timestamp('sourcefileuploadtime').notNull(), // time of file upload to clowder
  datasetid: varchar('datasetid').notNull().unique(), // datasetID from clowder
  datasetname: varchar('datasetname').notNull(), // dataset name from clowder. This is the name of the uploaded file without the extension.
  
  statement: varchar('statement').notNull().default('consort'), // statement type: consort | spirit (enum-like)
  pagewidth: real('pagewidth').default(500), // page width from grobid output
  pageheight: real('pageheight').default(799), // page height from grobid output
  extractedpdffileid: varchar('extractedpdffileid'), // extracted pdf fileID from sOffice extractor
  extractedxmlfileid: varchar('extractedxmlfileid'), // extracted xml fileID from pdf2text extractor
  extractedjsonfileid: varchar('extractedjsonfileid'), // extracted json fileID from pdf2text extractor
  extractedcsvfileid: varchar('extractedcsvfileid'), // extracted csv fileID from pdf2text extractor 
  inferencetime: timestamp('inferencetime'), // time of inference completion from model
  predictioncsvfileid: varchar('predictioncsvfileid'), // prediction csv fileID from rct extractor
  predictioncsvfilename: varchar('predictioncsvfilename'), // prediction csv file name from rct extractor
  highlightsjsonfileid: varchar('highlightsjsonfileid'), // highlights json fileID from rct extractor
  highlightsjsonfilename: varchar('highlightsjsonfilename'), // highlights json file name from rct extractor
  reportpdffileid: varchar('reportpdffileid'), // report pdf fileID from rct extractor
  reportpdffilename: varchar('reportpdffilename'), // report pdf file name from rct extractor
  nummissed: integer('nummissed'), // number of missed checklist items from model
  useruuid: integer('useruuid').notNull().references(() => users.useruuid), // useruuid from users table
  othermetadata: varchar('othermetadata') // other metadata from clowder
}, (table) => ({
  datasetIdUnique: uniqueIndex('publication_datasetid_uidx').on(table.datasetid),
  publicationUserIdx: index('publication_useruuid_idx').on(table.useruuid),
  statementCheck: check('publication_statement_check', sql`${table.statement} IN ('consort', 'spirit')`)
}));


// Section table
const section = pgTable('section', {
  sectionuuid: serial('sectionuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  sectionname: varchar('sectionname').default('')
}, (table) => ({
  sectionPublicationUnique: unique('uq_section_sectionuuid_publicationuuid').on(table.sectionuuid, table.publicationuuid)
}));


// Sentence table
const sentence = pgTable('sentence', {
  sentenceuuid: serial('sentenceuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid), 
  sectionuuid: integer('sectionuuid').notNull(),
  sentenceno: integer('sentenceno').notNull(),
  sentencetext: varchar('sentencetext').notNull(),
  coordinates: varchar('coordinates'),
  beginpage: integer('beginpage'),
  endpage: integer('endpage')
}, (table) => ({
  sentenceSectionPublicationFk: foreignKey({
    columns: [table.sectionuuid, table.publicationuuid],
    foreignColumns: [section.sectionuuid, section.publicationuuid],
    name: 'fk_sentence_section_publication'
  }),
  sentencePublicationUnique: unique('uq_sentence_sentenceuuid_publicationuuid').on(table.sentenceuuid, table.publicationuuid)
}));


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
}, (table) => ({
  statementTopicPublicationUnique: unique('uq_statementtopic_topicuuid_publicationuuid').on(
    table.statementtopicuuid,
    table.publicationuuid
  )
}));


// Annotation table
const annotation = pgTable('annotation', {
  annuuid: serial('annuuid').primaryKey(),
  sentenceuuid: integer('sentenceuuid').notNull(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  statementtopicuuid: integer('statementtopicuuid').notNull(),
  label: varchar('label'),
  labelscore: real('labelscore').default(0.0),
  modelname: varchar('modelname'),
  statementsectionname: varchar('statementsectionname'),
  statementtopicname: varchar('statementtopicname')
}, (table) => ({
  annotationSentencePublicationFk: foreignKey({
    columns: [table.sentenceuuid, table.publicationuuid],
    foreignColumns: [sentence.sentenceuuid, sentence.publicationuuid],
    name: 'fk_annotation_sentence_publication'
  }),
  annotationStatementTopicPublicationFk: foreignKey({
    columns: [table.statementtopicuuid, table.publicationuuid],
    foreignColumns: [statementTopic.statementtopicuuid, statementTopic.publicationuuid],
    name: 'fk_annotation_statementtopic_publication'
  }),
  annotationPublicationUnique: unique('uq_annotation_annuuid_publicationuuid').on(table.annuuid, table.publicationuuid)
}));


// Annotation feedback table
const annotationFeedback = pgTable('annotationfeedback', {
  feedbackuuid: serial('feedbackuuid').primaryKey(),
  annuuid: integer('annuuid').notNull().references(() => annotation.annuuid),
  useruuid: integer('useruuid').notNull().references(() => users.useruuid),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  delete: boolean('delete').default(false),
  newlabel: varchar('newlabel'),
  feedback: varchar('feedback').default(null),
  time: timestamp('time')
}, (table) => ({
  feedbackAnnotationPublicationFk: foreignKey({
    columns: [table.annuuid, table.publicationuuid],
    foreignColumns: [annotation.annuuid, annotation.publicationuuid],
    name: 'fk_annotationfeedback_annotation_publication'
  }),
  feedbackcheck: //check positive or negative feedback
    check('annotationfeedback_feedback_check', sql`${table.feedback} IN ('positive', 'negative')`)
}));



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