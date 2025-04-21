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

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;


export default function Pdf(props) {
	const dispatch = useDispatch();

	const {fileId, pdfSrc, metadata, ...other} = props;

	const [content, setContent] = useState({});
	// all sentences from metadata
	const [allSentences, setAllSentences] = useState([]); // [{label: "label", sentences: [{coords: "coords", text: "text"}]}]

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
	let pdf_render_scale = 1.5;
	let canvas_render_scale = 1.5; // keep same as pdf_render_scale for coordinate highlighting


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
			console.error("Error metadata undefined");
			const sentences_list = []
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

	// Get highlights for the current page, grouping labels by coordGroup
	function getPageHighlights() {
		// Temporary map to group labels by coordGroup
		// Structure: { "coordGroupString": { labels: ["label1", "label2"], text: "sentence text" } }
		const coordGroupMap = {};

		allSentences.forEach(entry => {
			const label = entry.label;
			const sentences = entry.sentences;

			if (sentences && sentences.length > 0) {
				sentences.forEach(sentence => {
					const sentenceText = sentence.text;
					// Ensure sentence.coords is a string before splitting
					if (typeof sentence.coords !== 'string') {
						// console.warn("Sentence coords are not a string:", sentence.coords);
						return; // Skip if coords are not a string
					}
					const coordGroups = sentence.coords.split(';');

					coordGroups.forEach(coordGroup => {
						if (!coordGroup) return; // Skip empty strings

						const parts = coordGroup.split(',');
						if (parts.length < 1) {
							// console.warn("Skipping invalid coordGroup (parts < 1):", coordGroup);
							return;
						}

						const pageNumStr = parts[0];
						if (pageNumStr === pageNumber.toString()) {
                            // Basic check for expected number of parts (page, x, y, width, height)
							if (parts.length < 5) {
								// console.warn("Skipping potentially malformed coordGroup (parts < 5):", coordGroup);
                                // Allow processing even if malformed for now, downstream checks handle NaN
							}
							// This coordGroup is on the current page
							if (!coordGroupMap[coordGroup]) {
								// First time seeing this coordGroup on this page
								coordGroupMap[coordGroup] = {
									labels: [label],
									text: sentenceText
								};
							} else {
								// Add label if it's not already associated with this coordGroup
								if (!coordGroupMap[coordGroup].labels.includes(label)) {
									coordGroupMap[coordGroup].labels.push(label);
								}
							}
						}
					});
				});
			}
		});

		// Convert the map into the final array structure
		// Group highlights by text, with each text having multiple coordGroups and labels
		const textMap = {}; // {text: string, coordGroups: string[], labels: string[]}
		Object.entries(coordGroupMap).forEach(([coordGroup, data]) => {
			const { text, labels } = data;
			if (!textMap[text]) {
				textMap[text] = {
					text,
					coordGroups: [coordGroup],
					labels: [...labels]
				};
			} else {
				textMap[text].coordGroups.push(coordGroup);
				// Add unique labels only
				labels.forEach(label => {
					if (!textMap[text].labels.includes(label)) {
						textMap[text].labels.push(label);
					}
				});
			}
		});
		
		const pageSpecificHighlights = Object.values(textMap);
		return pageSpecificHighlights;
	}
	

	// Draw text highlights on the canvas
	function highlightText(context, label, x, y, width, height, text){
		// rectangle highlights styling
		context.globalAlpha = 0.2
		context.fillStyle = statementType === "consort" ? consort_highlight_color[label] : spirit_highlight_color[label];
		context.fillRect(x , y , width , height );
	}


	// Draw text labels on the canvas
	// Accept label_text (to display) and styling_label (for color), calculate dynamic width
	function highlightLabel(context, label_text, styling_label, x, y, text){
		context.globalAlpha = 1.0
		// Background color based on styling_label. default to light gray if no color is defined
		const rectColor = statementType === "consort" 
			? (consort_highlight_color[styling_label] || "#f0f0f0") 
			: (spirit_highlight_color[styling_label] || "#f0f0f0");
		context.fillStyle = rectColor;

		// Estimate width needed based on text
		context.font = "bold 12px Verdana"; // Set font before measuring
		const textMetrics = context.measureText(label_text);
		const textWidth = textMetrics.width;
		const padding = 4; // Add some padding
		const rectWidth = textWidth + padding * 2;
		const rectHeight = 12 + padding; // Fixed height + padding based on font size

		context.fillRect(x, y, rectWidth, rectHeight); // Use dynamic width and calculated height

		// Label color based on styling_label. default to gray if no color is defined
		const textColor = statementType === "consort" ? 
			(consort_label_color[styling_label] || "#666666") : 
			(spirit_label_color[styling_label] || "#666666");
		context.fillStyle = textColor;
		context.textAlign = "start";
		context.textBaseline = "top"; // Y position adjustment based on padding
		context.fillText(label_text, x + padding, y + padding / 2); // Draw text inside padded rect
	}


	function renderHighlights() {
		// Use the dedicated highlight canvas
		const canvas = highlightCanvasRef.current;
		if (!canvas) {
			console.error("canvas.current is empty");
			return;
		}
		// Ensure we have page dimensions
		if (!pageWidth || !pageHeight) {
			console.error("Page dimensions not set.");
			return;
		}

		// const context = canvas.current.getContext('2d');
		// let canvas_width = canvas.current.width;
		// let canvas_height = canvas.current.height;
		// let scale_x = canvas_width / pageWidth;
		// let scale_y = canvas_height / pageHeight; // reverse of what is there in prev code in main branch

		// Calculate scaled dimensions for PDF rendering area
		const scaledPdfWidth = pageWidth * pdf_render_scale;
		const scaledPdfHeight = pageHeight * pdf_render_scale;

		// Set the overlay canvas dimensions to be wider for margins
		const context = canvas.getContext('2d');
		const canvas_width = scaledPdfWidth + 3 * marginWidth;
		const canvas_height = scaledPdfHeight;
		canvas.width = canvas_width;
		canvas.height = canvas_height
		// Clear the canvas
		context.clearRect(0, 0, canvas_width, canvas_height);

		// // Scale the canvas to 2x while keeping PDF at 1.5x
		// let scale_x = (canvas_height / pageHeight) * (canvas_render_scale/pdf_render_scale);
		// let scale_y = (canvas_width / pageWidth) * (canvas_render_scale/pdf_render_scale);
		const scale_factor = pdf_render_scale; // Use the same scale as the PDF render
		let scale_x = (scaledPdfWidth / pageWidth); // Match PDF render scale
		let scale_y = (scaledPdfHeight / pageHeight);
		const offset_x = marginWidth;

		const pageHighlights = getPageHighlights();
		console.log("pageHighlights:", pageHighlights); // Add logging

		// Iterate through the list of individual highlights
		pageHighlights.forEach(item => {
			// Destructure the new item structure with labels array
			const {text, coordGroups, labels} = item; 
			
			// Skip if there are no labels for this coordGroup (shouldn't happen with new logic, but safe check)
			if (labels.length === 0) {
				console.warn("Skipping coordGroup with empty labels array:", coordGroups);
				return; 
			}

			// put the label only for the first coordGroup for the sentence
			const firstCoordGroup = coordGroups[0];
			const parts = firstCoordGroup.split(',');
			if (parts.length < 5) {
				console.warn("Skipping invalid coordGroup:", firstCoordGroup);
				return; // Skip this item if coordGroup is malformed
			}
			const [label_page, label_x, label_y, label_width, label_height] = parts.map(Number);

			// Check if parsing resulted in valid numbers
			if ([label_page, label_x, label_y, label_width, label_height].some(isNaN)) {
				console.warn("Skipping coordGroup with NaN values:", firstCoordGroup);
				return; // Skip if any part is not a number
			}

			// Calculate scaled drawing coordinates and dimensions
			let drawX = label_x * scale_x;
			let drawY = label_y * scale_y;
			let drawWidth = label_width * scale_x;
			let drawHeight = label_height * scale_y;

			// --- Label Positioning ---
			// Use the labels array
			const combinedLabelText = labels.join(', '); // Join all labels for display
			const stylingLabel = labels[0]; // Use the first label for color styling (consistent)
			
			// Estimate label width dynamically based on combined text
			context.font = "bold 12px Verdana"; // Set font before measuring
			const textMetrics = context.measureText(combinedLabelText); // Use combined label text
			const padding = 4;
			const labelRectWidth = textMetrics.width + padding * 2;
			const labelRectHeight = 12 + padding;

			// Calculate label position based on drawX (scaled coordinate)
			let labelX;
			// Compare drawX against half of the canvas width
            if (drawX < canvas_width / 2) { 
				// Position near left margin
				labelX = padding + offset_x; // Position 10px from the left edge plus padding
			} else {
				// Position to the right of the highlight box
				labelX = drawX + drawWidth + offset_x + 10; // Position 10px to the right of the box
			}
			// Ensure label doesn't go significantly off canvas on the right (adjust as needed)
            labelX = Math.min(labelX, canvas_width - labelRectWidth - padding - 10); // Leave 10px buffer
            // Ensure label doesn't go off canvas on the left
            labelX = Math.max(labelX, padding);

			const labelY = drawY; // Use scaled drawY for label Y position

			// Call highlightLabel with combined text and the chosen styling label
			highlightLabel(context, combinedLabelText, stylingLabel, labelX, labelY, text);

			for (const coordGroup of coordGroups) {
				const parts = coordGroup.split(',');
				if (parts.length < 5) {
					console.warn("Skipping invalid coordGroup:", coordGroup);
					continue;
				}
				const [p, x, y, w, h] = parts.map(Number);
				let drawX = x * scale_x + offset_x;
				let drawY = y * scale_y;
				let drawWidth = w * scale_x;
				let drawHeight = h * scale_y;
				highlightText(context, stylingLabel, drawX, drawY, drawWidth, drawHeight, text);
			}
		});

	}


	return (
		<>
			{/* PDF Rendering Area and Navigation Container */}
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}> 
				{/* Page Navigation Controls - Moved Here and Centered */}
				<div style={{display: "flex", alignItems: "center", marginBottom: "20px"}}> {/* Added marginBottom, removed marginRight */}
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
					<input name="pageInput" type="text" value={pageNumber.toString()} onChange={onPageChange} style={{margin: "10px", width: "50px"}} />
				</div>

				{/* Relative positioning container for PDF and overlay canvas */}
				<div style={{ position: 'relative', width: `${(pageWidth * pdf_render_scale) + (3 * marginWidth)}px`, height: `${pageHeight * pdf_render_scale}px` }}>
					{/* PDF Document Rendering */}
					<div style={{ position: 'absolute', left: `${marginWidth}px`, top: '0' }}>
						<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
							<Page className={"PDFPage"}
								// canvasRef={canvas}
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
						width={pageWidth * pdf_render_scale + 3 * marginWidth}
					/>
				</div>
			</div>
		</>
	);

}
