const { 
  userQueries, 
  publicationQueries, 
  annotationQueries, 
  feedbackQueries, 
  contentQueries 
} = require('./queries');
const { rctdbTestConnection } = require('./connection');

async function rctdbExamples() {
  // Test the database connection
  const isConnected = await rctdbTestConnection();
  if (!isConnected) {
    console.log('Cannot run examples - database not connected');
    return;
  }

  try {
    console.log('\n=== RCTDB Examples ===\n');  

    // 1. Create a user
    console.log('1. Creating a user...');
    const newUser = await userQueries.createUser({
      name: 'John Doe',
      email: 'john.doe@example.com',  
      role: 'researcher',
      createtime: new Date()
    });
    console.log('Created user:', newUser[0]);

    // 2. Create a publication
    console.log('\n2. Creating a publication...');
    const newPublication = await publicationQueries.createPublication({
      source: 'clowder',
      fileid: 'file123',
      datasetid: 'dataset456',
      fileformat: 'pdf',
      journalname: 'Example Research Paper.pdf',
      statement: 'consort',
      fileuploadtime: new Date(),
      pagewidth: 8.5,
      pageheight: 11.0,
      nummissed: 0,
      useruuid: newUser[0].useruuid
    });
    console.log('Created publication:', newPublication[0]);

    // 3. Create a section
    console.log('\n3. Creating a section...');
    const newSection = await contentQueries.createSection({
      publicationuuid: newPublication[0].publicationuuid,
      sectionname: 'Introduction'
    });
    console.log('Created section:', newSection[0]);

    // 4. Create a sentence
    console.log('\n4. Creating a sentence...');
    const newSentence = await contentQueries.createSentence({
      publicaitonuuid: newPublication[0].publicationuuid, // Note: keeping typo from schema
      sectionuuid: newSection[0].sectionuuid,
      sentenceno: 1,
      sentencetext: 'This is an example sentence from the research paper.',
      coordinates: '{"x1": 100, "y1": 200, "x2": 300, "y2": 220}',
      beginpage: 1,
      endpage: 1
    });
    console.log('Created sentence:', newSentence[0]);

    // 5. Get publications by user
    console.log('\n5. Getting publications by user...');
    const userPublications = await publicationQueries.getPublicationsByUser(newUser[0].useruuid);
    console.log('User publications:', userPublications);

    // 6. Get all users
    console.log('\n6. Getting all users...');
    const allUsers = await userQueries.getAllUsers();
    console.log('All users:', allUsers);

    console.log('\n=== Examples completed successfully! ===');

  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  rctdbExamples()
    .then(() => {
      console.log('\nExamples finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Examples error:', error);
      process.exit(1);
    });
}

module.exports = { rctdbExamples }; 