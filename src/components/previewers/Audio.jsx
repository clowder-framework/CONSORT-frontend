export default function Audio(props) {
	const {fileId, audioSrc} = props;
	return <audio controls><source id={fileId} src={audioSrc} /></audio>;
}
