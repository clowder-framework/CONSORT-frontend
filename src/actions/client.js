// client actions

import {
	createEmptyDatasetRequest,
	getDatasetMetadataLoop,
	getFileInDataset,
	uploadFileToDatasetRequest
} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import config from "../app.config";
import {getClientInfo} from "../utils/common";
import {wordPipeline} from "../utils/word_pipeline";
import {pdfPipeline} from "../utils/pdf_pipeline";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "./file";
import {ADD_FILE_TO_DATASET, addFileToDataset, CREATE_DATASETS, createDataset} from "./dataset";


const clientInfo = await getClientInfo();

// createUploadExtract thunk function
export function createUploadExtract(file) {
	return async function createUploadExtractThunk(dispatch) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		
		// Clowder API call to create empty dataset
		const file_name = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
		const file_description = file.type;
		console.log("Uploading file", file_name);
		const dataset_json = await createEmptyDatasetRequest(file_name, file_description, clientInfo); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined && dataset_json !== null) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload input file to dataset
			let file_json = await uploadFileToDatasetRequest(dataset_json.id, file, clientInfo); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				file_json["filename"] = file.name;
				// submit uploaded file for extraction
				if (file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type =="application/msword"){
					const word_pipeline_status = await wordPipeline(file_json, dataset_json, config, clientInfo);
					if (word_pipeline_status) {
						console.log("File extraction complete.");
						dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, true));

					}
					else {
						console.error("File extraction failed");
						dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
					}
					
				}
				else if (file.type == "application/pdf") {
					const pdf_pipeline_status = await pdfPipeline(file_json, dataset_json, config, clientInfo);
					if (pdf_pipeline_status) {
						console.log("File extraction complete.");
						dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, true));

					}
					else {
						console.error("File extraction failed");
						dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
					}

					// TODO add extracted output files to dataset state
					//const filesInDataset = listFilesInDatasetRequest(dataset_json["id"]);
					//Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
				}
				else {
					// TODO add error action
					console.error("Error in file type");
					dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
				}
				// after submitting uploaded file for extraction, add the file to dataset state
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
			}
			else {
				console.error("Error in clowder upload of file ", file.name)
				dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
			}
		}
		else {
			console.error("Error in dataset creation");
			dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
		}	
	};
}

