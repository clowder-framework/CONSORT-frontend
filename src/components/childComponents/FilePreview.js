// Display file previews

import {useEffect, useState, useRef} from "react";
import {useSelector} from "react-redux";
import {Box} from "@material-ui/core";

import Pdf from "../previewers/Pdf";
import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import {getPreviewResources} from "../../utils/file";
import PreviewDrawerLeft from "./PreviewDrawerLeft";
import config from "../../app.config";

export default function FilePreview() {

	const pdfExtractor = config.pdf_extractor;
	const rctExtractor = config.rct_extractor;

	const filePreviews = useSelector((state) => state.file.previews);
	const [previews, setPreviews] = useState([]); // state for file previews
	const datasetMetadata = useSelector((state) => state.dataset.metadata);
	const [RCTmetadata, setRCTMetadata] = useState({}); // state for RCT metadata
	
	// Track the last processed file ID to prevent duplicate processing
	const lastProcessedFileId = useRef(null);
	
	// We don't want to clear states here as they're needed for preview

	// useEffect on filePreviews to download preview resources
	useEffect(() => {
		// Flag to track if the effect is still active (for cleanup)
		let isActive = true;
		
		const loadPreviews = async () => {
			if (filePreviews === undefined || filePreviews.length === 0) {
				return;
			}
			
			// Check if we have valid preview data
			if (!filePreviews[0] || !filePreviews[0][0]) {
				return;
			}
			
			const fileId = filePreviews[0][0].file_id;
			const previewsList = filePreviews[0][0].previews;
			
			// Skip if we've already processed this file ID
			if (lastProcessedFileId.current === fileId) {
				return;
			}
			
			// Mark this file ID as being processed
			lastProcessedFileId.current = fileId;
			
			// Reset the local previews state for new file
			setPreviews([]);
			
			// Process all previews and collect results
			const previewPromises = previewsList.map((preview) => 
				getPreviewResources(fileId, preview)
			);
			
			try {
				const previewConfigs = await Promise.all(previewPromises);
				
				// Only update state if the effect is still active
				if (isActive) {
					setPreviews(previewConfigs);
				}
			} catch (error) {
				console.error("Error loading preview resources:", error);
			}
		};
		
		loadPreviews();
		
		// Cleanup function to prevent state updates on unmounted component
		return () => {
			isActive = false;
		};
	}, [filePreviews]);

	// useEffect on datasetMetadata to load preview leftdrawer metadata
	useEffect(() => {
		if (datasetMetadata !== undefined && Array.isArray(datasetMetadata)) {
			const contentList = datasetMetadata.map(item => item.content);
			const pdfExtractorContent = contentList.find(item => item.extractor === pdfExtractor);
			const rctExtractorContent = contentList.find(item => item.extractor === rctExtractor);
			if (pdfExtractorContent){
				// setPDFMetadata(pdfExtractorContent);
			}
			if (rctExtractorContent){
				setRCTMetadata(rctExtractorContent);
			}
		}
		// console.log("datasetMetadata ", datasetMetadata);
	}, [datasetMetadata, pdfExtractor, rctExtractor]);


	return (
		<>
			<Box className="filepreview">
				<div className="previewBox">
					{
						previews.map((preview) => {
							if (preview["previewType"] === "audio") {
								return (
									<div key={preview["fileid"]}>
										<Audio fileId={preview["fileid"]} audioSrc={preview["resource"]}/>
									</div>
								);
							} else if (preview["previewType"] === "video") {
								return (
									<div key={preview["fileid"]}>
										<Video fileId={preview["fileid"]} videoSrc={preview["resource"]}/>
									</div>
								);
							// } else if (preview["previewType"] === "thumbnail") {
							// 	return (
							// 		<div key={preview["fileid"]}>
							// 			<Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}
							// 					   imgSrc={preview["resource"]}/>
							// 		</div>
							// 	);
							} else if (preview["previewType"] === "pdf" || preview["previewType"] === "thumbnail") {
								// console.log("previewType is ", preview["previewType"]);
								return (
									<Box key={preview["fileid"]} sx={{ display: "flex", height: "100vh", width: "100vw" }}>
										{/* Drawer takes its fixed width */}
										<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={RCTmetadata}/>
										{/* Main content area for PDF, allows it to grow and centers the PDF viewer */}
										<Box sx={{ flexGrow: 1, overflow: "auto", p: 1, display: "flex", justifyContent: "center" }}>
											<Pdf fileId={preview["fileid"]} pdfSrc={preview["resource"]} metadata={RCTmetadata}/>
										</Box>
									</Box>
								);
							} else if (preview["previewType"] === "html") {
								return (
									<Box key={preview["fileid"]} sx={{ display: "flex", height: "100vh", width: "100vw" }}>
										{/* Drawer takes its fixed width */}
										<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={RCTmetadata}/>
										{/* Main content area for HTML, allows it to grow */}
										<Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
											<Html fileId={preview["fileid"]} htmlSrc={preview["resource"]}/>
										</Box>
									</Box>
								);
							}

						})
					}
				</div>
			</Box>
		</>

	)
}
