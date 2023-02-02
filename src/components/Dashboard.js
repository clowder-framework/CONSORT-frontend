import React, {useEffect, useState, Component} from "react";
import {Link as RouterLink} from "react-router-dom";
import {AppBar, Box, Button, Dialog, DialogTitle, Grid, Link, ListItem, Tab, Tabs, Typography} from "@material-ui/core";
import TopBar from "./childComponents/TopBar";
import GetDataset from "./childComponents/GetDataset";
//import CreateDataset from "./childComponents/CreateDataset";

export default function Dashboard() {
	return (
		<>
			<TopBar/>
			<div className="outer-container">
				<div className="inner-container">
					<Grid container direction="row" item md={8} xs={12} style={{ display: "flex", gap: "1rem", justifyContent:"flex-start" }}>
						<Grid item>
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
