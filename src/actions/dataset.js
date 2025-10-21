// dataset actions

import {getClientInfo, getHeader} from "../utils/common";
import {createEmptyDatasetRequest, getDatasetsRequest} from "../utils/dataset";

// receive datasets action
export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
export const receiveDatasets = (type, json) => ({type: type, datasets: json});

// receive dataset about action
export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";
export const receiveDatasetAbout = (type, json) => ({type: type, about: json});

// receive files in dataset action
export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";
export const receiveFilesInDataset = (type, json) => ({type: type, files: json});

// create datasets action
export const CREATE_DATASETS = "CREATE_DATASETS";
export const createDataset = (type, json) => ({type: type, datasets: json});

// add file to dataset action
export const ADD_FILE_TO_DATASET = "ADD_FILE_TO_DATASET";
export const addFileToDataset = (type, json) => ({type: type, files: json});

// delete dataset action
export const DELETE_DATASET = "DELETE_DATASET";

// update dataset status action
export const UPDATE_DATASET_STATUS = "UPDATE_DATASET_STATUS";
export const updateDatasetStatus = (datasetId, status) => ({
    type: UPDATE_DATASET_STATUS,
    datasetId,
    status
});

// fetchDatasets thunk function
export const fetchDatasets = (title = null, limit="5") => async dispatch => {
	const clientInfo = await getClientInfo();
	const dataset_json = await getDatasetsRequest(title, limit, clientInfo); // list of datasets
	if (dataset_json !== undefined) {
		dispatch(receiveDatasets(RECEIVE_DATASETS, dataset_json));
	}
};

export function fetchFilesInDataset(id) {
	return async (dispatch) => {
		const clientInfo = await getClientInfo();
		let url = `${clientInfo.hostname}${clientInfo.prefix}/api/datasets/${id}/files?superAdmin=true`;
		return fetch(url, {mode: "cors", headers: getHeader(clientInfo)})
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

export function fetchDatasetAbout(id) {
	return async (dispatch) => {
		const clientInfo = await getClientInfo();
		let url = `${clientInfo.hostname}${clientInfo.prefix}/api/datasets/${id}?superAdmin=true`;
		return fetch(url, {mode: "cors", headers: getHeader(clientInfo)})
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

export const SET_DATASET_METADATA = "SET_DATASET_METADATA";
export function setDatasetMetadata(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			metadata: json,
			receivedAt: Date.now(),
		});
	};
}

export function postDatasetMetadata(id, metadata) {
	return async (dispatch) => {
		const clientInfo = await getClientInfo();
		let url = `${clientInfo.hostname}${clientInfo.prefix}/api/datasets/${id}/metadata.jsonld`;
		let authHeader = getHeader(clientInfo);
		authHeader.append('Accept', 'application/json');
		authHeader.append('Content-Type', 'application/json');
		const body = JSON.stringify(metadata);
		return fetch(url, {method:"POST", mode: "cors", headers: authHeader, body:body})
			.then((response) => {
				if (response.status === 200) {
					dispatch(setDatasetMetadata(SET_DATASET_METADATA, metadata));
				} else {
					dispatch(setDatasetMetadata(SET_DATASET_METADATA, {}));
				}
			});
	};
}

export function deleteDataset(datasetId) {
	return async (dispatch) => {
		const clientInfo = await getClientInfo();
		let url = `${clientInfo.hostname}${clientInfo.prefix}/api/datasets/${datasetId}?superAdmin=true`;
		return fetch(url, {mode: "cors", method: "DELETE", headers: getHeader(clientInfo)})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch({
						type: DELETE_DATASET,
						dataset: {"id": datasetId},
						receivedAt: Date.now(),
					});
				});
			} else {
				response.json().then(json => {
					console.error("Failed to delete dataset:", json);
				});
			}
		});
	};
}

export const RESET_DATASET_TO_DEFAULT = "RESET_DATASET_TO_DEFAULT";

export function resetDatasetToDefault() {
	return {
		type: RESET_DATASET_TO_DEFAULT
	};
}
