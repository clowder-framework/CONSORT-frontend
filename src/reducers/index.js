import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import client from "./client";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	client: client
});

export default rootReducer;
