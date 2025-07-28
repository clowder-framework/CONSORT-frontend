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

// Reset action types
export const RESET_STATEMENT_TO_DEFAULT = "RESET_STATEMENT_TO_DEFAULT";
export const RESET_USER_CATEGORY_TO_DEFAULT = "RESET_USER_CATEGORY_TO_DEFAULT";
export const RESET_USER_TO_DEFAULT = "RESET_USER_TO_DEFAULT";

export function resetStatementToDefault() {
	return {
		type: RESET_STATEMENT_TO_DEFAULT
	};
}

export function resetUserCategoryToDefault() {
	return {
		type: RESET_USER_CATEGORY_TO_DEFAULT
	};
}

export const SET_USER = "SET_USER";
export function setUser(user) {
	return {
		type: SET_USER,
		user: user
	};
}

export function resetUserToDefault() {
	return {
		type: RESET_USER_TO_DEFAULT
	};
}