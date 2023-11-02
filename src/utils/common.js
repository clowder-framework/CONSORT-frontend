import axios from "axios"


// get client endpoint
const getClient = {method:'GET', url:"/client"};

export function getClientInfo(){
	return axios.request(getClient).then(function (response) {
		return response.data.headers
	});
}

// get hostname
export function getHostname(){
	return axios.request(getClient).then(function (response) {
		return response.data.headers.hostname
	});
}

// construct header
export function getHeader(clientInfo) {
	const headers = new Headers({
		"X-API-Key": clientInfo.apikey
	});
	return headers;
}

export async function downloadResource(url, clientInfo) {
	let authHeader = getHeader(clientInfo);
	let response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: authHeader,
	});

	if (response.status === 200) {
		let blob = await response.blob();
		return window.URL.createObjectURL(blob);
	} else if (response.status === 401) {
		// TODO handle error
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

export function dataURItoFile(dataURI) {
	let metadata = dataURI.split(",")[0];
	let mime = metadata.match(/:(.*?);/)[1];
	let filename = metadata.match(/name=(.*?);/)[1];

	let binary = atob(dataURI.split(",")[1]);
	let array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(array)], {type: mime});
	return new File([blob], filename, {type: mime, lastModified: new Date()});
}
