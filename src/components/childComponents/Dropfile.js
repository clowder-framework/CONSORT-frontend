// File drag and drop

import React, { useState } from "react";
// Import the useDropzone hooks from react-dropzone
import { useDropzone } from "react-dropzone";
import { theme } from "../../theme";

const Dropfile = ({ onDrop, accept, message }) => {
	const [files, setFiles] = useState([]);
	
	// Initializing useDropzone hooks with options
	const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, open } = useDropzone({
		accept,
		// Disable dropping if there's no statement type selected
		noClick: !message || message.includes("Please select a statement type"),
		noDrop: !message || message.includes("Please select a statement type"),
		onDrop: (acceptedFiles, rejectedFiles) => {
			setFiles(acceptedFiles);
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (files.length > 0) {
			onDrop(files, []);
			setFiles([]);
		}
	};

	const isDisabled = !message || message.includes("Please select a statement type");

	return (
		<form onSubmit={handleSubmit}>
			<div className="dropzone-div" {...getRootProps({ onClick: (e) => e.preventDefault() })}>
				<input className="dropzone-input" {...getInputProps()} />
				<div className="text-center" style={{ marginTop: '2rem' }}>
					{!isDragActive && (<p className="dropzone-content">{message || "Drag and drop some files here"}</p>)}
					{isDragAccept && (<p className="dropzone-content">Release to drop the files here</p>)}
					{isDragReject && (<p className="dropzone-content">
						{!message || message.includes("Please select a statement type")
							? "Please select a statement type first"
							: "Unaccepted file format"}
					</p>)}
				</div>
				<button 
					variant="contained" 
					type="button" 
					onClick={open}
					disabled={isDisabled}
					style={{ 
						marginTop: '2rem',
						backgroundImage: 'linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)',
						fontFamily: theme.typography.fontFamily, 
						color: theme.palette.info.contrastText, 
						cursor: isDisabled ? 'not-allowed' : 'pointer',
						opacity: isDisabled ? 0.5 : 1,
						padding: '1rem 2rem',
						border: 'none',
						borderRadius: '8px',
						fontSize: '1.1rem',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
						transform: isDisabled ? 'none' : 'translateY(-2px)',
						transition: 'all 0.2s ease',
						minWidth: '120px',
						minHeight: '48px'
					}}>
					Browse Files
				</button>
			</div>
			{files.length > 0 && (
				<aside style={{ marginTop: '1rem' }}>
					<h4 style={{ 
						fontFamily: theme.typography.fontFamily,
						color: theme.palette.primary.main,
						marginBottom: '0.5rem'
					}}>File Selected</h4>
					<ul style={{ 
						listStyle: 'none', 
						padding: 0,
						fontFamily: theme.typography.fontFamily
					}}>
						{files.map((file) => (
							<li key={file.name} style={{ marginBottom: '0.5rem' }}>
								{file.name} - {file.size} bytes
							</li>
						))}
					</ul>
				</aside>
			)}
			<button 
				type="submit"
				disabled={files.length === 0 || isDisabled}
				style={{ 
					marginTop: '2rem',
					backgroundImage: 'linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)',
					fontFamily: theme.typography.fontFamily, 
					color: theme.palette.info.contrastText, 
					cursor: (files.length === 0 || isDisabled) ? 'not-allowed' : 'pointer',
					opacity: (files.length === 0 || isDisabled) ? 0.5 : 1,
					padding: '1rem 2rem',
					border: 'none',
					borderRadius: '8px',
					fontSize: '1.1rem',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					transform: (files.length === 0 || isDisabled) ? 'none' : 'translateY(-2px)',
					transition: 'all 0.2s ease',
					minWidth: '120px',
					minHeight: '48px'
				}}>
				Submit File
			</button>
		</form>
	);
};

export default Dropfile;
