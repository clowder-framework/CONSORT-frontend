// Display file previews

import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Box, Button} from "@material-ui/core";

import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {getPreviewResources} from "../../utils/file";
import TopBar from "./TopBar";
import PreviewDrawerLeft from "./PreviewDrawerLeft";


export default function FilePreview() {

	const filePreviews = useSelector((state) => state.file.previews);

	const [previews, setPreviews] = useState([]); // state for file previews
	// useEffect on filePreviews to download preview resources
	useEffect( async ()=> {
		if (filePreviews !== undefined && filePreviews.length > 0) {
			const previewsTemp = [];
			filePreviews[0].map(async (preview) => {
				// get all preview resources
				const preview_config = await getPreviewResources(preview);
				previewsTemp.push(preview_config);
				setPreviews(previewsTemp); // set previews
			});
		}
	}, [filePreviews])

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
												<PreviewDrawerLeft fileId={preview["fileid"]} fileSrc={preview["resource"]}/>
												<Html fileId={preview["fileid"]} htmlSrc={preview["resource"]}/>
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
