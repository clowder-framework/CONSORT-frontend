import {getHeader, getHostname} from "./common";
import config from "../app.config";

const hostname = await getHostname()

export async function getDatasetsRequest(title, limit) {
	// Clowder API to get dataset list
	let url = `${hostname}/clowder/api/datasets&limit=${limit}`;
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
	// Clowder API call to create empty dataset
	const url = `${config.hostname}/clowder/api/datasets/createempty`;
	let authHeader = getHeader('application/json', 'application/json');
	(await authHeader).append('Accept', 'application/json');
	(await authHeader).append('Content-Type', 'application/json');
	const body_data = {"name": dataset_name, "description": dataset_description, "space": config.space};
	const body = JSON.stringify(body_data);
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
		console.log("Creation of dataset failed");
		return null;
	} else {
		// handle error
		const responseJson = await response.json();
		console.log(responseJson);
		console.log("Creation of dataset failed");
		return null;
	}
}


export async function uploadFileToDatasetRequest(dataset_id, file) {
	// Clowder API call to upload file to dataset
	const upload_to_dataset_url = `${hostname}/clowder/api/uploadToDataset/${dataset_id}?extract=${config.extract}`;
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


export async function listFilesInDatasetRequest(dataset_id) {
	// function to get a list of all files in clowder dataset
	const listFiles_url = `${hostname}/clowder/api/datasets/${dataset_id}/listFiles`;
	// get the list of files in dataset
	const listFiles_response = await fetch(listFiles_url, {method:"GET", headers:getHeader(), mode: "cors"});
	return listFiles_response.json();
}


export async function getFileInDataset(dataset_id, file_type, file_name=null){
	// function to check if a specific file is present in dataset and return the file
	// filter files on file type and filename and select the first item in filtered array.
	let fileObjects = await listFilesInDatasetRequest(dataset_id);
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
	let endpoint = `${hostname}/clowder/api/datasets/${datasetId}/download`;
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
