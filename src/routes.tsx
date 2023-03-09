import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import FilePreview from "./components/childComponents/FilePreview";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Dashboard/>}/>
				<Route path="/preview" element={<FilePreview/>} />
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
