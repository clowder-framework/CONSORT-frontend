import {dataURItoFile, getHeader} from "./common";
import config from "../app.config";


export async function submitForExtraction(file_id, extractor_name){
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


export async function checkExtractionStatus(file_id){
	// Clowder API call to check extraction status of a file
	const extractions_status_url = `${config.hostname}/clowder/api/extractions/${file_id}/status`;
	const extractions_response = await fetch(extractions_status_url, {method:"GET", headers:getHeader()});
	let extractions_data = await extractions_response.json();
	//{"ncsa.file.digest": "DONE", "ncsa.rctTransparencyExtractor": "DONE", "Status": "Done"}
	return extractions_data;
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

export async function getPreviewsRequest(file_id) {
	const previews_url = `${config.hostname}/clowder/api/files/${file_id}/getPreviews?superAdmin=true`;
	const previews_response = await fetch(previews_url, {method:"GET", mode: "cors", headers:getHeader()});
	// [{"file_id":"63e6a5dfe4b034120ec4f035","previews":[{"pv_route":"/clowder/files/63e6a5dfe4b034120ec4f035/blob","p_main":"html-iframe.js","pv_id":"63e6a5dfe4b034120ec4f035","p_path":"/clowder/assets/javascripts/previewers/html","p_id":"HTML","pv_length":"21348","pv_contenttype":"text/html"}]}]
	let previews_list = [];
	if (previews_response.status === 200) {
		const file_preview = await previews_response.json();
		if (file_preview[0].file_id !== undefined){
			file_preview[0].previews.map((preview) => previews_list.push(preview));
			console.log("preview generated");
		}
		return previews_list;
	}
	else{
		console.log("preview failed");
	}
}
