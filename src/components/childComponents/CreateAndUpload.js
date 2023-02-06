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
		//return response.json();
		console.log(response);
	} else if (response.status === 401) {
		// TODO handle error
		console.log("error");
		//return {};
	} else {
		// TODO handle error
		console.log("error");
		//return {};
	}
}

export default function CreateAndUpload() {
	const [dropFile, setDropFile] = useState([]); // state for dropped file
	const [clowderFile, setClowderFile] = useState(null);  // state for uploaded file in Clowder

	// if dropFile state has changed, create and upload to dataset
	useEffect(async () => {
		const name = dropFile.name;
		const description = dropFile.type;
		if (name !== undefined) {
			const body = {"name": name, "description": description};
			const dataset = await createDatasetRequest(body);
			if (dataset["id"] !== undefined) {
				await uploadToDatasetRequest(dataset["id"], dropFile).then((response) => {setClowderFile(response)} );
			}
		}
		else {
			console.log("error in dropped file");
		}
	}, [dropFile]);

	// if clowderFile state has changed, submit file for extraction. if disabled by default.
	useEffect(async () => {
		if (clowderFile !== null) {
			const body = {"extractor": "ncsa.rctTransparencyExtractor"};
			//const extractor_name = "ncsa.wordcount";
			await extractionsRequest(clowderFile, body);

		}
	}, [clowderFile]);

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
