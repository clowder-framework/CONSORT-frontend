import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";
import pdfpreview from "./pdfpreview";
import statement from './statement';

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer,
	pdfpreview: pdfpreview,
	statement,
});

export default rootReducer;
