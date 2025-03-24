import React, {useEffect, useState, Component} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import TopBar from "./childComponents/TopBar";
import Intro from "./childComponents/Intro";
import CreateAndUpload from "./childComponents/CreateAndUpload";

function Dashboard() {
	return (
		<>
			<TopBar/>
			<div className="outer-container">
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
		</>
	)
}

export default Dashboard;
