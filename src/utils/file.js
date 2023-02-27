import {dataURItoFile, getHeader} from "./common";
import config from "../app.config";


export async function submitForExtraction(file_id){
	const body = {"extractor": "ncsa.rctTransparencyExtractor"};
	const extraction_response = await extractionRequest(file_id, body);
	// return {"status":"OK","job_id":"string"}
	return extraction_response;
}

async function extractionRequest(file_id,body_data) {
	// Clowder API call to submit a file for extraction
	const extractions_url = `${config.hostname}/clowder/api/files/${file_id}/extractions`;
	const body = JSON.stringify(body_data);
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	let response = await fetch(extractions_url, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// return {"status":"OK","job_id":"string"}
		console.log("submit to extraction successful");
		return response.json();

	} else if (response.status === 401) {
		// TODO handle error
		console.log("submit to extraction error");
		return {};
	} else {
		// TODO handle error
		console.log("submit to extraction error");
		return {};
	}
}

export async function fetchFileMetadata(id) {
	let url = `${config.hostname}/clowder/api/files/${id}/metadata?superAdmin=true`;
	let response = await fetch(url, {mode: "cors", headers: getHeader()});
	if (response.status === 200) {
		return await response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
}

export async function uploadFile(formData, selectedDatasetId) {
	let endpoint = `${config.hostname}/clowder/api/datasets/${selectedDatasetId}/files?superAdmin=true`;
	let authHeader = getHeader();
	let body = new FormData();
	formData.map((item) => {
		if (item["file"] !== undefined) {
			body.append("file", dataURItoFile(item["file"]));
		}
	});

	let response = await fetch(endpoint, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// {id:xxx}
		// {ids:[{id:xxx}, {id:xxx}]}
		return response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
}

export async function downloadFile(fileId, filename = null) {

	if (!filename) {
		filename = `${fileId}.zip`;
	}
	let endpoint = `${config.hostname}/clowder/api/files/${fileId}/blob?superAdmin=true`;
	let response = await fetch(endpoint, {method: "GET", mode: "cors", headers: await getHeader()});

	if (response.status === 200) {
		let blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
		} else {
			let anchor = window.document.createElement("a");
			anchor.href = window.URL.createObjectURL(blob);
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
		}
	} else if (response.status === 401) {
		// TODO
		console.log(response.json());
	} else {
		console.log(response.json());
	}

}
