// Create a dataset and upload a file. Submit for extraction and get file previews

import React, {useEffect, useState, useCallback, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import LoadingOverlay from "react-loading-overlay-ts";
import {Box, Button, Typography} from "@material-ui/core";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

import { theme } from "../../theme";
import {getClientInfo} from "../../utils/common";
import Dropfile from "./Dropfile";
import {createUploadExtract} from "../../actions/client";
import {getDatasetMetadata, getFileInDataset} from "../../utils/dataset";
import {downloadAndSaveFile} from "../../utils/file";
import {fetchFilePreviews, SET_EXTRACTION_STATUS, setExtractionStatus } from "../../actions/file";
import {SET_DATASET_METADATA, setDatasetMetadata} from "../../actions/dataset";
import {SET_STATEMENT_TYPE, setStatement, SET_USER_CATEGORY, setUserCategory, resetStatementToDefault, resetUserCategoryToDefault} from '../../actions/dashboard';
import config from "../../app.config";
import {resetFileToDefault} from '../../actions/file';
import {resetDatasetToDefault} from '../../actions/dataset';
import {resetPdfPreviewToDefault} from '../../actions/pdfpreview';


export default function CreateAndUpload() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // loading overlay state and button disabled state. set to active when dropfile is active
	const [loading_text, setLoadingText] = useState("Processing"); // loading overlay text.
	const [filename, setFilename] = useState(''); // uploaded filename
	const [spinner, setSpinner] = useState(true); //loading overlay spinner active
	const [preview, setPreview] = useState(true); // disabled button state for file preview button
	const [isAuthenticated, setIsAuthenticated] = useState(false); // state for authentication

	const datasets = useSelector((state) => state.dataset.datasets);
	const filesInDataset = useSelector(state => state.dataset.files);
	const extractionStatus = useSelector(state => state.file.extractionStatus);
	const listFilePreviews = (fileId, clientInfo) => dispatch(fetchFilePreviews(fileId, clientInfo));
	const datasetMetadata = (json) => dispatch(setDatasetMetadata(SET_DATASET_METADATA, json));
	const statementType = useSelector(state => state.statement.statementType); 
	const userCategory = useSelector(state => state.userCategory.userCategory);
	const datasetStatus = useSelector(state => state.dataset.status);

	const [RCTmetadata, setRCTMetadata] = useState({}); // state for RCT metadata
	const [PDFmetadata, setPDFMetadata] = useState({}); // state for PDF metadata
	let pdfExtractor;
	const rctExtractor = config.rct_extractor;
	if (userCategory === "author"){
		pdfExtractor = config.pymupdf_extractor;
	}
	else{
		pdfExtractor = config.pdf_extractor;
	}

	// Reference to track any active timeouts
	const timeoutsRef = useRef([]);

	// Check authentication status on mount
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const response = await fetch('/isAuthenticated', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();
				setIsAuthenticated(data.isAuthenticated);
			} catch (error) {
				console.error('Error checking authentication status:', error);
				setIsAuthenticated(false);
			}
		};
		checkAuthStatus();
	}, []);


	const handleStatementChange = (event) => {
		dispatch(setStatement(SET_STATEMENT_TYPE, event.target.value));
		config.statementType = event.target.value;
	};

	const handleUserCategoryChange = (event) => {
		dispatch(setUserCategory(SET_USER_CATEGORY, event.target.value));
		config.userCategory = event.target.value;
	};

	const onDropFile = (file) => {
		// Reset previous extraction state and previews
		dispatch(setExtractionStatus(null));
		dispatch({type: 'RESET_FILE_PREVIEWS'});
		dispatch({type: 'RESET_DATASET_METADATA'});
		
		setLoadingText("Uploading file");
		setLoading(true);
		setSpinner(true);
		setPreview(true);
		setFilename(file.name);
		dispatch(createUploadExtract(file, config));
	};

	// onDrop function to trigger createUploadExtract action dispatch
	const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
		// this callback function is triggered when a file is dropped into the dropzone
		
		// Reset all Redux states for a fresh upload
		dispatch(resetFileToDefault());
		dispatch(resetDatasetToDefault());
		dispatch(resetPdfPreviewToDefault());
		
		// Reset all local states for a fresh upload
		setLoading(true);
		setPreview(true); // disable preview button
		setRCTMetadata({});
		setPDFMetadata({});
		
		// Clear any pending timeouts
		timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
		timeoutsRef.current = [];
		
		try {
			acceptedFiles.map(file => {
				onDropFile(file)
			})
			rejectedFiles.map(file => {
				dispatch(setExtractionStatus("File rejected"));
				setSpinner(false);
			})
		}
		catch(error) {
			dispatch(setExtractionStatus("Upload failed"));
			setSpinner(false);
		}
	}, [mouseHover]);


	// useEffect on extractionStatus for preview generation
	useEffect(async () => {
		// Skip processing if we're in a state cleanup situation
		if (filename === '') {
			return;
		}
		
		if (extractionStatus !== null && datasetStatus !== "completed") {
			setLoadingText(extractionStatus);
			const clientInfo = await getClientInfo();
			const file_name = filename.replace(/\.[^/.]+$/, ""); // get filename without extension;
			
			// Make sure datasets exist before proceeding
			if (!datasets || datasets.length === 0) {
				console.log("No datasets available");
				return;
			}
			
			const dataset_id = datasets[0].id;
			let highlights_filename;
			// check extraction status and highlights file generation in loop
			const highlights_file_loop = async () => {
				if (pdfExtractor === config.pymupdf_extractor){
					highlights_filename = file_name + "-pymupdf" + '_highlights' + '.json'
				}
				else{
					highlights_filename = file_name + '_highlights' + '.json'
				}
				
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
						setPDFMetadata(pdfExtractorContent);
					}
					if (rctExtractorContent){
						setRCTMetadata(rctExtractorContent);
					}
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

					setPreview(false);  // View Results button activated
					setSpinner(false); // stop display of spinner
				} else {
					console.log("check highlights file after 5s");
					const timeoutId = setTimeout(highlights_file_loop, 5000);
					timeoutsRef.current.push(timeoutId);
				}
			};

			if (dataset_id !== null) {
				// Set a timeout to stop the loop after 20 minutes (1200000 ms)
				const startTime = Date.now();
				const timeoutDuration = 20 * 60 * 1000; // 20 minutes in milliseconds
				
				// Create a modified loop function that checks timeout
				const timeoutCheckedLoop = async () => {
					// Check if 20 minutes have passed
					if (Date.now() - startTime > timeoutDuration) {
						// If timeout reached and dataset status is still not completed
						if (datasetStatus !== "completed") {
							dispatch(setExtractionStatus("Failed: 20 minute timeout reached"));
							setSpinner(false);
							return; // Stop the loop
						}
					}
					
					await highlights_file_loop();
				};
				
				await timeoutCheckedLoop(); // Start the loop with timeout checking
			} else {
				console.error("Dataset does not exist");
			}
		}
		else if (extractionStatus === false){
			dispatch(setExtractionStatus("Error in extraction"));
			setSpinner(false); // stop display of spinner
		}
	}, [extractionStatus, datasetStatus]);

	// Watch for dataset status changes
	useEffect(() => {
		if (datasetStatus === "completed") {
			setPreview(false);
		}
	}, [datasetStatus]);


	const downloadOrPreview = () => {
		setLoading(false); // stop display of overlay
		setSpinner(false);
		if (userCategory === "author"){
			const reportFileID = RCTmetadata["extracted_files"][1]["file_id"]
			const reportFilename = RCTmetadata["extracted_files"][1]["filename"]
			downloadAndSaveFile(reportFileID, reportFilename).then(r => {
				console.log(r);
				// Clear all states
				setLoading(false);
				setSpinner(false);
				setLoadingText("Processing");
				setFilename('');
				setPreview(true);
				setRCTMetadata({});
				setPDFMetadata({});
				// Clear Redux states
				dispatch(resetFileToDefault());
				dispatch(resetDatasetToDefault());
				dispatch(resetPdfPreviewToDefault());
				dispatch(resetStatementToDefault());
				dispatch(resetUserCategoryToDefault());
			});
		}
		else{
			let path = '/preview';
			navigate(path);
		}
	}
	
	// Add timeout cleanup to prevent memory leaks when component unmounts
	useEffect(() => {
		return () => {
			// Only clear timeouts when unmounting, don't reset any states
			timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
			timeoutsRef.current = [];
		};
	}, []);

	// We pass onDrop function and accept prop to the component. It will be used as initial params for useDropzone hook
	return (
		<Box className="createupload" sx={{ padding: { xs: 2, sm: 3 }, width: '100%' }}>
			<LoadingOverlay active={loading} text={loading_text} spinner={spinner}>
				<div className="mousehoverdrop" onMouseEnter={() => setMouseHover(true)}>
					<Dropfile
						onDrop={onDrop}
						accept={{
							"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
							"application/msword": [".doc"],
							"application/pdf": [".pdf"]
						}}
						message={"Drag and drop your RCT manuscript here (pdf/doc/docx)"}
						style={{ fontFamily: theme.typography.fontFamily, color: theme.palette.info.main }}
					/>
				</div>
			</LoadingOverlay>

		<div className="radio-buttons-group-div" style={{ display: 'grid', gap: '1.5rem' }}>
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'minmax(150px, auto) 1fr',
				alignItems: 'start',
				gap: '1rem'
			}}>
				<Typography variant="h6" style={{ 
					fontFamily: theme.typography.fontFamily, 
					color: theme.palette.primary.main,
					paddingTop: '8px'
				}}>
					Select Guideline
				</Typography>
				<RadioGroup
					value={statementType}
					name="radio-buttons-group"
					onChange={handleStatementChange}
				>
					<div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '1rem', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<FormControlLabel 
								value="spirit" 
								control={<Radio />} 
								label="" 
								style={{ fontFamily: theme.typography.fontFamily, margin: 0, alignItems: 'center' }} 
								disabled={loading}
							/>
							<img className="spirit-logo" src="../../public/assets/spirit-logo.png" alt="spirit-logo-sm" style={{ height: '40px', width: 'auto', display: 'block' }}/>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
							<FormControlLabel 
								value="consort" 
								control={<Radio />} 
								label="" 
								style={{ fontFamily: theme.typography.fontFamily, margin: 0, alignItems: 'center' }} 
								disabled={loading}
							/>
							<img className="consort-logo" src="../../public/assets/consort-logo.png" alt="consort-logo-sm" style={{ height: '40px', width: 'auto', display: 'block' }}/>
						</div>
					</div>
				</RadioGroup>
			</div>
			{isAuthenticated && (
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'minmax(150px, auto) 1fr',
					alignItems: 'start',
					gap: '1rem'
				}}>
					<Typography variant="h6" style={{ 
						fontFamily: theme.typography.fontFamily, 
						color: theme.palette.primary.main,
						paddingTop: '8px'
					}}>
						Select Output
					</Typography>
					<RadioGroup
						defaultValue={userCategory}
						name="radio-buttons-group"
						onChange={handleUserCategoryChange}
					>
						<div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '1rem', alignItems: 'center' }}>
							<FormControlLabel 
								value="author" 
								control={<Radio />} 
								label="Download report" 
								style={{ fontFamily: theme.typography.fontFamily, margin: 0 }} 
								disabled={loading}
							/>
							<FormControlLabel 
								value="researcher" 
								control={<Radio />} 
								label="View highlighted manuscript" 
								style={{ fontFamily: theme.typography.fontFamily, margin: 0 }} 
								disabled={loading}
							/>
						</div>
					</RadioGroup>
				</div>
			)}
		</div>
			<div className="preview-button align-right" style={{ textAlign: { xs: 'center', sm: 'right' }, marginTop: '1rem' }}>
				<Button
					variant="contained"
					style={{
						color: theme.palette.info.contrastText,
						...(preview ? 
							{ backgroundColor: 'gray' } : 
							{ backgroundImage: 'linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)' }
						),
						fontFamily: theme.typography.fontFamily
					}}
					disabled={preview}
					onClick={downloadOrPreview}
				>
					View Results
				</Button>
			</div>

		</Box>

	);

}
