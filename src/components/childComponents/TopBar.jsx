import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {AppBar, Link, Toolbar, Typography,} from '@material-ui/core';
import {onTapLogout} from "../../utils/common";

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
	// logo:{
	// 	marginRight:"50px"
	// },
	toolBarItem: {
		margin: "auto 12px auto 12px",
	},
	toolBarlink: {
		textDecoration: "none",
		fontSize: "16px",
		color: "#495057",
	},
	title: {
		flexGrow: 1,
	},
}));

export default function TopBar() {
	const classes = useStyles();
	//const userInfo = await getUserInfo();
	return (
		<div className={classes.root}>
			<AppBar position="static" className={classes.appBar}>
				<Toolbar className={classes.toolBar}>
					<img className={classes.logo} src="../../public/assets/logo.png" alt="logo" width="150"
						 height="50"/>
					<Typography className={classes.toolBarItem} sx={{horizontalAlign: 'left'}}>
						<Link href="/" target="_blank" className={classes.toolBarlink}>
							Home</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<Link href="/" target="_blank" className={classes.toolBarlink} sx={{marginRight: "100px"}}>
							Help</Link>
					</Typography>
					<img className={classes.logo} align="right" src="../../public/assets/clowder-logo-sm.svg"
						 alt="clowder-logo-sm"/>
				</Toolbar>
			</AppBar>
		</div>
	);
}
