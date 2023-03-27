// Create a dataset and upload a file and submit for extraction

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
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {createEmptyDataset as createEmptyDatasetAction, createUploadExtract} from "../../actions/dataset";
import {uploadFileToDataset as uploadFileToDatasetAction} from "../../actions/dataset";
import {checkExtractionStatus, getPreviewResources} from "../../utils/file";
import {checkHtmlInDatasetRequest} from "../../utils/dataset";
import {fetchFilePreviews} from "../../actions/file";


export default function CreateAndUpload() {
	const dispatch = useDispatch();

	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // loading overlay state. set to active when dropfile is active
	const [loading_text , setLoadingText] = useState("processing"); // loading overlay text.
	const [previews, setPreviews] = useState([]); // state for file previews

	const listFilePreviews = (fileId) => dispatch(fetchFilePreviews(fileId));

	const datasets = useSelector((state) => state.dataset.datasets);
	const filesInDataset = useSelector(state => state.dataset.files);
	const filePreviews = useSelector((state) => state.file.previews);

	const extractor_name = "ncsa.rctTransparencyExtractor"


	const onDropFile = (file) => {
		setLoadingText("Uploading file");
		dispatch(createUploadExtract(file, extractor_name));
	};

	// useEffect on filesInDataset for preview generation
	useEffect(async()=> {
		if (filesInDataset !== undefined && filesInDataset.length > 0){
			const file_id = filesInDataset[0].id;
			const dataset_id = datasets[0].id;
			// check extraction status and html file generation in loop
			const loop = async () => {
				setLoadingText("Checking extraction status");
				const extraction_status = await checkExtractionStatus(file_id);
				console.log(extraction_status);
				if (extraction_status["Status"] === "Done" && extraction_status[extractor_name] === "DONE") {
					setLoadingText("Generating html file");
					const htmlFile = await checkHtmlInDatasetRequest(dataset_id);
					console.log(htmlFile);
					if (typeof htmlFile.id === "string") {
						// {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string}
						listFilePreviews(htmlFile.id);
					} else {
						console.log("check html file after 5s");
						setTimeout(loop, 5000);
					}
				} else {
					console.log("check extraction status after 5s");
					setTimeout(loop, 5000);
				}
			};

			if (file_id !== null){
				await loop(); // call the loop to check extractions
			}
			else{
				console.error("file does not exist");
			}
		}
	}, [filesInDataset]);
	// TODO how to make this dependency better? Now filesInDataset.id throws an error on start


	// useEffect on filePreviews to download preview resources
	useEffect( async ()=> {
		if (filePreviews !== undefined && filePreviews.length > 0) {
			const previewsTemp = [];
			filePreviews[0].map(async (preview) => {
				// get all preview resources
				const preview_config = await getPreviewResources(preview);
				previewsTemp.push(preview_config);
				setPreviews(previewsTemp); // set previews
				setLoading(false); // stop display of Overlay
			});
		}
	}, [filePreviews])


	// onDrop function to trigger createUploadExtract action dispatch
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
				text={loading_text}
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
