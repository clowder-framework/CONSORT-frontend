import {getHeader} from "./common";
import config from "../app.config";


export async function getDatasetsRequest(title, limit) {
	// Clowder API to get dataset list
	let url = `${config.hostname}/clowder/api/datasets&limit=${limit}`;
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


export async function createEmptyDatasetRequest(file) {
	// Clowder API call to create empty dataset
	const url = `${config.hostname}/clowder/api/datasets/createempty`;
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	const datasetname = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
	const description = file.type;
	const body_data = {"name": datasetname, "description": description, "space": [config.space]};
	const body = JSON.stringify(body_data);
	const response = await fetch(url, {method:"POST", mode:"cors", headers:authHeader, body:body});
	if (response.status === 200) {
		// return the dataset ID {id:xxx}
		console.log("Creation of dataset successful");
		return await response.json();
	}
	else if (response.status === 401) {
		// handle error
		console.log("Creation of dataset failed");
		return null;
	} else {
		// handle error
		console.log("Creation of dataset failed");
		return null;
	}
}

export async function uploadFileToDatasetRequest(dataset_id, file) {
	// Clowder API call to upload file to dataset
	const upload_to_dataset_url = `${config.hostname}/clowder/api/uploadToDataset/${dataset_id}?extract=${config.extract}`;
	let body = new FormData();
	body.append("File" ,file);
	let authHeader = getHeader();
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

export async function checkHtmlInDatasetRequest(dataset_id){
	// function to check if html file is there in the dataset
	const listFiles_url = `${config.hostname}/clowder/api/datasets/${dataset_id}/listFiles`;
	// get the list of files in dataset
	const dataset_listFiles_response = await fetch(listFiles_url, {method:"GET", headers:getHeader(), mode: "cors"});
	const dataset_listFiles = await dataset_listFiles_response.json();
	// filter html file and select the first item in filtered array.
	const htmlFile = Object.values(dataset_listFiles).filter(file => file.contentType === "text/html")[0];
	// [ {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string} ]
	if (htmlFile !== undefined && htmlFile.contentType === "text/html") {
		// found html file in dataset. return the object
		console.log("html file generated");
		return htmlFile;
	}
	else {
		console.log("html file generation failed");
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
	let endpoint = `${config.hostname}/clowder/api/datasets/${datasetId}/download`;
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
