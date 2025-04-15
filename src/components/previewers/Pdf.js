// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";
import {SET_PAGE_NUMBER, setPageNumber} from "../../actions/pdfpreview";
import { 
    consort_highlight_color, 
    consort_label_color, 
    spirit_highlight_color, 
    spirit_label_color 
} from '../styledComponents/HighlightColors';

import pdfFile from "./Cicero.pdf";
import metadataFile from "./Cicero_highlights_0230.json";

console.log("metadataFile:", metadataFile);


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Pdf(props) {
	const dispatch = useDispatch();

	const {fileId, pdfSrc, metadata, ...other} = props;

	const [content, setContent] = useState({});
	const [allSentences, setAllSentences] = useState([]);

	// const canvas = useRef();
	const highlightCanvasRef = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);
	let pageNumber = useSelector((state) => state.pdfpreview.pageNumber);
	const dispatchPageNumber = (number) => dispatch(setPageNumber(SET_PAGE_NUMBER, number));

	const statementType = useSelector(state => state.statement.statementType);

	const marginWidth = 75; // adjust margin width
	const [pageWidth, setPageWidth] = useState(500);
	const [pageHeight, setPageHeight]= useState(799);
	let [scale_x, setScaleX] = useState(1); // recalculated dynamically in renderHighlights
	let [scale_y, setScaleY] = useState(1); // recalculated dynamically in renderHighlights
	let pdf_render_scale = 1;
	let canvas_render_scale = 1; // keep same as pdf_render_scale for coordinate highlighting


	useEffect(() => {
		if (metadata !== undefined){
			const content = metadata;
			setContent(content);
			setPageWidth(parseInt(content['page_dimensions']['width']));
			setPageHeight(parseInt(content['page_dimensions']['height']));
			const checklist = content['checklist'];
			const sentences_list = []
			checklist.forEach((section) => {
				section.items.forEach((i) => {
					const sentences = i.sentences || [];
					const label = i.label;
					sentences_list.push({"label":label, "sentences":sentences});
				});
			});
			setAllSentences(sentences_list);
		}
		if (metadata === undefined){
			// console.error("Error metadata undefined");
			// const sentences_list = []
			// setAllSentences(sentences_list);
			let content = metadataFile['content'];
			console.log("content:", content);
			setContent(content);
			setPageWidth(parseInt(content['page_dimensions']['width']));
			setPageHeight(parseInt(content['page_dimensions']['height']));
			const checklist = content['checklist'];
			const sentences_list = []
			checklist.forEach((section) => {
				section.items.forEach((i) => {
					const sentences = i.sentences || [];
					const label = i.label;
					sentences_list.push({"label":label, "sentences":sentences});
				});
			});
			setAllSentences(sentences_list);
		}

	}, [metadata]);

	useEffect(() => {
		dispatchPageNumber(pageNumber);
		// Trigger re-render of highlights when page number changes
		// Delay slightly to allow PDF page to render first if needed
		//setTimeout(renderHighlights, 100);
	}, [pageNumber]);

	// // Effect to render highlights when relevant data changes
	// useEffect(() => {
	// 	// Ensure page dimensions are set before trying to render
	// 	if (pageWidth && pageHeight && allSentences.length > 0) {
	// 		// Delay slightly to ensure canvas ref is available and page might be rendered
	// 		setTimeout(renderHighlights, 100);
	// 	}
	// 	// Dependencies that should trigger a highlight re-render
	// }, [pageWidth, pageHeight, allSentences, statementType, pdf_render_scale, canvas_render_scale, pageNumber]);


	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);

	}

	function onPageLoadSuccess(){
		// pass
	}

	function onPageChange(event) {
		dispatchPageNumber(parseInt(event.target.value));
	}

	function changePage(offset) {
		dispatchPageNumber(+pageNumber + +offset);
	}

	function previousPage() {
		changePage(-1);
	}

	function nextPage() {
		changePage(1);
	}

	// Get highlights for the current page
	function getPageHighlights(){
		// Group by coordinates first, collecting all labels for each unique coordinate set.
		const sentenceCoordsToLabels = {}; // { coords: { labels: [], text: "" } }

		// Filter coordinates with the first element being page number
		let pageHighlights = allSentences.map(entry => {
			let label = entry.label;
			let sentences = entry.sentences;
			if (sentences.length > 0){
				const pageSentences = sentences.filter(sentence => {
					// Split coordinates into groups (separated by semicolon)
					const coordGroups = sentence.coords.split(';');
					// Check if coordGroups is valid and has a first element
					if (coordGroups.length === 0 || !coordGroups[0]) return false;
					// Get the page number from the first group (first element before comma)
					const pageNumStr = coordGroups[0].split(',')[0];
					return pageNumStr === pageNumber.toString();
				});
				

				pageSentences.forEach(sentence => {
					const coords = sentence.coords;
					const sentenceText = sentence.text;
					// commenting out adding sentence text 
					// if (!sentenceCoordsToLabels[coords]) {
					// 	// Initialize with labels array and sentence text
					// 	sentenceCoordsToLabels[coords] = { labels: [label], sentenceText: sentenceText };
					// }
					// else{
					// 	// Add label if not already present for this coordinate set
					// 	if (!sentenceCoordsToLabels[coords].labels.includes(label)) {
					// 		sentenceCoordsToLabels[coords].labels.push(label);
					// 	}
					// }
					if (!sentenceCoordsToLabels[coords]) {
						sentenceCoordsToLabels[coords] = []
					}
					if (!sentenceCoordsToLabels[coords].includes(label)) {
						sentenceCoordsToLabels[coords].push(label);
					}
				});
			}
		});

		// // Convert map to array [{ coords: string, labels: string[] }]
		// const groupedHighlights = Object.entries(sentenceCoordsToLabels).map(([coords, { labels, sentenceText }]) => ({
		// 	coords,
		// 	labels,
		// 	sentenceText
		// }));
		const groupedHighlights = Object.entries(sentenceCoordsToLabels).map(([coords, labels]) => ({
			coords,
			labels
		}));

		return groupedHighlights;
	}
	

	// Draw text highlights on the canvas
	function highlightText(context, label, x, y, width, height){
		// rectangle highlights styling
		context.globalAlpha = 0.2
		context.fillStyle = statementType === "consort" ? consort_highlight_color[label] : spirit_highlight_color[label];
		context.fillRect(x , y , width , height );
	}


	// Draw text labels on the canvas
	// Accept label_text (to display) and styling_label (for color), calculate dynamic width
	function highlightLabel(context, label_text, styling_label, x, y){
		context.globalAlpha = 1.0
		// Background color based on styling_label
		context.fillStyle = statementType === "consort" ? consort_highlight_color[styling_label] : spirit_highlight_color[styling_label];

		// Estimate width needed based on text
		context.font = "bold 12px Verdana"; // Set font before measuring
		const textMetrics = context.measureText(label_text);
		const textWidth = textMetrics.width;
		const padding = 4; // Add some padding
		const rectWidth = textWidth + padding * 2;
		const rectHeight = 12 + padding; // Fixed height + padding based on font size

		context.fillRect(x, y, rectWidth, rectHeight); // Use dynamic width and calculated height

		// Text color based on styling_label
		context.fillStyle = statementType === "consort" ? consort_label_color[styling_label] : spirit_label_color[styling_label];
		context.textAlign = "start";
		context.textBaseline = "top"; // Y position adjustment based on padding
		context.fillText(label_text, x + padding, y + padding / 2); // Draw text inside padded rect
	}


	function renderHighlights() {
		// Use the dedicated highlight canvas
		const canvas = highlightCanvasRef.current;
		if (!canvas) {
			console.error("canvas current empty");
			return;
		}
		// Ensure we have page dimensions
		if (!pageWidth || !pageHeight) {
			console.error("Page dimensions not set.");
			return;
		}

		const context = canvas.getContext('2d');
		// Set the overlay canvas dimensions to be wider for margins
		const canvas_width = scaledPdfWidth + 2 * marginWidth;
		const canvas_height = scaledPdfHeight;
		// Fix: Set canvas attributes directly
		canvas.width = canvas_width;
		canvas.height = canvas_height
		// Clear the canvas
		context.clearRect(0, 0, canvas_width, canvas_height);

		// Calculate scaled dimensions for PDF rendering area
		const scaledPdfWidth = pageWidth * pdf_render_scale;
		const scaledPdfHeight = pageHeight * pdf_render_scale;

		// Scale the canvas to 2x while keeping PDF at 1.5x
		let scale_x = (canvas_height / pageHeight) * (canvas_render_scale/pdf_render_scale);
		let scale_y = (canvas_width / pageWidth) * (canvas_render_scale/pdf_render_scale);
		const scale_factor = pdf_render_scale; // Use the same scale as the PDF render
		// let scale_x = (scaledPdfWidth / pageWidth); // Match PDF render scale
		// let scale_y = (scaledPdfHeight / pageHeight);
		const offset_x = marginWidth;

		const pageHighlights = getPageHighlights();
		console.log("pageHighlights:", pageHighlights);
		// Iterate through groupedHighlights
		pageHighlights.forEach(item => {
			const { coords, labels } = item; // Destructure coords, labels, and sentence
			if (labels.length === 0) return; // Skip if no labels somehow

			const combinedLabelText = labels.join(', '); // Join labels into a string
			const stylingLabel = labels[0]; // Use the first label for styling colors

			let coordsList = coords.split(';');
			// label sentence first box
			let [text_p, text_x, text_y, text_width, text_height] = coordsList[0].split(',').map(Number);
			text_x = (text_x * scale_factor) + offset_x;
			text_y = text_y * scale_factor;
			text_width = text_width * scale_factor;


			// --- Label Positioning ---
			// Estimate label width dynamically
			context.font = "bold 12px Verdana"; // Set font before measuring
			const textMetrics = context.measureText(combinedLabelText);
			const padding = 4;
			const labelRectWidth = textMetrics.width + padding * 2;
			const labelRectHeight = 12 + padding;

			// put labels to either side of text - Calculate label position
			let labelX;
			if (text_x < scaledPdfWidth / 2){ // Check scaled x against half canvas width
				// Position on left margin
				labelX = Math.max(padding, marginWidth - labelRectWidth - padding); // Align to right of left margin
			}
			else{
				// Position in the right margin
				labelX = text_x + text_width + (2 * scale_factor);
			}
			const labelY = text_y; // Use scaled text_y for label Y position

			// Call modified highlightLabel with combined text and styling label
			highlightLabel(context, combinedLabelText, stylingLabel, labelX, labelY);

			// Draw rectangles based on coordinates
			// Use the stylingLabel (first label) for highlight color
			for (let i = 0; i < coordsList.length; i++) {
				const [p, x, y, width, height] = coordsList[i].split(',').map(Number);
				const drawX = (x * scale_factor) + offset_x; // Apply scale and offset
				const drawY = y * scale_factor;           // Apply scale
				const drawWidth = width * scale_factor;   // Apply scale
				const drawHeight = height * scale_factor; // Apply scale
				highlightText(context, stylingLabel, drawX, drawY, drawWidth, drawHeight);
			}
		});

	}


	return (
		<>
			<div>
				{/* Page Navigation Controls */}
				<p>
					Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
				</p>
				<button
					type="button"
					disabled={pageNumber <= 1}
					onClick={previousPage}
					style={{margin: "10px"}}
				>
					Previous
				</button>
				<button
					type="button"
					disabled={pageNumber >= numPages}
					onClick={nextPage}
					style={{margin: "10px"}}
				>
					Next
				</button>
				Page Number :
				<input name="pageInput" type="text" value={pageNumber.toString()} onChange={onPageChange} style={{margin: "10px"}} />

			</div>

			{/* PDF Rendering Area */}
			<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}> 
				{/* Relative positioning container for PDF and overlay canvas */}
				<div style={{ position: 'relative', width: `${(pageWidth * pdf_render_scale) + (2 * marginWidth)}px`, height: `${pageHeight * pdf_render_scale}px` }}>
					{/* PDF Document Rendering */}
					<div style={{ position: 'absolute', left: `${marginWidth}px`, top: '0' }}>
						<Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
							<Page className={"PDFPage"}
								//canvasRef={canvas}
								key={`page_${pageNumber + 1}`}
								pageNumber={pageNumber}
								onLoadSuccess={onPageLoadSuccess}
								onRenderSuccess={renderHighlights}
								renderTextLayer={true}
								renderAnnotationLayer={false}
								width={pageWidth * pdf_render_scale}
								//height={pageHeight * pdf_render_scale}
							/>
						</Document>
					</div>
					{/* Overlay Canvas */}
					<canvas 
						ref={highlightCanvasRef} 
						style={{ position: 'absolute', left: '0', top: '0', pointerEvents: 'none' }} 
				
					/>
				</div>
			</div>
		</>
	);

}
