import React, {useEffect, useState, Component} from "react";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";

function Preview() {
	return (
		<>
			<div className="outer-container">
				<div className="inner-container">
					<Grid container spacing={2} direction="row" style={{ display: "flex", gap: "2rem", justifyContent:"flex-start" }}>
						<Grid item xs={10} >
							<Box className="filePreview">
								<FilePreview />
							</Box>
						</Grid>
					</Grid>
				</div>
			</div>
		</>
	)
}

export default Preview;
