// RCT pipeline for word files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {pdfPipeline} from "../utils/pdf_pipeline";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "../actions/file";
import {updateDatasetStatus} from "../actions/dataset";

// word_pipeline function
export async function wordPipeline(file_json, dataset_json, config, clientInfo, dispatch) {

	const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;

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
            const pdf_pipeline_status = await pdfPipeline(extracted_pdf_file, dataset_json, config, clientInfo, dispatch);
            if (pdf_pipeline_status) {
                dispatch(updateDatasetStatus(datasetid, "pdf-completed"));
            } else {
                dispatch(updateDatasetStatus(datasetid, "pdf-failed")); // Reset status on failure
            }
            return pdf_pipeline_status;
        }
        else {
            console.error("SOffice extraction dataset metadata not found");
            dispatch(updateDatasetStatus(datasetid, "soffice-failed")); // Reset status on failure
            return false;
        }
    }
    else {
        console.error("SOffice extraction submission failed");
        dispatch(updateDatasetStatus(datasetid, "soffice-failed")); // Reset status on failure
        return false;
    }
}
