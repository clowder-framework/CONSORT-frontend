import {getClientInfo, getHeader, getHostname} from "./common";
import config from "../app.config";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clientInfo = await getClientInfo();

export async function getDatasetsRequest(title, limit) {
	// Clowder API to get dataset list - proxied through Express server
	let url = `/api/datasets?limit=${limit}`;
	if (title) url = `${url}&title=${title}`;
	const response = await fetch(url, {mode: "cors", headers: getHeader()});
	if (response.status === 200) {
		console.log("Fetch dataset successful");
		return await response.json(); // list of datasets
	}
	else if (response.status === 401) {
		// handle error
		console.log("Fetch of dataset failed");
		return null;
	} else {
		// handle error
		console.log("Fetch of dataset failed");
		return null;
	}

}


export async function createEmptyDatasetRequest(dataset_name, dataset_description) {
	// Clowder API call to create empty dataset - proxied through Express server
	const url = "/api/datasets/createempty";
	const authHeader = new Headers();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	const body_data = {"name": dataset_name, "description": dataset_description, "space": config.space};
	const body = JSON.stringify(body_data);
	try {
		const response = await fetch(url, {method:"POST", mode:"cors", headers:authHeader, body:body});
		if (response.status === 200) {
			// return the dataset ID {id:xxx}
			console.log("Creation of dataset successful");
			return await response.json();
		}
		else if (response.status === 401) {
			// handle error
			const responseJson = await response.json();
			console.log(responseJson);
			console.error("Creation of dataset failed");
			return null;
		} else {
			// handle error
			const responseJson = await response.json();
			console.log(responseJson);
			console.error("Creation of dataset failed");
			return null;
		}
	}
	catch (error) {
		console.error("Creation of dataset failed", error);
		return null;
	}
}


export async function uploadFileToDatasetRequest(dataset_id, file, clientInfo) {
	// Clowder API call to upload file to dataset - proxied through Express server
	const upload_to_dataset_url = `/api/uploadToDataset/${dataset_id}?extract=${config.extract}`;
	let body = new FormData();
	body.append("File" ,file);
	let authHeader = getHeader(clientInfo);
	let response = await fetch(upload_to_dataset_url, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});
	if (response.status === 200) {
		// return file ID
		// {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
		console.log("upload to dataset successful");
		return response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
}


export async function listFilesInDatasetRequest(dataset_id, clientInfo) {
	// function to get a list of all files in clowder dataset - proxied through Express server
	const listFiles_url = `/api/datasets/${dataset_id}/listFiles`;
	// get the list of files in dataset
	let authHeader = getHeader(clientInfo);
	const listFiles_response = await fetch(listFiles_url, {method:"GET", headers:authHeader, mode: "cors"});
	return listFiles_response.json();
}


export async function getFileInDataset(dataset_id, file_type, file_name, clientInfo){
	// function to check if a specific file is present in dataset and return the file
	// filter files on file type and filename and select the first item in filtered array.
	let fileObjects = await listFilesInDatasetRequest(dataset_id, clientInfo);
	console.log("getFileInDataset", dataset_id, file_type, file_name);
	console.log("fileObjects", fileObjects);
	let files = [];
	if (file_name) {
		files = Object.values(fileObjects).filter(file => {
			if (file.contentType === file_type && file.filename === file_name){
				return file
			}
		});
	}
	else {
		files = Object.values(fileObjects).filter(file => file.contentType === file_type);
	}
	// get the first item of files list
	const file = files[0];
	// [ {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string} ]
	if (file !== undefined && file.contentType === file_type) {
		// found file in dataset. return the object
		console.log("File with type ", file_type, " generated");
		return file;
	}
	else {
		console.log("No File with type ", file_type);
		return null;
	}
}


export async function downloadDataset(datasetId, filename = null) {

	if (filename) {
		filename = filename.replace(/\s+/g, "_");
		filename = `${filename}.zip`;
	} else {
		filename = `${datasetId}.zip`;
	}
	let endpoint = `/api/datasets/${datasetId}/download`;
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


export async function getDatasetMetadata(dataset_id, clientInfo) {
	// returns the metadata for the dataset - proxied through Express server
	const metadata_url = `/api/datasets/${dataset_id}/metadata.jsonld`;
	let authHeader = getHeader(clientInfo);
	const metadata_response = await fetch(metadata_url, {method:"GET", headers:authHeader, mode: "cors"});
	let metadata_response_json = await metadata_response.json();
	return metadata_response_json;
}


export async function getDatasetExtractorMetadata(dataset_id, extractor_name, clientInfo){
	// returns the metadata for the dataset for extractors specified in config - proxied through Express server
	const metadata_url = `/api/datasets/${dataset_id}/metadata.jsonld?extractor=${extractor_name}`;
	let authHeader = getHeader(clientInfo);
	const metadata_response = await fetch(metadata_url, {method:"GET", headers:authHeader, mode: "cors"});
	let metadata_response_json = await metadata_response.json();
	return metadata_response_json;
}


export async function setDatasetMetadata(dataset_id, content) {
	// function to set the user defined metadata for dataset - proxied through Express server
	const metadata_url = `/api/datasets/${dataset_id}/usermetadatajson`;
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	const body = JSON.stringify(content);
	const response = await fetch(metadata_url, {method:"POST", mode:"cors", headers:authHeader, body:body});
	if (response.status === 200) {
		console.log("Set metadata for dataset");
		return await response.json();
	}
	else if (response.status === 401) {
		// handle error
		console.log("Metadata for dataset failed");
		return null;
	} else {
		// handle error
		console.log("Metadata for dataset failed");
		return null;
	}
}


export async function getDatasetMetadataLoop(dataset_id, extractor_name, clientInfo) {
	if (!dataset_id) {
		console.error("Dataset does not exist");
		return [];
	}

	let metadataFound = false;
	let relevantMetadata = null;

	do {
		const metadata = await getDatasetMetadata(dataset_id, clientInfo);
		if (metadata && metadata.length > 0) {
			relevantMetadata = metadata.find(item => item.content && item.content.extractor === extractor_name);
			if (relevantMetadata) {
				console.log(`Metadata found for extractor: ${extractor_name}`, relevantMetadata);
				metadataFound = true;
			}
		}
		if (!metadataFound) {
			console.log(`No metadata found for extractor: ${extractor_name}. Retrying in 5 seconds...`);
			await sleep(5000);
		}
	} while (!metadataFound);

	return relevantMetadata.content;
}
