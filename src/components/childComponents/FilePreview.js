// Display file previews

import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, Grid} from "@material-ui/core";

import Pdf from "../previewers/Pdf";
import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {getPreviewResources} from "../../utils/file";
import PreviewDrawerLeft from "./PreviewDrawerLeft";
import Intro from "./Intro";
import CreateAndUpload from "./CreateAndUpload";
import {getClientInfo} from "../../utils/common";
import config from "../../app.config";


export default function FilePreview() {

	const pdfExtractor = config.pdf_extractor;
	const rctExtractor = config.rct_extractor;

	const filePreviews = useSelector((state) => state.file.previews);
	const [previews, setPreviews] = useState([]); // state for file previews
	const datasetMetadata = useSelector((state) => state.dataset.metadata);
	const [RCTmetadata, setRCTMetadata] = useState({}); // state for RCT metadata
	const [PDFmetadata, setPDFMetadata] = useState({}); // state for RCT metadata

	// useEffect on filePreviews to download preview resources
	useEffect( async ()=> {
		if (filePreviews !== undefined && filePreviews.length > 0) {
			const previewsTemp = [];
			// get either pdf preview / html preview
			if (filePreviews.length === 1){
				// only html preview
				filePreviews[0].map(async (preview) => {
					const clientInfo = await getClientInfo()
					const preview_config = await getPreviewResources(preview, clientInfo);
					previewsTemp.push(preview_config);
					setPreviews(previewsTemp); // set previews
				});
			}
			else {
				// TODO only one file preview will be set. Can remove the else portion
				// both pdf and html preview. Get pdf preview
				filePreviews[1].map(async (preview) => {
					const clientInfo = await getClientInfo()
					const preview_config = await getPreviewResources(preview, clientInfo);
					previewsTemp.push(preview_config);
					setPreviews(previewsTemp); // set previews
				});
			}

		}
	}, [filePreviews]);

	// useEffect on datasetMetadata to load preview leftdrawer metadata
	useEffect( async ()=> {
		if (datasetMetadata !== undefined) {
			const contentList = datasetMetadata.map(item => item.content);
			const pdfExtractorContent = contentList.find(item => item.extractor === pdfExtractor);
			const rctExtractorContent = contentList.find(item => item.extractor === rctExtractor);
			if (pdfExtractorContent){
				setPDFMetadata(pdfExtractorContent);
			}
			if (rctExtractorContent){
				setRCTMetadata(rctExtractorContent);
			}
		}
	}, [datasetMetadata])


	return (
		<>
			<div className="outer-container">
				<div className="inner-container">
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
									} else if (preview["previewType"] === "thumbnail") {
										return (
											<div key={preview["fileid"]}>
												<Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}
														   imgSrc={preview["resource"]}/>
											</div>
										);
									} else if (preview["previewType"] === "pdf") {
										return (
											<div key={preview["fileid"]}>
												<Grid container spacing={2} direction="row">
													<Grid item xs={5} >
														<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={RCTmetadata}/>
													</Grid>
													<Grid item xs={7} >
														<Pdf fileId={preview["fileid"]} pdfSrc={preview["resource"]} metadata={RCTmetadata}/>
													</Grid>
												</Grid>
											</div>
										);
									} else if (preview["previewType"] === "html") {
										return (
											<div key={preview["fileid"]}>
												<Grid container spacing={2} direction="row">
													<Grid item xs={3} >
														<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={RCTmetadata}/>
													</Grid>
													<Grid item xs={9} >
														<Html fileId={preview["fileid"]} htmlSrc={preview["resource"]}/>
													</Grid>
												</Grid>
											</div>
										);
									}

								})
							}
						</div>
					</Box>
				</div>
			</div>
		</>

	)
}
