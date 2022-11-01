import React from "react";

export default function Html(props) {
	const {fileId, htmlSrc, ...other} = props;
	return <iframe id={fileId} src={htmlSrc} width="1000" height="1000"/>
}
