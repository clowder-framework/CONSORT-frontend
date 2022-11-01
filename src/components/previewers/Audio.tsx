import React from "react";

type Props = {
	fileId: string,
	audioSrc: string
}

export default function Audio(props: Props) {
	const {fileId, audioSrc} = props;
	return <audio controls><source id={fileId} src={audioSrc} /></audio>
}
