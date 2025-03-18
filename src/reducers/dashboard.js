
const initialState = {
    statementType: 'consort',  // default value
    userCategory: 'author'
};

export function statement(state = initialState, action) {
    switch (action.type) {
        case 'SET_STATEMENT_TYPE':
            return {
                ...state,
                statementType: action.statementType
            };
        default:
            return state;
    }
} 

export function userCategory(state = initialState, action) {
    switch (action.type) {
        case 'SET_USER_CATEGORY':
            return {
                ...state,
                userCategory: action.userCategory
            };
        default:
            return state;
    }
}
