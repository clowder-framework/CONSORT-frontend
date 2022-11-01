import React, {useState} from "react";

import {Box, Container} from "@material-ui/core";

import Form from "@rjsf/material-ui";
import datasetSchema from "../../schema/datasetSchema.json";
import {createDataset} from "../../utils/dataset";
import LoadingOverlay from "react-loading-overlay-ts";
import {useNavigate} from "react-router";
import {FormProps} from "@rjsf/core";
import {ClowderButton} from "../styledComponents/ClowderButton";


type Props = {
	setOpen: any
}

export default function CreateDataset(props: Props) {
	const {setOpen} = props;

	const history = useNavigate();

	// const [disabled, setDisabled] = useState(true);
	const [loading, setLoading] = useState(false);

	const onSave = async (formData:FormData) => {
		setLoading(true);
		const response = await createDataset(formData);

		setLoading(false);
		setOpen(false);

		// zoom into that newly created dataset
		if (response !== {} && response["id"] !== undefined) {
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
				<Form schema={datasetSchema["schema"] as FormProps<any>["schema"]} uiSchema={datasetSchema["uiSchema"]} // widgets={widgets}
					  onSubmit={({formData}, _) => {onSave(formData);}}>
					<Box className="inputGroup">
						<ClowderButton variant="contained" type="submit" className="form-button-block">Create</ClowderButton>
					</Box>
				</Form>
			</LoadingOverlay>
		</Container>
	);
}
