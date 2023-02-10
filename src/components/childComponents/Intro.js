import React from 'react';
import {Typography} from '@material-ui/core';

export default function Intro() {
	return(
		<div className="intro">
			<div className="major-text">
				<Typography variant="h3" palette="primary.main">
					Check your trial quality before submission
				</Typography>
			</div>
			<div className="minor-text">
				<Typography variant="h6" palette="primary.light">
					Check up your clinical trial quality before submission
				</Typography>
			</div>
			<div className="icons">
				<img className="spirit-consort-logo" src="../../public/spirit-consort-logo.png" alt="spirit-consort-logo-sm"/>
			</div>

		</div>
	);

}
