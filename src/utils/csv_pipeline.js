// RCT pipeline for pdf files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";

// csv_pipeline function
export async function csvPipeline(file_json, dataset_json, config, clientInfo) {

    const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;

    const rct_extraction_submission = await submitForExtraction(fileid, config.rct_extractor, config.statementType, clientInfo);
    if (rct_extraction_submission) {
        const rct_extraction_metadata = await getDatasetMetadataLoop(datasetid, config.rct_extractor, clientInfo);
        if (rct_extraction_metadata !== null){
            console.log("RCT extraction metadata", rct_extraction_metadata);
            console.log("RCT extraction complete");
            return true;
        }
        else {
            console.error("RCT extraction dataset metadata not found");
            return false;
        }
    }
    else {
        console.error("RCT extraction submission failed");
        return false;
    }
}
