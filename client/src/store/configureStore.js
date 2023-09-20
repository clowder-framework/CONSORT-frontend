import {applyMiddleware, compose, createStore} from "redux";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import thunk from "redux-thunk";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "../reducers";

function configureStoreProd() {
	const middlewares = [
		// Add other middleware on this line...

		// thunk middleware can also accept an extra argument to be passed to each thunk action
		// https://github.com/gaearon/redux-thunk#injecting-a-custom-argument
		thunk,
	];

	return createStore(rootReducer, compose(
		applyMiddleware(...middlewares)
		)
	);
}

function configureStoreDev() {
	const middlewares = [
		// Add other middleware on this line...
		thunkMiddleware,

		// Redux middleware that spits an error on you when you try to mutate your state either inside a dispatch or between dispatches.
		reduxImmutableStateInvariant(),

		// thunk middleware can also accept an extra argument to be passed to each thunk action
		// https://github.com/gaearon/redux-thunk#injecting-a-custom-argument
		thunk,
	];

	// adds support for Redux dev tools
	//const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const composedEnhancer = composeWithDevTools(applyMiddleware(...middlewares));
	const store = createStore(rootReducer, composedEnhancer);

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept("../reducers", () => {
			const nextReducer = require("../reducers").default; // eslint-disable-line global-require
			store.replaceReducer(nextReducer);
		});
	}

	return store;
}

const configureStore = process.env.NODE_ENV === "production" ? configureStoreProd : configureStoreDev;

export default configureStore;
