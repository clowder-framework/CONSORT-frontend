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
import {checkExtractionStatus, getPreviewsRequest} from "../../utils/file";
import {checkHtmlInDatasetRequest} from "../../utils/dataset";
import {fetchFilePreviews} from "../../actions/file";


export default function CreateAndUpload() {
	const dispatch = useDispatch();

	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // processing state. set to active when dropfile is active
	const [extractionJob, setExtractionJob] = useState(null);  // state for extraction job ID and status
	const [previews, setPreviews] = useState([]); // state for file previews
	const listFilePreviews = (fileId) => dispatch((fetchFilePreviews(fileId)));

	const datasets = useSelector((state) => state.dataset.datasets);
	const filesInDataset = useSelector(state => state.dataset.files);
	const extractor_name = "ncsa.rctTransparencyExtractor"

	function selectDatasetID(){
		// not able to useSelector here
		//const datasets = useSelector((state) => state.dataset.datasets);
		return datasets.map(dataset => dataset.id);
	}

	const onDropFile = (file) => {
		dispatch(createUploadExtract(file, extractor_name));
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
