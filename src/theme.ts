import {createTheme} from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles';

// Extend the theme to include custom properties
declare module '@mui/material/styles' {
	interface Palette {
		gradient: {
			start: string;
			middle1: string;
			middle2: string;
			end: string;
		};
	}
	interface PaletteOptions {
		gradient?: {
			start?: string;
			middle1?: string;
			middle2?: string;
			end?: string;
		};
	}
}

// A custom theme for this app
export const theme = createTheme({
	typography: {
		fontFamily: [
			'Lexend',
			'sans-serif',
		].join(','),
	},
	palette: {
		primary: {
			light: "#AD8AF8",
			main: "#8148FC",
			dark: "#481EC0",
			contrastText: '#FFFFFF',
		},
		secondary: {
			light: "#868E96",
			main: "#6C757D",
			dark: "#333333",
		},
		info: {
			main: "#0086A1"
		},
		background: {
			default: "#F8F8F8"
		},
		gradient: {
			start: "#CD67F9",
			middle1: "#AD60F2",
			middle2: "#7F46FC",
			end: "#486EF5",
		}
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				colorInherit: {
					backgroundColor: "#FFFFFF",
					boxShadow: "none",
				},
			},
			defaultProps: {
				color: "inherit",
			},
		},
	},
});

export const searchTheme = {
	typography: {
		fontFamily: theme.typography.fontFamily,
		fontSize: "16px",
	},
	colors: {
		textColor: theme.palette.secondary.dark,
		primaryTextColor: theme.palette.primary.contrastText,
		primaryColor: theme.palette.primary.main,
		titleColor: theme.palette.secondary.dark,
		alertColor: theme.palette.primary.dark,
	}
};
