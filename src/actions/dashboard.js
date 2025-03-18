// actions for the dashboard component

// user choice statement actions
export const SET_STATEMENT_TYPE = "SET_STATEMENT_TYPE";
export function setStatement(type, statement) {
	return (dispatch) => {
		dispatch({
			type: type,
			statementType: statement
		});
	};
}

// user category actions
export const SET_USER_CATEGORY = "SET_USER_CATEGORY";
export function setUserCategory(type, category) {
	return (dispatch) => {
		dispatch({
			type: type,
			userCategory: category
		});
	};
}

