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