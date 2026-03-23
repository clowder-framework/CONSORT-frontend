/**
 * RCTDB Client Usage Examples
 * 
 * This file demonstrates how to use the RCTDB client to interact with the RCTDB API.
 * Make sure to install axios first: npm install axios
 */
import React from 'react';
import { rctdbClient, rctdbAPI, createRCTDBClient } from './rctdb-client.js';

// ============ BASIC USAGE EXAMPLES ============

/**
 * Example 1: Using the default client instance
 */
export async function exampleBasicUsage() {
  try {
    // Test connection
    const isHealthy = await rctdbClient.testConnection();
    console.log('RCTDB Connection:', isHealthy ? 'OK' : 'Failed');

    // Get all users
    const users = await rctdbClient.getAllUsers();
    console.log('Users:', users);

    // Get all publications
    const publications = await rctdbClient.getAllPublications();
    console.log('Publications:', publications);

  } catch (error) {
    console.error('Error in basic usage:', error);
  }
}

/**
 * Example 2: Using the convenience API
 */
export async function exampleConvenienceAPI() {
  try {
    // Using shorthand methods
    const users = await rctdbAPI.users.getAll();
    const publications = await rctdbAPI.publications.getAll();
    const healthStatus = await rctdbAPI.health.check();

    console.log('Users:', users.length);
    console.log('Publications:', publications.length);
    console.log('Health:', healthStatus);

  } catch (error) {
    console.error('Error in convenience API:', error);
  }
}

/**
 * Example 3: Creating a custom client with configuration
 */
export async function exampleCustomClient() {
  try {
    // Create client with custom configuration
    const customClient = createRCTDBClient({
      baseURL: 'http://localhost:3001/rctdb',
      timeout: 15000,
      headers: {
        'X-Custom-Header': 'MyApp/1.0'
      }
    });

    // Set auth token if needed
    customClient.setAuthToken('your-jwt-token-here');

    const users = await customClient.getAllUsers();
    console.log('Custom client users:', users);

  } catch (error) {
    console.error('Error in custom client:', error);
  }
}

// ============ CRUD OPERATION EXAMPLES ============

/**
 * Example 4: User management operations
 */
export async function exampleUserOperations() {
  try {
    // Create a new user
    const newUser = await rctdbClient.createUser({
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'researcher'
    });
    console.log('Created user:', newUser);

    // Get user by UUID
    const user = await rctdbClient.getUserByUuid(newUser.uuid);
    console.log('Retrieved user:', user);

    // Get all users
    const allUsers = await rctdbClient.getAllUsers();
    console.log('Total users:', allUsers.length);

  } catch (error) {
    console.error('Error in user operations:', error);
  }
}

/**
 * Example 5: Publication management operations
 */
export async function examplePublicationOperations() {
  try {
    // Create a new publication
    const newPublication = await rctdbClient.createPublication({
      title: 'My Research Paper',
      abstract: 'This is an abstract of my research paper.',
      authors: ['John Doe', 'Jane Smith'],
      journal: 'Nature',
      year: 2024,
      doi: '10.1000/example.doi',
      user_uuid: 1 // Assuming user with UUID 1 exists
    });
    console.log('Created publication:', newPublication);

    // Get publication by UUID
    const publication = await rctdbClient.getPublicationByUuid(newPublication.uuid);
    console.log('Retrieved publication:', publication);

    // Get annotations for this publication
    const annotations = await rctdbClient.getPublicationAnnotations(newPublication.uuid);
    console.log('Publication annotations:', annotations);

  } catch (error) {
    console.error('Error in publication operations:', error);
  }
}

/**
 * Example 6: Annotation and feedback operations
 */
export async function exampleAnnotationOperations() {
  try {
    // Create an annotation
    const newAnnotation = await rctdbClient.createAnnotation({
      publication_uuid: 1, // Assuming publication with UUID 1 exists
      user_uuid: 1, // Assuming user with UUID 1 exists
      text: 'This is an important finding',
      page_number: 5,
      coordinates: { x: 100, y: 200, width: 300, height: 50 },
      annotation_type: 'highlight'
    });
    console.log('Created annotation:', newAnnotation);

    // Update the annotation
    const updatedAnnotation = await rctdbClient.updateAnnotation(newAnnotation.uuid, {
      text: 'This is a very important finding - updated'
    });
    console.log('Updated annotation:', updatedAnnotation);

    // Create feedback for the annotation
    const feedback = await rctdbClient.createFeedback({
      annotation_uuid: newAnnotation.uuid,
      user_uuid: 2, // Different user providing feedback
      feedback_type: 'agree',
      comment: 'I agree with this annotation'
    });
    console.log('Created feedback:', feedback);

    // Get all feedback for the annotation
    const allFeedback = await rctdbClient.getAnnotationFeedback(newAnnotation.uuid);
    console.log('All feedback:', allFeedback);

  } catch (error) {
    console.error('Error in annotation operations:', error);
  }
}

// ============ ERROR HANDLING EXAMPLES ============

/**
 * Example 7: Error handling and retry logic
 */
export async function exampleErrorHandling() {
  try {
    // Try to get a non-existent user
    const user = await rctdbClient.getUserByUuid(99999);
    console.log('User:', user);
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('User not found - this is expected');
    } else {
      console.error('Unexpected error:', error);
    }
  }

  // Example with retry logic
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const health = await rctdbClient.checkHealth();
      console.log('Health check successful:', health);
      break;
    } catch (error) {
      retries++;
      console.log(`Health check failed, retry ${retries}/${maxRetries}`);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached, service unavailable');
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// ============ REACT HOOK EXAMPLES ============

/**
 * Example 8: React hook for RCTDB operations
 */
export function useRCTDB() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const executeWithErrorHandling = async (operation) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // User operations
    getUsers: () => executeWithErrorHandling(() => rctdbAPI.users.getAll()),
    createUser: (data) => executeWithErrorHandling(() => rctdbAPI.users.create(data)),
    
    // Publication operations
    getPublications: () => executeWithErrorHandling(() => rctdbAPI.publications.getAll()),
    createPublication: (data) => executeWithErrorHandling(() => rctdbAPI.publications.create(data)),
    
    // Health check
    checkHealth: () => executeWithErrorHandling(() => rctdbAPI.health.check())
  };
}

// ============ INTEGRATION EXAMPLES ============

/**
 * Example 9: Full workflow example
 */
export async function exampleFullWorkflow() {
  try {
    console.log('Starting full workflow example...');

    // 1. Check service health
    const isHealthy = await rctdbClient.testConnection();
    if (!isHealthy) {
      throw new Error('RCTDB service is not available');
    }

    // 2. Create a user
    const user = await rctdbClient.createUser({
      name: 'Dr. Alice Research',
      email: 'alice@university.edu',
      role: 'principal_investigator'
    });

    // 3. Create a publication
    const publication = await rctdbClient.createPublication({
      title: 'Advanced Machine Learning Techniques',
      abstract: 'A comprehensive study of modern ML approaches.',
      authors: ['Dr. Alice Research'],
      user_uuid: user.uuid
    });

    // 4. Create annotations
    const annotation1 = await rctdbClient.createAnnotation({
      publication_uuid: publication.uuid,
      user_uuid: user.uuid,
      text: 'Key methodology section',
      page_number: 3,
      annotation_type: 'note'
    });

    const annotation2 = await rctdbClient.createAnnotation({
      publication_uuid: publication.uuid,
      user_uuid: user.uuid,
      text: 'Important results',
      page_number: 7,
      annotation_type: 'highlight'
    });

    // 5. Get all annotations for the publication
    const allAnnotations = await rctdbClient.getPublicationAnnotations(publication.uuid);

    console.log('Workflow completed successfully!');
    console.log('Created:', {
      user: user.uuid,
      publication: publication.uuid,
      annotations: allAnnotations.length
    });

  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// ============ EXPORT ALL EXAMPLES ============

export const examples = {
  basicUsage: exampleBasicUsage,
  convenienceAPI: exampleConvenienceAPI,
  customClient: exampleCustomClient,
  userOperations: exampleUserOperations,
  publicationOperations: examplePublicationOperations,
  annotationOperations: exampleAnnotationOperations,
  errorHandling: exampleErrorHandling,
  fullWorkflow: exampleFullWorkflow
};

// Run all examples (uncomment to test)
export async function runAllExamples() {
  console.log('Running RCTDB Client Examples...');
  
  for (const [name, example] of Object.entries(examples)) {
    console.log(`\n--- ${name} ---`);
    try {
      await example();
    } catch (error) {
      console.error(`Example ${name} failed:`, error);
    }
    break;
  }
}

// Auto-run the examples when this file is executed directly
runAllExamples().catch(console.error); 