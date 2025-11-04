import {dataURItoFile, downloadResource, getClientInfo, getHeader} from "./common";
import config from "../app.config";


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export async function submitForExtraction(file_id, extractor_name, statementType, clientInfo){
	// submits file for extraction and returns true if extraction is successful, else returns false
	let body = {}
	if (extractor_name === config.rct_extractor){
		body = {"extractor": extractor_name, "parameters": {"statement": statementType}};
	}
	else{
		body = {"extractor": extractor_name};
	}
	
	const extraction_response = await extractionRequest(file_id, body, clientInfo);
	console.log("Extraction response for extractor ", extractor_name, extraction_response);
	if (extraction_response !== null && extraction_response.status === "OK") {
		return true;
	}
	else {
		return false;
	}
}


async function extractionRequest(file_id, body_data, clientInfo) {
	// Clowder API call to submit a file for extraction - proxied through Express server
	const extractions_url = `/api/files/${file_id}/extractions`;
	const body = JSON.stringify(body_data);
	let authHeader = getHeader(clientInfo);
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');

	let extraction_response = null;

	const extractionRequest_loop = async () => {

		let response = await fetch(extractions_url, {
			method: "POST",
			mode: "cors",
			headers: authHeader,
			body: body,
		});
		extraction_response = await response.json(); // JSONObj {"status":"OK","job_id":"string"}
		//const extraction_response_text = await response.text();
		//console.log(extraction_response_text);
		if (response.status === 200) {
			// return {"status":"OK","job_id":"string"}
			console.log("submit to extraction successful");
		} else if (response.status === 409){
			// TODO handle error
			console.error("submit to extraction error", extraction_response);
			console.log("submit for extraction after 30s");
			await sleep(30000);
			await extractionRequest_loop();
		}
		else {
			// TODO handle error
			console.error("submit to extraction error", extraction_response);
			extraction_response.status = "FAIL";
		}
		return extraction_response;

	}

	extraction_response = await extractionRequest_loop();
	return extraction_response;

}


export async function fetchFileMetadata(id) {
	let url = `/api/files/${id}/metadata?superAdmin=true`;
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


export async function checkExtractionStatus(file_id, clientInfo){
	// Clowder API call to check extraction status of a file - proxied through Express server
	const extractions_status_url = `/api/extractions/${file_id}/statuses`;
	let authHeader = getHeader(clientInfo);
	authHeader.append("Accept", "*/*");
	const response = await fetch(extractions_status_url, {method:"GET", mode: "cors", headers:authHeader});
	if (response.status === 200){
		console.log("Extraction status response %s", response);
		//{"ncsa.file.digest": "DONE", "ncsa.rctTransparencyExtractor": "DONE", "Status": "Done"}
		return await response.json();
	} else if (response.status === 401) {
		// TODO handle error
		console.error("Extraction status error %s %s", extractions_status_url, response);
		return {};
	} else if (response.status === 500){
		// TODO handle error
		console.error("Extraction status Error %s %s", extractions_status_url, response);
		return {};
	}
	else {
		// TODO handle error
		console.error("Extraction status error %s %s", extractions_status_url, response);
		return {};
	}

}

// Not used
export async function checkExtractionStatusLoop(file_id, extractor, interval, clientInfo){
	// check extraction status of a file in loop. Check status every interval seconds

	let extraction_status = false;

	const status_check_loop = async () => {
		const extractions_data = await checkExtractionStatus(file_id, clientInfo);
		console.log(extractions_data);
		const extractions_data_status = extractions_data["Status"];
		const extractions_data_extractor = extractions_data[extractor];


		if (extractions_data_status === "Done"){
			if (extractions_data_extractor === "DONE"){
				console.log("Extraction completed for file");
				extraction_status = true;
			}
			else {
				try {
					const extractions_data_extractor_message = extractions_data_extractor.split(".");
					if (extractions_data_extractor_message[0] === "StatusMessage") {
						// check the status message from extractor
						const extractor_message = extractions_data_extractor_message[1].split(":");
						if (extractor_message[0] === "error") {
							console.error("Error in extraction %s", extractor);
							extraction_status = false;
						}
						else {
							console.log("check extraction status after %s ms", interval);
							await sleep(interval);
							await status_check_loop();
						}

					}
				} catch (e) {
					console.error("Error in extraction %s %s", extractor, e);
					extraction_status = false;
				}
			}
		}
		else if (extractions_data_status === "Processing") {
			console.log("check extraction status after %s ms", interval);
			await sleep(interval);
			await status_check_loop();
		}
	} // status_check_loop end

	if (file_id !== null){
		await status_check_loop();
		return extraction_status;
	}
	else {
		return extraction_status;
	}
}


export async function uploadFile(formData, selectedDatasetId) {
	let endpoint = `/api/datasets/${selectedDatasetId}/files?superAdmin=true`;
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


export async function downloadAndSaveFile(fileId, filename = null) {

	if (!filename) {
		filename = `${fileId}.zip`;
	}
	const clientInfo = await getClientInfo();
	let endpoint = `/api/files/${fileId}/blob?superAdmin=true`;
	let authHeader = getHeader(clientInfo);
	let response = await fetch(endpoint, {method: "GET", mode: "cors", headers: authHeader});

	if (response.status === 200) {
		let blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, "RCTCheck_" + filename);
			console.log("RCTCheck_" + filename + " downloaded");
		} else {
			let anchor = window.document.createElement("a");
			anchor.href = window.URL.createObjectURL(blob);
			anchor.download = "RCTCheck_" + filename;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			console.log("RCTCheck_" + filename + " downloaded");
		}
	} else if (response.status === 401) {
		// TODO
		console.error(response.json());
	} else {
		console.error(response.json());
	}
	return "RCTCheck_" + filename;
}


export async function getPreviewsRequest(file_id, clientInfo) {
	const previews_url = `/api/files/${file_id}/getPreviews?superAdmin=true`;
	let authHeader = getHeader(clientInfo)
	const previews_response = await fetch(previews_url, {method:"GET", mode: "cors", headers:authHeader});
	// [{"file_id":"63e6a5dfe4b034120ec4f035","previews":[{"pv_route":"/clowder/files/63e6a5dfe4b034120ec4f035/blob","p_main":"html-iframe.js","pv_id":"63e6a5dfe4b034120ec4f035","p_path":"/clowder/assets/javascripts/previewers/html","p_id":"HTML","pv_length":"21348","pv_contenttype":"text/html"}]}]
	let previews_list = [];
	if (previews_response.status === 200) {
		const file_preview = await previews_response.json();
		// if (file_preview[0].file_id !== undefined){
		// 	file_preview[0].previews.map((preview) => previews_list.push(preview));
		// 	console.log("preview generated");
		// }
		//return previews_list;
		return file_preview;
	}
	else{
		console.log("preview failed");
	}
}


export async function getPreviewResources(fileId, preview, clientInfo) {
	// get all file preview resources
	const preview_config = {};
	//console.log(preview); {p_id:"HTML", p_main:"html-iframe.js", p_path:"/assets/javascripts/previewers/html", pv_contenttype:"text/html", pv_id:"64ac2c9ae4b024bdd77bbfb1",pv_length:"52434",pv_route:"/files/64ac2c9ae4b024bdd77bbfb1/blob"}
	//{"pv_route": "/clowder/api/previews/67224c2ae4b095dc59cb5fde","p_main": "thumbnail-previewer.js","pv_id": "67224c2ae4b095dc59cb5fde","p_path": "/clowder/assets/javascripts/previewers/thumbnail","p_id": "Thumbnail","pv_length": "157049","pv_contenttype": "image/png"}
	
	preview_config.previewType = preview["p_id"].replace(" ", "-").toLowerCase(); // html

	if (preview_config.previewType === 'thumbnail') {
		// TODO this is a hacky way to fix file previewer extractor output for soffice converted pdf docs
		// in some cases, the file previewer extractor puts pdf file as thumbnail type. See https://github.com/clowder-framework/CONSORT-frontend/pull/91
		// Convert preview route to use proxy
		let pv_route = preview["pv_route"];
		// Convert /clowder/api/... or /clowder/files/... to /api/...
		pv_route = pv_route.replace(/^\/clowder\//, '/').replace(/^\/files\//, '/api/files/');
		if (!pv_route.startsWith('/api/')) {
			pv_route = '/api' + pv_route;
		}
		preview_config.url = `${pv_route}?superAdmin=true`;
		preview_config.fileid = preview["pv_id"];
		preview_config.previewer = `/public${preview["p_path"]}/`;
		preview_config.fileType = preview["pv_contenttype"];

		const resourceURL = `/api/files/${fileId}/blob?superAdmin=true`;
		preview_config.resource = await downloadResource(resourceURL, clientInfo);
	}
	else {
		// Convert preview route to use proxy
		let pv_route = preview["pv_route"];
		// Convert /clowder/api/... or /clowder/files/... to /api/...
		pv_route = pv_route.replace(/^\/clowder\//, '/').replace(/^\/files\//, '/api/files/');
		if (!pv_route.startsWith('/api/')) {
			pv_route = '/api' + pv_route;
		}
		preview_config.url = `${pv_route}?superAdmin=true`;
		preview_config.fileid = preview["pv_id"];
		preview_config.previewer = `/public${preview["p_path"]}/`;
		preview_config.fileType = preview["pv_contenttype"];
		
		// Handle preview resource URL
		let pv_routes = preview["pv_route"];   // pv_route:"/files/64ac2c9ae4b024bdd77bbfb1/blob"
		if (!pv_routes.includes("/api/")) {
			try{
				let routes = pv_routes.split("files/");
				// add api endpoint in url
				pv_routes = routes[0] + 'api/files/' + routes[1];
			} catch (e) {
				console.error("Incorrect Preview url %s", pv_routes);
			}
		}
		// Convert to proxy route
		pv_routes = pv_routes.replace(/^\/clowder\//, '/');
		if (!pv_routes.startsWith('/api/')) {
			pv_routes = '/api' + pv_routes;
		}
		preview_config.pv_route = pv_routes;
		const resourceURL = `${pv_routes}?superAdmin=true`;
		preview_config.resource = await downloadResource(resourceURL, clientInfo);
	}

	return preview_config;
}

