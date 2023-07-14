import config from "../app.config";


// construct header
export function getHeader() {
	const headers = new Headers({
		"X-API-Key": config.apikey
	});

	return headers;

	// const headers = new Headers({
	// 	"Authorization": cookies.get("Authorization"),
	// });
}

export async function downloadResource(url) {
	let authHeader = getHeader();
	let response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: authHeader,
	});

	if (response.status === 200) {
		let blob = await response.blob();
		console.log(response.body);
		console.log(blob);
		return window.URL.createObjectURL(blob);
	} else if (response.status === 401) {
		// TODO handle error
		console.error("DownloadResource Error", response.status);
		return null;
	} else {
		// TODO handle error
		console.error("DownloadResource Error", response.status);
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
