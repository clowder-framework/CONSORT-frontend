import {
	SET_EXTRACTION_STATUS,
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_METADATA,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_PREVIEWS,
	RESET_FILE_TO_DEFAULT
} from "../actions/file";

const defaultState = {metadata: {}, extractedMetadata: {}, metadataJsonld: [], previews: [], extractionStatus: null};

const file = (state = defaultState, action) => {
	switch (action.type) {
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {metadata: action.metadata});
		case RECEIVE_FILE_EXTRACTED_METADATA:
			return Object.assign({}, state, {extractedMetadata: action.extractedMetadata});
		case RECEIVE_FILE_METADATA_JSONLD:
			return Object.assign({}, state, {metadataJsonld: action.metadataJsonld});
		case RECEIVE_PREVIEWS:
			return { ...state,
				// new previews list
				previews: [...state.previews, action.previews]
			};
		case SET_EXTRACTION_STATUS:
			return Object.assign({}, state, {extractionStatus: action.extractionStatus});
		case 'RESET_FILE_PREVIEWS':
			return { ...state, previews: [] };
		case RESET_FILE_TO_DEFAULT:
			return defaultState;
		default:
			return state;
	}
};

export default file;
