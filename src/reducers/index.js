import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";
import pdfpreview from "./pdfpreview";
import { statement, userCategory, user} from './dashboard';

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer,
	pdfpreview: pdfpreview,
	statement,
	userCategory,
	user
});

export default rootReducer;
