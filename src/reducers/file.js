import {
	EXTRACTION_STATUS,
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_METADATA,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_PREVIEWS
} from "../actions/file";

const defaultState = {metadata: {}, extractedMetadata: {}, metadataJsonld: [], previews: [], extractionStatus: false};

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
		case EXTRACTION_STATUS:
			return Object.assign({}, state, {extractionStatus: action.extractionStatus});
		default:
			return state;
	}
};

export default file;
