// file actions

import config from "../app.config";
import {getHeader} from "../utils/common";
import {getPreviewsRequest} from "../utils/file";


export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function receiveFileMetadata(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			metadata: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFileMetadata(id) {
	let url = `${config.hostname}/clowder/api/files/${id}/metadata?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, json));
				});
			} else {
				dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, []));
			}
		});
	};
}

export const RECEIVE_FILE_EXTRACTED_METADATA = "RECEIVE_FILE_EXTRACTED_METADATA";

export function receiveFileExtractedMetadata(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			extractedMetadata: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFileExtractedMetadata(id) {
	let url = `${config.hostname}/clowder/api/files/${id}/extracted_metadata?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch(receiveFileExtractedMetadata(RECEIVE_FILE_EXTRACTED_METADATA, json));
				});
			} else {
				dispatch(receiveFileExtractedMetadata(RECEIVE_FILE_EXTRACTED_METADATA, []));
			}
		});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";

export function receiveFileMetadataJsonld(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			metadataJsonld: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFileMetadataJsonld(id) {
	let url = `${config.hostname}/clowder/api/files/${id}/metadata.jsonld?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch(receiveFileMetadataJsonld(RECEIVE_FILE_METADATA_JSONLD, json));
				});
			} else {
				dispatch(receiveFileMetadataJsonld(RECEIVE_FILE_METADATA_JSONLD, []));
			}
		});
	};
}

export const SET_EXTRACTION_STATUS = "SET_EXTRACTION_STATUS";
export function setExtractionStatus(status) {
	return (dispatch) => {
		dispatch({
			type: SET_EXTRACTION_STATUS,
			extractionStatus: status
		});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";
export function receiveFilePreviews(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			previews: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFilePreviews(id, clientInfo) {
	return async function fetchFilePreviewsThunk(dispatch) {
		const previews_list = await getPreviewsRequest(id, clientInfo) // list of previews
		console.log("preview", previews_list);
		// [{"file_id": "63e6a5dfe4b034120ec4f035", "previews": [{"pv_route":"/clowder/files/63e6a5dfe4b034120ec4f035/blob","p_main":"html-iframe.js","pv_id":"63e6a5dfe4b034120ec4f035","p_path":"/clowder/assets/javascripts/previewers/html","p_id":"HTML","pv_length":"21348","pv_contenttype":"text/html"}]}]
		// [{p_id: "PDF", p_main: "some-library.js", p_path: "/assets/javascripts/previewers/pdf", pv_contenttype: "application/pdf", pv_id: "67057fb9e4b00da0e4ef9937", pv_length: "2324500", pv_route: "/files/67057fb9e4b00da0e4ef9937/blob"}]
		if (previews_list !== undefined && previews_list !== null) {
			dispatch(receiveFilePreviews(RECEIVE_PREVIEWS, previews_list));
		} else {
			dispatch(receiveFilePreviews(RECEIVE_PREVIEWS, []));
		}
	}
}


export const DELETE_FILE = "DELETE_FILE";

export function deleteFile(fileId) {
	let url = `${config.hostname}/clowder/api/files/${fileId}?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode: "cors", method: "DELETE", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json => {
					dispatch({
						type: DELETE_FILE,
						file: {"id": fileId, "status": json["status"] === undefined ? json["status"] : "success"},
						receivedAt: Date.now(),
					});
				});
			} else {
				response.json().then(json => {
					dispatch({
						type: DELETE_FILE,
						file: {"id": null, "status": json["status"] === undefined ? json["status"] : "fail"},
						receivedAt: Date.now(),
					});
				});
			}
		});
	};
}
