// Fetch and display datasets from Clowder /datasets GET endpoint

import React, {useEffect, useState} from 'react';
import {Box, Button} from "@material-ui/core";

import config from "../../app.config";
import {getHeader} from "../../utils/common";
import {useDispatch, useSelector} from "react-redux";
import {fetchDatasets as fetchDatasetsAction} from "../../actions/dataset";

// not used in react-redux
async function getDatasetFromUrl(url) {
	const dataset_data_response = await fetch(url, {method:"GET", headers:getHeader()});

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
	const thumbnail=props.thumbnail;
	if (thumbnail !== null && thumbnail !== undefined) {
		const thumbnail_url = `/api/thumbnails/${thumbnail}/blob?superAdmin=true`;
		return (
			<div className="thumbnail">
				<img className="thumbnail-image" src={thumbnail_url} alt="thumbnail"/>
			</div>
		);
	}
	else {
		return null;
	}
}

function DisplayDataset(props) {
	const dataset = props.dataset;
	const name = dataset["name"];
	const description = dataset["description"];
	const created = dataset["created"];
	const thumbnail = dataset["thumbnail"];

	return (
		<div className="display-dataset">
			<p>Name : {name}</p>
			<p>Description: {description}</p>
			<p>Created: {created}</p>
			<GetThumbnailFromUrl thumbnail={thumbnail}/>
		</div>
	);
}

const GetDataset = () => {

	const dispatch = useDispatch();
	const listDatasets = () => dispatch(fetchDatasetsAction()); // get list of Datasets. limit 5

	const datasets = useSelector((state) => state.dataset.datasets);

	return (
		<>
			<Button onClick={()=> listDatasets()}> Explore Datasets </Button>
			{
				datasets.map((dataset) => {
					return(
						<div key={dataset.id}>
							<DisplayDataset dataset={dataset} />
						</div>
					);
				})
			}
		</>
	);

};

export default GetDataset;
