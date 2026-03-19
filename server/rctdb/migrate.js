const fs = require('fs');
const path = require('path');
const { rctdbpool } = require('./connection');

async function rctdbMigrate() {
  const rctdbclient = await rctdbpool.connect();
  
  try {
    // Read the Drizzle journal file to get ordered migrations
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

    // Keep track of which migrations have already been applied.
    // This custom table is separate from drizzle-kit internals.
    await rctdbclient.query(`
      CREATE TABLE IF NOT EXISTS "consort_migrations" (
        "tag" varchar PRIMARY KEY,
        "applied_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Run in deterministic order by idx, then timestamp for tie-break.
    const orderedEntries = [...journal.entries].sort((a, b) => {
      if (a.idx !== b.idx) return a.idx - b.idx;
      return a.when - b.when;
    });

    let appliedCount = 0;

    for (const entry of orderedEntries) {
      const alreadyAppliedResult = await rctdbclient.query(
        'SELECT 1 FROM "consort_migrations" WHERE "tag" = $1',
        [entry.tag]
      );

      if (alreadyAppliedResult.rowCount > 0) {
        continue;
      }

      const migrationSqlFile = `${entry.tag}.sql`;
      const migrationPath = path.join(drizzlePath, migrationSqlFile);

      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file not found: ${migrationSqlFile}`);
      }

      console.log(`🚀 Running database migration from: ${migrationSqlFile} (${entry.tag})...`);
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');

      try {
        await rctdbclient.query('BEGIN');
        await rctdbclient.query(migrationSql);
        await rctdbclient.query(
          'INSERT INTO "consort_migrations" ("tag") VALUES ($1)',
          [entry.tag]
        );
        await rctdbclient.query('COMMIT');
        appliedCount += 1;
      } catch (error) {
        await rctdbclient.query('ROLLBACK');
        throw error;
      }
    }

    if (appliedCount === 0) {
      console.log('✅ No pending migrations found.');
    } else {
      console.log(`✅ Migration completed successfully! Applied ${appliedCount} migration(s).`);
    }
    
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