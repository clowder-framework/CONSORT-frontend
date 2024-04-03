// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


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
		if (metadata !== undefined){
			let content = metadata;
			setContent(content);
			setPageWidth(parseInt(content['page_dimensions']['width']));
			setPageHeight(parseInt(content['page_dimensions']['height']));
			let checklist = content['checklist'];
			let sentences_list = []
			checklist.forEach((section) => {
				section.items.forEach((i) => {
					let sentences = i.sentences || [];
					let label = i.item;
					sentences_list.push({"label":label, "sentences":sentences});
				});
			});
			setAllSentences(sentences_list);
		}
		if (metadata == undefined){
			console.log("Error metadata undefined");
		}

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
		let pageHighlights = allSentences.map(entry => {
			let label = entry.label;
			let sentences = entry.sentences;
			if (sentences.length > 0){
				let pageSentences = sentences.filter(sentence => sentence.coords.startsWith(pageNumber.toString()));
				if (pageSentences.length > 0 && pageSentences != undefined){
					return {"label": label, "sentences": pageSentences};
				}
			}
		});
		pageHighlights = pageHighlights.filter(element => element !== undefined); // remove all undefined elements
		console.log("pageHighlights:", pageHighlights);

		return pageHighlights;
	}


	function renderHighlights() {
		if (!canvas.current) {
			console.error("canvas current empty");
			return;
		}
		const pageHighlights = getPageHighlights();
		let context = canvas.current.getContext('2d');
		let canvas_width = canvas.current.width;
		let canvas_height = canvas.current.height;
		let scale_x = canvas_height / pageHeight;
		let scale_y = canvas_width / pageWidth;

		pageHighlights.forEach(item => {
			let label = item.label;
			let sentences = item.sentences;
			sentences.forEach(sentence => {
				let coordsList = sentence.coords.split(';');
				// label sentence first box
				let [text_p, text_x, text_y, text_width, text_height] = coordsList[0].split(',').map(Number);
				text_x = text_x * scale_x;
				text_y = text_y * scale_y;
				// put labels to either side of text
				if (text_x < 100){
					text_x = 10;
				}
				else{
					text_x = text_x + text_width + 2;
				}
				let text_label = label;
				context.globalAlpha = 1.0
				context.font = "10px Verdana";
				context.fillStyle = 'red';
				context.fillText(text_label, text_x, text_y);

				// Draw rectangles based on coordinates
				for (let i = 0; i < coordsList.length; i++) {
					let [p, x, y, width, height] = coordsList[i].split(',').map(Number);
					// rectangle highlights styling
					context.globalAlpha = 0.2
					context.fillStyle = 'rgb(255, 190, 60)';
					context.fillRect(x * scale_x, y * scale_y, width * scale_x, height * scale_y);

				}
			});

		});

	}


	return (
		<>
			<div>
				<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
					<Page className={"PDFPage"}
						key={`page_${pageNumber + 1}`}
						pageNumber={pageNumber}
						canvasRef={canvas}
						onRenderSuccess={renderHighlights}
						renderTextLayer={true}
						renderAnnotationLayer={false}
						width={pageWidth}
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
