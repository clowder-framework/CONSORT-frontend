// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import samplePDF from '../../../main.pdf';
import json from "../../../main-metadata.json";

export default function Pdf(props) {
	const {fileId, pdfSrc, ...other} = props;

	const [content, setContent] = useState({});
	const [allSentences, setAllSentences] = useState([]);

	const canvas = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageHighlightCoordinates, setPageHighlightCoordinates] = useState([]);


	useEffect(() => {
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
		let highlightCoordinates = [];
		// TODO remove below line. Get the first 3 elements of pageCoords for testing
		let coordinateLists = pageCoords.slice(0,3);

		coordinateLists.forEach(coordinateList => {
			// Initialize variables for minimum and maximum values
			let minX = Infinity;
			let maxY = -Infinity;
			let maxW = -Infinity;
			let maxH = -Infinity;
			coordinateList.forEach(coordinateSet => {
				let [p, x, y, w, h] = coordinateSet.split(',').map(Number);
				// Update minimum and maximum values
				minX = Math.min(minX, x);
				maxY = Math.max(maxY, y);
				maxW = Math.max(maxW, w);
				maxH = Math.max(maxH, h);

			});
			highlightCoordinates.push([minX, maxY, maxW, maxH]);
		});
		setPageHighlightCoordinates(highlightCoordinates);
		return highlightCoordinates;
	}


	function renderHighlights() {
		if (!canvas.current) {
			console.error("canvas current empty");
			return;
		}
		const highlightCoordinates = getPageHighlights();
		let context = canvas.current.getContext('2d');
		let { width, height } = canvas.current;

		// context highlights styling
		context.globalCompositeOperation = 'hard-light';  // change composition operation for drawing new shapes
		context.strokeStyle = 'rgb(255, 99, 71)';
		context.lineWidth = 2;

		// Draw rectangles based on coordinates
		for (let i = 0; i < highlightCoordinates.length; i++) {
			let [x, y, width, height] = highlightCoordinates[i];
			context.strokeRect(x, y, width, height);
		}
	}


	return (
		<>
			<Document file={samplePDF} onLoadSuccess={onDocumentLoadSuccess}>
				<Page
					key={`page_${pageNumber + 1}`}
					pageNumber={pageNumber}
					canvasRef={canvas}
					onRenderSuccess={renderHighlights}
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
