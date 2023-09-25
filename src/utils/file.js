import {dataURItoFile, downloadResource, getClientInfo, getHeader} from "./common";
import config from "../app.config";


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export async function submitForExtraction(file_id, extractor_name, clientInfo){
	// submits file for extraction and returns true if extraction is successful, else returns false
	const body = {"extractor": extractor_name};
	const extraction_response = await extractionRequest(file_id, body, clientInfo);
	console.log(extraction_response);
	if (extraction_response !== null && extraction_response.status === "OK") {
		return true;
	}
	else {
		return false;
	}
}


async function extractionRequest(file_id,body_data, clientInfo) {
	// Clowder API call to submit a file for extraction
	const extractions_url = `${clientInfo.hostname}/clowder/api/files/${file_id}/extractions`;
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
		console.log(extraction_response);
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


export async function checkExtractionStatus(file_id, clientInfo){
	// Clowder API call to check extraction status of a file
	const extractions_status_url = `${clientInfo.hostname}/clowder/api/extractions/${file_id}/status`;
	let authHeader = getHeader(clientInfo);
	authheader.append("Accept", "*/*");
	const response = await fetch(extractions_status_url, {method:"GET", mode: "no-cors", headers:authHeader});
	if (response.status === 200){
		//{"ncsa.file.digest": "DONE", "ncsa.rctTransparencyExtractor": "DONE", "Status": "Done"}
		return await response.json();
	} else if (response.status === 401) {
		// TODO handle error
		console.error("Extraction Status error %s %s", extractions_status_url, response);
		return {};
	} else if (response.status === 500){
		// TODO handle error
		console.error("Extraction Status Error %s %s", extractions_status_url, response);
		return {};
	}
	else {
		// TODO handle error
		console.error("Extraction Status error %s %s", extractions_status_url, response);
		return {};
	}

}

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
	const clientInfo = await getClientInfo();
	let endpoint = `${clientInfo.hostname}/clowder/api/files/${fileId}/blob?superAdmin=true`;
	let authHeader = getHeader(clientInfo);
	let response = await fetch(endpoint, {method: "GET", mode: "cors", headers: authHeader});

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


export async function getPreviewsRequest(file_id, clientInfo) {
	const previews_url = `${clientInfo.hostname}/clowder/api/files/${file_id}/getPreviews?superAdmin=true`;
	let authHeader = getHeader(clientInfo)
	const previews_response = await fetch(previews_url, {method:"GET", mode: "cors", headers:authHeader});
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


export async function getPreviewResources(preview, clientInfo) {
	// get all file preview resources
	const preview_config = {};
	//console.log(preview); {p_id:"HTML", p_main:"html-iframe.js", p_path:"/assets/javascripts/previewers/html", pv_contenttype:"text/html", pv_id:"64ac2c9ae4b024bdd77bbfb1",pv_length:"52434",pv_route:"/files/64ac2c9ae4b024bdd77bbfb1/blob"}
	preview_config.previewType = preview["p_id"].replace(" ", "-").toLowerCase(); // html
	preview_config.url = `${clientInfo.hostname}${preview["pv_route"]}?superAdmin=true`;
	preview_config.fileid = preview["pv_id"];
	preview_config.previewer = `/public${preview["p_path"]}/`;
	preview_config.fileType = preview["pv_contenttype"];

	// TODO need to fix on clowder v1: sometimes pv_route return the non-API routes
	// clowder/files vs clowder/api/files
	// Temp fix insert /api/
	let pv_routes = preview["pv_route"];
	if (!pv_routes.includes("/api/")) {
		try{
			let routes = pv_routes.split("files/");
			if (preview_config.url.includes("localhost")){
				// if running in local, the pv_route will not have clowder path
				pv_routes = routes[0] + 'clowder/api/files/' + routes[1];
			}
			else{
				pv_routes = routes[0] + 'api/files/' + routes[1];
			}
		} catch (e) {
			console.error("Incorrect Preview url %s", pv_routes);
		}
	}
	preview_config.pv_route = pv_routes;
	const resourceURL = `${clientInfo.hostname}${pv_routes}?superAdmin=true`;
	preview_config.resource = await downloadResource(resourceURL, clientInfo);
	return preview_config;
}

