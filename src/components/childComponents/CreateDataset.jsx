import React, {useState} from "react";

import {Box, Button, Container} from "@material-ui/core";

import {makeStyles} from "@material-ui/core/styles";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {createDataset} from "../../utils/dataset";
import LoadingOverlay from "react-loading-overlay-ts";
import {useNavigate} from "react-router";

const useStyles = makeStyles();

export default function CreateDataset(props) {
	const {setOpen, ...other} = props;

	const history = useNavigate();

	const [disabled, setDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const onSave = async (formData) => {
		setLoading(true);
		const response = await createDataset(formData);

		setLoading(false);
		setOpen(false);

		// zoom into that newly created dataset
		if (response && response["id"] !== undefined) {
			history(`/datasets/${response["id"]}`);
		}
	};

	return (
		<Container>
			<LoadingOverlay
				active={loading}
				spinner
				text="Saving..."
			>
				<Form schema={datasetSchema["schema"]} uiSchema={datasetSchema["uiSchema"]} // widgets={widgets}
					  onSubmit={({formData}, e) => {onSave(formData);}}>
					<Box className="inputGroup">
						<Button variant="contained" type="submit" className="form-button-block">Create</Button>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);
}
