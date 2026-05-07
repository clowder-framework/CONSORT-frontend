import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";

import Dashboard from "./components/Dashboard";
import Preview from "./components/Preview";
import Faq from "./components/Faq";
// import CreateAndUpload from "./components/childComponents/CreateAndUpload";

function NotFound(): JSX.Element {
	const navigate = useNavigate();
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			minHeight="100vh"
			gap={3}
		>
			<Typography variant="h3" fontWeight="bold" color="text.primary">
				404
			</Typography>
			<Typography variant="h6" color="text.secondary">
				Page not found
			</Typography>
			<Typography variant="body2" color="text.secondary">
				The page you&apos;re looking for doesn&apos;t exist or has been moved.
			</Typography>
			<Button
				variant="contained"
				startIcon={<HomeIcon />}
				onClick={() => navigate("/home/")}
				size="large"
			>
				Go to Home
			</Button>
		</Box>
	);
}

export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/home/" element={<Dashboard/>}/>
				{/* <Route path="/create/" element={<CreateAndUpload/>}/> */}
				<Route path="/preview" element={<Preview/>} />
				<Route path="/faq" element={<Faq/>} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}
