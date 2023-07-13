// Preview LeftDrawer Component
import React, {useState} from 'react';
import {Box, Button, Typography} from "@material-ui/core";
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import {List} from "@mui/material";
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

import {downloadFile} from "../../utils/file";


const drawerWidth = 440;

export default function PreviewDrawerLeft(props) {
	const {fileId, fileSrc, metadata, ...other} = props;
	let extractor = "";
	let items_missed = "";
	let checklist = [];

	if (metadata !== undefined && metadata.content !== undefined){
		console.log(metadata);
		let content = metadata["content"][0];
		extractor = content["extractor"];
		items_missed = content["items_missed"];
		checklist = content["checklist"];
	}

	const [openSection, setOpenSection] = useState([]);

	const handleClick = (section) => {
		if (openSection.includes(section)) {
			setOpenSection(openSection.filter(sid => sid !== section));
		} else {
			let newOpenSection = [...openSection];
			newOpenSection.push(section);
			setOpenSection(newOpenSection);
		}
	}

	const isOpen = (section) => {
		if(section in openSection){
			return true;
		} else{
			return false;
		}
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
				<Toolbar sx={{ width: drawerWidth, justifyContent: "space-between" }}>
					<Box variant="contained" color="primary">
						<Typography variant="h6">Items Missed</Typography>
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
					{
						checklist.length > 0 ?
							checklist.map((check_item, index) => {
								return (
									<>
										<ListItemButton component="section" key={index} onClick={handleClick(check_item.section)}>
											<ListItemText primary={check_item.section} />
											{isOpen(check_item.section) ? <ExpandLess /> : <ExpandMore />}
										</ListItemButton>
										<Collapse in={isOpen(check_item.section)} timeout="auto" unmountOnExit>
											<List component="items" disablePadding>
												{
													check_item.items.length > 0 ?
														check_item.items.map((item, index) => {
															const found = item.found === "Yes" ? true : false;
															return (
																<ListItemButton sx={{ pl: 4 }} key={item.item}>
																	<ListItemText primary={item.item} />
																	{found ? <CheckIcon color="green" /> : <CancelIcon color="red" />}
																</ListItemButton>
															);
														})
														: <></>
												}
											</List>
										</Collapse>
									</>
								);
							})
							: <></>
					}

				</List>

			</Drawer>

		</Box>
	);
}
