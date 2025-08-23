import axios from 'axios';

// Configuration
const DEFAULT_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api/rctdb' 
  : '/api/rctdb';
// const DEFAULT_TIMEOUT = 60000; // 60 seconds

/**
 * RCTDB API Client
 * Provides methods to interact with all RCTDB routes
 */
class RCTDBClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || DEFAULT_BASE_URL;
    // this.timeout = config.timeout || DEFAULT_TIMEOUT;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      // timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[RCTDB] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[RCTDB] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[RCTDB] Response error:', error);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw error;
      }
    );
  }

  // ============ USER METHODS ============

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Promise<Object>} Created user object
   */
  async upsertUser(userData) {
    const response = await this.client.post('/users', userData);
    return response.data;
  }

  /**
   * Get user by UUID
   * @param {number} uuid - User UUID
   * @returns {Promise<Object>} User object
   */
  async getUserByEmail(email) {
    const response = await this.client.get(`/users/${email}`);
    return response.data;
  }

  // ============ PUBLICATION METHODS ============

  /**
   * Get all publications with user information
   * @returns {Promise<Array>} Array of publications with user data
   */
  async getAllPublications() {
    const response = await this.client.get('/publications');
    return response.data;
  }

  /**
   * Create a new publication
   * @param {Object} publicationData - Publication data object
   * @returns {Promise<Object>} Created publication object
   */
  async upsertPublication(publicationData) {
    const response = await this.client.post('/publications', publicationData);
    return response.data;
  }

  /**
   * Get publication by UUID
   * @param {number} uuid - Publication UUID
   * @returns {Promise<Object>} Publication object
   */
  async getPublicationByUuid(uuid) {
    const response = await this.client.get(`/publications/${uuid}`);
    return response.data;
  }

  /**
   * Get annotations for a specific publication
   * @param {number} publicationUuid - Publication UUID
   * @returns {Promise<Array>} Array of annotations with context
   */
  async getPublicationAnnotations(publicationUuid) {
    const response = await this.client.get(`/publications/${publicationUuid}/annotations`);
    return response.data;
  }

  // ============ ANNOTATION METHODS ============

  /**
   * Create a new annotation
   * @param {Object} annotationData - Annotation data object
   * @returns {Promise<Object>} Created annotation object
   */
  async createAnnotation(annotationData) {
    const response = await this.client.post('/annotations', annotationData);
    return response.data;
  }

  /**
   * Update an existing annotation
   * @param {number} uuid - Annotation UUID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated annotation object
   */
  async updateAnnotation(uuid, updateData) {
    const response = await this.client.put(`/annotations/${uuid}`, updateData);
    return response.data;
  }

  /**
   * Get feedback for a specific annotation
   * @param {number} annotationUuid - Annotation UUID
   * @returns {Promise<Array>} Array of feedback objects
   */
  async getAnnotationFeedback(annotationUuid) {
    const response = await this.client.get(`/annotations/${annotationUuid}/feedback`);
    return response.data;
  }

  // ============ FEEDBACK METHODS ============

  /**
   * Create feedback for an annotation
   * @param {Object} feedbackData - Feedback data object
   * @returns {Promise<Object>} Created feedback object
   */
  async createFeedback(feedbackData) {
    const response = await this.client.post('/feedback', feedbackData);
    return response.data;
  }

  // ============ HEALTH CHECK ============

  /**
   * Check the health of the RCTDB service
   * @returns {Promise<Object>} Health status object
   */
  async checkHealth() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ============ UTILITY METHODS ============

  /**
   * Test connection to the RCTDB service
   * @returns {Promise<boolean>} True if connection is healthy
   */
  async testConnection() {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch (error) {
      console.error('[RCTDB] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Set authorization token for authenticated requests
   * @param {string} token - Authorization token
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

}

// ============ CONVENIENCE METHODS ============

/**
 * Create a default RCTDB client instance
 * @param {Object} config - Optional configuration
 * @returns {RCTDBClient} RCTDB client instance
 */
export const createRCTDBClient = (config = {}) => {
  return new RCTDBClient(config);
};

/**
 * Default client instance
 */
export const rctdbClient = new RCTDBClient();


export default RCTDBClient;