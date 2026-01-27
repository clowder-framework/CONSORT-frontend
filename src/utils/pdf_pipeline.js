// RCT pipeline for pdf files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {csvPipeline} from "../utils/csv_pipeline";
import {setExtractionStatus} from "../actions/file";
import {updateDatasetStatus} from "../actions/dataset";

// pdf_pipeline function
export async function pdfPipeline(file_json, dataset_json, config, dispatch) {
	
	const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;
	const statementType = config.statementType;
	// use grobid extractor for all user categories
	const pdf_extractor = config.pdf_extractor; // default pdf extractor is grobid
	dispatch(setExtractionStatus("Extracting sentences and metadata from file"));
	dispatch(updateDatasetStatus(datasetid, "in progress"));
	
	const pdf_extraction_submission = await submitForExtraction(fileid, pdf_extractor, statementType);
	if (pdf_extraction_submission) {
		const pdf_extraction_metadata = await getDatasetMetadataLoop(datasetid, pdf_extractor);
		if (pdf_extraction_metadata !== null && pdf_extraction_metadata !== undefined){
			let csv_file_name = null;
			let extracted_csv_file = null;
			if (pdf_extraction_metadata.extractor === config.pymupdf_extractor) {
				csv_file_name = pdf_extraction_metadata.extracted_files[2].filename;
			}
			else{
				const fileNameWithoutExtension = filename.split(".").slice(0, -1).join(".");
				csv_file_name = `${fileNameWithoutExtension}.csv`;
			}
			extracted_csv_file = await getFileInDataset(datasetid, "text/csv", csv_file_name);
			
			if (extracted_csv_file !== null && typeof extracted_csv_file.id === "string") {
				const pdf_file_json = {
					fileid: fileid,
					filename: filename
				};
				const csv_pipeline_status = await csvPipeline(extracted_csv_file, dataset_json, pdf_file_json, config, dispatch);
				if (csv_pipeline_status) {
					dispatch(updateDatasetStatus(datasetid, "csv-completed"));
					return true;
				} else {
					dispatch(updateDatasetStatus(datasetid, "csv-failed")); // Reset status on failure
					return false;
				}
			}
			else {
				dispatch(updateDatasetStatus(datasetid, "csv-failed")); // Reset status on failure
				return false;
			}
		}
		else {
			dispatch(updateDatasetStatus(datasetid, "pdf-failed")); // Reset status on failure
			return false;
		}
	}
	else {
		dispatch(updateDatasetStatus(datasetid, "pdf-failed")); // Reset status on failure
		return false;
	}

}
