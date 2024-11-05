import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";
// import CreateAndUpload from "./components/childComponents/CreateAndUpload";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/home/" element={<Dashboard/>}/>
				{/* <Route path="/create/" element={<CreateAndUpload/>}/> */}
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
