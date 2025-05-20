import React, { useState, useEffect } from "react";
import {Box, Button, Grid, ListItem, Typography} from "@material-ui/core";
import FilePreview from "./childComponents/FilePreview";

function Preview() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
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
	
	return (
		<>
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
