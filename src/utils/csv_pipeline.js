// RCT pipeline for pdf files
import {getDatasetMetadataLoop} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {setExtractionStatus} from "../actions/file";
import {updateDatasetStatus} from "../actions/dataset";

// csv_pipeline function
export async function csvPipeline(file_json, dataset_json, pdf_file_json, config, dispatch) {

	const fileid = file_json.id; // input csv file id
	const datasetid = dataset_json.id;
	dispatch(setExtractionStatus("Making predictions"));
	dispatch(updateDatasetStatus(datasetid, "in progress"));
	
	const rct_extraction_submission = await submitForExtraction(fileid, config.rct_extractor, config.statementType, pdf_file_json);
	if (rct_extraction_submission) {
		const rct_extraction_metadata = await getDatasetMetadataLoop(datasetid, config.rct_extractor);
		if (rct_extraction_metadata !== null){
			dispatch(updateDatasetStatus(datasetid, "completed"));
			return true;
		}
		else {
			dispatch(updateDatasetStatus(datasetid, "failed")); // Reset status on failure
			return false;
		}
	}
	else {
		dispatch(updateDatasetStatus(datasetid, "failed")); // Reset status on failure
		return false;
	}
}
