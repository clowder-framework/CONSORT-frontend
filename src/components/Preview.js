import React, {useEffect, useState, Component} from "react";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
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
