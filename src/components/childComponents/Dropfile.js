// File drag and drop

import React from "react";
// Import the useDropzone hooks from react-dropzone
import { useDropzone } from "react-dropzone";

const Dropfile = ({ onDrop, accept }) => {
	// Initializing useDropzone hooks with options
	const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
		onDrop,
		accept
	});

	/*
	  useDropzone hooks exposes two functions called getRootProps and getInputProps
	  and also exposes isDragActive boolean
	*/

	return (
		<div className="dropzone-div" {...getRootProps()}>
			<input className="dropzone-input" {...getInputProps()} />
			<div className="text-center">
				{!isDragActive && (<p className="dropzone-content"> Drag and drop some files here </p>)}
				{isDragAccept && (<p className="dropzone-content"> Release to drop the files here </p>)}
				{isDragReject && (<p className="dropzone-content"> Unaccepted file format </p>)}
			</div>
		</div>
	);
};

export default Dropfile;
