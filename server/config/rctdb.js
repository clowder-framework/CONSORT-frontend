require('dotenv').config();

/**
 * Database configuration class following the same pattern as the Python DbConfig
 * Uses environment variables for all sensitive database credentials
 */
class DbConfig {
    constructor() {
        // PostgreSQL configuration using environment variables
        this.server = process.env.PGSERVER || 'localhost';
        
        // Clean port value by stripping quotes and converting to int
        const rawPort = process.env.PGPORT || '5432';
        const portStr = rawPort.replace(/['"\\]/g, '');
        this.port = parseInt(portStr, 10);
        
        this.user = process.env.PGUSER || 'consort';
        this.password = process.env.PGPASSWORD || 'password';
        this.database = process.env.PGDATABASE || 'consort';
        this.driver = 'postgresql';
        
        // Connection pool settings
        this.pool = {
            max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
            min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
            idle: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 10000,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT, 10) || 60000,
        };
        
        // SSL configuration for production
        this.ssl = process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false;
        
        // Validate required configuration
        this.validate();
    }
    
    /**
     * Validate that all required configuration is present
     */
    validate() {
        const requiredFields = ['server', 'port', 'user', 'password', 'database'];
        const missing = requiredFields.filter(field => !this[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
        }
        
        if (isNaN(this.port)) {
            throw new Error('Database port must be a valid number');
        }
    }
    
    /**
     * Get connection string for PostgreSQL
     */
    getConnectionString() {
        return `postgresql://${this.user}:${this.password}@${this.server}:${this.port}/${this.database}`;
    }
    
    /**
     * Get configuration object for Sequelize/Knex
     */
    getSequelizeConfig() {
        return {
            dialect: 'postgres',
            host: this.server,
            port: this.port,
            username: this.user,
            password: this.password,
            database: this.database,
            pool: this.pool,
            dialectOptions: {
                ssl: this.ssl
            },
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        };
    }
    
    /**
     * Get configuration object for node-postgres (pg)
     */
    getPgConfig() {
        return {
            host: this.server,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database,
            ssl: this.ssl,
            max: this.pool.max,
            min: this.pool.min,
            idleTimeoutMillis: this.pool.idle,
            connectionTimeoutMillis: this.pool.acquire
        };
    }
}

module.exports = DbConfig; 