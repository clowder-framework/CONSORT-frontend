const { Pool } = require('pg');
const DbConfig = require('./config/rctdb');

let pool = null;
let dbConfig = null;

/**
 * Setup database connection pool
 * Similar to setup_db() in the Python implementation
 */
function setupDb() {
    if (!dbConfig) {
        dbConfig = new DbConfig();
    }
    
    if (!pool) {
        const config = dbConfig.getPgConfig();
        pool = new Pool(config);
        
        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
        
        // Handle pool connection events
        pool.on('connect', () => {
            console.log('Connected to PostgreSQL database');
        });
        
        // Create tables if they don't exist (basic schema)
        createTablesIfNotExist();
    }
    
    return pool;
}

/**
 * Get database connection from pool
 * Similar to get_db_session() in the Python implementation
 */
async function getDbConnection() {
    if (!pool) {
        setupDb();
    }
    return pool;
}

/**
 * Get a single client from the pool for transactions
 */
async function getDbClient() {
    if (!pool) {
        setupDb();
    }
    return await pool.connect();
}

/**
 * Execute a query with automatic connection management
 */
async function query(text, params) {
    const client = await getDbConnection();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Execute a transaction with automatic rollback on error
 */
async function transaction(callback) {
    const client = await getDbClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Create basic tables if they don't exist
 * This mirrors the table creation in the Python models
 */
async function createTablesIfNotExist() {
    try {
        const client = await getDbConnection();
        
        // Users table (similar to Users model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                userid SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE,
                email VARCHAR(255) UNIQUE,
                createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                role VARCHAR(50) DEFAULT 'user'
            )
        `);
        
        // Publication table (similar to Publication model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS publication (
                publicationid SERIAL PRIMARY KEY,
                source VARCHAR(255),
                fileformat VARCHAR(50),
                journalname VARCHAR(255),
                statementtype VARCHAR(100),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                datasetid VARCHAR(255),
                plaintext TEXT,
                content TEXT,
                othermetadata TEXT
            )
        `);
        
        // Section table (similar to Section model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS section (
                sectionid SERIAL PRIMARY KEY,
                publicationid INTEGER REFERENCES publication(publicationid),
                beginoffset INTEGER,
                endoffset INTEGER,
                sectionname VARCHAR(255),
                parentname VARCHAR(255),
                topsectionname VARCHAR(255),
                normalizedsectionname VARCHAR(255),
                sectiontext TEXT
            )
        `);
        
        // Sentence table (similar to Sentence model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS sentence (
                sentenceid SERIAL PRIMARY KEY,
                sectionid INTEGER REFERENCES section(sectionid),
                publicationid INTEGER REFERENCES publication(publicationid),
                beginoffset INTEGER,
                endoffset INTEGER,
                coordinates TEXT,
                sentenceno INTEGER,
                sentencetext TEXT,
                label VARCHAR(255) DEFAULT '0'
            )
        `);
        
        // Annotation table (similar to Annotation model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS annotation (
                annid SERIAL PRIMARY KEY,
                publicationid INTEGER REFERENCES publication(publicationid),
                label VARCHAR(255) DEFAULT '0',
                labelsource VARCHAR(100) DEFAULT 'model',
                modelname VARCHAR(100) DEFAULT 'model',
                modelversion VARCHAR(50) DEFAULT '0.1',
                userid INTEGER REFERENCES users(userid),
                createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted BOOLEAN DEFAULT FALSE,
                deletetime VARCHAR(255)
            )
        `);
        
        // SentenceAnnotation table (similar to SentenceAnnotation model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS sentenceannotation (
                sentenceannid SERIAL PRIMARY KEY,
                sentenceid INTEGER REFERENCES sentence(sentenceid),
                annid INTEGER REFERENCES annotation(annid)
            )
        `);
        
        // Feedback table (similar to Feedback model in Python)
        await client.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                annid INTEGER REFERENCES annotation(annid) PRIMARY KEY,
                userid INTEGER REFERENCES users(userid),
                createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                feedback INTEGER DEFAULT 0
            )
        `);
        
        console.log('Database tables created/verified successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

/**
 * Close database connection pool
 */
async function closeDb() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection pool closed');
    }
}

/**
 * Get database configuration (for debugging/info)
 */
function getDbConfig() {
    if (!dbConfig) {
        dbConfig = new DbConfig();
    }
    
    // Return config without sensitive information
    return {
        server: dbConfig.server,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        driver: dbConfig.driver,
        pool: dbConfig.pool
    };
}

/**
 * Test database connection
 */
async function testConnection() {
    try {
        const client = await getDbConnection();
        const result = await client.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

module.exports = {
    setupDb,
    getDbConnection,
    getDbClient,
    query,
    transaction,
    createTablesIfNotExist,
    closeDb,
    getDbConfig,
    testConnection
}; 