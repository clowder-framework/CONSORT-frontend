export default function Html(props) {
	const {fileId, htmlSrc} = props;
	return <iframe id={fileId} src={htmlSrc} width="1000" height="1000"/>;
}
