// RCT pipeline for pdf files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "../actions/file";
import {updateDatasetStatus} from "../actions/dataset";

// csv_pipeline function
export async function csvPipeline(file_json, dataset_json, config, dispatch) {

    const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;
    dispatch(setExtractionStatus("Making predictions"));
    dispatch(updateDatasetStatus(datasetid, "in progress"));
    
    const rct_extraction_submission = await submitForExtraction(fileid, config.rct_extractor, config.statementType);
    if (rct_extraction_submission) {
        const rct_extraction_metadata = await getDatasetMetadataLoop(datasetid, config.rct_extractor);
        if (rct_extraction_metadata !== null){
            console.log("RCT extraction metadata", rct_extraction_metadata);
            console.log("RCT extraction complete");
            dispatch(updateDatasetStatus(datasetid, "completed"));
            return true;
        }
        else {
            console.error("RCT extraction dataset metadata not found");
            dispatch(updateDatasetStatus(datasetid, "failed")); // Reset status on failure
            return false;
        }
    }
    else {
        console.error("RCT extraction submission failed");
        dispatch(updateDatasetStatus(datasetid, "failed")); // Reset status on failure
        return false;
    }
}
