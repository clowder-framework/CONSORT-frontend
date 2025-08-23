const fs = require('fs');
const path = require('path');
const { rctdbpool } = require('./connection');

async function rctdbMigrate() {
  const rctdbclient = await rctdbpool.connect();
  
  try {
    // Read the SQL schema file
    const rctdbschemaPath = path.join(__dirname, '../rctdbschema.sql');
    const rctdbschema = fs.readFileSync(rctdbschemaPath, 'utf8');
    
    console.log('🚀 Running database migration...');
    
    // Execute the schema
    await rctdbclient.query(rctdbschema);
    
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