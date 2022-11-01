import React from "react";

type Props = {
	fileId: string,
	videoSrc: string
}

export default function Video(props: Props) {
	const {fileId, videoSrc} = props;
	return (<video width='100%' id='ourvideo' controls>
		<source id={fileId} src={videoSrc}></source>
	</video>);
}
