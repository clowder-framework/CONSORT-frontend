// actions for the dashboard component

import { rctdbClient } from "../utils/rctdb-client";
import { ANONYMOUS_USER } from "../reducers/dashboard";

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
export const SET_USER = "SET_USER";
export const RESET_USER_TO_DEFAULT = "RESET_USER_TO_DEFAULT";

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

export function setUser(type, userData) {
	return (dispatch) => {
		dispatch({
			type,
			userName: userData?.userName || ANONYMOUS_USER.userName,
			userUuid: userData?.userUuid ?? null,
			userEmail: userData?.userEmail ?? ANONYMOUS_USER.userEmail,
			userRole: userData?.userRole ?? ANONYMOUS_USER.userRole
		});
	};
}

export function resetUserToDefault() {
	return {
		type: RESET_USER_TO_DEFAULT
	};
}

async function upsertUser(dispatch) {
	const user = await (await fetch("/getUser", { method: "GET", credentials: "include" })).json();
	const userName = user?.name || user?.username || ANONYMOUS_USER.userName;
	const userRole = user?.role || "researcher";
	const isAnonymous = userName.toLowerCase() === ANONYMOUS_USER.userName;
	const email = user?.email || (isAnonymous ? ANONYMOUS_USER.userEmail : null);

	const upserted = email ? await rctdbClient.upsertUser({ name: userName, email, role: userRole }) : null;
	dispatch(setUser(SET_USER, {
		userName: upserted?.name || userName,
		userUuid: upserted?.useruuid ?? null,
		userEmail: upserted?.email || email,
		userRole: upserted?.role || userRole
	}));
}

export function checkAuthenticationStatus() {
	return async (dispatch) => {
		dispatch(setAuthenticationLoading(true));
		try {
			const response = await fetch("/isAuthenticated", {
				method: "GET",
				credentials: "include",
			});
			const data = await response.json();
			dispatch(setAuthenticationStatus(data.isAuthenticated));
			
			dispatch(setUserCategory(SET_USER_CATEGORY, data.isAuthenticated ? "researcher" : "author"));
			try {
				await upsertUser(dispatch);
			} catch (error) {
				console.error("Error upserting user:", error);
				if (!data.isAuthenticated) dispatch(setUser(SET_USER, ANONYMOUS_USER));
			}
		} catch (error) {
			dispatch(setAuthenticationStatus(false));
			dispatch(setUserCategory(SET_USER_CATEGORY, "author"));
			dispatch(setUser(SET_USER, ANONYMOUS_USER));
		} finally {
			dispatch(setAuthenticationLoading(false));
		}
	};
}

