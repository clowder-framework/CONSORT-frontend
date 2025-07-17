/**
 * Example usage of the RCT database connection module
 * This file demonstrates how to use the database connection in your RCT application
 * Updated to work with the authentication system from auth.js
 */

// TODO : Can be deleted after testing

const database = require('../rctdb');

// Example 1: Simple query execution with user context
async function getUserById(userId, requestingUser = null) {
    try {
        const result = await database.query(
            'SELECT * FROM users WHERE userid = $1',
            [userId]
        );
        
        console.log(`User query requested by: ${requestingUser?.username || 'system'}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Example 2: Transaction usage for complex operations with authentication
async function createUserWithPublication(userData, publicationData, authenticatedUser) {
    return await database.transaction(async (client) => {
        console.log(`Creating user and publication, requested by: ${authenticatedUser.username}`);
        
        // Insert user
        const userResult = await client.query(
            'INSERT INTO users (username, email, role) VALUES ($1, $2, $3) RETURNING userid',
            [userData.username, userData.email, userData.role]
        );
        const userId = userResult.rows[0].userid;

        // Insert publication linked to user
        const publicationResult = await client.query(
            'INSERT INTO publication (source, fileformat, datasetid) VALUES ($1, $2, $3) RETURNING publicationid',
            [publicationData.source, publicationData.fileformat, publicationData.datasetid]
        );

        return {
            userId,
            publicationId: publicationResult.rows[0].publicationid,
            createdBy: authenticatedUser.username
        };
    });
}

// Example 3: Using connection pool directly for streaming or bulk operations
async function getAllUsers() {
    try {
        const pool = await database.getDbConnection();
        const result = await pool.query('SELECT * FROM users ORDER BY createtime DESC');
        return result.rows;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
}

// Example 4: Updating annotation data (similar to Python update_db function)
// This is the main function called by the RCT pipeline
async function updateAnnotationData(dataArray, datasetId, statementType, authenticatedUser = null) {
    return await database.transaction(async (client) => {
        console.log(`Updating annotation data for dataset ${datasetId}, statement type: ${statementType}`);
        console.log(`Requested by: ${authenticatedUser?.username || 'system'}`);
        
        // Get or create user - use authenticated user if available
        let userId;
        if (authenticatedUser && authenticatedUser.id) {
            // Use authenticated user
            userId = authenticatedUser.id;
            
            // Make sure user exists in our database
            let userResult = await client.query(
                'SELECT userid FROM users WHERE userid = $1',
                [userId]
            );
            
            if (userResult.rows.length === 0) {
                // Create user in our database
                userResult = await client.query(
                    'INSERT INTO users (userid, username, email, role) VALUES ($1, $2, $3, $4) RETURNING userid',
                    [userId, authenticatedUser.username, authenticatedUser.email || null, 'user']
                );
                userId = userResult.rows[0].userid;
            }
        } else {
            // Use guest user for unauthenticated requests
            const userResult = await client.query(
                'INSERT INTO users (username, email, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username RETURNING userid',
                ['guest_user', 'guest_user@gmail.com', 'guest']
            );
            userId = userResult.rows[0].userid;
        }

        // Create publication record
        const publicationResult = await client.query(
            'INSERT INTO publication (source, fileformat, statementtype, datasetid, timestamp) VALUES ($1, $2, $3, $4, NOW()) RETURNING publicationid',
            [dataArray[0]?.file || 'unknown', 'csv', statementType, datasetId]
        );
        const publicationId = publicationResult.rows[0].publicationid;

        // Process each data item
        for (const item of dataArray) {
            // Create section
            const sectionResult = await client.query(
                'INSERT INTO section (publicationid, sectionname, sectiontext) VALUES ($1, $2, $3) RETURNING sectionid',
                [publicationId, item.section, item.sentence]
            );
            const sectionId = sectionResult.rows[0].sectionid;

            // Create sentence
            const sentenceResult = await client.query(
                'INSERT INTO sentence (sectionid, publicationid, sentencetext, coordinates, label) VALUES ($1, $2, $3, $4, $5) RETURNING sentenceid',
                [sectionId, publicationId, item.sentence, item.coordinates, item.label]
            );
            const sentenceId = sentenceResult.rows[0].sentenceid;

            // Create annotation
            const annotationResult = await client.query(
                'INSERT INTO annotation (publicationid, label, labelsource, userid) VALUES ($1, $2, $3, $4) RETURNING annid',
                [publicationId, item.label, 'model', userId]
            );
            const annId = annotationResult.rows[0].annid;

            // Link sentence and annotation
            await client.query(
                'INSERT INTO sentenceannotation (sentenceid, annid) VALUES ($1, $2)',
                [sentenceId, annId]
            );

            // Create feedback record
            await client.query(
                'INSERT INTO feedback (annid, userid, feedback) VALUES ($1, $2, $3)',
                [annId, userId, 0]
            );
        }

        console.log(`Successfully processed ${dataArray.length} annotation items`);
        return { 
            publicationId, 
            processed: dataArray.length,
            userId: userId,
            createdBy: authenticatedUser?.username || 'guest'
        };
    });
}

// Example 5: Application startup with database initialization
async function initializeApp() {
    try {
        console.log('Initializing RCT database connection...');
        
        // Setup database (creates pool and tables)
        await database.setupDb();
        
        // Test the connection
        const isConnected = await database.testConnection();
        if (!isConnected) {
            throw new Error('Database connection test failed');
        }
        
        console.log('RCT Database initialized successfully');
        console.log('Database config:', database.getDbConfig());
        
    } catch (error) {
        console.error('Failed to initialize RCT database:', error);
        process.exit(1);
    }
}

// Example 6: Get user by authentication info (similar to auth.js pattern)
async function getUserByAuthInfo(authUser) {
    try {
        if (!authUser || !authUser.id) {
            return null;
        }
        
        // Look up user in our database
        const result = await database.query(
            'SELECT * FROM users WHERE userid = $1',
            [authUser.id]
        );
        
        if (result.rows.length === 0) {
            // Create user if doesn't exist
            const createResult = await database.query(
                'INSERT INTO users (userid, username, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [authUser.id, authUser.name || 'unknown', authUser.email || null, 'user']
            );
            return createResult.rows[0];
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by auth info:', error);
        throw error;
    }
}

// Example 7: Submit feedback with authentication
async function submitUserFeedback(annId, feedback, authenticatedUser) {
    try {
        if (!authenticatedUser || !authenticatedUser.id) {
            throw new Error('Authentication required for feedback submission');
        }
        
        const result = await database.query(
            `INSERT INTO feedback (annid, userid, feedback, createtime) 
             VALUES ($1, $2, $3, NOW()) 
             ON CONFLICT (annid) DO UPDATE SET 
             feedback = EXCLUDED.feedback, 
             userid = EXCLUDED.userid, 
             createtime = EXCLUDED.createtime
             RETURNING *`,
            [annId, authenticatedUser.id, feedback]
        );
        
        console.log(`Feedback submitted by ${authenticatedUser.username} for annotation ${annId}`);
        return result.rows[0];
    } catch (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }
}

// Example 8: Graceful shutdown
async function gracefulShutdown() {
    console.log('Shutting down RCT database connection...');
    await database.closeDb();
    console.log('RCT Database connection closed');
}

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = {
    getUserById,
    createUserWithPublication,
    getAllUsers,
    updateAnnotationData,
    initializeApp,
    getUserByAuthInfo,
    submitUserFeedback,
    gracefulShutdown
};

// If this file is run directly, demonstrate the usage
if (require.main === module) {
    initializeApp()
        .then(() => {
            console.log('RCT Database examples ready to use');
        })
        .catch(console.error);
} 