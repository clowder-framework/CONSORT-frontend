import {dataURItoFile, downloadResource, getHeader} from "./common";
import config from "../app.config";


export async function submitForExtraction(file_id, extractor_name){
	const body = {"extractor": extractor_name};
	//const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const extraction_response = await extractionRequest(file_id, body);
	// if (extraction_response === null) {
	// 	await sleep(5000);
	//
	// }
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
		return null;
	} else {
		// TODO handle error
		console.log("submit to extraction error", response.status);
		return null;
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

export async function checkExtractionStatusLoop(file_id, interval){
	// check extraction status of a file in loop. Check status every interval seconds

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	let extraction_status = false;

	const status_check_loop = async () => {
		const extractions_data = await checkExtractionStatus(file_id);
		console.log(extractions_data);
		if (extractions_data["Status"] === "Done"){
			console.log("Extraction completed for file");
			extraction_status = true;
		}
		else {
			console.log("check extraction status after %s ms", interval);
			await sleep(interval);
			await status_check_loop();
		}
	}
	if (file_id !== null){
		await status_check_loop();
	}
	if (extraction_status === false) {
		await status_check_loop();
	}
	else if (extraction_status === true) {
		return extraction_status;
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


export async function getPreviewResources(preview) {
	// get all file preview resources
	const preview_config = {}
	preview_config.previewType = preview["p_id"].replace(" ", "-").toLowerCase(); // html
	preview_config.url = `${config.hostname}${preview["pv_route"]}?superAdmin=true`;
	preview_config.fileid = preview["pv_id"];
	preview_config.previewer = `/public${preview["p_path"]}/`;
	preview_config.fileType = preview["pv_contenttype"];

	// TODO need to fix on clowder v1: sometimes pv_route return the non-API routes
	// /clowder/file vs clowder/api/file
	// TODO Temp fix insert /api/
	let pv_routes = preview["pv_route"];
	if (!pv_routes.includes("/api/")) {
		pv_routes = `${pv_routes.slice(0, 9)}api/${pv_routes.slice(9, pv_routes.length)}`;
	}
	preview_config.pv_route = pv_routes;
	const resourceURL = `${config.hostname}${pv_routes}?superAdmin=true`;
	preview_config.resource = await downloadResource(resourceURL);
	return preview_config;
}
