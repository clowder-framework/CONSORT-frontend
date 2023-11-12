// Preview Pdf file
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
//import { pdfjs } from 'react-pdf';
//import { Document, Page } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
// 	'pdfjs-dist/build/pdf.worker.min.js',
// 	import.meta.url,
// ).toString();

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;
	// var loadingTask = pdfjsLib.getDocument(pdfSrc);
	// loadingTask.promise.then(function(pdf) {
	// 	pdf.getPage(1).then(function(page) {
	// 		// you can now use *page* here
	// 		var scale = 1.5;
	// 		var viewport = page.getViewport({ scale: scale, });
	// 		var outputScale = window.devicePixelRatio || 1;
	//
	// 		var canvas = document.getElementById('the-canvas');
	// 		var context = canvas.getContext('2d');
	//
	// 		canvas.width = Math.floor(viewport.width * outputScale);
	// 		canvas.height = Math.floor(viewport.height * outputScale);
	// 		canvas.style.width = Math.floor(viewport.width) + "px";
	// 		canvas.style.height =  Math.floor(viewport.height) + "px";
	//
	// 		var transform = outputScale !== 1
	// 			? [outputScale, 0, 0, outputScale, 0, 0]
	// 			: null;
	//
	// 		var renderContext = {
	// 			canvasContext: context,
	// 			transform: transform,
	// 			viewport: viewport
	// 		};
	// 		page.render(renderContext);
	// 	});
	// });

	const canvasRef = useRef();
	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

	const [pdfRef, setPdfRef] = useState();
	const [currentPage, setCurrentPage] = useState(1);

	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);

	const renderPage = useCallback((pageNum, pdf=pdfRef) => {
		pdf && pdf.getPage(pageNum).then(function(page) {
			const viewport = page.getViewport({scale: 1.5});
			const canvas = canvasRef.current;
			canvas.height = viewport.height;
			canvas.width = viewport.width;
			const renderContext = {
				canvasContext: canvas.getContext('2d'),
				viewport: viewport
			};
			page.render(renderContext);
		});
	}, [pdfRef]);

	useEffect(() => {
		renderPage(currentPage, pdfRef);
	}, [pdfRef, currentPage, renderPage]);

	useEffect(() => {
		const loadingTask = pdfjsLib.getDocument(pdfSrc);
		loadingTask.promise.then(loadedPdf => {
			setPdfRef(loadedPdf);
		}, function (reason) {
			console.error(reason);
		});
	}, [pdfSrc]);

	const nextPage = () => pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);

	const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

	return <canvas ref={canvasRef}></canvas>;

		//<iframe id={fileId} src={pdfSrc} style={{"width":"100%", "height":"1000px"}} />

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
}
