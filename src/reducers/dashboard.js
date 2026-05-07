import { 
	SET_STATEMENT_TYPE, SET_USER_CATEGORY, 
	RESET_STATEMENT_TO_DEFAULT, RESET_USER_CATEGORY_TO_DEFAULT,
	SET_AUTHENTICATION_STATUS, SET_AUTHENTICATION_LOADING,
	SET_USER, RESET_USER_TO_DEFAULT
} from "../actions/dashboard";

export const ANONYMOUS_USER = { userName: "anonymous", userUuid: null, userEmail: "anonymous@example.com", userRole: "author" };

const initialState = {
	statementType: "consort",
	userCategory: ANONYMOUS_USER.userRole,
	isAuthenticated: false,
	authenticationLoading: false,
	...ANONYMOUS_USER
};

export function statement(state = initialState, action) {
	switch (action.type) {
		case SET_STATEMENT_TYPE:
			return {
				...state,
				statementType: action.statementType
			};
		case RESET_STATEMENT_TO_DEFAULT:
			return {
				...initialState,
				statementType: initialState.statementType
			};
		default:
			return state;
	}
} 

export function userCategory(state = initialState, action) {
	switch (action.type) {
		case SET_USER_CATEGORY:
			return {
				...state,
				userCategory: action.userCategory
			};
		case RESET_USER_CATEGORY_TO_DEFAULT:
			return {
				...initialState,
				userCategory: initialState.userCategory
			};
		default:
			return state;
	}
}

export function authentication(state = initialState, action) {
	switch (action.type) {
		case SET_AUTHENTICATION_STATUS:
			return {
				...state,
				isAuthenticated: action.isAuthenticated
			};
		case SET_AUTHENTICATION_LOADING:
			return {
				...state,
				authenticationLoading: action.isLoading
			};
		default:
			return state;
	}
}

export function user(state = initialState, action) {
    switch (action.type) {
        case SET_USER:
            return {
                ...state,
                userName: action.userName ?? state.userName,
                userUuid: action.userUuid !== undefined ? action.userUuid : state.userUuid,
                userEmail: action.userEmail !== undefined ? action.userEmail : state.userEmail,
                userRole: action.userRole ?? state.userRole
            };
        case RESET_USER_TO_DEFAULT:
            return {
                ...initialState,
                userName: initialState.userName
            };
        default:
            return state;
    }
}