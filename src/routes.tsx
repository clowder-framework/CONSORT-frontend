import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";
import Faq from "./components/Faq";
// import CreateAndUpload from "./components/childComponents/CreateAndUpload";


export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
		<Route path="/home/" element={<Dashboard/>}/>
		{/* <Route path="/create/" element={<CreateAndUpload/>}/> */}
		<Route path="/preview" element={<Preview/>} />
		<Route path="/preview/:dataset_id/:file_id" element={<Preview/>} />
		<Route path="/faq" element={<Faq/>} />
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
