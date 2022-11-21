import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {
	AppBar,
	Box,
	Button,
	Dialog,
	DialogTitle,
	Grid,
	ListItem,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Typography
} from "@material-ui/core";
import DescriptionIcon from "@material-ui/icons/Description";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import UploadFile from "../files/UploadFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import {downloadDataset} from "../../utils/dataset";
import {downloadFile, fetchFileMetadata} from "../../utils/file";
import {useDispatch, useSelector} from "react-redux";
import {deleteFile as deleteFileAction} from "../../actions/file";
import {deleteDataset as deleteDatasetAction, fetchDatasetAbout, fetchFilesInDataset} from "../../actions/dataset";
import {useNavigate, useParams} from "react-router";
import {downloadThumbnail} from "../../utils/thumbnail";
import {Link as RouterLink} from "react-router-dom";
import TopBar from "../navigation/TopBar";
import {BreadCrumb} from "../navigation/BreadCrumb";

const useStyles = makeStyles((theme) => ({
	appBar: {
		background: "#FFFFFF",
		boxShadow: "none",
	},
	tab: {
		fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform: "capitalize",
		maxWidth: "50px",
	},
	fileCardOuterBox: {
		position: "relative"
	},
	fileCard: {
		background: "#FFFFFF",
		border: "1px solid #DFDFDF",
		boxSizing: "border-box",
		borderRadius: "4px",
		margin: "20px auto",
		"& > .MuiGrid-item": {
			padding: 0,
			height: "150px",
		}
	},
	fileCardImg: {
		height: "50%",
		margin: "40px auto",
		display: "block"
	},
	fileCardText: {
		padding: "40px 20px",
		fontSize: "16px",
		fontWeight: "normal",
		color: "#212529"
	},
	fileCardActionBox: {
		position: "absolute",
		right: "5%",
		top: "40px",
	},
	fileCardActionItem: {
		display: "block"
	},
	optionButton: {
		float: "right",
		padding: "6px 12px",
		width: "100px",
		background: "#6C757D",
		borderRadius: "4px",
		color: "white",
		textTransform: "capitalize"
	},
	optionMenuItem: {
		fontWeight: "normal",
		fontSize: "14px",
		color: "#212529",
		marginTop: "8px",
	}
}));

export default function Dataset() {
	const classes = useStyles();

	const history = useNavigate();

	// path parameter
	const {datasetId} = useParams();

	const dispatch = useDispatch();
	const listFilesInDataset = (datasetId:string|undefined) => dispatch(fetchFilesInDataset(datasetId));
	const listDatasetAbout = (datasetId:string|undefined) => dispatch(fetchDatasetAbout(datasetId));
	const deleteFile = (fileId:string|undefined) => dispatch(deleteFileAction(fileId));
	const deleteDataset = (datasetId:string|undefined|null) => dispatch(deleteDatasetAction(datasetId));

	const filesInDataset = useSelector((state) => state.dataset.files);
	const datasetAbout = useSelector((state) => state.dataset.about);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [open, setOpen] = React.useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [fileThumbnailList, setFileThumbnailList] = useState([]);

	useEffect(() => {
		listFilesInDataset(datasetId);
		listDatasetAbout(datasetId);
	}, []);

	// get metadata of each files; because we need the thumbnail of each file!!!
	useEffect(() => {

		(async () => {
			if (filesInDataset !== undefined && filesInDataset.length > 0) {

				let fileThumbnailListTemp = [];
				await Promise.all(filesInDataset.map(async (fileInDataset) => {

					let fileMetadata = await fetchFileMetadata(fileInDataset["id"]);
					// add thumbnails
					if (fileMetadata["thumbnail"] !== null && fileMetadata["thumbnail"] !== undefined) {
						let thumbnailURL = await downloadThumbnail(fileMetadata["thumbnail"]);
						fileThumbnailListTemp.push({"id": fileInDataset["id"], "thumbnail": thumbnailURL})
					}
				}));
				setFileThumbnailList(fileThumbnailListTemp);
			}
		})();
	}, [filesInDataset])

	const handleTabChange = (_event: any, newTabIndex:number) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handleOptionClick = (event: { currentTarget: React.SetStateAction<null>; }) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	const paths = [
		{
			"name": "Explore",
			"url": "/"
		},
		{
			"name": datasetAbout["name"],
			"url": `/datasets/${datasetId}`
		}
	]

	return (
		<>
			<TopBar/>
			<div className="outer-container">
				<BreadCrumb paths={paths}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item lg={8} xl={8} md={8} sm={8} xs={12}>
							<AppBar className={classes.appBar} position="static">
								{/*Tabs*/}
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dataset tabs">
									<Tab className={classes.tab} label="Files" {...a11yProps(0)} />
									{/*<Tab className={classes.tab} label="Metadata" {...a11yProps(1)} />*/}
									{/*<Tab className={classes.tab} label="Extractions" {...a11yProps(2)} />*/}
									{/*<Tab className={classes.tab} label="Visualizations" {...a11yProps(3)} />*/}
									{/*<Tab className={classes.tab} label="Comments" {...a11yProps(4)} />*/}
								</Tabs>
								{/*option menus*/}
								<Box>
									<Button aria-haspopup="true" onClick={handleOptionClick}
											className={classes.optionButton} endIcon={<ArrowDropDownIcon/>}>
										Options
									</Button>
									<Menu
										id="simple-menu"
										anchorEl={anchorEl}
										keepMounted
										open={Boolean(anchorEl)}
										onClose={handleOptionClose}
									>
										<MenuItem className={classes.optionMenuItem}
												  onClick={() => {
													  setOpen(true);
													  handleOptionClose();
												  }}>
											Add Files
										</MenuItem>
										<MenuItem className={classes.optionMenuItem}
												  onClick={() => {
													  downloadDataset(datasetId, datasetAbout["name"]).then();
													  handleOptionClose();
												  }}>
											Download All
										</MenuItem>
										<MenuItem onClick={() => {
											deleteDataset(datasetId);
											handleOptionClose();
											history("/")
										}
										} className={classes.optionMenuItem}>Delete</MenuItem>
										{/*<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem}>Follow</MenuItem>*/}
										{/*<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem}>Collaborators</MenuItem>*/}
										{/*<MenuItem onClick={handleOptionClose} className={classes.optionMenuItem}>Extraction</MenuItem>*/}
									</Menu>
								</Box>
							</AppBar>
							<TabPanel value={selectedTabIndex} index={0}>

								{
									filesInDataset !== undefined && fileThumbnailList !== undefined ?
										filesInDataset.map((file) => {
											let thumbnailComp = <DescriptionIcon className={classes.fileCardImg}
																				 style={{fontSize: "5em"}}/>;
											fileThumbnailList.map((thumbnail) => {
												if (file["id"] !== undefined && thumbnail["id"] !== undefined &&
													thumbnail["thumbnail"] !== null && thumbnail["thumbnail"] !== undefined &&
													file["id"] === thumbnail["id"]) {
													thumbnailComp = <img src={thumbnail["thumbnail"]} alt="thumbnail"
																		 className={classes.fileCardImg}/>;
												}
											});
											return (
												<Box className={classes.fileCardOuterBox}>
													<ListItem component={RouterLink}
															  to={`/files/${file["id"]}?datasetId=${datasetId}`}
															  className={classes.fileCard}
															  key={file["id"]}>
														<Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
															{thumbnailComp}
														</Grid>
														<Grid item xl={8} lg={8} md={8} sm={8} xs={12}>
															<Box className={classes.fileCardText}>
																<Typography>File name: {file["filename"]}</Typography>
																<Typography>File size: {file["size"]}</Typography>
																<Typography>Created on: {file["date-created"]}</Typography>
																<Typography>Content type: {file["contentType"]}</Typography>
															</Box>
														</Grid>
													</ListItem>
													<Box className={classes.fileCardActionBox}>
														<Box className={classes.fileCardActionItem}>
															<Button startIcon={<DeleteOutlineIcon/>}
																	onClick={() => {deleteFile(file["id"]);}}>Delete</Button>
														</Box>
														<Box className={classes.fileCardActionItem}>
															<Button startIcon={<StarBorderIcon/>}
																	disabled={true}>Follow</Button>
														</Box>
														<Box className={classes.fileCardActionItem}>
															<Button startIcon={<CloudDownloadOutlinedIcon/>}
																	onClick={() => {downloadFile(file["id"], file["filename"]);}}>
																Download</Button>
														</Box>
													</Box>
												</Box>
											);
										})
										:
										<></>
								}
							</TabPanel>
							{/*<TabPanel value={selectedTabIndex} index={1}></TabPanel>*/}
							{/*<TabPanel value={selectedTabIndex} index={2}></TabPanel>*/}
							{/*<TabPanel value={selectedTabIndex} index={3}></TabPanel>*/}
							{/*<TabPanel value={selectedTabIndex} index={4}></TabPanel>*/}
						</Grid>
						<Grid item lg={4} md={4} xl={4} sm={4} xs={12}>
							{
								datasetAbout !== undefined ?
									<Box className="infoCard">
										<Typography className="title">About</Typography>
										<Typography className="content">Name: {datasetAbout["name"]}</Typography>
										<Typography className="content">Dataset ID: {datasetAbout["id"]}</Typography>
										<Typography className="content">Owner: {datasetAbout["authorId"]}</Typography>
										<Typography className="content">Description: {datasetAbout["description"]}</Typography>
										<Typography className="content">Created on: {datasetAbout["created"]}</Typography>
										{/*/!*TODO use this to get thumbnail*!/*/}
										<Typography className="content">Thumbnail: {datasetAbout["thumbnail"]}</Typography>
										{/*<Typography className="content">Belongs to spaces: {datasetAbout["authorId"]}</Typography>*/}
										{/*/!*TODO not sure how to use this info*!/*/}
										{/*<Typography className="content">Resource type: {datasetAbout["resource_type"]}</Typography>*/}
									</Box> : <></>
							}
							{/*<Divider light/>*/}
							{/*<Box className="infoCard">*/}
							{/*	<Typography className="title">Statistics</Typography>*/}
							{/*	<Typography className="content">Views: 10</Typography>*/}
							{/*	<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>*/}
							{/*	<Typography className="content">Downloads: 0</Typography>*/}
							{/*	<Typography className="content">Last downloaded: Never</Typography>*/}
							{/*</Box>*/}
							{/*<Divider light/>*/}
							{/*<Box className="infoCard">*/}
							{/*	<Typography className="title">Tags</Typography>*/}
							{/*	<Grid container spacing={4}>*/}
							{/*		<Grid item lg={8} sm={8} xl={8} xs={12}>*/}
							{/*			<ClowderInput defaultValue="Tag"/>*/}
							{/*		</Grid>*/}
							{/*		<Grid item lg={4} sm={4} xl={4} xs={12}>*/}
							{/*			<ClowderButton>Search</ClowderButton>*/}
							{/*		</Grid>*/}
							{/*	</Grid>*/}
							{/*</Box>*/}
							{/*<Divider light/>*/}
						</Grid>
					</Grid>
					<Dialog open={open} onClose={() => {setOpen(false);}} fullWidth={true} aria-labelledby="form-dialog">
						<DialogTitle id="form-dialog-title">Add Files</DialogTitle>
						{/*pass select to uploader so once upload succeeded, can jump to that dataset/file page*/}
						<UploadFile selectedDatasetId={datasetId} setOpen={setOpen}/>
					</Dialog>
				</div>
			</div>
		</>
	);
}

function TabPanel(props:any) {
	const {children, value, index, ...other} = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`dataset-tabpanel-${index}`}
			aria-labelledby={`dataset-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index:number) {
	return {
		id: `dataset-tab-${index}`,
		"aria-controls": `dataset-tabpanel-${index}`,
	};
}
