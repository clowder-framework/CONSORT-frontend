import { combineReducers } from "redux";
import file from "./file";
import datasetReducer from "./dataset";

const rootReducer = combineReducers({
	file: file,
	dataset: datasetReducer
});

export default rootReducer;
