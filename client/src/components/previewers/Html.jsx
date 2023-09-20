import React from "react";
import Link from "@material-ui/core/Link";

export default function Html(props) {
	const {fileId, htmlSrc, ...other} = props;
	return <iframe id={fileId} src={htmlSrc} width="1000" height="1000"/>
}
