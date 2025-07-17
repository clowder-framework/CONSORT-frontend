/**
 * Database Client Utilities
 * Frontend utilities for interacting with the database API
 * These functions make HTTP requests to the server's database API endpoints
 */

import axios from 'axios';

// Get the base URL for the server API
const getServerBaseUrl = () => {
    // In development, the server runs on a different port
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001'; // Adjust port as needed
    }
    // In production, assume same domain
    return '';
};

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: `${getServerBaseUrl()}/api/rctdb`,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response.data, // Return just the data part
    (error) => {
        console.error('Database API Error:', error);
        
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data.message || error.response.data.error || 'Server error');
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Something else happened
            throw new Error(error.message || 'Unknown error occurred');
        }
    }
);

/**
 * Test database connection
 */
export async function testDatabaseConnection() {
    try {
        const response = await apiClient.get('/test');
        return response;
    } catch (error) {
        console.error('Failed to test database connection:', error);
        throw error;
    }
}

/**
 * Store annotation data (equivalent to Python update_db function)
 * @param {Array} dataArray - Array of annotation data objects
 * @param {string} datasetId - Dataset ID
 * @param {string} statementType - Statement type (e.g., 'consort', 'spirit')
 */
export async function storeAnnotationData(dataArray, datasetId, statementType) {
    try {
        const response = await apiClient.post('/annotations', {
            dataArray,
            datasetId,
            statementType
        });
        return response;
    } catch (error) {
        console.error('Failed to store annotation data:', error);
        throw error;
    }
}

/**
 * Get publications with optional filtering
 * @param {Object} options - Query options
 * @param {string} options.datasetId - Filter by dataset ID
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 */
export async function getPublications(options = {}) {
    try {
        const params = new URLSearchParams();
        if (options.datasetId) params.append('datasetId', options.datasetId);
        if (options.limit) params.append('limit', options.limit.toString());
        if (options.offset) params.append('offset', options.offset.toString());
        
        const response = await apiClient.get(`/publications?${params.toString()}`);
        return response;
    } catch (error) {
        console.error('Failed to get publications:', error);
        throw error;
    }
}

/**
 * Get sentences for a specific publication
 * @param {number} publicationId - Publication ID
 * @param {Object} options - Query options
 * @param {string} options.sectionName - Filter by section name
 * @param {number} options.limit - Maximum number of results
 */
export async function getPublicationSentences(publicationId, options = {}) {
    try {
        const params = new URLSearchParams();
        if (options.sectionName) params.append('sectionName', options.sectionName);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const response = await apiClient.get(`/publications/${publicationId}/sentences?${params.toString()}`);
        return response;
    } catch (error) {
        console.error('Failed to get publication sentences:', error);
        throw error;
    }
}

/**
 * Get annotations with optional filtering
 * @param {Object} options - Query options
 * @param {number} options.publicationId - Filter by publication ID
 * @param {number} options.userId - Filter by user ID
 * @param {string} options.labelSource - Filter by label source
 * @param {number} options.limit - Maximum number of results
 */
export async function getAnnotations(options = {}) {
    try {
        const params = new URLSearchParams();
        if (options.publicationId) params.append('publicationId', options.publicationId.toString());
        if (options.userId) params.append('userId', options.userId.toString());
        if (options.labelSource) params.append('labelSource', options.labelSource);
        if (options.limit) params.append('limit', options.limit.toString());
        
        const response = await apiClient.get(`/annotations?${params.toString()}`);
        return response;
    } catch (error) {
        console.error('Failed to get annotations:', error);
        throw error;
    }
}

/**
 * Submit feedback for an annotation
 * @param {number} annId - Annotation ID
 * @param {number} userId - User ID
 * @param {number} feedback - Feedback value (e.g., 1 for positive, -1 for negative, 0 for neutral)
 */
export async function submitFeedback(annId, userId, feedback) {
    try {
        const response = await apiClient.post('/feedback', {
            annId,
            userId,
            feedback
        });
        return response;
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        throw error;
    }
}

/**
 * Get or create a user by email
 * @param {string} email - User email
 */
export async function getUserByEmail(email) {
    try {
        const response = await apiClient.get(`/users/${encodeURIComponent(email)}`);
        return response;
    } catch (error) {
        console.error('Failed to get user:', error);
        throw error;
    }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
    try {
        const response = await apiClient.get('/stats');
        return response;
    } catch (error) {
        console.error('Failed to get database stats:', error);
        throw error;
    }
}

/**
 * Get database configuration info
 */
export async function getDatabaseConfig() {
    try {
        const response = await apiClient.get('/config');
        return response;
    } catch (error) {
        console.error('Failed to get database config:', error);
        throw error;
    }
}

/**
 * Helper function to handle common data transformations
 * Transform RCT pipeline data to the format expected by the database
 * @param {Array} rctResults - Results from RCT processing
 * @param {Object} fileInfo - File information
 * @param {Object} datasetInfo - Dataset information
 */
export function transformRctDataForDatabase(rctResults, fileInfo, datasetInfo) {
    return rctResults.map((item, index) => ({
        file: fileInfo.filename || fileInfo.name || 'unknown',
        section: item.section || 'unknown',
        sentence: item.sentence || item.text || '',
        coordinates: item.coordinates || '',
        section_sentence: index, // Use array index as section_sentence
        prev_section: item.prev_section || '',
        next_section: item.next_section || '',
        tokenized_sentence: item.tokenized_sentence || item.sentence || '',
        label: Array.isArray(item.label) ? item.label : [item.label || '0']
    }));
}

/**
 * Convenience function to store RCT pipeline results
 * @param {Array} rctResults - Results from RCT processing
 * @param {Object} fileInfo - File information
 * @param {Object} datasetInfo - Dataset information
 * @param {string} statementType - Statement type ('consort' or 'spirit')
 */
export async function storeRctResults(rctResults, fileInfo, datasetInfo, statementType = 'consort') {
    try {
        const transformedData = transformRctDataForDatabase(rctResults, fileInfo, datasetInfo);
        const result = await storeAnnotationData(transformedData, datasetInfo.id, statementType);
        
        console.log(`Successfully stored ${transformedData.length} annotations for dataset ${datasetInfo.id}`);
        return result;
    } catch (error) {
        console.error('Failed to store RCT results:', error);
        throw error;
    }
}

export default {
    testDatabaseConnection,
    storeAnnotationData,
    getPublications,
    getPublicationSentences,
    getAnnotations,
    submitFeedback,
    getUserByEmail,
    getDatabaseStats,
    getDatabaseConfig,
    transformRctDataForDatabase,
    storeRctResults
}; 