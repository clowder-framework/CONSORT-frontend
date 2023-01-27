// Fetch and display datasets from Clowder /datasets GET endpoint

import React, {useEffect, useState} from 'react';
import {Box, Button} from "@material-ui/core";

import config from "../../app.config";
import {getHeader} from "../../utils/common";

async function getDatasetFromUrl(url) {
	let dataset_data_response = await fetch(url, {method:'GET', headers:getHeader()})

	if (dataset_data_response.status === 200) {
		return dataset_data_response.json();
	} else if (dataset_data_response.status === 401) {
		// TODO handle error
		return null;
	} else {
		// TODO handle error
		return null;
	}
}

function GetThumbnailFromUrl(props) {
	let thumbnail=props.thumbnail
	if (thumbnail !== null && thumbnail !== undefined) {
		let thumbnail_url = `${config.hostname}/clowder/api/thumbnails/${thumbnail}/blob?superAdmin=true`;
		return (
			<div className="thumbnail">
				<img className="thumbnail-image" src={thumbnail_url} alt="thumbnail"/>
			</div>
		);
	}
}

function DisplayDataset(props) {
	let dataset = props.dataset;
	let name = dataset["name"];
	let description = dataset["description"]
	let created = dataset["created"]
	let thumbnail = dataset["thumbnail"]

	return (
		<div className="dataset">
			<p>Name : {name}</p>
			<p>Description: {description}</p>
			<p>Created: {created}</p>
			<GetThumbnailFromUrl thumbnail={thumbnail}/>
		</div>
	)
}

export default function GetDataset() {
	const [fetchDatasets, setFetchDatasets] = useState(false); // state of explore button
	const [datasets, setDatasets] = useState([]); // state for dataset list returned from fetch

	// Click Explore Dataset button to get dataset list
	useEffect(() => {
		let dataset_url = `${config.hostname}/clowder/api/datasets?superAdmin=true&limit=5`;
		if (fetchDatasets == true) {
			getDatasetFromUrl(dataset_url).then((response) => {setDatasets(response)});
		}
	}, [fetchDatasets])

	return (
		<>
			<Button onClick={()=> setFetchDatasets(true)}> Explore Datasets </Button>
			{
				datasets.map((dataset) => {
					return(
						<div>
							<DisplayDataset dataset={dataset} />
						</div>
					)
				})
			}
		</>
	)

}
