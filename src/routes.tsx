import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/dashboard" element={<Dashboard/>}/>
				<Route path="/preview" element={<Preview/>} />
				<Route path="*"
					   element={
						   <main style={{padding: "1rem"}}>
							   <p>Page Not Found!</p>
						   </main>
					   }
				/>
			</Routes>
		</BrowserRouter>
	);
}
