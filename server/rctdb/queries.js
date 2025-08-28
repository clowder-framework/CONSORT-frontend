const { eq, and, desc, asc, sql } = require('drizzle-orm');
const { rctdb } = require('./connection');
const { 
  users, 
  publication, 
  section, 
  sentence, 
  annotation, 
  annotationFeedback,
  statementSection,
  statementTopic 
} = require('./schema');

// User operations
const userQueries = {
  // Upsert a user
  async upsertUser(userData) {
    return await rctdb
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.name,
        set: { lastlogin: sql`now()` }
      })
      .returning();
  },

  // Get user by name
  async getUserByName(name) {
    return await rctdb.select().from(users).where(eq(users.name, name));
  },

  // Get user by UUID
  async getUserByUuid(uuid) {
    return await rctdb.select().from(users).where(eq(users.useruuid, uuid));
  },

  // Get all users
  async getAllUsers() {
    return await rctdb.select().from(users).orderBy(asc(users.name));
  }
};

// Publication operations
const publicationQueries = {
  // Create a new publication
  async createPublication(publicationData) {
    return await rctdb.insert(publication).values(publicationData).returning();
  },

  // Upsert a publication - handles both create and update scenarios
  async upsertPublication(publicationData) {
    // Process the data to ensure timestamps are proper Date objects
    const processedData = { ...publicationData };
    
    // Handle timestamps
    if (processedData.sourcefileuploadtime && !(processedData.sourcefileuploadtime instanceof Date)) {
      processedData.sourcefileuploadtime = new Date(processedData.sourcefileuploadtime);
    }
    if (processedData.inferencetime && !(processedData.inferencetime instanceof Date)) {
      processedData.inferencetime = new Date(processedData.inferencetime);
    }

    // Check if publication already exists
    const existingPublication = await rctdb.select()
      .from(publication)
      .where(eq(publication.datasetid, processedData.datasetid))
      .limit(1);

    if (existingPublication.length > 0) {
      // Publication exists, update only the provided fields
      const { datasetid, ...updateFields } = processedData; // Exclude datasetid from updates
      
      return await rctdb.update(publication)
        .set(updateFields)
        .where(eq(publication.datasetid, datasetid))
        .returning();
    } else {
      // Publication doesn't exist, create new one
      return await rctdb.insert(publication)
        .values(processedData)
        .returning();
    }
  },

  // Get publication by UUID
  async getPublicationByUuid(uuid) {
    return await rctdb.select().from(publication).where(eq(publication.publicationuuid, uuid));
  },

  // Get publication by dataset ID
  async getPublicationByDatasetId(datasetId) {
    return await rctdb.select().from(publication).where(eq(publication.datasetid, datasetId));
  },

  // Get publications by user
  async getPublicationsByUser(userUuid) {
    return await rctdb.select().from(publication)
      .where(eq(publication.useruuid, userUuid))
      .orderBy(desc(publication.sourcefileuploadtime));
  },

  // Get all publications with user info
  async getAllPublicationsWithUsers() {
    return await rctdb.select({
      publication: publication,
      user: users
    }).from(publication)
      .leftJoin(users, eq(publication.useruuid, users.useruuid))
      .orderBy(desc(publication.sourcefileuploadtime));
  },

  // Update publication
  async updatePublication(uuid, updates) {
    return await rctdb.update(publication)
      .set(updates)
      .where(eq(publication.publicationuuid, uuid))
      .returning();
  }
};

// Annotation operations
const annotationQueries = {
  // Create annotation
  async createAnnotation(annotationData) {
    return await rctdb.insert(annotation).values(annotationData).returning();
  },

  // Get annotations by publication
  async getAnnotationsByPublication(publicationUuid) {
    return await rctdb.select().from(annotation)
      .where(eq(annotation.publicationuuid, publicationUuid));
  },

  // Get annotations with sentences and sections
  async getAnnotationsWithContext(publicationUuid) {
    return await rctdb.select({
      annotation: annotation,
      sentence: sentence,
      section: section
    }).from(annotation)
      .leftJoin(sentence, and(
        eq(annotation.sentenceuuid, sentence.sentenceuuid),
        eq(sentence.publicationuuid, publicationUuid)
      ))
      .leftJoin(section, and(
        eq(sentence.sectionuuid, section.sectionuuid),
        eq(section.publicationuuid, publicationUuid)
      ))
      .where(eq(annotation.publicationuuid, publicationUuid));
  },

  // Update annotation
  async updateAnnotation(uuid, updates) {
    return await rctdb.update(annotation)
      .set(updates)
      .where(eq(annotation.annuuid, uuid))
      .returning();
  }
};

// Feedback operations
const feedbackQueries = {
  // Create feedback
  async createFeedback(feedbackData) {
    return await rctdb.insert(annotationFeedback).values(feedbackData).returning();
  },

  // Get feedback by annotation
  async getFeedbackByAnnotation(annotationUuid) {
    return await rctdb.select().from(annotationFeedback)
      .where(eq(annotationFeedback.annuuid, annotationUuid))
      .orderBy(desc(annotationFeedback.time));
  },

  // Get feedback by user
  async getFeedbackByUser(userUuid) {
    return await rctdb.select().from(annotationFeedback)
      .where(eq(annotationFeedback.useruuid, userUuid))
      .orderBy(desc(annotationFeedback.time));
  }
};

// Section and sentence operations
const contentQueries = {
  // Create section
  async createSection(sectionData) {
    return await rctdb.insert(section).values(sectionData).returning();
  },

  // Create sentence
  async createSentence(sentenceData) {
    return await rctdb.insert(sentence).values(sentenceData).returning();
  },

  // Get sections by publication
  async getSectionsByPublication(publicationUuid) {
    return await rctdb.select().from(section)
      .where(eq(section.publicationuuid, publicationUuid));
  },

  // Get sentences by section
  async getSentencesBySection(sectionUuid) {
    return await rctdb.select().from(sentence)
      .where(eq(sentence.sectionuuid, sectionUuid))
      .orderBy(asc(sentence.sentenceno));
  }
};

const statementQueries = {
  // Get statement section by publication
  async getStatementSectionByPublication(publicationUuid) {
    return await rctdb.select().from(statementSection)
      .where(eq(statementSection.publicationuuid, publicationUuid));
  },

  // Get statement section by publication and statementsectionname
  async getStatementSectionByPublicationAndName(publicationUuid, statementSectionName) {
    return await rctdb.select().from(statementSection)
      .where(and(
        eq(statementSection.publicationuuid, publicationUuid),
        eq(statementSection.statementsectionname, statementSectionName)
      ));
  },

  // Get statement topic by publication
  async getStatementTopicByPublication(publicationUuid) {
    return await rctdb.select().from(statementTopic)
      .where(eq(statementTopic.publicationuuid, publicationUuid));
  },

  // Get statement topic by publication and statementtopicname
  async getStatementTopicByPublicationAndName(publicationUuid, statementTopicName) {
    return await rctdb.select().from(statementTopic)
      .where(and(
        eq(statementTopic.publicationuuid, publicationUuid),
        eq(statementTopic.statementtopicname, statementTopicName)
      ));
  }
}

module.exports = {
  userQueries,
  publicationQueries,
  annotationQueries,
  feedbackQueries,
  contentQueries,
  statementQueries
}; 