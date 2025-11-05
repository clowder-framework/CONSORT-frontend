import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";
import pdfpreview from "./pdfpreview";
import { statement, userCategory, authentication } from './dashboard';

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer,
	pdfpreview: pdfpreview,
	statement,
	userCategory,
	authentication
});

export default rootReducer;
