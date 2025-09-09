require('dotenv').config();

module.exports = {
  schema: './rctdb/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.PGSERVER || 'localhost',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'consort',
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    table: 'drizzle_migrations',
    schema: 'public'
  }
}; 
