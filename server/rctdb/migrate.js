const fs = require('fs');
const path = require('path');
const { rctdbpool } = require('./connection');

async function rctdbMigrate() {
  const rctdbclient = await rctdbpool.connect();
  
  try {
    // Read the Drizzle journal file to get the latest migration
    const drizzlePath = path.join(__dirname, '../drizzle');
    const journalPath = path.join(drizzlePath, 'meta/_journal.json');
    
    if (!fs.existsSync(journalPath)) {
      throw new Error('Drizzle journal file not found at meta/_journal.json');
    }
    
    const journalContent = fs.readFileSync(journalPath, 'utf8');
    const journal = JSON.parse(journalContent);
    
    if (!journal.entries || journal.entries.length === 0) {
      throw new Error('No migration entries found in journal file');
    }
    
    // Get the latest migration entry (highest idx or most recent timestamp)
    const latestEntry = journal.entries.reduce((latest, current) => {
      return (current.when > latest.when) ? current : latest;
    });
    
    const latestSqlFile = `${latestEntry.tag}.sql`;
    const migrationPath = path.join(drizzlePath, latestSqlFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${latestSqlFile}`);
    }
    
    console.log(`🚀 Running database migration from: ${latestSqlFile} (${latestEntry.tag})...`);
    
    // Read and execute the latest migration SQL
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await rctdbclient.query(migrationSql);
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    rctdbclient.release();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  rctdbMigrate()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { rctdbMigrate }; 