const { pgTable, serial, integer, varchar, timestamp, real, boolean, foreignKey } = require('drizzle-orm/pg-core');

// Users table
const users = pgTable('users', {
  useruuid: serial('useruuid').primaryKey(),
  name: varchar('name'),
  email: varchar('email'),
  role: varchar('role'),
  createtime: timestamp('createtime'),
  lastlogin: timestamp('lastlogin')
});

// Publication table
const publication = pgTable('publication', {
  publicationuuid: serial('publicationuuid').primaryKey(),
  source: varchar('source').default('clowder'),
  fileid: varchar('fileid'),
  datasetid: varchar('datasetid'),
  fileformat: varchar('fileformat'),
  journalname: varchar('journalname'),
  statement: varchar('statement').default('consort'),
  fileuploadtime: timestamp('fileuploadtime'),
  pagewidth: real('pagewidth'),
  pageheight: real('pageheight'),
  inferencetime: timestamp('inferencetime'),
  nummissed: integer('nummissed'),
  useruuid: integer('useruuid').notNull().references(() => users.useruuid)
});

// Section table
const section = pgTable('section', {
  sectionuuid: serial('sectionuuid').primaryKey(),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  sectionname: varchar('sectionname')
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
  statementtopicfound: boolean('statementtopicfound') 
});

// Annotation table
const annotation = pgTable('annotation', {
  annuuid: serial('annuuid').primaryKey(),
  sentenceuuid: integer('sentenceuuid').notNull().references(() => sentence.sentenceuuid),
  publicationuuid: integer('publicationuuid').notNull().references(() => publication.publicationuuid),
  statementtopicuuid: integer('statementtopicuuid').notNull().references(() => statementTopic.statementtopicuuid),
  label: varchar('label'),
  labelscore: real('labelscore'),
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
  delete: boolean('delete'),
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