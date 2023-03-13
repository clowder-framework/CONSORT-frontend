import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import {downloadFile} from "../../utils/file";

const drawerWidth = 240;

export default function PreviewDrawerLeft(props) {
	const {fileId, fileSrc, ...other} = props;

	const onDownload = () => {
		downloadFile(fileId)
	}

	return (
		<Box sx={{ display: 'flex' }}>
			<Drawer
				sx={{
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
					<Button onClick={onDownload} variant="contained" color="primary" startIcon={<DownloadIcon />}>
						Export
					</Button>
				</Toolbar>
				<Divider />

			</Drawer>

		</Box>
	);
}
