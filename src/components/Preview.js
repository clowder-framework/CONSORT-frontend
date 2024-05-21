import React from "react";
import {Box, Button, Grid, ListItem, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";

function Preview() {
	return (
		<>
			<div className="outer-container">
				<div className="inner-container">
					<Box className="filePreview">
						<FilePreview />
					</Box>
				</div>
			</div>
		</>
	)
}

export default Preview;
