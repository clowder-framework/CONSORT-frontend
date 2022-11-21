import React, {useState} from "react";

import {Box, Container} from "@material-ui/core";

import LoadingOverlay from "react-loading-overlay-ts";

import Form from "@rjsf/material-ui";

import {uploadFile} from "../../utils/file.js";
import fileSchema from "../../schema/fileSchema.json";
import {useNavigate} from "react-router";
import {FormProps} from "@rjsf/core";
import {ClowderButton} from "../styledComponents/ClowderButton";

type Props = {
	selectedDatasetId: string,
	setOpen: any
}

export default function UploadFile(props:Props) {
	const {selectedDatasetId, setOpen} = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	const [loading, setLoading] = useState(false);


	const onSave = async (formData:FormData) => {
		setLoading(true);
		const response = await uploadFile(formData, selectedDatasetId);
		setLoading(false);
		setOpen(false);
		if (response !== {} && (response["id"] !== undefined || response["ids"] !== undefined)) {
			// Redirect to file route with file Id and dataset id
			history(`/files/${response["id"]}?datasetId=${selectedDatasetId}`);
		} else {
			// TODO display error message to show upload unsuccess
			console.log("fail to upload files!");
		}
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
			<Form schema={fileSchema["schema"] as FormProps<any>["schema"]} uiSchema={fileSchema["uiSchema"]}
				  onSubmit={({formData}, _) => {onSave(formData);}}>
				<Box className="inputGroup">
					<ClowderButton variant="contained" type="submit" className="form-button-block">Upload</ClowderButton>
				</Box>
			</Form>
			</LoadingOverlay>
		</Container>
	);

}
