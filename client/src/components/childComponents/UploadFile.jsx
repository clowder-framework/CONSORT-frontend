import React, {useState} from "react";

import {Box, Button, Container} from "@material-ui/core";

import LoadingOverlay from "react-loading-overlay-ts";
import {makeStyles} from "@material-ui/core/styles";

import Form from "@rjsf/material-ui";

import {uploadFile} from "../../utils/file.js";
import fileSchema from "../../schema/fileSchema.json";
import {useNavigate} from "react-router";

const useStyles = makeStyles();

export default function UploadFile(props) {
	const {selectedDatasetId, setOpen} = props;
	const classes = useStyles();

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	const [loading, setLoading] = useState(false);


	const onSave = async (formData) => {
		setLoading(true);
		const response = await uploadFile(formData, selectedDatasetId);
		setLoading(false);
		setOpen(false);
		if (response !== {} && (response["id"] !== undefined || response["ids"] !== undefined)) {
			// Redirect to file route with file Id and dataset id
			history(`/files/${response["id"]}?datasetId=${selectedDatasetId}`);
		} else {
			// TODO display error message to show upload unsuccess
			console.error("fail to upload files!");
		}
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
			<Form schema={fileSchema["schema"]} uiSchema={fileSchema["uiSchema"]}
				  onSubmit={({formData}, e) => {onSave(formData);}}>
				<Box className="inputGroup">
					<Button variant="contained" type="submit" className="form-button-block">Upload</Button>
				</Box>
			</Form>
			</LoadingOverlay>
		</Container>
	);

}
