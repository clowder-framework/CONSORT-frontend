import React from "react";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";

type BreadCrumbProps = {
	paths: any
}
export const BreadCrumb: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const { paths } = props;
	const history = useNavigate();

	return (
		<MuiBreadcrumbs aria-label="breadcrumb">
			{
				paths.map((path:any, index:number) => {
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
	);
};
