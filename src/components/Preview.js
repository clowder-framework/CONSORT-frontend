import React from "react";
import {Box} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";
import TopBar from "./childComponents/TopBar";

function Preview() {
	return (
		<>
			<TopBar/>
			<div className="outer-container">
				<Box className="filePreview">
					<FilePreview />
				</Box>
			</div>
		</>
	)
}

export default Preview;
