// client actions

import {
	createEmptyDatasetRequest,
	getDatasetMetadata,
	getFileInDataset,
	uploadFileToDatasetRequest
} from "../utils/dataset";
import {checkExtractionStatusLoop, submitForExtraction} from "../utils/file";
import config from "../app.config";
import {getClientInfo} from "../utils/common";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "./file";
import {ADD_FILE_TO_DATASET, addFileToDataset, CREATE_DATASETS, createDataset} from "./dataset";


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// createUploadExtract thunk function
export function createUploadExtract(file) {
	return async function createUploadExtractThunk(dispatch) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		const clientInfo = await getClientInfo();
		// Clowder API call to create empty dataset
		const file_name = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
		const file_description = file.type;
		const dataset_json = await createEmptyDatasetRequest(file_name, file_description, clientInfo); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined && dataset_json !== null) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload input file to dataset
			let file_json = await uploadFileToDatasetRequest(dataset_json.id, file, clientInfo); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				file_json["filename"] = file.name;
				// submit uploaded file for extraction
				if (file.type == "text/plain"){
					const rct_extraction_submission = await submitForExtraction(file_json.id, config.rct_extractor, clientInfo);
					if (rct_extraction_submission) {
						// check every 5s for extraction status
						//const rct_extraction_status = await checkExtractionStatusLoop(file_json.id, config.rct_extractor, 5000, clientInfo);
						const rct_extraction_status = true
						if (rct_extraction_status === true){
							console.log("RCT extraction status true");
							dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, true));

						}
						else {
							console.error("RCT extraction status false");
							dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
						}
					}
					else {
						console.error("RCT extraction status false");
						dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
					}

				}
				else if (file.type == "application/pdf") {
					const pdf_extraction_submission = await submitForExtraction(file_json.id, config.pdf_extractor, clientInfo);
					if (pdf_extraction_submission) {
						const pdf_metadata = await getPdfMetadataLoop(dataset_json.id, clientInfo);
						if (pdf_metadata !== null){
							console.log("pdf extraction done");
							const csv_file_name = file_name + '.csv';
							const extracted_csv_file = await getFileInDataset(dataset_json.id, "text/csv", csv_file_name, clientInfo);
							if (extracted_csv_file !== null && typeof extracted_csv_file.id === "string") {
								const rct_extraction_submission = await submitForExtraction(extracted_csv_file.id, config.rct_extractor, clientInfo);
								if (rct_extraction_submission === true){
									// check every 5s for extraction status
									//const rct_extraction_status = await checkExtractionStatusLoop(extracted_txt_file.id, config.rct_extractor, 5000, clientInfo);
									const rct_extraction_status = true;
									if (rct_extraction_status === true){
										console.log("RCT extraction status true");
										dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, true));

									}
									else {
										console.error("RCT extraction status false");
										dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
									}
								}
								else {
									console.error("RCT extraction status false");
									dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
								}

							}
						}
						else {
							console.error("Pdf extraction status false");
							dispatch(setExtractionStatus(SET_EXTRACTION_STATUS, false));
						}
					}

					// add extracted output files to dataset state
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
	};
}

async function getPdfMetadataLoop(dataset_id, clientInfo){
	// method to check if metadata has been uploaded to dataset. else wait in loop
	// check pdf2text extraction status and dataset metadata generation in loop
	const pdf_metadata_loop = async () => {
		// get dataset metadata as json-ld
		const metadata = await getDatasetMetadata(dataset_id, clientInfo);
		if (metadata !== null && metadata.length > 0) {
			return metadata[0]["content"];
		} else {
			console.log("check pdf extraction after 30s");
			await sleep(30000);
			await pdf_metadata_loop();
			//setTimeout(pdf_metadata_loop, 30000);
		}
	};

	if (dataset_id !== null) {
		await pdf_metadata_loop(); // call the loop to check extractions
	} else {
		console.error("Dataset does not exist");
		return [];
	}
}
