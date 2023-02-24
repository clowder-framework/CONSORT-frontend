import React, {useEffect, useState, Component} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import TopBar from "./childComponents/TopBar";
import Intro from "./childComponents/Intro";
import GetDataset from "./childComponents/GetDataset";


function Dashboard() {
	return (
		<>
			<TopBar/>
			<div className="outer-container">
				<div className="inner-container">
					<Grid container spacing={2} direction="row" style={{ display: "flex", gap: "2rem", justifyContent:"flex-start" }}>
						<Grid item xs={5} >
							<Box className="intro">
								<Intro />
							</Box>
						</Grid>
						<Grid item xs={2} >
							<Box className="getDataset">
								<GetDataset />
							</Box>
						</Grid>
					</Grid>
				</div>
			</div>
		</>
	)
}

export default Dashboard;
