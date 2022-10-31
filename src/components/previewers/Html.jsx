import React from "react";
import Link from "@material-ui/core/Link";

export default function Html(props) {
	const {fileId, htmlSrc, ...other} = props;
	return <Link id={fileId} href={htmlSrc} target="_blank">Click here to preview</Link>
}
