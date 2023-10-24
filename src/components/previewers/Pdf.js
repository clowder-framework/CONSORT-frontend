// Preview Pdf file
import React, { useState } from "react";
//import pdfjsLib;
import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.js',
	import.meta.url,
).toString();

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;
	// var loadingTask = pdfjsLib.getDocument(pdfSrc);
	// loadingTask.promise.then(function(pdf) {
	// 	// you can now use *pdf* here
	// });
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
	}

	return (
		<div>
			<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
				<Page pageNumber={pageNumber} />
			</Document>
			<p>
				Page {pageNumber} of {numPages}
			</p>
		</div>
	);
}
