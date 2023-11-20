// Preview Pdf file
import React, { useEffect, useRef, useState } from "react";
// import {
// 	DocumentContext,
// 	DocumentWrapper,
// 	Overlay,
// 	PageWrapper,
// 	RENDER_TYPE,
// 	ScrollContext,
// } from '@allenai/pdf-components';


import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";
import samplePDF from "../../../ard.pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;

	// Using AllenAI
	// const { pageDimensions, numPages } = React.useContext(DocumentContext);
	// const { setScrollRoot } = React.useContext(ScrollContext);
	//
	// // ref for the div in which the Document component renders
	// const pdfContentRef = React.createRef();
	//
	// // ref for the scrollable region where the pages are rendered
	// const pdfScrollableRef = React.createRef();
	//
	// const samplePdfUrl = 'https://arxiv.org/pdf/2112.07873.pdf';
	//
	// return (
	// 	<div>
	// 		<div className="reader__container">
	// 			<DocumentWrapper
	// 				className="reader__main"
	// 				file={samplePdfUrl}
	// 				inputRef={pdfContentRef}
	// 				renderType={RENDER_TYPE.SINGLE_CANVAS}>
	// 				<div className="reader__page-list" ref={pdfScrollableRef}>
	// 					{Array.from({ length: numPages }).map((_, i) => (
	// 						<PageWrapper key={i} pageIndex={i} renderType={RENDER_TYPE.SINGLE_CANVAS}>
	// 						</PageWrapper>
	// 					))}
	// 				</div>
	// 			</DocumentWrapper>
	// 		</div>
	// 	</div>
	// );

	// Using react-pdf
	const canvas = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);
	const [scale, setScale] = useState(1);

	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
	}

	function onRenderSuccess() {
		setIsRendered(true);
	}

	function degreesToRadians(degrees) {
		return degrees * (Math.PI / 180);
	}

	useEffect(() => {
		if (!isRendered || !canvas.current) {
			return;
		}

		let context = canvas.current.getContext('2d');
		let { width, height } = canvas.current;

		context.save();
		// testing canvas draw
		const angle = 45;
		context.translate(width / 2, height / 2);
		context.rotate(degreesToRadians(angle));
		context.globalCompositeOperation = 'multiply';
		context.textAlign = 'center';
		context.font = '30px sans-serif';
		context.fillStyle = 'rgba(0, 0, 0, .25)';
		context.fillText('Acme Inc', 0, 0);
		//left: calc(var(--scale-factor)*41.00px); top: calc(var(--scale-factor)*505.72px); font-size: calc(var(--scale-factor)*9.00px); font-family: sans-serif; transform: scaleX(1.01551);

		context.restore();
	}, [isRendered]);

	return (
		<Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess}>
			{Array.from(
				new Array(numPages),
				(el, index) => (
					<Page
						key={`page_${index + 1}`}
						pageNumber={index + 1}
						canvasRef={canvas}
						onRenderSuccess={onRenderSuccess}
						renderTextLayer={true}
						renderAnnotationLayer={false}
					/>
				),
			)}
		</Document>
	);

}
