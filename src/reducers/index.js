import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";
import pdfpreview from "./pdfpreview";

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer,
	pdfpreview: pdfpreview,
});

export default rootReducer;
