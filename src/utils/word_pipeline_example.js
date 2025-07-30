// Enhanced word_pipeline.js with database integration
// This is an example of how to modify your existing word_pipeline.js

import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {pdfPipeline} from "../utils/pdf_pipeline";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "../actions/file";
import {updateDatasetStatus} from "../actions/dataset";

// Import database integration utilities
import { storePipelineResults, isDatasetProcessed } from "./rctdb-pipeline";

// Enhanced word_pipeline function with database integration
export async function wordPipelineWithDatabase(file_json, dataset_json, config, clientInfo, dispatch) {

    const fileid = file_json.id;
    const filename = file_json.filename;
    const datasetid = dataset_json.id;

    try {
        // Optional: Check if dataset already processed
        const alreadyProcessed = await isDatasetProcessed(datasetid, config.statementType);
        if (alreadyProcessed) {
            console.log(`Dataset ${datasetid} already processed for ${config.statementType}`);
            // Uncomment to skip reprocessing:
            // return true;
        }

        dispatch(setExtractionStatus("Extracting text from file"));
        dispatch(updateDatasetStatus(datasetid, "in progress"));
        
        const soffice_extraction_submission = await submitForExtraction(fileid, config.soffice_extractor, config.statementType, clientInfo);
        if (soffice_extraction_submission) {
            // check for dataset metadata updation after extraction
            const soffice_extraction_metadata = await getDatasetMetadataLoop(datasetid, config.soffice_extractor, clientInfo);
            if (soffice_extraction_metadata !== null){
                console.log("SOffice extraction complete. Proceeding to Pdf extraction");
                // Remove the file extension from the filename
                const fileNameWithoutExtension = filename.split('.').slice(0, -1).join('.');
                const pdf_file_name = fileNameWithoutExtension + '.pdf';  
                const extracted_pdf_file = await getFileInDataset(datasetid, "application/pdf", pdf_file_name, clientInfo);
                
                // Call PDF pipeline (which should also be enhanced with database integration)
                const pdf_pipeline_status = await pdfPipeline(extracted_pdf_file, dataset_json, config, clientInfo, dispatch);
                
                if (pdf_pipeline_status) {
                    dispatch(updateDatasetStatus(datasetid, "pdf-completed"));

                    // **NEW: Store results to database after successful processing**
                    try {
                        // Get the RCT results - this depends on how your pipeline stores results
                        // You might need to adjust this based on your actual data flow
                        const rctResults = getRctResultsFromPipeline(extracted_pdf_file, dataset_json, dispatch);
                        
                        if (rctResults && rctResults.length > 0) {
                            await storePipelineResults(
                                rctResults,
                                file_json,
                                dataset_json,
                                config.statementType,
                                dispatch
                            );
                            console.log('Successfully stored pipeline results to database');
                        }
                    } catch (dbError) {
                        console.error('Failed to store to database, but pipeline succeeded:', dbError);
                        // Don't fail the entire pipeline if database storage fails
                    }
                } else {
                    dispatch(updateDatasetStatus(datasetid, "pdf-failed"));
                }
                
                return pdf_pipeline_status;
            }
            else {
                console.error("SOffice extraction dataset metadata not found");
                dispatch(updateDatasetStatus(datasetid, "soffice-failed"));
                return false;
            }
        }
        else {
            console.error("SOffice extraction submission failed");
            dispatch(updateDatasetStatus(datasetid, "soffice-failed"));
            return false;
        }
    } catch (error) {
        console.error('Word pipeline with database integration failed:', error);
        dispatch(updateDatasetStatus(datasetid, "failed"));
        return false;
    }
}

/**
 * Helper function to extract RCT results from pipeline
 * This is a placeholder - you'll need to implement based on your actual data flow
 */
function getRctResultsFromPipeline(extracted_pdf_file, dataset_json, dispatch) {
    // Option 1: Get from Redux state
    const state = dispatch.getState?.();
    if (state?.file?.rctResults) {
        return state.file.rctResults;
    }
    
    // Option 2: Get from dataset metadata
    if (dataset_json?.metadata?.rctResults) {
        return dataset_json.metadata.rctResults;
    }
    
    // Option 3: Get from file metadata
    if (extracted_pdf_file?.metadata?.rctResults) {
        return extracted_pdf_file.metadata.rctResults;
    }
    
    // Option 4: Build from existing metadata structure
    // This is where you'd transform your existing metadata format
    // to the format expected by the database
    
    return [];
}

/**
 * Alternative approach: Use the wrapper function
 * This automatically integrates database storage into existing pipeline
 */
import { withDatabaseIntegration } from "./rctdb-pipeline";
import { wordPipeline as originalWordPipeline } from "../utils/word_pipeline";

// Wrap your existing pipeline with database integration
export const wordPipelineWithDatabaseWrapper = withDatabaseIntegration(
    originalWordPipeline, 
    'Word Pipeline'
);

/**
 * Example of direct database storage call
 * Use this when you have the RCT results ready
 */
export async function storeWordPipelineResults(rctResults, file_json, dataset_json, config, dispatch) {
    try {
        const result = await storePipelineResults(
            rctResults,
            file_json,
            dataset_json,
            config.statementType,
            dispatch
        );
        
        console.log('Stored word pipeline results:', result);
        return result;
    } catch (error) {
        console.error('Failed to store word pipeline results:', error);
        throw error;
    }
} 