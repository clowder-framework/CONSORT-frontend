import React, {useContext} from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import {ApiContext} from "./components/ApiContext";
import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";


export const AppRoutes = (): JSX.Element => {
	const header = useContext(ApiContext);
	// pass header value to all components
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/home/" element={<Dashboard/>}/>
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
