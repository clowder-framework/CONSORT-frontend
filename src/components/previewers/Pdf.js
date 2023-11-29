// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;

	const canvas = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1);

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
		setPageNumber(1);
	}

	function onRenderSuccess() {
		setIsRendered(true);
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


	useEffect(() => {
		if (!isRendered || !canvas.current) {
			return;
		}
		let context = canvas.current.getContext('2d');
		let { width, height } = canvas.current;
		//console.log(context, width, height);

		// context highlights
		// context.globalCompositeOperation = 'source-over';  // change composition operation for drawing new shapes
		// context.textAlign = 'center';
		// context.font = 'bold 50px sans-serif';
		// context.fillStyle = 'rgb(255, 99, 71)';
		// context.fillText('FILL TEXT', 20, 50, 500);
		// context.rect(10, 10, 150, 100);
		// context.fill();

		//context.restore();
		context.save();
	}, [isRendered]);

	return (
		<>
			<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
				<Page
					key={`page_${pageNumber + 1}`}
					pageNumber={pageNumber}
					canvasRef={canvas}
					onRenderSuccess={onRenderSuccess}
					renderTextLayer={true}
					renderAnnotationLayer={false}
				/>
			</Document>
			<div>
				<p>
					Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
				</p>
				<button
					type="button"
					disabled={pageNumber <= 1}
					onClick={previousPage}
				>
					Previous
				</button>
				<button
					type="button"
					disabled={pageNumber >= numPages}
					onClick={nextPage}
				>
					Next
				</button>
			</div>
		</>
	);

}
