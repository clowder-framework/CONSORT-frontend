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
	const [allSentences, setAllSentences] = useState([]);

	const canvas = useRef();
	const [isRendered, setIsRendered] = useState();
	const [numPages, setNumPages] = useState(null);

	//const [pageNumber, setPageNumber] = useState(1);
	let pageNumber = useSelector((state) => state.pdfpreview.pageNumber);
	const dispatchPageNumber = (number) => dispatch(setPageNumber(SET_PAGE_NUMBER, number));

	const statementType = useSelector(state => state.statement.statementType);

	const [pageWidth, setPageWidth] = useState(500);
	const [pageHeight, setPageHeight]= useState(799);
	let [canvas_width, setCanvasWidth] = useState(500);
	let [canvas_height, setCanvasHeight] = useState(800);
	let [scale_x, setScaleX] = useState(1);
	let [scale_y, setScaleY] = useState(1);


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

	}, [pageNumber]);


	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);

	}

	function onPageLoadSuccess(){
		// Move to onRenderSuccess
	}

	function onPageChange(event) {
		dispatchPageNumber(parseInt(event.target.value));
	}

	function changePage(offset) {
		dispatchPageNumber(+pageNumber + +offset);
		//setPageNumber(prevPageNumber => prevPageNumber + offset);
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
				let pageSentences = sentences.filter(sentence => { 
					// Split coordinates into groups (separated by semicolon)
                    const coordGroups = sentence.coords.split(';');
                    // Get the page number from the first group (first element before comma)
                    const pageNum = coordGroups[0].split(',')[0];
                    return pageNum === pageNumber.toString();
				}); 
				if (pageSentences.length > 0 && pageSentences != undefined){
					return {"label": label, "sentences": pageSentences};
				}
			}
		});
		pageHighlights = pageHighlights.filter(element => element !== undefined); // remove all undefined elements
		console.log("pageHighlights:", pageHighlights);

		return pageHighlights;
	}

	function highlightText(context, label, x, y, width, height){
		// rectangle highlights styling
		context.globalAlpha = 0.2
		context.fillStyle = statementType === "consort" ? consort_highlight_color[label] : spirit_highlight_color[label];
		context.fillRect(x , y , width , height );
	}

	function highlightLabel(context, label, x, y){
		context.globalAlpha = 1.0
		context.fillStyle = statementType === "consort" ? consort_highlight_color[label] : spirit_highlight_color[label];
		context.fillRect(x, y, 25, 12);
		context.font = "bold 12px Verdana";
		context.fillStyle = statementType === "consort" ? consort_label_color[label] : spirit_label_color[label];
		context.textAlign = "start";
		context.textBaseline = "top";
		context.fillText(label, x, y);
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
				text_width = text_width * scale_x;
				// put labels to either side of text
				if (text_x < (canvas_width * scale_x)/2){
					text_x = 10 * scale_x;
				}
				else{
					text_x = text_x + text_width + (2 * scale_x);
				}
				highlightLabel(context, label, text_x, text_y)
				// Draw rectangles based on coordinates
				for (let i = 0; i < coordsList.length; i++) {
					const [p, x, y, width, height] = coordsList[i].split(',').map(Number);
					highlightText(context, label, x * scale_x, y * scale_y, width * scale_x, height * scale_y);
				}
			});

		});

	}


	return (
		<>
			<div>
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

			<div>
				<Document file={pdfSrc} onLoadSuccess={onDocumentLoadSuccess}>
					<Page className={"PDFPage"}
						  key={`page_${pageNumber + 1}`}
						  pageNumber={pageNumber}
						  onLoadSuccess={onPageLoadSuccess}
						  canvasRef={canvas}
						  onRenderSuccess={renderHighlights}
						  renderTextLayer={true}
						  renderAnnotationLayer={false}
						  width={pageWidth}
					/>
				</Document>
			</div>
		</>
	);

}
