// File drag and drop

import React from "react";
import { styled } from "@material-ui/core/styles";
import {Box} from "@material-ui/core";
// Import the useDropzone hooks from react-dropzone
import { useDropzone } from "react-dropzone";


const Dropfile = ({ onDrop, accept }) => {
	// Initializing useDropzone hooks with options
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
				{isDragActive ? (
					<p className="dropzone-content">Release to drop the files here</p>
				) : (
					<p className="dropzone-content"> Drag and drop some files here </p>
				)}
			</div>
		</div>
	);
};

export default Dropfile;
