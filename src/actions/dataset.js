import config from "../app.config";
import {getHeader} from "../utils/common";
import {createEmptyDatasetRequest, getDatasetsRequest, uploadFileToDatasetRequest} from "../utils/dataset";

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

export function createUploadExtract(file) {
	return async function createUploadExtractThunk(dispatch, getState) {
		dispatch(createEmptyDataset(file));
		const present_state = getState();
		const datasets = getState().dataset.datasets;
		if (datasets !== undefined && datasets.length > 0) {
			const datasetID = datasets[0].id;
			console.log(datasetID)
			dispatch(uploadFileToDataset(datasetID, file));
		}
	};
}


// crate datasets action
export const CREATE_DATASETS = "CREATE_DATASETS";
export const createDataset = (type, json) => ({type: type, datasets: json});
// createEmptyDataset thunk function
export const createEmptyDataset = (file) => async dispatch => {
	// Clowder API call to create empty dataset
	const dataset = await createEmptyDatasetRequest(file); // returns the dataset ID {id:xxx}
	if (dataset !== undefined) {
		dispatch(createDataset(CREATE_DATASETS, dataset));
	}
};

// add file to dataset action
export const ADD_FILE_TO_DATASET = "ADD_FILE_TO_DATASET";
export const addFileToDataset = (type, json) => ({type: type, files: json});
// uploadFileToDataset thunk function
export const uploadFileToDataset = (dataset_id, file) => async dispatch => {
	// const datasetname = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
	// const datasets_response = await getDatasetsRequest(datasetname, "1");
	// const dataset_id = datasets_response[0].id;
	console.log("datasetid", dataset_id);
	const file_json = await uploadFileToDatasetRequest(dataset_id, file); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
	if (file_json !== undefined){
		dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
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
