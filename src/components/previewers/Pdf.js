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
		setPageNumber(1);
	}
	function changePage(offset) {
		setPageNumber(prevPageNumber => prevPageNumber + offset);
	}

	function previousPage() {
		changePage(-1);
	}

	function nextPage() {
		changePage(1);
	}

	return (
		<iframe id={fileId} src={pdfSrc} style={{"width":"100%", "height":"1000px"}} />
		// <div>
		// 	<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
		// 		<Page pageNumber={pageNumber} />
		// 	</Document>
		// 	<p>
		// 		Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
		// 	</p>
		// 	<button
		// 		type="button"
		// 		disabled={pageNumber <= 1}
		// 		onClick={previousPage}
		// 	>
		// 		Previous
		// 	</button>
		// 	<button
		// 		type="button"
		// 		disabled={pageNumber >= numPages}
		// 		onClick={nextPage}
		// 	>
		// 		Next
		// 	</button>
		// </div>
	);
}
