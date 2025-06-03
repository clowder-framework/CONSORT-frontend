import {
	SET_PAGE_NUMBER,
	RESET_PDFPREVIEW_TO_DEFAULT
} from "../actions/pdfpreview";

const defaultState = {pageNumber: 1};

const pdfpreview = (state = defaultState, action) => {
	switch (action.type) {
		case SET_PAGE_NUMBER:
			return Object.assign({}, state, {pageNumber: action.pageNumber});
		case RESET_PDFPREVIEW_TO_DEFAULT:
			return defaultState;
		default:
			return state;
	}
};

export default pdfpreview;
