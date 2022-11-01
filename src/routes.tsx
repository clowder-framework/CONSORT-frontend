import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Dashboard from "./components/Dashbard";
import DatasetComponent from "./components/datasets/Dataset";
import FileComponent from "./components/files/File";

export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Dashboard/>}/>
				<Route path="/datasets/:datasetId" element={<DatasetComponent/>} />
				<Route path="/files/:fileId" element={<FileComponent/>} />
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
