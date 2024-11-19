const initialState = {
    statementType: 'consort'  // default value
};

export default function statement(state = initialState, action) {
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