// Preview LeftDrawer Component
import React, {useEffect, useState} from 'react';
import {Box, Button, Typography} from "@material-ui/core";
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import {Badge, List} from "@mui/material";
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

const drawerWidth = 400;

export default function PreviewDrawerLeft(props) {
	const {fileId, fileSrc, metadata, ...other} = props;
	const [extractor, setExtractor] = useState('');
	const [content, setContent] = useState({});
	const [itemsMissed, setItemsMissed] = useState('');
	const [checklist, setChecklist] = useState([]);
	const [openSections, setOpenSections] = useState([]);

	useEffect(() => {
		if (metadata !== undefined && metadata.content !== undefined){
			let content = metadata["content"][0];
			setContent(content);
			setExtractor(content["extractor"]);
			setItemsMissed(content["items_missed"]);
			setChecklist(content["checklist"]);
		}
	},[]);

	const handleClick = (name) => {
		setOpenSections(prevOpenSections => {
			if (prevOpenSections.includes(name)) {
				return prevOpenSections.filter(section => section !== name);
			} else {
				return [...prevOpenSections, name];
			}
		});
	};

	const isOpen = (name) => {
		return openSections.includes(name);
	}

	const isMissed = (missed) => {
		return missed > 0;
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
				<Toolbar sx={{ justifyContent: "space-between" }}>
					<Box variant="contained" color="primary">
						<Typography variant="h6">Items Missed</Typography>
						<Typography align="center">{itemsMissed}</Typography>
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
								const missed = parseInt(check_item.missed);

								return (
									<>
										<ListItemButton key={index} onClick={() => {handleClick(check_item.section)}}>
											<ListItemText primary={check_item.section} />
											{isMissed(missed) ? <Badge badgeContent={missed} style={{color:"red", marginRight:"5"}} /> : <CheckIcon style={{color:"green"}} />}
											{isOpen(check_item.section) ? <ExpandLess /> : <ExpandMore />}
										</ListItemButton>
										<Collapse in={isOpen(check_item.section)} timeout="auto" unmountOnExit>
											<List disablePadding>
												{
													check_item.items.length > 0 ?
														check_item.items.map((item, index) => {
															const found = item.found === "Yes" ? true : false;
															return (
																<ListItemButton key={index} sx={{ pl: 4 }}>
																	<ListItemText primary={item.item} secondary={item.topic}/>
																	{found ? <CheckIcon style={{color:"green"}} /> : <CancelIcon style={{color:"red"}} />}
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
