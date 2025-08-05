require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const rctdbschema = require('./schema');

// Create PostgreSQL connection pool
const rctdbpool = new Pool({
  host: process.env.PGSERVER || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'consort',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Create Drizzle instance
const rctdb = drizzle(rctdbpool, { rctdbschema });

// Test connection function
async function rctdbTestConnection() {
  try {
    const client = await rctdbpool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await rctdbpool.end();
  process.exit(0);
});

module.exports = {
  rctdb,
  rctdbpool,
  rctdbTestConnection
}; 