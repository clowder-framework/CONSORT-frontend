import React from 'react';
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import {Button} from "@mui/material";
import {makeStyles} from "@material-ui/core/styles";
import {useNavigate} from "react-router";

const useStyles = makeStyles((theme) => ({
	breadCrumb: {
		padding: "28px"
	},
	breadCrumbText: {
		fontStyle: "normal",
		fontWeight: "600",
		fontSize: "24px",
		color: "#343A40"
	},
	breadCrumbLink: {
		fontStyle: "normal",
		fontWeight: "600",
		fontSize: "24px",
		color: "#6C757D",
	}
}));

export default function Breadcrumbs(props) {
	const classes = useStyles();
	const history = useNavigate();

	const {paths} = props;
	return (
		<div>
			<MuiBreadcrumbs aria-label="breadcrumb">
				{
					paths.map((path, index) => {
						if (index !== paths.length -1){
							return (<Button key={index} onClick={() => history(path["url"])}>{path["name"]}
							</Button>);
						}
						else{
							return (<Button disabled color="primary" key={index}>{path["name"]}</Button>);
						}
					})
				}
			</MuiBreadcrumbs>
		</div>
	);
}
