import {
	RECEIVE_FILES_IN_DATASET,
	RECEIVE_DATASET_ABOUT, SET_DATASET_METADATA,
	RECEIVE_DATASETS, DELETE_DATASET,
	CREATE_DATASETS, ADD_FILE_TO_DATASET
} from "../actions/dataset";
import {DELETE_FILE, SET_EXTRACTION_STATUS} from "../actions/file";

const defaultState = {files: [], about: {}, datasets: [], status: "", metadata: {}};

const datasetReducer = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILES_IN_DATASET:
			return Object.assign({}, state, {files: action.files});
		case ADD_FILE_TO_DATASET:
			return { ...state,
				// new files list
				files: [...state.files, action.files]
			};
		case DELETE_FILE:
			return Object.assign({}, state, {
				files: state.files.filter(file => file.id !== action.file.id),
				status: action.file.status
			});
		case RECEIVE_DATASET_ABOUT:
			return Object.assign({}, state, {about: action.about});
		case RECEIVE_DATASETS:
			return Object.assign({}, state, {datasets: action.datasets});
		case CREATE_DATASETS:
			return { ...state,
				// new datasets list
				datasets: [...state.datasets, action.datasets]
			};
		case DELETE_DATASET:
			return Object.assign({}, state, {
				datasets: state.datasets.filter(dataset => dataset.id !== action.dataset.id),
				status: action.dataset.status
			});
		case SET_DATASET_METADATA:
			return Object.assign({}, state, {metadata: action.metadata});
		default:
			return state;
	}
};

export default datasetReducer;
