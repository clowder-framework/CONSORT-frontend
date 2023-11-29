// Preview Pdf file
import React, { useState } from "react";

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;

	return (
		<iframe id={fileId} src={pdfSrc} style={{"width":"100%", "height":"1000px"}} />
	);
}
