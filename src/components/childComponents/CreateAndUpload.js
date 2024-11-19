// Create a dataset and upload a file. Submit for extraction and get file previews

import React, {useEffect, useState, useCallback} from 'react';
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import LoadingOverlay from "react-loading-overlay-ts";
import {Box, Button} from "@material-ui/core";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import {getClientInfo} from "../../utils/common";
import Dropfile from "./Dropfile";
import {createUploadExtract} from "../../actions/client";
import {getDatasetMetadata, getFileInDataset} from "../../utils/dataset";
import {fetchFilePreviews} from "../../actions/file";
import {SET_DATASET_METADATA, setDatasetMetadata} from "../../actions/dataset";
import config from "../../app.config";


export default function CreateAndUpload() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const pdfExtractor = config.pdf_extractor;
	const rctExtractor = config.rct_extractor;

	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // loading overlay state and button disabled state. set to active when dropfile is active
	const [loading_text, setLoadingText] = useState("Processing"); // loading overlay text.
	const [filename, setFilename] = useState(''); // uploaded filename
	const [spinner, setSpinner] = useState(true); //loading overlay spinner active
	const [preview, setPreview] = useState(true); // disabled button state for file preview button

	const datasets = useSelector((state) => state.dataset.datasets);
	const filesInDataset = useSelector(state => state.dataset.files);
	const extractionStatus = useSelector(state => state.file.extractionStatus);
	const listFilePreviews = (fileId, clientInfo) => dispatch(fetchFilePreviews(fileId, clientInfo));
	const datasetMetadata = (json) => dispatch(setDatasetMetadata(SET_DATASET_METADATA, json));

	const handleStatementChange = (event) => {
		dispatch(setStatement(event.target.value));
	};

	const onDropFile = (file) => {
		setLoadingText("Uploading file");
		setFilename(file.name);
		dispatch(createUploadExtract(file));
	};

	// useEffect on extractionStatus for preview generation
	useEffect(async () => {
		if (extractionStatus !== null && extractionStatus === true) {
			const clientInfo = await getClientInfo();
			const file_name = filename.replace(/\.[^/.]+$/, ""); // get filename without extension;
			const dataset_id = datasets[0].id;
			// check extraction status and html file generation in loop
			const html_file_loop = async () => {
				setLoadingText("Checking extraction status");
				const highlights_filename = file_name + '_highlights' + '.json'
				const highlightsFile = await getFileInDataset(dataset_id, "application/json", highlights_filename, clientInfo);
				if (highlightsFile !== null && typeof highlightsFile.id === "string") {
					// {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string}
					const metadata = await getDatasetMetadata(dataset_id, clientInfo);
					console.log("metadata", metadata);
					// get the metadata content list
					const contentList = metadata.map(item => item.content);
					console.log("metadata content list", contentList);
					const pdfExtractorContent = contentList.find(item => item.extractor === pdfExtractor);
					const rctExtractorContent = contentList.find(item => item.extractor === rctExtractor);
					if (pdfExtractorContent){
						// get pdf preview
						console.log("pdf extractor preview ", pdfExtractorContent)
						const pdf_extractor_extracted_files = pdfExtractorContent["extracted_files"]
						const pdf_input_file = pdf_extractor_extracted_files[0]["file_id"]
						console.log("listFilePreviews", pdf_input_file)
						listFilePreviews(pdf_input_file, clientInfo);
					}
					else{
						listFilePreviews(highlightsFile.id, clientInfo);
					}
					datasetMetadata(metadata);

					setLoadingText("Extraction completed");
					setPreview(false)  // Continue button activated
					setSpinner(false); // stop display of spinner
				} else {
					console.log("check highlights file after 5s");
					setTimeout(html_file_loop, 5000);
				}
			};

			if (dataset_id !== null) {
				await html_file_loop(); // call the loop to check extractions
			} else {
				console.error("Dataset does not exist");
			}
		}
		else if (extractionStatus === false){
			setLoadingText("Error in extraction");
			setSpinner(false); // stop display of spinner
		}
	}, [extractionStatus]);


	// onDrop function to trigger createUploadExtract action dispatch
	const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
		// this callback will be called after files get dropped.
		setLoading(true);
		try {
			acceptedFiles.map(file => {
				onDropFile(file)
			})
			rejectedFiles.map(file => {
				setLoadingText("File rejected");
				setSpinner(false); // stop display of spinner
			})
		}
		catch(error) {
			setLoadingText("Upload failed", error)
			setSpinner(false); // stop display of spinner
		}
	}, [mouseHover]);


	const goToPreviewRoute = () => {
		setLoading(false); // stop display of Overlay
		let path = '/preview';
		navigate(path);
	}

	// We pass onDrop function and accept prop to the component. It will be used as initial params for useDropzone hook
	return (
		<Box className="createupload">
			<LoadingOverlay active={loading} text={loading_text} spinner={spinner}>
				<div className="mousehoverdrop" onMouseEnter={() => setMouseHover(true)}>
					{/* <Dropfile onDrop={onDrop} accept={{"text/plain": [".txt"], "application/pdf": [".pdf"]}}/> */}
					<Dropfile onDrop={onDrop} accept={{"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],  "application/msword": [".doc"], "application/pdf": [".pdf"]}}/>
				</div>
			</LoadingOverlay>

			<div className="radio-buttons-group-div">
				<RadioGroup 
					defaultValue="consort" 
					name="radio-buttons-group" 
					row
					onChange={handleStatementChange}
				>
					<FormControlLabel value="consort" control={<Radio />} label="Trial results" />
					<img className="consort-logo" src="../../public/assets/consort-logo.png" alt="consort-logo-sm"/>
					<FormControlLabel value="spirit" control={<Radio />} label="Trial protocol" />
					<img className="spirit-logo" src="../../public/assets/spirit-logo.png" alt="spirit-logo-sm"/>
				</RadioGroup>
			</div>
			<div className="preview-button align-right">
				<Button variant="contained" disabled={preview} onClick={goToPreviewRoute}> View Results </Button>
			</div>

		</Box>

	);

}
