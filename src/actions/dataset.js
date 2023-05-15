import config from "../app.config";
import {getHeader} from "../utils/common";
import {
	createEmptyDatasetRequest, getDatasetsRequest,
	getFileInDataset, listFilesInDatasetRequest, uploadFileToDatasetRequest
} from "../utils/dataset";
import {checkExtractionStatus, checkExtractionStatusLoop, submitForExtraction} from "../utils/file";

// receive datasets action
export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
export const receiveDatasets = (type, json) => ({type: type, datasets: json, receivedAt: Date.now()});
// fetchDatasets thunk function
export const fetchDatasets = (title = null, limit="5") => async dispatch => {
	const dataset_json = await getDatasetsRequest(title, limit); // list of datasets
	if (dataset_json !== undefined) {
		dispatch(receiveDatasets(RECEIVE_DATASETS, dataset_json));
	}
};

// create datasets action
export const CREATE_DATASETS = "CREATE_DATASETS";
export const createDataset = (type, json) => ({type: type, datasets: json});
// add file to dataset action
export const ADD_FILE_TO_DATASET = "ADD_FILE_TO_DATASET";
export const addFileToDataset = (type, file_json) => ({type: type, files: file_json});
// get extraction status of file
export const EXTRACTION_STATUS = "EXTRACTION_STATUS";
export const extractionStatus = (type, status) => ({type: type, extraction_status:status})


// createUploadExtract thunk function
export function createUploadExtract(file) {
	return async function createUploadExtractThunk(dispatch) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		// Clowder API call to create empty dataset
		const file_name = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
		const file_description = file.type;
		const dataset_json = await createEmptyDatasetRequest(file_name, file_description); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload input file to dataset
			let file_json = await uploadFileToDatasetRequest(dataset_json.id, file); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				file_json["filename"] = file.name;
				// submit uploaded file for extraction
				if (file.type == "text/plain"){
					const rct_extraction_json = submitForExtraction(file_json.id, config.rct_extractor);
					if (rct_extraction_json !== null && rct_extraction_json["status"] === "OK") {
						// check every 5s for extraction status
						const rct_extraction_status = await checkExtractionStatusLoop(file_json.id, 5000);
						if (rct_extraction_status === true){
							console.log("RCT extraction status true");
							dispatch(extractionStatus(EXTRACTION_STATUS, true));

						}
						else {
							console.error("RCT extraction status false");
							dispatch(extractionStatus(EXTRACTION_STATUS, false));
						}
					}
					else {
						console.error("RCT extraction status false", rct_extraction_json);
						dispatch(extractionStatus(EXTRACTION_STATUS, false));
					}

				}
				else if (file.type == "application/pdf") {
					const pdf_extraction_json = await submitForExtraction(file_json.id, config.pdf_extractor);
					if (pdf_extraction_json !== null && pdf_extraction_json["status"] === "OK") {
						const pdf_extraction_status = await checkExtractionStatusLoop(file_json.id, 5000);
						if (pdf_extraction_status === true){
							console.log("pdf extraction done");
							const text_file_name = file_name + '.txt';
							const extracted_txt_file = await getFileInDataset(dataset_json.id, "text/file", text_file_name);
							if (extracted_txt_file !== null && typeof extracted_txt_file.id === "string") {
								const rct_extraction_json = await submitForExtraction(extracted_txt_file.id, config.rct_extractor);
								// check every 5s for extraction status
								const rct_extraction_status = await checkExtractionStatusLoop(extracted_txt_file.id, 5000);
								if (rct_extraction_status === true){
									console.log("RCT extraction status true");
									dispatch(extractionStatus(EXTRACTION_STATUS, true));

								}
								else {
									console.error("RCT extraction status false");
									dispatch(extractionStatus(EXTRACTION_STATUS, false));
								}
							}
						}
						else {
							console.error("Pdf extraction status false");
						}
					}

					// add extracted output files to dataset state
					//const filesInDataset = listFilesInDatasetRequest(dataset_json["id"]);
					//Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
				}
				else {
					// TODO add error action
					console.error("Error in file type");
				}
				// after submitting uploaded file for extraction, add the file to dataset state
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
			}
			else {
				console.error("Error in clowder upload of file ", file.name)
			}
		}
	};
}


// createEmptyDataset thunk function
export const createEmptyDataset = (file) => async dispatch => {
	// Clowder API call to create empty dataset
	const dataset = await createEmptyDatasetRequest(file); // returns the dataset ID {id:xxx}
	if (dataset !== undefined) {
		dispatch(createDataset(CREATE_DATASETS, dataset));
	}
};


export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";
export function receiveFilesInDataset(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			files: json,
			receivedAt: Date.now(),
		});
	};
}


export function fetchFilesInDataset(id) {
	let url = `${config.hostname}/clowder/api/datasets/${id}/files?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, json));
				});
			} else {
				dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, []));
			}
		});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";

export function receiveDatasetAbout(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			about: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchDatasetAbout(id) {
	let url = `${config.hostname}/clowder/api/datasets/${id}?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, json));
				});
			} else {
				dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, []));
			}
		});
	};
}

export const DELETE_DATASET = "DELETE_DATASET";

export function deleteDataset(datasetId) {
	let url = `${config.hostname}/clowder/api/datasets/${datasetId}?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", method: "DELETE", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch({
						type: DELETE_DATASET,
						dataset: {"id": datasetId, "status": json["status"] === undefined ? json["status"] : "success"},
						receivedAt: Date.now(),
					});
				});
			} else {
				response.json().then(json => {
					dispatch({
						type: DELETE_DATASET,
						dataset: {"id": null, "status": json["status"] === undefined ? json["status"] : "fail"},
						receivedAt: Date.now(),
					});
				});
			}
		});
	};
}
