// construct header
// Note: API key is no longer needed on the client - the Express server proxy adds it
export function getHeader() {
	const headers = new Headers();
	// API key is now handled by the server proxy, so we don't need to send it from the client
	return headers;
}

export async function downloadResource(url) {
	// URL should already be proxied (starts with /api/)
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
	});

	if (response.status === 200) {
		const blob = await response.blob();
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
	const metadata = dataURI.split(",")[0];
	const mime = metadata.match(/:(.*?);/)[1];
	const filename = metadata.match(/name=(.*?);/)[1];

	const binary = atob(dataURI.split(",")[1]);
	const array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	const blob = new Blob([new Uint8Array(array)], {type: mime});
	return new File([blob], filename, {type: mime, lastModified: new Date()});
}
