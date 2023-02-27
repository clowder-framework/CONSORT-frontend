import {getHeader} from "./common";
import config from "../app.config";


export async function createEmptyDatasetRequest(file) {
	// Clowder API call to create empty dataset
	const url = `${config.hostname}/clowder/api/datasets/createempty?superAdmin=true`;
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	const filename = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension
	const datasetname = filename + "_dataset";
	const description = file.type;
	const body_data = {"name": datasetname, "description": description};
	const body = JSON.stringify(body_data);
	const response = await fetch(url, {method:"POST", mode:"cors", headers:authHeader, body:body});
	if (response.status === 200) {
		// return the dataset ID {id:xxx}
		return await response.json();
	}
	else if (response.status === 401) {
		// handle error
		return null;
	} else {
		// handle error
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
	let endpoint = `${config.hostname}/clowder/api/datasets/${datasetId}/download?superAdmin=true`;
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
