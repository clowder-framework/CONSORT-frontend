import React from "react";
import {Box, Button, Grid, ListItem, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";

function Preview() {
	return (
		<>
			<div className="outer-container">
				<Box className="filePreview">
					<FilePreview />
				</Box>
			</div>
		</>
	)
}

export default Preview;
