/**
 * Database Pipeline Integration
 * This module integrates database operations into the existing pipeline workflows
 * Used by word_pipeline.js, pdf_pipeline.js and other processing files
 */

import { storeRctResults, storeAnnotationData, getPublications } from './rctdb-client';

/**
 * Store pipeline results to database
 * This function is called from pipelines like word_pipeline.js after RCT processing
 * 
 * @param {Array} rctResults - Results from RCT processing
 * @param {Object} fileInfo - File information object
 * @param {Object} datasetInfo - Dataset information object  
 * @param {string} statementType - Statement type ('consort' or 'spirit')
 * @param {Function} dispatch - Redux dispatch function for status updates
 */
export async function storePipelineResults(rctResults, fileInfo, datasetInfo, statementType, dispatch) {
    try {
        if (dispatch) {
            dispatch({ type: 'SET_EXTRACTION_STATUS', payload: 'Storing results to database...' });
        }
        
        console.log('Storing pipeline results to database:', {
            resultsCount: rctResults?.length || 0,
            datasetId: datasetInfo?.id,
            statementType,
            filename: fileInfo?.filename
        });

        const result = await storeRctResults(rctResults, fileInfo, datasetInfo, statementType);
        
        if (dispatch) {
            dispatch({ 
                type: 'SET_DATABASE_STORAGE_STATUS', 
                payload: { 
                    status: 'completed',
                    publicationId: result.data?.publicationId,
                    processedCount: result.data?.processed
                }
            });
        }
        
        console.log('Successfully stored pipeline results to database');
        return result;
        
    } catch (error) {
        console.error('Failed to store pipeline results to database:', error);
        
        if (dispatch) {
            dispatch({ 
                type: 'SET_DATABASE_STORAGE_STATUS', 
                payload: { 
                    status: 'failed',
                    error: error.message
                }
            });
        }
        
        // Don't throw - allow pipeline to continue even if database storage fails
        return null;
    }
}

/**
 * Get existing results from database for a dataset
 * Useful for checking if processing has already been done
 * 
 * @param {string} datasetId - Dataset ID
 * @param {string} statementType - Statement type filter
 */
export async function getExistingResults(datasetId, statementType = null) {
    try {
        const publications = await getPublications({ 
            datasetId, 
            limit: 10 
        });
        
        if (statementType) {
            return publications.data.filter(pub => pub.statementtype === statementType);
        }
        
        return publications.data;
        
    } catch (error) {
        console.error('Failed to get existing results from database:', error);
        return [];
    }
}

/**
 * Check if dataset has already been processed
 * @param {string} datasetId - Dataset ID
 * @param {string} statementType - Statement type
 */
export async function isDatasetProcessed(datasetId, statementType) {
    try {
        const existingResults = await getExistingResults(datasetId, statementType);
        return existingResults.length > 0;
    } catch (error) {
        console.error('Failed to check if dataset is processed:', error);
        return false;
    }
}

/**
 * Enhanced pipeline wrapper that includes database integration
 * This can be used to wrap existing pipeline functions
 * 
 * @param {Function} pipelineFunction - The original pipeline function
 * @param {string} pipelineName - Name of the pipeline for logging
 */
export function withDatabaseIntegration(pipelineFunction, pipelineName) {
    return async function(file_json, dataset_json, config, clientInfo, dispatch) {
        try {
            // Check if already processed (optional - can skip for reprocessing)
            const isProcessed = await isDatasetProcessed(dataset_json.id, config.statementType);
            if (isProcessed) {
                console.log(`Dataset ${dataset_json.id} already processed for ${config.statementType}`);
                // Uncomment next line if you want to skip reprocessing:
                // return true;
            }
            
            // Run the original pipeline
            const result = await pipelineFunction(file_json, dataset_json, config, clientInfo, dispatch);
            
            // If pipeline succeeded and we have results, store to database
            if (result && dispatch) {
                // Try to get RCT results from the current state or context
                // This might need adjustment based on how your pipeline stores results
                const rctResults = extractRctResultsFromContext(dispatch.getState?.());
                
                if (rctResults && rctResults.length > 0) {
                    await storePipelineResults(
                        rctResults, 
                        file_json, 
                        dataset_json, 
                        config.statementType,
                        dispatch
                    );
                }
            }
            
            return result;
            
        } catch (error) {
            console.error(`${pipelineName} with database integration failed:`, error);
            throw error;
        }
    };
}

/**
 * Helper function to extract RCT results from Redux state or context
 * This might need to be customized based on your state structure
 */
function extractRctResultsFromContext(state) {
    // This is a placeholder - adjust based on your actual state structure
    try {
        return state?.file?.rctResults || state?.dataset?.rctResults || [];
    } catch (error) {
        console.error('Failed to extract RCT results from context:', error);
        return [];
    }
}

/**
 * Store raw annotation data (for more direct control)
 * Use this when you have pre-formatted annotation data
 * 
 * @param {Array} annotationData - Pre-formatted annotation data array
 * @param {string} datasetId - Dataset ID
 * @param {string} statementType - Statement type
 * @param {Function} dispatch - Redux dispatch function
 */
export async function storeRawAnnotationData(annotationData, datasetId, statementType, dispatch) {
    try {
        if (dispatch) {
            dispatch({ type: 'SET_EXTRACTION_STATUS', payload: 'Storing annotations to database...' });
        }
        
        const result = await storeAnnotationData(annotationData, datasetId, statementType);
        
        if (dispatch) {
            dispatch({ 
                type: 'SET_DATABASE_STORAGE_STATUS', 
                payload: { 
                    status: 'completed',
                    publicationId: result.data?.publicationId,
                    processedCount: result.data?.processed
                }
            });
        }
        
        return result;
        
    } catch (error) {
        console.error('Failed to store raw annotation data:', error);
        
        if (dispatch) {
            dispatch({ 
                type: 'SET_DATABASE_STORAGE_STATUS', 
                payload: { 
                    status: 'failed',
                    error: error.message
                }
            });
        }
        
        throw error;
    }
}

export default {
    storePipelineResults,
    getExistingResults,
    isDatasetProcessed,
    withDatabaseIntegration,
    storeRawAnnotationData
}; 