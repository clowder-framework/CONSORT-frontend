// pdf previewer actions

export const SET_PAGE_NUMBER = "SET_PAGE_NUMBER";
export function setPageNumber(type, page) {
	return (dispatch) => {
		dispatch({
			type: type,
			pageNumber: page
		});
	};
}

export const RESET_PDFPREVIEW_TO_DEFAULT = "RESET_PDFPREVIEW_TO_DEFAULT";

export function resetPdfPreviewToDefault() {
	return {
		type: RESET_PDFPREVIEW_TO_DEFAULT
	};
}
