import config from "../app.config";
import {getHeader} from "../utils/common";
import {createEmptyDatasetRequest, getDatasetsRequest, uploadFileToDatasetRequest} from "../utils/dataset";
import {convertPDF, submitForExtraction} from "../utils/file";

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
export function createUploadExtract(file, extractor_name) {
	return async function createUploadExtractThunk(dispatch) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		// Clowder API call to create empty dataset
		const dataset_json = await createEmptyDatasetRequest(file); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload file to dataset
			const file_json = await uploadFileToDatasetRequest(dataset_json.id, file); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				const extraction_json = submitForExtraction(file_json.id, extractor_name)
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
			}
		}
	};
}

// createUpload thunk function
export function convertCreateUploadExtract(pdfFile, extractor_name) {
	return async function convertCreateUploadExtractThunk(dispatch) {
		// this function converts pdf file to text.
		// creates an empty dataset. uploads the 2 files to the dataset and submits text file for extraction
		// convert pdf to text file using npm pdf2json package
		const textFile = convertPDF(pdfFile);
		// Clowder API call to create empty dataset
		const dataset_json = await createEmptyDatasetRequest(pdfFile); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload file to dataset
			const pdfFile_json = await uploadFileToDatasetRequest(dataset_json.id, pdfFile); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			const textFile_json = await uploadFileToDatasetRequest(dataset_json.id, textFile);
			if (textFile_json !== undefined){
				const extraction_json = submitForExtraction(textFile_json.id, extractor_name)
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, textFile_json));
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
