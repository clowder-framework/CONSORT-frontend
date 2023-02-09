// Create a dataset and upload a file to it
// Use Clowder createempty dataset API to create an empty dataset and uploadToDataset API to upload file to that dataset

import React, {useEffect, useState, useCallback} from 'react';
import {Box, Button} from "@material-ui/core";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Dropfile from "./Dropfile";
import Html from "../previewers/Html";
import config from "../../app.config";
import {getHeader} from "../../utils/common";

async function createDatasetRequest(body_data) {
	const create_dataset_url = `${config.hostname}/clowder/api/datasets/createempty?superAdmin=true`;
	let body = JSON.stringify(body_data);
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');

	let create_dataset_response = await fetch(create_dataset_url,
		{method:"POST", mode:"cors", headers:authHeader, body:body} )

	if (create_dataset_response.status === 200) {
		// return the dataset ID {id:xxx}
		return create_dataset_response.json();
	} else if (create_dataset_response.status === 401) {
		// TODO handle error
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

async function uploadToDatasetRequest(dataset_id, file) {
	const upload_to_dataset_url = `${config.hostname}/clowder/api/uploadToDataset/${dataset_id}?extract=false`;
	let body = new FormData();
	body.append("File" ,file);
	let authHeader = getHeader();
	//authHeader.append('Accept', 'application/json');
	//authHeader.append('Content-Type', 'multipart/form-data');
	let response = await fetch(upload_to_dataset_url, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// return file ID
		// {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
		return response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
}

async function extractionsRequest(file,body_data) {
	const file_id = file["id"];
	const extractions_url = `${config.hostname}/clowder/api/files/${file_id}/extractions`;
	const body = JSON.stringify(body_data);
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');
	let response = await fetch(extractions_url, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// return {"status":"OK","job_id":"string"}
		return response.json();

	} else if (response.status === 401) {
		// TODO handle error
		console.log("error");
		return {};
	} else {
		// TODO handle error
		console.log("error");
		return {};
	}
}

async function checkExtractionStatus(file){
	// function to check extraction status of a file
	const file_id = file["id"];
	const extractions_status_url = `${config.hostname}/clowder/api/extractions/${file_id}/status`;
	const extractions_response = await fetch(extractions_status_url, {method:"GET", headers:getHeader()});
	const extractions_response_json = extractions_response.json();
	//{"ncsa.file.digest": "DONE", "ncsa.rctTransparencyExtractor": "DONE", "Status": "Done"}
	return extractions_response_json;
}

async function checkHtmlInDataset(dataset){
	// function to check if an html file is there in the dataset
	const dataset_id = dataset["id"];
	const listFiles_url = `${config.hostname}/clowder/api/datasets/${dataset_id}/listFiles`;
	// get the list of files in dataset
	const dataset_listFiles_response = await fetch(listFiles_url, {method:"GET", headers:getHeader()});
	// .then((response) => {setClowderFile(response)} );
	await fetch(listFiles_url, {method:"GET", headers:getHeader()}).then((response) => {
		// [ {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string} ]
		const dataset_listFiles = response.json();
		console.log(dataset_listFiles);
		// [ {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string} ]
		const htmlFile = Object.values(dataset_listFiles).filter(file => file.contentType === "text/html");
		console.log(htmlFile);
		if (htmlFile !== undefined ) {
			// found html file in dataset
			return htmlFile;
		}
		else {
			return null;
		}
	});

}


async function getPreviewUrl(file_id) {
	const previews_url = `${config.hostname}/clowder/api/files/${file_id}/getPreviews`;
	let response = await fetch(previews_url, {method:"GET", headers:getHeader()});
	if (response.status === 200) {
		let json_response = response.json();
		json_response[0]["previews"].map((preview) => {
			if(preview["pv_contenttype"] === "text/html") {
				return preview["pv_route"];
			}
			else{
				console.log("preview error");
				return null;
			}
		});
	}
}

export default function CreateAndUpload() {
	const [dropFile, setDropFile] = useState([]); // state for dropped file
	const [clowderDataset, setClowderDataset] = useState(null); // state for created dataset in Clowder
	const [clowderFile, setClowderFile] = useState(null);  // state for uploaded file in Clowder
	const [extractionJob, setExtractionJob] = useState(null);  // state for extraction job ID and status

	// if dropFile state has changed, create and upload to dataset
	useEffect(async () => {
		const name = dropFile.name;
		const description = dropFile.type;
		if (name !== undefined) {
			const body = {"name": name, "description": description};
			const dataset = await createDatasetRequest(body);
			if (dataset["id"] !== undefined) {
				setClowderDataset(dataset);
				await uploadToDatasetRequest(dataset["id"], dropFile).then((response) => {setClowderFile(response)} );
			}
		}
		else {
			console.log("error in dropped file");
		}
	}, [dropFile]);

	// if clowderFile state has changed, submit file for extraction and preview html.
	useEffect(async () => {
		if (clowderFile !== null) {
			const body = {"extractor": "ncsa.rctTransparencyExtractor"};
			//const extractor_name = "ncsa.wordcount";
			await extractionsRequest(clowderFile, body).then((response)=> {setExtractionJob(response)}); // end of extraction request
		}
	}, [clowderFile]);

	// set timer for 30s once extraction is done
	useEffect( () => {
		const timer = setTimeout(() => {
			// check dataset again after 1min
			console.log("check after 30s");
		}, 30000);
		// unmount function to clear interval to prevent memory leaks.
		return () => clearTimeout(timer);
	}, [extractionJob]);

	if (extractionJob.status === 200) {
		// const loop = () => {
		// 		// 	const extraction_status = checkExtractionStatus(clowderFile);
		// 		// 	if (extraction_status["Status"] === "Done") {
		// 		// 		const htmlFile = checkHtmlInDataset(clowderDataset);
		// 		// 		if (htmlFile === undefined) {
		// 		// 			console.log("check html file after 5s");
		// 		// 			setTimeout(loop, 5000);
		// 		// 		} else {
		// 		// 			// {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string}
		// 		// 			const preview_url = getPreviewUrl(htmlFile["id"]);
		// 		// 			if (preview_url !== null) {
		// 		// 				const htmlFileUrl = `${config.hostname}/${preview_url}`;
		// 		// 				console.log(htmlFileUrl);
		// 		// 				return <Html fileId={htmlFile["id"]} htmlSrc={htmlFileUrl}/>;
		// 		// 			}
		// 		// 		}
		// 		// 	} else {
		// 		// 		setTimeout(loop, 5000);
		// 		// 	}
		// 		//
		// 		// };
		// 		// loop(); // call the loop to check extractions
		console.log(extractionJob);

	}

	// onDrop function
	const onDrop = useCallback(acceptedFiles => {
		// this callback will be called after files get dropped, we will get the acceptedFiles. If you want, you can even access the rejected files too
		acceptedFiles.map(file => setDropFile(file));
	}, []);
	// TODO have a dependancy here - mouse hover or dropped file action

	// We pass onDrop function and accept prop to the component. It will be used as initial params for useDropzone hook
	return (
		<Box className="createupload">
			<Dropfile onDrop={onDrop}
					  accept={ {'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'text/html': ['.html', '.htm'], 'text/plain':['.txt']} }
			/>
			<FormControl>
				<FormLabel id="demo-radio-buttons-group-label">Guideline</FormLabel>
				<RadioGroup row aria-labelledby="demo-radio-buttons-group-label" defaultValue="consort" name="radio-buttons-group">
					<FormControlLabel value="consort" control={<Radio />} label="CONSORT" />
					<FormControlLabel value="spirit" control={<Radio />} label="SPIRIT" />
				</RadioGroup>
			</FormControl>
		</Box>



	);

}
