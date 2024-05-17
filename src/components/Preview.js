import React, {useEffect, useState, Component} from "react";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";
import Pdf from "./previewers/Pdf";
import PreviewDrawerLeft from "./childComponents/PreviewDrawerLeft";

function Preview() {
	return (
		<>
			<div className="outer-container">
				<div className="inner-container">
					<Box className="filePreview">
						<Grid container spacing={2} direction="row">
							<Grid item xs={5} >
								<PreviewDrawerLeft />
							</Grid>
							<Grid item xs={7} >
								<Pdf />
							</Grid>
						</Grid>
					</Box>
				</div>
			</div>
		</>
	)
}

export default Preview;
