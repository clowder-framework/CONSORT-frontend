import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import App from "./components/App";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App/>}/>
				<Route path="*"
					   element={
						   <main style={{padding: "1rem"}}>
							   <p>Page Not Found!</p>
						   </main>
					   }
				/>
			</Routes>
		</BrowserRouter>
	)
}
