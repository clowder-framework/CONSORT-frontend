import config from "../app.config";
import {getHeader} from "../utils/common";
import {
	createEmptyDatasetRequest, getDatasetsRequest,
	getFileInDataset, listFilesInDatasetRequest, uploadFileToDatasetRequest
} from "../utils/dataset";
import {checkExtractionStatus, submitForExtraction} from "../utils/file";

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
			// upload file to dataset
			const file_json = await uploadFileToDatasetRequest(dataset_json.id, file); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				// add uploaded file to dataset state
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
				// submit uploaded file for extraction
				if (file.type == "text/plain"){
					const rct_extraction_json = submitForExtraction(file_json.id, config.rct_extractor);
					// check every 5s for extraction status
					// const loop = async () => {
					// 	if (rct_extraction_json.status === "OK") {
					// 		const filesInDataset = listFilesInDatasetRequest(dataset_json["id"]);
					// 		// add extracted output files to dataset state
					// 		Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
					// 	}
					// 	else {
					// 		console.log("check RCT extraction status after 5s");
					// 		setTimeout(loop, 5000);
					//
					// 	}
					// }
				}
				else if (file.type == "application/pdf") {
					console.log("pdf file name", file_name);
					const pdf_extraction_json = submitForExtraction(file_json.id, config.pdf_extractor);
					const loop = async () => {
						if (pdf_extraction_json.status !== "OK"){
							console.log("check pdf extraction status after 2s");
							setTimeout(loop, 2000);
						}
						else if (pdf_extraction_json.status === "OK"){
							// check if txt file is generated and submit for RCTextractor
							const extracted_txt_file = getFileInDataset(dataset_json.id, "text/plain", file_name);
							if (typeof extracted_txt_file.id === "string") {
								const rct_extraction_json = submitForExtraction(extracted_txt_file.id, config.rct_extractor);
							}
							else {
								await loop();
							}
						}
						else {
							console.log("check pdf extraction status after 2s");
							await loop();
						}
					}
					// add extracted output files to dataset state
					//Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
				}
				else {
					// TODO add error action
					console.log("Error in file type");
				}

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
