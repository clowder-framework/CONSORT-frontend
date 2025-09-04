import axios from "axios"


// get client endpoint
const getClient = {method:'GET', url:"/client"};

export function getClientInfo(){
	return axios.request(getClient).then(function (response) {
		return response.data.headers
	});
	// // For testing, change to
	// return {hostname:"http://localhost:8000",
	// 	prefix:'',
	// 	apikey:"<apikey>"}
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


  // content = {"extractor": rctextractor_name, "extracted_files": extracted_files, "page_dimensions": page_dimensions,
  // "items_missed": str(items_missed), "checklist": checklist}
  // checklist = [ {"section": section_name1, "missed":num, "items": [{"topic": topic_name1, "item":item_name1, "found": "No/Yes", "sentences":[{text:'', coords:''}]}, {"topic": topic_name2, "item":item_name2, "found": "No/Yes"}] }, {"section": section_name2, "missed":num, "items":[]},]

  // get checklist from publication, annotations, statementSection, statementTopic
  export function getJsonList(publication, annotations, statementSection, statementTopic) {
    const jsonList = [];
	const page_width = publication["pagewidth"];
	const page_height = publication["pageheight"];
	const items_missed = publication["nummissed"];
	const reportpdffileid = publication["reportpdffileid"];
	const reportpdffilename = publication["reportpdffilename"];
	const extractor = "rctextractor_name";
	const content = {
		"extractor": extractor,
		"extracted_files": [{"file_id": reportpdffileid, "filename": reportpdffilename}],
		"page_dimensions": {"width": page_width, "height": page_height},
		"items_missed": items_missed,
		"checklist": []
	}

	jsonList.push(content);
    return jsonList;
  }