// Display file previews

import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, Grid} from "@material-ui/core";

import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {getPreviewResources} from "../../utils/file";
import PreviewDrawerLeft from "./PreviewDrawerLeft";


export default function FilePreview() {

	//const filePreviews = useSelector((state) => state.file.previews);   // CHANGE remove comment
	const filePreviews = [{"previewType":"html", "pv_route":"/clowder/files/63e6a5dfe4b034120ec4f035/blob","p_main":"html-iframe.js","pv_id":"63e6a5dfe4b034120ec4f035","p_path":"/clowder/assets/javascripts/previewers/html","p_id":"HTML","pv_length":"21348","pv_contenttype":"text/html"}];
	const [previews, setPreviews] = useState([]); // state for file previews
	const datasetMetadata = useSelector((state) => state.dataset.metadata);
	const [metadata, setMetadata] = useState({}); // state for dataset metadata

	// useEffect on filePreviews to download preview resources  // CHANGE uncomment this
	// useEffect( async ()=> {
	// 	if (filePreviews !== undefined && filePreviews.length > 0) {
	// 		const previewsTemp = [];
	// 		filePreviews[0].map(async (preview) => {
	// 			// get all preview resources
	// 			const preview_config = await getPreviewResources(preview);
	// 			previewsTemp.push(preview_config);
	// 			setPreviews(previewsTemp); // set previews
	// 		});
	// 	}
	// }, [filePreviews]);

	useEffect( () => {
		setPreviews(filePreviews);
	}, []);  // CHANGE remove this useEffect

	// useEffect on datasetMetadata to load preview leftdrawer metadata
	useEffect( async ()=> {
		if (datasetMetadata !== undefined) {
			// CHANGE remove tempMetadata
			let tempMetadata = {"@context": ["http://clowder.ncsa.illinois.edu/contexts/metadata.jsonld"], "created_at": "Fri 14 July 19:19:55 UTC 2023", "agent": {"@type": "user", "user_id": "http://clowder.ncsa.illinois.edu/api/users"}, "extractor": "ncsa.rctTransparencyExtractor", "content": [{"items_missed": "6", "checklist": [{"section": "Title and abstract", "items": [{"item": "1a", "found": "No"}, {"item": "1b", "found": "No"}]}, {"section": "Introduction - Background and objectives", "items": [{"item": "2a", "found": "Yes"}, {"item": "2a", "found": "Yes"}, {"item": "2b", "found": "Yes"}]}, {"section": "Methods - Trial design", "items": [{"item": "3a", "found": "Yes"}, {"item": "3b", "found": "No"}]}, {"section": "Methods - Participants", "items": [{"item": "4a", "found": "Yes"}, {"item": "4a", "found": "Yes"}, {"item": "4a", "found": "Yes"}, {"item": "4b", "found": "Yes"}, {"item": "4b", "found": "Yes"}]}, {"section": "Methods - Interventions", "items": [{"item": "5", "found": "Yes"}]}, {"section": "Methods - Outcomes", "items": [{"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6a", "found": "Yes"}, {"item": "6b", "found": "Yes"}, {"item": "6b", "found": "Yes"}]}, {"section": "Methods - Sample size", "items": [{"item": "7a", "found": "Yes"}, {"item": "7a", "found": "Yes"}, {"item": "7b", "found": "Yes"}, {"item": "7b", "found": "Yes"}]}, {"section": "Randomization - Sequence generation", "items": [{"item": "8a", "found": "Yes"}, {"item": "8b", "found": "Yes"}, {"item": "8b", "found": "Yes"}]}, {"section": "Randomization - Allocation concealment mechanism", "items": [{"item": "9", "found": "Yes"}]}, {"section": "Randomization - Implementation", "items": [{"item": "10", "found": "Yes"}]}, {"section": "Randomization - Blinding", "items": [{"item": "11a", "found": "Yes"}, {"item": "11b", "found": "No"}]}, {"section": "Randomization - Statistical methods", "items": [{"item": "12a", "found": "Yes"}, {"item": "12a", "found": "Yes"}, {"item": "12a", "found": "Yes"}, {"item": "12a", "found": "Yes"}, {"item": "12b", "found": "Yes"}, {"item": "12b", "found": "Yes"}, {"item": "12b", "found": "Yes"}]}, {"section": "Results - Participant flow (a diagram is strongly recommended)", "items": [{"item": "13a", "found": "Yes"}, {"item": "13b", "found": "Yes"}, {"item": "13b", "found": "Yes"}]}, {"section": "Results - Recruitment", "items": [{"item": "14a", "found": "Yes"}, {"item": "14a", "found": "Yes"}, {"item": "14b", "found": "Yes"}, {"item": "14b", "found": "Yes"}, {"item": "14b", "found": "Yes"}, {"item": "14b", "found": "Yes"}]}, {"section": "Results - Baseline data", "items": [{"item": "15", "found": "Yes"}, {"item": "15", "found": "Yes"}]}, {"section": "Results - Numbers analyzed", "items": [{"item": "16", "found": "No"}]}, {"section": "Results - Outcomes and estimation", "items": [{"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17a", "found": "Yes"}, {"item": "17b", "found": "Yes"}, {"item": "17b", "found": "Yes"}]}, {"section": "Results - Ancillary analyses", "items": [{"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}, {"item": "18", "found": "Yes"}]}, {"section": "Results - Harms", "items": [{"item": "19", "found": "Yes"}, {"item": "19", "found": "Yes"}]}, {"section": "Discussion - Limitations", "items": [{"item": "20", "found": "Yes"}, {"item": "20", "found": "Yes"}, {"item": "20", "found": "Yes"}, {"item": "20", "found": "Yes"}]}, {"section": "Discussion - Generalizability", "items": [{"item": "21", "found": "Yes"}, {"item": "21", "found": "Yes"}]}, {"section": "Discussion - Interpretation", "items": [{"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}, {"item": "22", "found": "Yes"}]}, {"section": "Other information - Registration", "items": [{"item": "23", "found": "Yes"}, {"item": "23", "found": "Yes"}]}, {"section": "Other information - Protocol", "items": [{"item": "24", "found": "Yes"}]}, {"section": "Other information - Funding", "items": [{"item": "25", "found": "No"}]}]}]};
			setMetadata(tempMetadata); // set dataset metadata  CHANGE tempMetadata to datasetMetadata
		}
	}, []); // CHANGE [] to [datasetMetadata]


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
									} else if (preview["previewType"] === "html") {
										return (
											<div key={preview["fileid"]}>
												<Grid container spacing={2} direction="row">
													<Grid item xs={3} >
														<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]} metadata={metadata}/>
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
