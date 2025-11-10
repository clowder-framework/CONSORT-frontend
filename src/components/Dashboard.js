import React, {useEffect, useState, Component} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import TopBar from "./childComponents/TopBar";
import Intro from "./childComponents/Intro";
import CreateAndUpload from "./childComponents/CreateAndUpload";
import Footer from "./childComponents/Footer";
import { useTheme } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { resetFileToDefault } from "../actions/file";
import { resetDatasetToDefault } from "../actions/dataset";
import { resetPdfPreviewToDefault } from "../actions/pdfpreview";
import { resetStatementToDefault, resetUserCategoryToDefault } from "../actions/dashboard";

function Dashboard() {
	const theme = useTheme();
	const dispatch = useDispatch();
	
	// Clear all Redux states when Dashboard component mounts
	useEffect(() => {
		// This ensures states are cleared when returning to home page
		dispatch(resetFileToDefault());
		dispatch(resetDatasetToDefault());
		dispatch(resetPdfPreviewToDefault());
		dispatch(resetStatementToDefault());
		dispatch(resetUserCategoryToDefault());
	}, [dispatch]);
	
	return (
		<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<TopBar/>
			<div className="outer-container" style={{ flex: 1 }}>
				<div className="inner-container">
					<Grid container spacing={2} direction="row" style={{ display: "flex", gap: "2rem", justifyContent:"flex-start" }}>
						<Grid item xs={12} sm={5}>
							<Box className="intro">
								<Intro />
							</Box>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Box className="createAndUpload">
								<CreateAndUpload />
							</Box>
						</Grid>
					</Grid>
				</div>
			</div>
			<Footer />
		</div>
	)
}

export default Dashboard;
