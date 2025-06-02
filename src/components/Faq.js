// Create a FAQ page

import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import Footer from './childComponents/Footer';
import { Link as RouterLink } from 'react-router-dom';
import { theme } from '../theme';

const faqData = [
	{
		question: "What is this application about?",
		answer: "This application is designed to help users analyze their RCT manuscripts based on CONSORT or SPIRIT guidelines."
	},
	{
		question: "How do I upload a file?",
		answer: "You can upload a file by draggin and dropping it into the main page section and following the instructions provided."
	},
	{
		question: "What file types are supported?",
		answer: "Currently, we support PDF and Word document file types."
	},
	{
		question: "How can I contact support?",
		answer: "You can contact support by clicking on the 'Contact Us' link in the top bar and sending an email to the provided address."
	},
    {
        question: "Where can I find the scientific data paper?",
        answer: "You can find the scientific data paper in the footer of the page."
    },
    {
        question: "How can I find the SPIRIT guidelines?",
        answer: <span>SPIRIT statement can be found here: <a href="https://www.equator-network.org/reporting-guidelines/spirit-2013-statement-defining-standard-protocol-items-for-clinical-trials/" target="_blank" rel="noopener noreferrer">https://www.equator-network.org/reporting-guidelines/spirit-2013-statement-defining-standard-protocol-items-for-clinical-trials/</a></span>
    },
    {
        question: "How can I find the CONSORT guidelines?",
        answer: <span>CONSORT statement can be found here: <a href="https://www.equator-network.org/reporting-guidelines/consort/" target="_blank" rel="noopener noreferrer">https://www.equator-network.org/reporting-guidelines/consort/</a></span>
    }
];

function Faq() {
	return (
		<>
			<Container>
				<Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
					FAQ
				</Typography>
				<Box>
					{faqData.map((item, index) => (
						<Box key={index} mb={2}>
							<Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
								{index + 1}. {item.question}
							</Typography>
							<Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
								{item.answer}
							</Typography>
						</Box>
					))}
				</Box>
				<Box sx={{ mt: 4, textAlign: 'center' }}>
					<Button 
						variant="contained" 
						color="primary" 
						component={RouterLink} 
						to="/home"
						sx={{
							background: 'linear-gradient(to right, #CD67F9, #486EF5)',
							color: 'white',
							padding: '12px 24px',
							borderRadius: '4px',
							textDecoration: 'none',
							fontWeight: '500',
							transition: 'opacity 0.2s',
							'&:hover': {
								opacity: 0.9
							}
						}}
					>
						Home
					</Button>
				</Box>
				
			</Container>
			<Box sx={{ mt: 4 }}>
				<Footer />
			</Box>
		</>
		
	);
}

export default Faq;
