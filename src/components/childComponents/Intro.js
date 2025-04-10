import React from 'react';
import {Typography} from '@material-ui/core';
import { theme } from '../../theme';

export default function Intro() {
	return(
		<div className="intro">
			<div className="major-text">
				<Typography variant="h3" style={{ 
					color: 'transparent',
					backgroundImage: `linear-gradient(to right, ${theme.palette.gradient.start}, ${theme.palette.gradient.middle1}, ${theme.palette.gradient.middle2}, ${theme.palette.gradient.end})`,
					WebkitBackgroundClip: 'text',
					fontFamily: theme.typography.fontFamily
				}}>
					Check your manuscript reporting quality
				</Typography>
			</div>
			<div className="minor-text">
				<Typography variant="h6" style={{ 
					// color: 'transparent',
					// backgroundImage: `linear-gradient(to right, ${theme.palette.gradient.start}, ${theme.palette.gradient.middle1}, ${theme.palette.gradient.middle2}, ${theme.palette.gradient.end})`,
					// WebkitBackgroundClip: 'text',
					color: theme.palette.secondary.dark,
					fontFamily: theme.typography.fontFamily
				}}>
					RCTCheck uses NLP techniques to help you assess the compliance of your randomised controlled trial (RCT) manuscript with relevant guidelines.
				</Typography>
			</div>
		</div>
	);

}
