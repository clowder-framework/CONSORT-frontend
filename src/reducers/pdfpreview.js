import {
	SET_PAGE_NUMBER,
} from "../actions/pdfpreview";

const defaultState = {pageNumber: 1};

const pdfpreview = (state = defaultState, action) => {
	switch (action.type) {
		case SET_PAGE_NUMBER:
			return Object.assign({}, state, {pageNumber: action.pageNumber});
		default:
			return state;
	}
};

export default pdfpreview;
