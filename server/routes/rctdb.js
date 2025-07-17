const express = require('express');
const router = express.Router();
const database = require('../rctdb');
const { updateAnnotationData } = require('../examples/database-usage');

/**
 * RCT Database API Routes
 * These routes provide HTTP endpoints for frontend to interact with the RCT database
 */

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Import middleware
const { 
    initializeDatabase, 
    validateAnnotationData, 
    validateFeedback,
    logDatabaseRequests,
    corsForDatabase,
    requireAuth,
    optionalAuth
} = require('../middleware/rctdb');

// Apply middleware
router.use(corsForDatabase);
router.use(logDatabaseRequests);
router.use(initializeDatabase);
router.use(express.json());

/**
 * GET /api/rctdb/test
 * Test database connection
 */
router.get('/test', asyncHandler(async (req, res) => {
    const isConnected = await database.testConnection();
    res.json({
        success: isConnected,
        message: isConnected ? 'Database connection successful' : 'Database connection failed',
        timestamp: new Date().toISOString()
    });
}));

/**
 * GET /api/rctdb/config
 * Get database configuration info (without sensitive data)
 */
router.get('/config', asyncHandler(async (req, res) => {
    const config = database.getDbConfig();
    res.json({
        success: true,
        config: config
    });
}));

/**
 * POST /api/rctdb/annotations
 * Store annotation data (similar to Python update_db function)
 * Body: { dataArray, datasetId, statementType }
 * Requires authentication
 */
router.post('/annotations', requireAuth, validateAnnotationData, asyncHandler(async (req, res) => {
    const { dataArray, datasetId, statementType } = req.body;
    
    console.log(`Storing annotations for user: ${req.authenticatedUser.username}, dataset: ${datasetId}`);
    
    const result = await updateAnnotationData(dataArray, datasetId, statementType);
    
    res.json({
        success: true,
        message: 'Annotation data stored successfully',
        data: result,
        user: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/publications
 * Get publications, optionally filtered by dataset ID
 * Uses optional auth to provide user context but allow anonymous access
 */
router.get('/publications', optionalAuth, asyncHandler(async (req, res) => {
    const { datasetId, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM publication';
    let params = [];
    
    if (datasetId) {
        query += ' WHERE datasetid = $1';
        params.push(datasetId);
        query += ' ORDER BY timestamp DESC LIMIT $2 OFFSET $3';
        params.push(limit, offset);
    } else {
        query += ' ORDER BY timestamp DESC LIMIT $1 OFFSET $2';
        params.push(limit, offset);
    }
    
    const result = await database.query(query, params);
    
    res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        user: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/publications/:publicationId/sentences
 * Get sentences for a specific publication
 */
router.get('/publications/:publicationId/sentences', optionalAuth, asyncHandler(async (req, res) => {
    const { publicationId } = req.params;
    const { sectionName, limit = 100 } = req.query;
    
    let query = `
        SELECT s.*, sec.sectionname, a.label as annotation_label, a.labelsource
        FROM sentence s
        LEFT JOIN section sec ON s.sectionid = sec.sectionid
        LEFT JOIN sentenceannotation sa ON s.sentenceid = sa.sentenceid
        LEFT JOIN annotation a ON sa.annid = a.annid
        WHERE s.publicationid = $1
    `;
    let params = [publicationId];
    
    if (sectionName) {
        query += ' AND sec.sectionname = $2';
        params.push(sectionName);
        query += ' ORDER BY s.sentenceno LIMIT $3';
        params.push(limit);
    } else {
        query += ' ORDER BY s.sentenceno LIMIT $2';
        params.push(limit);
    }
    
    const result = await database.query(query, params);
    
    res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        user: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/annotations
 * Get annotations with optional filtering
 */
router.get('/annotations', optionalAuth, asyncHandler(async (req, res) => {
    const { publicationId, userId, labelSource, limit = 50 } = req.query;
    
    let query = `
        SELECT a.*, u.username, p.source as publication_source
        FROM annotation a
        LEFT JOIN users u ON a.userid = u.userid
        LEFT JOIN publication p ON a.publicationid = p.publicationid
        WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (publicationId) {
        paramCount++;
        query += ` AND a.publicationid = $${paramCount}`;
        params.push(publicationId);
    }
    
    if (userId) {
        paramCount++;
        query += ` AND a.userid = $${paramCount}`;
        params.push(userId);
    }
    
    if (labelSource) {
        paramCount++;
        query += ` AND a.labelsource = $${paramCount}`;
        params.push(labelSource);
    }
    
    paramCount++;
    query += ` ORDER BY a.createtime DESC LIMIT $${paramCount}`;
    params.push(limit);
    
    const result = await database.query(query, params);
    
    res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        user: req.authenticatedUser.username
    });
}));

/**
 * POST /api/rctdb/feedback
 * Submit feedback for an annotation
 * Requires authentication
 */
router.post('/feedback', requireAuth, validateFeedback, asyncHandler(async (req, res) => {
    const { annId, feedback } = req.body;
    
    // Use the authenticated user's ID instead of requiring it in the body
    const userId = req.authenticatedUser.id;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID not available from authentication session'
        });
    }
    
    // Update or insert feedback
    const result = await database.query(
        `INSERT INTO feedback (annid, userid, feedback, createtime) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (annid) DO UPDATE SET 
         feedback = EXCLUDED.feedback, 
         userid = EXCLUDED.userid, 
         createtime = EXCLUDED.createtime
         RETURNING *`,
        [annId, userId, feedback]
    );
    
    res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: result.rows[0],
        user: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/users/:email
 * Get or create a user by email
 * Requires authentication
 */
router.get('/users/:email', requireAuth, asyncHandler(async (req, res) => {
    const { email } = req.params;
    
    let user = await database.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    
    if (user.rows.length === 0) {
        // Create default user if not exists
        const username = email.split('@')[0]; // Use email prefix as username
        user = await database.query(
            'INSERT INTO users (username, email, role) VALUES ($1, $2, $3) RETURNING *',
            [username, email, 'user']
        );
    }
    
    res.json({
        success: true,
        data: user.rows[0],
        requestedBy: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/stats
 * Get database statistics
 */
router.get('/stats', optionalAuth, asyncHandler(async (req, res) => {
    const stats = await database.transaction(async (client) => {
        const publications = await client.query('SELECT COUNT(*) as count FROM publication');
        const sentences = await client.query('SELECT COUNT(*) as count FROM sentence');
        const annotations = await client.query('SELECT COUNT(*) as count FROM annotation');
        const users = await client.query('SELECT COUNT(*) as count FROM users');
        
        return {
            publications: parseInt(publications.rows[0].count),
            sentences: parseInt(sentences.rows[0].count),
            annotations: parseInt(annotations.rows[0].count),
            users: parseInt(users.rows[0].count)
        };
    });
    
    res.json({
        success: true,
        data: stats,
        user: req.authenticatedUser.username
    });
}));

/**
 * GET /api/rctdb/user/current
 * Get current authenticated user info
 * Similar to /getUser in auth.js but returns RCT DB format
 */
router.get('/user/current', requireAuth, asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            isAuthenticated: true,
            user: req.authenticatedUser
        }
    });
}));

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('RCT Database API Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

module.exports = router; 