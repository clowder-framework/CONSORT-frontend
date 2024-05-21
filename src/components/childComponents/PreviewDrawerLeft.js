// Preview LeftDrawer Component
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, Typography} from "@material-ui/core";
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import {Badge, List, ListItemIcon} from "@mui/material";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import {downloadAndSaveFile} from "../../utils/file";
import {SET_PAGE_NUMBER, setPageNumber} from "../../actions/pdfpreview";

const drawerWidth = 400;


export default function PreviewDrawerLeft(props) {
	const dispatch = useDispatch();

	const {fileId, fileSrc, metadata, ...other} = props;
	const [extractor, setExtractor] = useState('');
	const [content, setContent] = useState({});
	const [itemsMissed, setItemsMissed] = useState('');
	const [checklist, setChecklist] = useState([]);
	const [openSections, setOpenSections] = useState([]);
	const [reportFileID, setReportFileID] = useState('');
	const [item_found_pages , setItemFoundPages] = useState({});
	const pageNumber = (number) => dispatch(setPageNumber(SET_PAGE_NUMBER, Number(number)));


	function getCoordsPages(sentences){
		let pageNumbers = new Set();
		sentences.forEach(item => {
			const coordsArray = item.coords.split(';');
			coordsArray.forEach(coord => {
				const coordValues = coord.split(',');
				pageNumbers.add(coordValues[0]);
			});
		});
		return pageNumbers;
	}

	function get_item_found_pages(checklist){
		if (checklist.length < 1){
			console.error("No checklist");
			return null
		}
		else {
			const result = {};
			checklist.forEach(section => {
				section.items.forEach(item => {
					if (item.found === "Yes") {
						const found_pages = getCoordsPages(item.sentences);
						result[item.item] = [...found_pages];
					}
					else{
						result[item.item] = [];
					}
				});
			});
			console.log("Items found pages", result);

			return result;

		}
	}

	const handleSectionClick = (name) => {
		setOpenSections(prevOpenSections => {
			if (prevOpenSections.includes(name)) {
				return prevOpenSections.filter(section => section !== name);
			} else {
				return [...prevOpenSections, name];
			}
		});
	};

	const handleItemClick = (pagenum) =>{
		pageNumber(pagenum);
		console.log("Go to ", pagenum);
	};

	const isOpen = (name) => {
		// console.log(section_found_pages);
		// const item_found_pages = section_found_pages[name];
		return openSections.includes(name);
	}

	const isMissed = (missed) => {
		return missed > 0;
	}

	const onDownload = () => {
		downloadAndSaveFile(reportFileID, "results.pdf").then(r => console.log(r));
	}


	useEffect(() => {
		if (metadata !== undefined){
			let content = metadata;
			setContent(content);
			setExtractor(content["extractor"]);
			setItemsMissed(content["items_missed"]);
			setChecklist(content["checklist"]);
			setReportFileID(content["extracted_files"][1]["file_id"])
			setItemFoundPages(get_item_found_pages(content["checklist"]))
		}
		if (metadata === undefined){
			console.log("Error metadata undefined");
		}
	},[]);



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
						(checklist.length > 0 && item_found_pages !== null) ?
							checklist.map((check_item, index) => {
								const missed = parseInt(check_item.missed);

								return (
									<>
										<ListItem key={index} divider>
											<ListItemButton onClick={() => {handleSectionClick(check_item.section)}}>
												<ListItemText primary={check_item.section} />
												{isMissed(missed) ? <Badge badgeContent={missed} max={35} color={"primary"} /> : <CheckIcon style={{color:"green"}} />}
												{isOpen(check_item.section) ? <ExpandLess sx={{ml:"20px"}} /> : <ExpandMore sx={{ml:"20px"}}/>}
											</ListItemButton>
										</ListItem>

										<Collapse in={isOpen(check_item.section)} timeout="auto" unmountOnExit>
											<List key={index} disablePadding>
												{
													check_item.items.length > 0 ?
														check_item.items.map((i, index) => {
															const found = i.found === "Yes";
															return (
																<>
																	<div className="label" style={{display: "flex", flexDirection: "row",  alignItems: "center"}}>
																		<ListItemText primary={i.item} secondary={i.topic} sx={{ pl: 4 }}/>
																		<ListItemIcon>
																			{found ? <CheckIcon style={{color:"green"}} /> : <CancelIcon style={{color:"red"}} />}
																		</ListItemIcon>
																	</div>

																	<div className="pages" style={{display: "flex", flexDirection: "row",  alignItems: "center"}}>
																		<ToggleButtonGroup
																			exclusive
																			aria-label="item pages"
																			size="small"
																			orientation="horizontal"
																			sx={{ pl: 4 }}
																		>
																			{
																				item_found_pages[i.item].map((pagenum, page_index) => (
																				<ToggleButton key={page_index} value={pagenum} aria-label="item page" onClick={() => {handleItemClick(pagenum)}}>
																					<Typography variant="string">Page: {pagenum}</Typography>
																				</ToggleButton>
																				))
																			}
																		</ToggleButtonGroup>
																	</div>
																</>
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
