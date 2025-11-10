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

// Authentication actions
export const SET_AUTHENTICATION_STATUS = "SET_AUTHENTICATION_STATUS";
export const SET_AUTHENTICATION_LOADING = "SET_AUTHENTICATION_LOADING";

export function setAuthenticationStatus(isAuthenticated) {
	return (dispatch) => {
		dispatch({
			type: SET_AUTHENTICATION_STATUS,
			isAuthenticated: isAuthenticated
		});
	};
}

export function setAuthenticationLoading(isLoading) {
	return (dispatch) => {
		dispatch({
			type: SET_AUTHENTICATION_LOADING,
			isLoading: isLoading
		});
	};
}

export function checkAuthenticationStatus() {
	return async (dispatch) => {
		dispatch(setAuthenticationLoading(true));
		try {
			const response = await fetch('/isAuthenticated', {
				method: 'GET',
				credentials: 'include',
			});
			const data = await response.json();
			dispatch(setAuthenticationStatus(data.isAuthenticated));
			
			// Set user category based on authentication status
			if (data.isAuthenticated) {
				dispatch(setUserCategory(SET_USER_CATEGORY, "researcher"));
			} else {
				dispatch(setUserCategory(SET_USER_CATEGORY, "author"));
			}
		} catch (error) {
			console.error('Error checking authentication status:', error);
			dispatch(setAuthenticationStatus(false));
			dispatch(setUserCategory(SET_USER_CATEGORY, "author"));
		} finally {
			dispatch(setAuthenticationLoading(false));
		}
	};
}

