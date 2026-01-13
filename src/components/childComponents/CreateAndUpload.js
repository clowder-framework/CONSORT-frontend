// Create a dataset and upload a file. Submit for extraction and get file previews

import {useEffect, useState, useCallback, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import LoadingOverlay from "react-loading-overlay-ts";
import {Box, Button, Typography} from "@material-ui/core";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";

import { theme } from "../../theme";
import Dropfile from "./Dropfile";
import {createUploadExtract} from "../../actions/client";
import {getDatasetMetadata, getFileInDataset} from "../../utils/dataset";
import {downloadAndSaveFile} from "../../utils/file";
import {fetchFilePreviews, setExtractionStatus } from "../../actions/file";
import {SET_DATASET_METADATA, setDatasetMetadata} from "../../actions/dataset";
import {SET_STATEMENT_TYPE, setStatement, SET_USER_CATEGORY, setUserCategory, resetStatementToDefault, resetUserCategoryToDefault, checkAuthenticationStatus} from "../../actions/dashboard";
import config from "../../app.config";
import {resetFileToDefault} from "../../actions/file";
import {resetDatasetToDefault} from "../../actions/dataset";
import {resetPdfPreviewToDefault} from "../../actions/pdfpreview";


export default function CreateAndUpload() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [mouseHover, setMouseHover] = useState(false); // mouse hover state for dropzone
	const [loading, setLoading] = useState(false); // loading overlay state and button disabled state. set to active when dropfile is active
	const [loading_text, setLoadingText] = useState("Processing"); // loading overlay text.
	const [filename, setFilename] = useState(""); // uploaded filename
	const [spinner, setSpinner] = useState(true); // loading overlay spinner active
	const [preview, setPreview] = useState(true); // disabled button state for file preview button

	const datasets = useSelector((state) => state.dataset.datasets);
	const extractionStatus = useSelector(state => state.file.extractionStatus);
	const statementType = useSelector(state => state.statement.statementType);
	const userCategory = useSelector(state => state.userCategory.userCategory);
	const datasetStatus = useSelector(state => state.dataset.status);
	const isAuthenticated = useSelector(state => state.authentication.isAuthenticated);

	const [RCTmetadata, setRCTMetadata] = useState({}); // state for RCT metadata
	const [PDFmetadata, setPDFMetadata] = useState({}); // state for PDF metadata
	const pdfExtractor = config.pdf_extractor;
	const rctExtractor = config.rct_extractor;

	// Reference to track any active timeouts
	const timeoutsRef = useRef([]);
	// Reference to track if extraction has already completed for current file
	const extractionCompletedRef = useRef(false);

	// Check authentication status on mount using Redux
	useEffect(() => {
		dispatch(checkAuthenticationStatus());
	}, [dispatch]);

	// Update config when authentication status changes
	useEffect(() => {
		config.userCategory = isAuthenticated ? "researcher" : "author";
		dispatch(setUserCategory(SET_USER_CATEGORY, isAuthenticated ? "researcher" : "author"));
	}, [isAuthenticated]);


	const handleStatementChange = (event) => {
		dispatch(setStatement(SET_STATEMENT_TYPE, event.target.value));
		config.statementType = event.target.value;
	};


	const onDropFile = (file) => {
		// Reset previous extraction state and previews
		dispatch(setExtractionStatus(null));
		dispatch({type: "RESET_FILE_PREVIEWS"});
		dispatch({type: "RESET_DATASET_METADATA"});

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

		// Reset extraction completed flag for new upload
		extractionCompletedRef.current = false;

		// Clear any pending timeouts
		timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
		timeoutsRef.current = [];

		try {
			acceptedFiles.map(file => {
				onDropFile(file);
			});
			rejectedFiles.map(() => {
				dispatch(setExtractionStatus("File rejected"));
				setSpinner(false);
			});
		}
		catch(error) {
			dispatch(setExtractionStatus("Upload failed"));
			setSpinner(false);
		}
	}, [mouseHover]);


	// useEffect on extractionStatus for preview generation
	useEffect(() => {
		// Skip processing if we're in a state cleanup situation
		if (filename === "") {
			return;
		}

		// Skip if extraction already completed for this file
		if (extractionCompletedRef.current) {
			return;
		}

		if (extractionStatus !== null && datasetStatus !== "completed") {
			setLoadingText(extractionStatus);
			const file_name = filename.replace(/\.[^/.]+$/, ""); // get filename without extension;

			// Make sure datasets exist before proceeding
			if (!datasets || datasets.length === 0) {
				return;
			}

			const dataset_id = datasets[0].id;
			const highlights_filename = `${file_name}_highlights.json`;
			// check extraction status and highlights file generation in loop
			const highlights_file_loop = async () => {
				// Check again if already completed to prevent race conditions
				if (extractionCompletedRef.current) {
					return;
				}
				
				const highlightsFile = await getFileInDataset(dataset_id, "application/json", highlights_filename);
				if (highlightsFile !== null && typeof highlightsFile.id === "string") {
					// Mark extraction as completed to prevent duplicate processing
					extractionCompletedRef.current = true;
					
					// {"id":string, "size":string, "date-created":string, "contentType":text/html, "filename":string}
					const metadata = await getDatasetMetadata(dataset_id);
					// get the metadata content list
					const contentList = metadata.map(item => item.content);
					const pdfExtractorContent = contentList.find(item => item.extractor === pdfExtractor);
					const rctExtractorContent = contentList.find(item => item.extractor === rctExtractor);
					if (rctExtractorContent){
						setRCTMetadata(rctExtractorContent);
					}
					if (pdfExtractorContent){
						setPDFMetadata(pdfExtractorContent);
						// get pdf preview
						const pdf_extractor_extracted_files = pdfExtractorContent["extracted_files"];
						const pdf_input_file = pdf_extractor_extracted_files[0]["file_id"];
						console.log("pdfExtractorContent", pdfExtractorContent);
						console.log("pdf_extractor_extracted_files", pdf_extractor_extracted_files);
						dispatch(fetchFilePreviews(pdf_input_file));
					}
					else{
						dispatch(fetchFilePreviews(highlightsFile.id));
					}
					dispatch(setDatasetMetadata(SET_DATASET_METADATA, metadata));

					setPreview(false);  // View Results button activated
					 
					setSpinner(false); // stop display of spinner
				} else {
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

				timeoutCheckedLoop(); // Start the loop with timeout checking
			}
		}
		else if (extractionStatus === false){
			dispatch(setExtractionStatus("Error in extraction"));
			setSpinner(false); // stop display of spinner
		}
	}, [extractionStatus, datasetStatus, filename, datasets, dispatch, pdfExtractor, rctExtractor]);

	// Watch for dataset status changes
	useEffect(() => {
		if (datasetStatus === "completed") {
			setPreview(false);
			setSpinner(false);
		}
	}, [datasetStatus]);


	const downloadOrPreview = () => {
		setLoading(false); // stop display of overlay
		setSpinner(false);
		if (userCategory === "author"){
			const reportFileID = RCTmetadata["extracted_files"][1]["file_id"];
			const reportFilename = RCTmetadata["extracted_files"][1]["filename"];
			downloadAndSaveFile(reportFileID, reportFilename).then(() => {
				// Clear all states
				setLoading(false);
				setSpinner(false);
				setLoadingText("Processing");
				setFilename("");
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
			const path = "/preview";
			navigate(path);
		}
	};

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
		<Box className="createupload" sx={{ padding: { xs: 2, sm: 3 }, width: "100%" }}>
			<div className="radio-buttons-group-div" style={{ 
				display: "grid", 
				gridTemplateColumns: "auto auto auto",
				gap: "1rem 2rem",
				alignItems: "center",
				marginBottom: "2rem" 
			}}>
				<Typography variant="h6" style={{
					fontFamily: theme.typography.fontFamily,
					color: theme.palette.primary.main
				}}>
					Select Guideline
				</Typography>
				<FormControlLabel
					value="spirit"
					control={<Radio checked={statementType === "spirit"} onChange={handleStatementChange} />}
					label="SPIRIT"
					style={{ fontFamily: theme.typography.fontFamily, margin: 0 }}
					disabled={loading}
				/>
				<FormControlLabel
					value="consort"
					control={<Radio checked={statementType === "consort"} onChange={handleStatementChange} />}
					label="CONSORT"
					style={{ fontFamily: theme.typography.fontFamily, margin: 0 }}
					disabled={loading}
				/>
			</div>
			<LoadingOverlay active={loading} text={loading_text} spinner={spinner} styles={{
				overlay: (base) => ({
					...base,
					background: "rgba(163, 90, 244, 1)"
				})
			}}>
				<div className="mousehoverdrop" onMouseEnter={() => setMouseHover(true)} style={{ marginTop: "1rem" }}>
					<Dropfile
						onDrop={onDrop}
						accept={{
							"application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
							"application/msword": [".doc"],
							"application/pdf": [".pdf"]
						}}
						message={"Drag and drop your RCT manuscript here (pdf/doc/docx)"}
						style={{ fontFamily: theme.typography.fontFamily, color: theme.palette.primary.main }}
					/>
				</div>
			</LoadingOverlay>
			<div id="preview-button" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem", width: "100%" }}>
				<Button
					variant="contained"
					style={{
						color: theme.palette.info.contrastText,
						...(preview ?
							{ backgroundColor: "lightgray", color: "darkgray" } :
							{ backgroundImage: "linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)" }
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
