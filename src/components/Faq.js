// Create a FAQ page

import React from 'react';
import { Container, Typography, Box } from '@mui/material';


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
        answer: "SPIRIT statement can be found here: https://www.consort-statement.org/spirit/"
    },
    {
        question: "How can I find the CONSORT guidelines?",
        answer: "CONSORT statement can be found here: https://www.equator-network.org/reporting-guidelines/consort/"
    }
];

function Faq() {
	return (
		<Container>
			<Typography variant="h4" gutterBottom>
				FAQ
			</Typography>
			<Box>
				{faqData.map((item, index) => (
					<Box key={index} mb={2}>
						<Typography variant="h6">
							{index + 1}. {item.question}
						</Typography>
						<Typography variant="body1">
							{item.answer}
						</Typography>
					</Box>
				))}
			</Box>
		</Container>
	);
}

export default Faq;
