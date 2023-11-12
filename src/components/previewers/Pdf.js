// Preview Pdf file
import React, { useEffect, useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs";


export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;

	const canvasRef = useRef();
	pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

	const [pdfRef, setPdfRef] = useState();
	const [currentPage, setCurrentPage] = useState(1);

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

	return (
		<>
			<div id="canvas-preview">
				<canvas ref={canvasRef}></canvas>
			</div>
			<div id="pagination">
				<button
						type="button"
						onClick={prevPage}
					>
						Previous
					</button>
					<button
						type="button"
						onClick={nextPage}
					>
						Next
					</button>

			</div>
		</>
	);

}
