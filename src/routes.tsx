import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

//import Dashboard from "./components/Dashbard";
import Dashboard from "./components/Dashboard";
//import DatasetComponent from "./components/Dataset";
//import FileComponent from "./components/File";

export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Dashboard/>}/>
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
