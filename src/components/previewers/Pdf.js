// Preview Pdf file using react-pdf package
import React, { useEffect, useRef, useState } from "react";
import { pdfjs , Document, Page } from 'react-pdf';
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const highlight_color = {
	"1a":"#88FF88",
	"1b":"#88FF88",
	"2a": "#CCAAFF",
	"2b": "#CCAAFF",
	"3a": "#88FFFF",
	"3b": "#88FFFF",
	"4a": "#88FFFF",
	"4b": "#88FFFF",
	"5":  "#88FFFF",
	"6a": "#88FFFF",
	"6b": "#88FFFF",
	"7a": "#88FFFF",
	"7b": "#88FFFF",
	"8a": "#88FFFF",
	"8b": "#88FFFF",
	"9" : "#88FFFF",
	"10" :"#88FFFF",
	"11a" :"#88FFFF",
	"11b" :"#88FFFF",
	"12a ":"#88FFFF",
	"12b" :"#88FFFF",
	"13a":"#bbff44",
	"13b" :"#bbff44",
	"14a" :"#bbff44",
	"14b" :"#bbff44",
	"15" :"#bbff44",
	"16" :"#bbff44",
	"17a" :"#bbff44",
	"17b" :"#bbff44",
	"18" :"#bbff44",
	"19" :"#bbff44",
	"20" :"#AACCFF",
	"21" :"#AACCFF",
	"22" :"#AACCFF",
	"23" :"#FFAACC",
	"24" :"#FFAACC",
	"25" :"#FFAACC",
}


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
	const [canvas_width, setCanvasWidth] = useState(500);
	const [canvas_height, setCanvasHeight] = useState(800);
	const [scale_x, setScaleX] = useState(1);
	const [scale_y, setScaleY] = useState(1);


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

	}, [metadata]);


	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
		setPageNumber(1);
	}

	function onPageLoadSuccess(){
		setCanvasWidth(canvas.current.width);
		setCanvasHeight(canvas.current.height);
		setScaleY(canvas_height / pageHeight);
		setScaleX(canvas_width / pageWidth);
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

	function highlightText(context, label, x, y, width, height){
		// rectangle highlights styling
		context.globalAlpha = 0.2
		context.fillStyle = highlight_color[label];  // 'rgb(255, 190, 60)';
		context.fillRect(x , y , width , height );
	}

	function highlightLabel(context, label, x, y){
		context.globalAlpha = 1.0
		context.font = "10px Verdana";
		context.fillStyle =  highlight_color[label];
		context.fillRect(x, y, 20, 10);
		context.fillStyle = 'red';
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
