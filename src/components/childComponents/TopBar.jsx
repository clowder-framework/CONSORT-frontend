import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, Link, Toolbar, Typography, Button, Box} from '@material-ui/core';
import { theme } from '../../theme';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		background: "#FFFFFF",
		boxShadow: "none",
		position: "relative",
		zIndex: theme.zIndex.drawer + 1
	},
	toolBar: {
		padding: "0 45px"
	},
	drawer:{
		paddingTop: "45px"
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	toolBarItem: {
		margin: "auto 12px auto 12px",
	},
	toolBarlink: {
		textDecoration: "none",
		fontSize: theme.typography.fontSize,
		color: theme.palette.secondary.dark,
	},
	title: {
		flexGrow: 1,
	},
}));



export default function TopBar() {
	const classes = useStyles();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// useEffect(() => {
	// 	const checkAuthStatus = async () => {
	// 		try {
	// 			const response = await fetch('/status', {
	// 				method: 'GET',
	// 				credentials: 'include',
	// 			});
	// 			const data = await response.json();
	// 			setIsAuthenticated(data.isAuthenticated);
	// 		} catch (error) {
	// 			console.error('Error checking authentication status:', error);
	// 		}
	// 	};
	// 	checkAuthStatus();
	// }, []);

	// const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

	// const handleAuthButtonClick = async () => {
	// 	if (isAuthenticated) {
	// 		try {
	// 			await fetch('/logout', {
	// 				method: 'POST',
	// 				credentials: 'include',
	// 				headers: {
	// 					'CSRF-Token': csrfToken
	// 				}
	// 			});
	// 			setIsAuthenticated(false);
	// 		} catch (error) {
	// 			console.error('Error logging out:', error);
	// 		}
	// 	} else {
	// 		window.location.href = '/login/federated/cilogon';
	// 	}
	// };

	return (
		<div className={classes.root}>
			<AppBar position="static" className={classes.appBar}>
				<Toolbar className={classes.toolBar}>
					<img className={classes.logo} src="../../public/assets/logo.png" alt="logo" width="150"
						 height="50"/>
					<Box sx={{ flexGrow: 1 }} />
					<Typography className={classes.toolBarItem} sx={{horizontalAlign: 'right', fontFamily: theme.typography.fontFamily}}>
						<Link href="mailto:halil@illinois.edu" className={classes.toolBarlink}>
							Contact Us</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<Link href="/faq" target="_blank" className={classes.toolBarlink} sx={{marginRight: "100px", fontFamily: theme.typography.fontFamily}}>
							FAQ</Link>
					</Typography>
					<Button 
						variant="contained" 
						style={{ color: theme.palette.primary.main, fontFamily: theme.typography.fontFamily }} 
						onClick={() => { window.location.href = '/logout'; }}
					>
						Logout
					</Button>
				</Toolbar>
				
			</AppBar>
		</div>
	);
}
