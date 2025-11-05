import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, Link, Toolbar, Typography, Button, Box} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
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
		display: 'flex',
		alignItems: 'center',
		visibility: 'visible',
		opacity: 1
	},
	toolBarlink: {
		textDecoration: "none",
		fontSize: theme.typography.fontSize,
		color: theme.palette.secondary.dark,
		fontFamily: theme.typography.fontFamily,
		// do not change color of the link
		"&:hover": {
			color: theme.palette.secondary.dark,
		},
		"&:active": {
			color: theme.palette.secondary.dark,
		},
		"&:visited": {
			color: theme.palette.secondary.dark,
		},
	},
	title: {
		flexGrow: 1,
	},
}));



export default function TopBar() {
	const classes = useStyles();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [username, setUsername] = useState("anonymous");

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
		
		const getUsername = async () => {
			try {
				console.log('Fetching username...');
				const response = await fetch('/getUser', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();
				setUsername(data.username);
				console.log('Username set to:', data.username);
			} catch (error) {
				console.error('Error fetching username:', error);
				setUsername('anonymous');
			}
		}
		getUsername();
	}, []);

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
					<RouterLink to="/home" className={classes.logo}>
						<img src="../../public/assets/logo.png" alt="logo" width="150" height="50"/>
					</RouterLink>
					{username !== 'anonymous' && (
						<div style={{ 
							marginLeft: '16px',
							display: 'flex', 
							alignItems: 'center',
							backgroundImage: `linear-gradient(to right, ${theme.palette.gradient.start}, ${theme.palette.gradient.middle1}, ${theme.palette.gradient.middle2}, ${theme.palette.gradient.end})`,
							padding: '6px 16px',
							borderRadius: '4px',
							color: 'transparent',
							fontFamily: theme.typography.fontFamily,
							WebkitBackgroundClip: 'text',
							fontSize: '16px',
							fontWeight: 'bold',
						}}>
							<span>
								Welcome, {username}!
							</span>
						</div>
					)}
					<Box sx={{ flexGrow: 1 }} />
					<Typography className={classes.toolBarItem} sx={{horizontalAlign: 'right', color: theme.palette.secondary.dark}}>
						<Link href="mailto:halil@illinois.edu" className={classes.toolBarlink} style={{color: theme.palette.secondary.dark, fontFamily: theme.typography.fontFamily}}>
							Contact Us</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<RouterLink to="/faq" className={classes.toolBarlink} style={{color: theme.palette.secondary.dark, fontFamily: theme.typography.fontFamily}}>
							FAQ</RouterLink>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<RouterLink to="/home" className={classes.toolBarlink} style={{marginRight: "50px", color: theme.palette.secondary.dark, fontFamily: theme.typography.fontFamily}}>
							Home</RouterLink>
					</Typography>
					
					<Button 
						variant="contained" 
						style={{ 
							color: '#FFFFFF',
							backgroundImage: 'linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)',
							fontFamily: theme.typography.fontFamily 
						}} 
						onClick={async () => {
							if (!isAuthenticated) {
								window.location.href = '/login';
							} else {
								window.location.href = '/logout';
							}
						}}
					>
						{isAuthenticated ? 'Logout' : 'Login'}
					</Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}
