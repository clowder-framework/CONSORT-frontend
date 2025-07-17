/**
 * Database Middleware
 * Provides middleware for database initialization, error handling, and request validation
 */

// TODO : can be simplified

const database = require('../rctdb');

/**
 * Initialize database connection middleware
 * Ensures database is set up before handling requests
 */
async function initializeDatabase(req, res, next) {
    try {
        // Initialize database if not already done
        await database.setupDb();
        next();
    } catch (error) {
        console.error('Database initialization failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database initialization failed',
            message: error.message
        });
    }
}

/**
 * Validate request body for annotation data
 */
function validateAnnotationData(req, res, next) {
    const { dataArray, datasetId, statementType } = req.body;
    
    if (!dataArray || !Array.isArray(dataArray)) {
        return res.status(400).json({
            success: false,
            error: 'dataArray is required and must be an array'
        });
    }
    
    if (!datasetId || typeof datasetId !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'datasetId is required and must be a string'
        });
    }
    
    if (!statementType || typeof statementType !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'statementType is required and must be a string'
        });
    }
    
    // Validate each item in dataArray has required fields
    for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];
        if (!item.sentence || typeof item.sentence !== 'string') {
            return res.status(400).json({
                success: false,
                error: `dataArray[${i}].sentence is required and must be a string`
            });
        }
        
        if (!item.section || typeof item.section !== 'string') {
            return res.status(400).json({
                success: false,
                error: `dataArray[${i}].section is required and must be a string`
            });
        }
    }
    
    next();
}

/**
 * Validate feedback request
 */
function validateFeedback(req, res, next) {
    const { annId, userId, feedback } = req.body;
    
    if (!annId || typeof annId !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'annId is required and must be a number'
        });
    }
    
    if (!userId || typeof userId !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'userId is required and must be a number'
        });
    }
    
    if (feedback === undefined || typeof feedback !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'feedback is required and must be a number'
        });
    }
    
    next();
}

/**
 * Rate limiting middleware for database operations
 */
function rateLimitDatabase(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();
    
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Clean up old entries
        for (const [id, timestamps] of requests.entries()) {
            requests.set(id, timestamps.filter(timestamp => now - timestamp < windowMs));
            if (requests.get(id).length === 0) {
                requests.delete(id);
            }
        }
        
        // Check current client
        const clientRequests = requests.get(clientId) || [];
        
        if (clientRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests',
                message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs/1000/60} minutes.`
            });
        }
        
        // Add current request
        clientRequests.push(now);
        requests.set(clientId, clientRequests);
        
        next();
    };
}

/**
 * Authentication middleware using the same pattern as auth.js
 * Checks req.isAuthenticated() and gets user info from req.user
 */
function requireAuth(req, res, next) {
    // Check if user is authenticated using the same method as auth.js
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'You must be logged in to access this resource'
        });
    }
    
    // Check if user object exists
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'User information not available',
            message: 'Authentication session is invalid'
        });
    }
    
    // Add user info to request for downstream middleware/routes
    // This follows the same pattern as getUser in auth.js
    req.authenticatedUser = {
        id: req.user.id || null,
        username: req.user.name || 'anonymous',
        email: req.user.email || null,
        // Add any other user fields you need
    };
    
    console.log(`[RCT DB Auth] User ${req.authenticatedUser.username} accessing ${req.method} ${req.path}`);
    
    next();
}

/**
 * Optional authentication middleware - allows both authenticated and anonymous users
 * But provides user info if available
 */
function optionalAuth(req, res, next) {
    if (req.isAuthenticated() && req.user) {
        // User is authenticated, add user info
        req.authenticatedUser = {
            id: req.user.id || null,
            username: req.user.name || 'anonymous',
            email: req.user.email || null,
        };
    } else {
        // User is not authenticated, use anonymous user
        req.authenticatedUser = {
            id: null,
            username: 'anonymous',
            email: null,
        };
    }
    
    next();
}

/**
 * Database health check middleware
 */
async function checkDatabaseHealth(req, res, next) {
    try {
        const isHealthy = await database.testConnection();
        if (!isHealthy) {
            return res.status(503).json({
                success: false,
                error: 'Database is not available',
                message: 'Database health check failed'
            });
        }
        next();
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(503).json({
            success: false,
            error: 'Database health check failed',
            message: error.message
        });
    }
}

/**
 * Request logging middleware for database operations
 */
function logDatabaseRequests(req, res, next) {
    const start = Date.now();
    
    // Log request
    console.log(`[RCT DB API] ${req.method} ${req.path} - Start`);
    
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        const status = data.success ? 'SUCCESS' : 'ERROR';
        console.log(`[RCT DB API] ${req.method} ${req.path} - ${status} (${duration}ms)`);
        
        if (!data.success && data.error) {
            console.error(`[RCT DB API ERROR] ${data.error}: ${data.message || ''}`);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
}

/**
 * CORS middleware for database API
 */
function corsForDatabase(req, res, next) {
    // Allow requests from your frontend domain
    const allowedOrigins = [
        'http://localhost:3000',  // React dev server
        'http://localhost:3001',  // Alternative port
        process.env.UI_URL        // Production frontend URL
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}

module.exports = {
    initializeDatabase,
    validateAnnotationData,
    validateFeedback,
    rateLimitDatabase,
    requireAuth,
    optionalAuth,
    checkDatabaseHealth,
    logDatabaseRequests,
    corsForDatabase
}; 