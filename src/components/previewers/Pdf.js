// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import samplePDF from '../../../main.pdf';
import json from "../../../main-metadata.json";

export default function Pdf(props) {
	const {fileId, pdfSrc, metadata, ...other} = props;

	const [content, setContent] = useState({});
	const [allSentences, setAllSentences] = useState([]);

	const canvas = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageWidth, setPageWidth] = useState(500);
	const [pageHeight, setPageHeight]= useState(799);


	useEffect(() => {
		if (metadata == undefined){
			let content = json['content'][0];
			let checklist = content['checklist'];
			setContent(content);
			let sentences_list = []
			checklist.forEach((section) => {
				section.items.forEach((item) => {
					let sentences = item.sentences || [];
					sentences_list.push(...sentences);
				});
			});
			setAllSentences(sentences_list);
		}
		// if (metadata !== undefined){
		// 	let content = metadata;
		// 	setContent(content);
		// 	let checklist = content['checklist'];
		// 	let sentences_list = []
		// 	checklist.forEach((section) => {
		// 		section.items.forEach((item) => {
		// 			let sentences = item.sentences || [];
		// 			sentences_list.push(...sentences);
		// 		});
		// 	});
		// 	setAllSentences(sentences_list);
		// }

	}, []);


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

	function getPageHighlights(){
		// Filter coordinates with the first element being page number
		let pageCoords = allSentences.map(entry => {
			let coordsStr = entry.coords.split(';');
			let filteredCoords = coordsStr.filter(coord => coord.startsWith(pageNumber.toString()));
			if (filteredCoords.length > 0 && filteredCoords != undefined){
				return filteredCoords;
			}
		});
		pageCoords = pageCoords.filter(element => element !== undefined); // remove all undefined elements
		console.log("pageCoords:", pageCoords);
		let highlightCoordinates = [];

		pageCoords.forEach(coordinateList => {
			coordinateList.forEach(coordinateSet => {
				let [p, x, y, w, h] = coordinateSet.split(',').map(Number);
				highlightCoordinates.push([x, y, w, h]);
			});

		});
		return highlightCoordinates;
	}


	function renderHighlights() {
		if (!canvas.current) {
			console.error("canvas current empty");
			return;
		}
		const highlightCoordinates = getPageHighlights();
		let context = canvas.current.getContext('2d');
		let canvas_width = canvas.current.width;
		let canvas_height = canvas.current.height;
		let page_width = 595.276;  // TODO to remove later
		let page_height = 799.37;  // TODO to remove later
		let scale_x = canvas_height / page_height;
		let scale_y = canvas_width / page_width;

		// context highlights styling
		context.globalAlpha = 0.2
		//context.globalCompositeOperation = 'soft-light';  // change composition operation for drawing new shapes
		context.fillStyle = 'rgb(255, 190, 60)';

		// Draw rectangles based on coordinates
		for (let i = 0; i < highlightCoordinates.length; i++) {
			let [x, y, width, height] = highlightCoordinates[i];
			context.fillRect(x * scale_x, y * scale_y, width * scale_x, height * scale_y);
		}
	}


	return (
		<>
			<div>
				<Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess} width={595.276}>
					<Page className={"PDFPage"}
						key={`page_${pageNumber + 1}`}
						pageNumber={pageNumber}
						canvasRef={canvas}
						onRenderSuccess={renderHighlights}
						renderTextLayer={true}
						renderAnnotationLayer={false}
						width={595.276}
					/>
				</Document>
			</div>

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
