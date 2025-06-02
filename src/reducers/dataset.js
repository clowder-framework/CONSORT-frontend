import {
	RECEIVE_FILES_IN_DATASET,
	RECEIVE_DATASET_ABOUT, SET_DATASET_METADATA,
	RECEIVE_DATASETS, DELETE_DATASET,
	CREATE_DATASETS, ADD_FILE_TO_DATASET,
	RESET_DATASET_TO_DEFAULT
} from "../actions/dataset";
import {DELETE_FILE, SET_EXTRACTION_STATUS} from "../actions/file";

const defaultState = {files: [], about: {}, datasets: [], metadata: {}};

const datasetReducer = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILES_IN_DATASET:
			return Object.assign({}, state, {files: action.files});
		case ADD_FILE_TO_DATASET:
			return { ...state,
				files: [...state.files, action.files]
			};
		case DELETE_FILE:
			return Object.assign({}, state, {
				files: state.files.filter(file => file.id !== action.file.id)
			});
		case RECEIVE_DATASET_ABOUT:
			return Object.assign({}, state, {about: action.about});
		case RECEIVE_DATASETS:
			return Object.assign({}, state, {
				datasets: action.datasets.map(dataset => ({
					...dataset,
					status: dataset.status || "created" // Ensure each dataset has a status
				}))
			});
		case CREATE_DATASETS:
			return { ...state,
				datasets: [...state.datasets, {
					...action.datasets,
					status: "created" // Set initial status for new dataset
				}]
			};
		case DELETE_DATASET:
			return Object.assign({}, state, {
				datasets: state.datasets.map(dataset => 
					dataset.id === action.dataset.id 
						? { ...dataset, status: "deleted" }
						: dataset
				)
			});
		case SET_DATASET_METADATA:
			return Object.assign({}, state, {metadata: action.metadata});
		case 'RESET_DATASET_METADATA':
			return Object.assign({}, state, {metadata: {}});
		case 'UPDATE_DATASET_STATUS':
			return Object.assign({}, state, {
				datasets: state.datasets.map(dataset => 
					dataset.id === action.datasetId 
						? { ...dataset, status: action.status }
						: dataset
				)
			});
		case RESET_DATASET_TO_DEFAULT:
			return defaultState;
		default:
			return state;
	}
};

export default datasetReducer;
