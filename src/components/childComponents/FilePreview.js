// Display file previews

import {useEffect, useMemo, useState, useRef} from "react";
import {useSelector} from "react-redux";
import {Box} from "@material-ui/core";

import Pdf from "../previewers/Pdf";
import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import {getPreviewResources} from "../../utils/file";
import PreviewDrawerLeft from "./PreviewDrawerLeft";
import config from "../../app.config";
import {rctdbClient} from "../../utils/rctdb-client";

export default function FilePreview() {

	const rctExtractor = config.rct_extractor;

	const filePreviews = useSelector((state) => state.file.previews);
	const [previews, setPreviews] = useState([]); // state for file previews
	const datasets = useSelector((state) => state.dataset.datasets); // [{id: '68adf5f9e4b04fc9ce8e5811', status: 'csv-completed'}]
	const datasetId = datasets?.[0]?.id;

	const datasetMetadata = useSelector((state) => state.dataset.metadata);
	const [publicationData, setPublicationData] = useState({
		publication: {},
		annotations: [],
		statementSection: [],
		statementTopic: [],
	});
	const RCTmetadata = useMemo(() => {
		if (!Array.isArray(datasetMetadata)) {
			return {};
		}
		const contentList = datasetMetadata.map((item) => item.content);
		return contentList.find((item) => item.extractor === rctExtractor) || {};
	}, [datasetMetadata, rctExtractor]);
	
	// Track the last processed file ID to prevent duplicate processing
	const lastProcessedFileId = useRef(null);
	
	// We don't want to clear states here as they're needed for preview

	// get publication details by datasetId
	useEffect(() => {
		const loadPublicationDetails = async () => {
			if (!datasetId) {
				return;
			}

			const nextPublication = await rctdbClient.getPublicationByDatasetId(datasetId);
			console.log("Publication:", nextPublication);

			if (!nextPublication?.publicationuuid) {
				setPublicationData({
					publication: nextPublication || {},
					annotations: [],
					statementSection: [],
					statementTopic: [],
				});
				return;
			}

			const [nextAnnotations, nextStatementSection, nextStatementTopic] = await Promise.all([
				rctdbClient.getPublicationAnnotations(nextPublication.publicationuuid),
				rctdbClient.getPublicationStatementSection(nextPublication.publicationuuid),
				rctdbClient.getPublicationStatementTopic(nextPublication.publicationuuid),
			]);

			console.log("Annotations:", nextAnnotations);
			console.log("Statement Section:", nextStatementSection);
			console.log("Statement Topic:", nextStatementTopic);

			setPublicationData({
				publication: nextPublication,
				annotations: nextAnnotations,
				statementSection: nextStatementSection,
				statementTopic: nextStatementTopic,
			});
		};

		loadPublicationDetails();
	}, [datasetId]);

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
										<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={RCTmetadata}
											publication={publicationData.publication}
											statementSection={publicationData.statementSection}
											statementTopic={publicationData.statementTopic}
											annotations={publicationData.annotations}
										/>
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
