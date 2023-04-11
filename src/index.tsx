// Set up your application entry point here...
///* eslint-disable import/default */

import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux";
import {AppRoutes} from "./routes";
import configureStore from "./store/configureStore";
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {theme} from './theme';

const store = configureStore();


render(
	<ThemeProvider theme={theme}>
		<Provider store={store}>
			<CssBaseline/>
			<AppRoutes/>
		</Provider>
	</ThemeProvider>
	, document.getElementById("app")
);
