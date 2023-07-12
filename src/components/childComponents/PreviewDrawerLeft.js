import * as React from 'react';
import {Box, Button, Typography} from "@material-ui/core";
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import {downloadFile} from "../../utils/file";

const drawerWidth = 240;

export default function PreviewDrawerLeft(props) {
	const {fileId, fileSrc, metadata, ...other} = props;
	console.log(metadata);
	let extractor = '';
	let items_missed = '';
	let checklist = '';
	if (metadata !== undefined){
		let content = metadata["content"][0];
		extractor = content["extractor"];
		items_missed = content["items_missed"];
		checklist = content["checklist"];
	}


	const onDownload = () => {
		downloadFile(fileId, "results.html").then(r => console.log(r));
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<Drawer
				sx={{
					paddingTop: "30px",
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
				}}
				variant="permanent"
				anchor="left"
			>
				<Toolbar>
					<Box variant="contained" color="secondary">
						<Typography variant="h3">Items Missed</Typography>
						<Typography align="center">{items_missed}</Typography>
					</Box>
					<Button onClick={onDownload} variant="contained" color="primary" startIcon={<DownloadIcon />}>
						Export
					</Button>
				</Toolbar>
				<Divider />

				<List
					sx={{ width: drawerWidth, }}
					component="nav"
					aria-labelledby="item-checklist"
					subheader={
						<ListSubheader component="div" id="item-checklist-subheader">
							CONSORT Checklist Items
						</ListSubheader>
					}
					variant="permanent"
					anchor="left"
				>


				</List>



			</Drawer>

		</Box>
	);
}
