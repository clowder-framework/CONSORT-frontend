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
