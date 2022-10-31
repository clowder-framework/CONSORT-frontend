import React from "react";
import {Route, Routes, BrowserRouter} from "react-router-dom";

import App from "./containers/App";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App/>} />
				<Route path="*"
					   element={
						   <main style={{ padding: "1rem" }}>
							   <p>Page Not Found!</p>
						   </main>
					   }
				/>
			</Routes>
		</BrowserRouter>
	)
}
