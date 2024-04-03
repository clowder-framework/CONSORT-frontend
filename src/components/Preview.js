import React, {useEffect, useState, Component} from "react";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";
import Pdf from "./previewers/Pdf";

function Preview() {
	return (
		<>
			<div className="outer-container">
				<div className="inner-container">
					<Box className="filePreview">
						<Pdf />
					</Box>
				</div>
			</div>
		</>
	)
}

export default Preview;
