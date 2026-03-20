import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";
import pdfpreview from "./pdfpreview";
import { statement, userCategory, authentication, user } from "./dashboard";

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer,
	pdfpreview: pdfpreview,
	statement,
	userCategory,
	authentication,
	user
});

export default rootReducer;
