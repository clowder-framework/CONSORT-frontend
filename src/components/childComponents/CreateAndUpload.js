// Create a dataset and upload a file to it
// Use Clowder createempty dataset API to create an empty dataset and uploadToDataset API to upload file to that dataset

import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import LoadingOverlay from "react-loading-overlay-ts";
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
import {downloadResource} from "../../utils/common";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {createEmptyDataset as createEmptyDatasetAction, createUploadExtract} from "../../actions/dataset";
import {uploadFileToDataset as uploadFileToDatasetAction} from "../../actions/dataset";
import {submitForExtraction} from "../../utils/file";


async function checkExtractionStatus(file){
	// Clowder API call to check extraction status of a file
	const file_id = file["id"];
	const extractions_status_url = `${config.hostname}/clowder/api/extractions/${file_id}/status`;
	const extractions_response = await fetch(extractions_status_url, {method:"GET", headers:getHeader()});
	let extractions_data = await extractions_response.json();
	//{"ncsa.file.digest": "DONE", "ncsa.rctTransparencyExtractor": "DONE", "Status": "Done"}
	return extractions_data;
}

async function checkHtmlInDataset(dataset){
	// function to check if html file is there in the dataset
	const dataset_id = dataset["id"];
	const listFiles_url = `${config.hostname}/clowder/api/datasets/${dataset_id}/listFiles`;
	// get the list of files in dataset
	const dataset_listFiles_response = await fetch(listFiles_url, {method:"GET", headers:getHeader(), mode: "cors"});
	const dataset_listFiles = await dataset_listFiles_response.json();
	// filter html file and select the first item in filtered array.
	const htmlFile = Object.values(dataset_listFiles).filter(file => file.contentType === "text/html")[0];
	// [ {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string} ]
	if (htmlFile !== undefined && htmlFile.contentType === "text/html") {
		// found html file in dataset. return the object
		console.log("html file generated");
		return htmlFile;
	}
	else {
		console.log("html file generation failed");
		return null;
	}

}

async function getPreviews(file_id) {
	const previews_url = `${config.hostname}/clowder/api/files/${file_id}/getPreviews?superAdmin=true`;
	const previews_response = await fetch(previews_url, {method:"GET", mode: "cors", headers:getHeader()});
	// [{"file_id":"63e6a5dfe4b034120ec4f035","previews":[{"pv_route":"/clowder/files/63e6a5dfe4b034120ec4f035/blob","p_main":"html-iframe.js","pv_id":"63e6a5dfe4b034120ec4f035","p_path":"/clowder/assets/javascripts/previewers/html","p_id":"HTML","pv_length":"21348","pv_contenttype":"text/html"}]}]
	let previews_list = [];
	if (previews_response.status === 200) {
		const file_preview = await previews_response.json();
		if (file_preview[0].file_id !== undefined){
			file_preview[0].previews.map((preview) => previews_list.push(preview));
			console.log("preview generated");
		}
		return previews_list;
	}
	else{
		console.log("preview failed");
	}
}

export default function CreateAndUpload() {
	const dispatch = useDispatch();
	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // processing state. set to active when dropfile is active
	const [clowderDataset, setClowderDataset] = useState(null); // state for created dataset in Clowder
	const [clowderFile, setClowderFile] = useState(null);  // state for uploaded file in Clowder
	const [extractionJob, setExtractionJob] = useState(null);  // state for extraction job ID and status
	const [previews, setPreviews] = useState([]); // state for file previews


	// if clowderFile state has changed, submit file for extraction and preview html.
	// useEffect(async () => {
	// 	if (clowderFile !== null) {
	// 		const body = {"extractor": "ncsa.rctTransparencyExtractor"};
	// 		//const extractor_name = "ncsa.wordcount";
	// 		await extractionsRequest(clowderFile, body).then((response)=> setExtractionJob(response)); // end of extraction request
	// 	}
	// }, [clowderFile]);

	// check extraction status in loop
	// useEffect( () => {
	// 	const loop = async () => {
	// 		const extraction_status = await checkExtractionStatus(clowderFile);
	// 		console.log(extraction_status);
	// 		if (extraction_status["Status"] === "Done" && extraction_status["ncsa.rctTransparencyExtractor"] === "DONE") {
	// 			const htmlFile = await checkHtmlInDataset(clowderDataset);
	// 			console.log(htmlFile);
	// 			if (typeof htmlFile.id === "string") {
	// 				// {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string}
	// 				const previews_list = await getPreviews(htmlFile.id);
	// 				const preview = previews_list[0];
	// 				console.log(preview);
	// 				if (preview !== undefined) {
	// 					let previewsTemp = [];
	// 					// get all preview resources
	// 					let preview_config = {};
	// 					preview_config.previewType = preview["p_id"].replace(" ", "-").toLowerCase(); // html
	// 					preview_config.url = `${config.hostname}${preview["pv_route"]}?superAdmin=true`;
	// 					preview_config.fileid = preview["pv_id"];
	// 					preview_config.previewer = `/public${preview["p_path"]}/`;
	// 					preview_config.fileType = preview["pv_contenttype"];
	//
	// 					// TODO need to fix on clowder v1: sometimes pv_route return the non-API routes
	// 					// /clowder/file vs clowder/api/file
	// 					// TODO Temp fix insert /api/
	// 					let pv_routes = preview["pv_route"];
	// 					if (!pv_routes.includes("/api/")) {
	// 						pv_routes = `${pv_routes.slice(0, 9)}api/${pv_routes.slice(9, pv_routes.length)}`;
	// 					}
	// 					const resourceURL = `${config.hostname}${pv_routes}?superAdmin=true`;
	// 					preview_config.resource = await downloadResource(resourceURL);
	// 					previewsTemp.push(preview_config);
	// 					setPreviews(previewsTemp); // set previews
	// 					setLoading(false); // stop display of Overlay
	// 				}
	// 				else{
	// 					console.log("preview generation failed");
	// 				}
	//
	// 			} else {
	// 				console.log("check html file after 5s");
	// 				setTimeout(loop, 5000);
	// 			}
	// 		} else {
	// 			console.log("check extraction status after 5s");
	// 			setTimeout(loop, 5000);
	// 		}
	//
	// 	};
	// 	if (extractionJob !== null){
	// 		loop(); // call the loop to check extractions
	// 	}
	//
	// }, [extractionJob]);

	const datasets = useSelector((state) => state.dataset.datasets);
	const filesInDataset = useSelector(state => state.dataset.files);

	function selectDatasetID(){
		// not able to useSelector here
		//const datasets = useSelector((state) => state.dataset.datasets);
		return datasets.map(dataset => dataset.id);
	}

	const onDropFile = async (file) => {
		// dont think we need async here in the above line
		//dispatch(createUploadExtract(file));
		dispatch(createEmptyDatasetAction(file));
		const datasetID = selectDatasetID(datasets);
		console.log("datsetID", datasetID);
		// TODO check below code if it can be used instead
		// if (datasets !== undefined && datasets.length > 0) {
		// 	await (datasets.map(dataset => {
		// 		const dataset_id = dataset.id;
		// 		dispatch(uploadFileToDatasetAction(dataset_id, file));
		// 	}));
		// }
		//dispatch(uploadFileToDatasetAction(file));
		//dispatch(submitForExtractionAction(files[0].id))

	};

	// useEffect(async()=> {
	// 	if (filesInDataset !== undefined && filesInDataset.length > 0){
	// 		const file_id = filesInDataset[0].id;
	// 		const extraction_response = submitForExtraction(file_id);
	// 	}
	// }, [filesInDataset]);

	// onDrop function
	const onDrop = useCallback(acceptedFiles => {
		// this callback will be called after files get dropped, we will get the acceptedFiles. If you want, you can even access the rejected files too
		acceptedFiles.map(file => onDropFile(file));
		setLoading(true);
	}, [mouseHover]);
	// TODO have a dependancy here - mouse hover or dropped file action

	// We pass onDrop function and accept prop to the component. It will be used as initial params for useDropzone hook
	return (
		<Box className="createupload">
			<LoadingOverlay
				active={loading}
				spinner
				text="Processing..."
			>
			<div className="mousehoverdrop" onMouseEnter={()=> setMouseHover(true)} >
				<Dropfile onDrop={onDrop}
						  accept={ {'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'text/html': ['.html', '.htm'], 'text/plain':['.txt']} }
				/>
			</div>
			</LoadingOverlay>

			<FormControl>
				<FormLabel id="demo-radio-buttons-group-label">Guideline</FormLabel>
				<RadioGroup row aria-labelledby="demo-radio-buttons-group-label" defaultValue="consort" name="radio-buttons-group">
					<FormControlLabel value="consort" control={<Radio />} label="CONSORT" />
					<FormControlLabel value="spirit" control={<Radio />} label="SPIRIT" />
				</RadioGroup>
			</FormControl>

			<div className="previewBox">
				{
					previews.map((preview) => {
						if (preview["previewType"] === "audio") {
							return (
								<div key={preview["fileid"]}>
									<Audio fileId={preview["fileid"]} audioSrc={preview["resource"]}/>;
								</div>
							);
						} else if (preview["previewType"] === "video") {
							return (
								<div key={preview["fileid"]}>
									<Video fileId={preview["fileid"]} videoSrc={preview["resource"]}/>;
								</div>
							);
						} else if (preview["previewType"] === "thumbnail") {
							return (
								<div key={preview["fileid"]}>
									<Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}
											   imgSrc={preview["resource"]}/>;
								</div>
							);
						} else if (preview["previewType"] === "html") {
							return (
								<div key={preview["fileid"]}>
									<Html fileId={preview["fileid"]} htmlSrc={preview["resource"]}/>;
								</div>
							);
						}

					})
				}
			</div>
		</Box>

	);

}
