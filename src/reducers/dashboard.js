import { 
    SET_STATEMENT_TYPE, SET_USER_CATEGORY, 
    RESET_STATEMENT_TO_DEFAULT, RESET_USER_CATEGORY_TO_DEFAULT 
} from '../actions/dashboard';

const initialState = {
    statementType: 'spirit',  // default value
    userCategory: 'author'
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
