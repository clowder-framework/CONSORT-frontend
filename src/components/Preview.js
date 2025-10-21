import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {Box, Button, Grid, ListItem, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";
import TopBar from "./childComponents/TopBar";
import { fetchFilePreviews } from "../actions/file";
import { getClientInfo } from "../utils/common";
import { getDatasetMetadata } from "../utils/dataset";
import { setDatasetMetadata, SET_DATASET_METADATA } from "../actions/dataset";

function Preview() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const { dataset_id, file_id } = useParams();
	const dispatch = useDispatch();
	const filePreviews = useSelector((state) => state.file.previews);
	const datasetMetadata = useSelector((state) => state.dataset.metadata);
	
	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				const response = await fetch('/isAuthenticated', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();
				setIsAuthenticated(data.isAuthenticated);
			} catch (error) {
				console.error('Error checking authentication status:', error);
			}
		};
		checkAuthStatus();
	}, []);
	
	// Fetch data if URL parameters are provided and Redux state is empty
	useEffect(() => {
		const fetchData = async () => {
			if (dataset_id && file_id && isAuthenticated) {
				const clientInfo = await getClientInfo();
				
				// Fetch file previews if not already in state
				if (!filePreviews || filePreviews.length === 0) {
					dispatch(fetchFilePreviews(file_id, clientInfo));
				}
				
				// Fetch dataset metadata if not already in state
				if (!datasetMetadata || datasetMetadata.length === 0) {
					const metadata = await getDatasetMetadata(dataset_id, clientInfo);
					dispatch(setDatasetMetadata(SET_DATASET_METADATA, metadata));
				}
			}
		};
		
		fetchData();
	}, [dataset_id, file_id, isAuthenticated]);
	
	return (
		<>
			<TopBar/>
			<div className="outer-container">
				<Box className="filePreview">
					{isAuthenticated ? (
						<FilePreview />
					) : (
						<Typography variant="h6" align="center" style={{ padding: "20px" }}>
							Please login to use this feature
						</Typography>
					)}
				</Box>
			</div>
		</>
	)
}

export default Preview;
