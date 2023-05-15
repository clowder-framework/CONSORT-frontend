// client reducers
import {SET_MESSAGE} from "../actions/client";

const defaultState = {healthCheck: null, message: ""};

const client = (state = defaultState, action) => {
	switch (action.type) {
		case SET_MESSAGE:
			return Object.assign({}, state, {message: action.message});
		default:
			return state;

	}
};

export default client;
