// Create empty dataset with Clowder /datasets POST endpoint

import React, {useEffect, useState} from 'react';
import config from "../../app.config";
import {getHeader} from "../../utils/common";
import NewDatasetModal from "./NewDatasetModal";

async function createDatasetRequest(name, description) {
	let create_dataset_url = `${config.hostname}/clowder/api/datasets/createempty?superAdmin=true`;
	let body = {'name':name, 'description': description};
	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');

	let create_dataset_response = await fetch(create_dataset_url,
		{method:'POST', mode:'cors', headers:authHeader, body:body} )

	if (create_dataset_response.status === 200) {
		// return the dataset ID
		return create_dataset_response.json();
	} else if (create_dataset_response.status === 401) {
		// TODO handle error
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

export default function CreateDataset() {
	const [newDataset, setNewDataset] = useState(null);

	// Click Create Dataset Modal to send POST request
	const onSubmit = (event) =>{
		event.preventDefault(event);
		let datasetName = event.target.name.value;
		let datasetDescription = event.target.description.value;
		setNewDataset(createDatasetRequest(datasetName, datasetDescription));
	}

	return (
		<>
			<NewDatasetModal onSubmit={onSubmit}/>
		</>
	)
}
