import React from "react";

type Props = {
	fileId: string,
	htmlSrc: string,
}
export default function Html(props: Props) {
	const {fileId, htmlSrc} = props;
	return <iframe id={fileId} src={htmlSrc} width="1000" height="1000"/>
}
