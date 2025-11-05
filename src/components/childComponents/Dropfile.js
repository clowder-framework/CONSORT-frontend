// File drag and drop

import React from "react";
// Import the useDropzone hooks from react-dropzone
import { useDropzone } from "react-dropzone";
import { theme } from "../../theme";

const Dropfile = ({ onDrop, accept, message }) => {
	// Initializing useDropzone hooks with options
	const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
		onDrop,
		accept,
		// Disable dropping if there's no statement type selected
		noClick: !message || message.includes("Please select a statement type"),
		noDrop: !message || message.includes("Please select a statement type")
	});

	return (
		<div className="dropzone-div" {...getRootProps()}>
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
			<button variant="contained" type="button" onClick={onDrop} style={{ marginTop: '2rem',
				backgroundImage: 'linear-gradient(to right, #CD67F9, #AD60F2, #7F46FC, #486EF5)',
				fontFamily: theme.typography.fontFamily, color: theme.palette.info.contrastText, cursor: 'pointer' }}>
				Browse Files
			</button>
		</div>
	);
};

export default Dropfile;
