// client actions

import {
	createEmptyDatasetRequest,
	getDatasetMetadataLoop,
	getFileInDataset,
	uploadFileToDatasetRequest
} from "../utils/dataset";
import config from "../app.config";
import {getClientInfo} from "../utils/common";
import {wordPipeline} from "../utils/word_pipeline";
import {pdfPipeline} from "../utils/pdf_pipeline";
import {SET_EXTRACTION_STATUS, setExtractionStatus} from "./file";
import {ADD_FILE_TO_DATASET, addFileToDataset, CREATE_DATASETS, createDataset} from "./dataset";
import {resetFileToDefault} from "./file";
import {resetDatasetToDefault} from "./dataset";
import {resetPdfPreviewToDefault} from "./pdfpreview";
import {resetStatementToDefault} from "./dashboard";
import {resetUserCategoryToDefault} from "./dashboard";
import {rctdbClient} from "../utils/rctdb";


const clientInfo = await getClientInfo();


// createUploadExtract thunk function
export function createUploadExtract(file, config) {
    return async function createUploadExtractThunk(dispatch, getState) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		console.log("StatementType", config.statementType)
		console.log("UserCategory", config.userCategory)
        // read username from redux state set by SET_USER
        let usernameFromState = "Anonymous";
        try {
            const state = typeof getState === "function" ? getState() : undefined;
            if (state) {
                if (state.user && typeof state.user.userName === "string" && state.user.userName.trim() !== "") {
                    usernameFromState = state.user.userName;
                }
            }
        } catch (e) {
            // keep default "Anonymous" on any unexpected error
            console.warn("Could not read username from state.", e);
        }
        const userData = await rctdbClient.upsertUser({ name: usernameFromState, role: config.userCategory });
		console.log("User upserted to RCTDB", usernameFromState);
		console.log("User data updated in RCTDB", userData);

		// Clowder API call to create empty dataset
		const file_name = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
		const file_description = file.type;
		console.log("Uploading file", file_name);
		const dataset_json = await createEmptyDatasetRequest(file_name, file_description, clientInfo); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined && dataset_json !== null) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload input file to dataset
			let file_json = await uploadFileToDatasetRequest(dataset_json.id, file, clientInfo); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				const publicationData = {source: "Clowder", datasetid: dataset_json.id, datasetname: file_name,
					sourcefileid: file_json.id, sourcefileuploadtime: new Date().toISOString(), sourcefileformat: file.type, sourcefilename: file.name,
					statement: config.statementType, useruuid: userData.uuid};
				await rctdbClient.upsertPublication(publicationData);
				console.log("Publication created in RCTDB", publicationData);
				file_json["filename"] = file.name;
				// submit uploaded file for extraction
				dispatch(setExtractionStatus("Analyzing file"));
				if (file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type =="application/msword"){
					const word_pipeline_status = await wordPipeline(file_json, dataset_json, config, clientInfo, dispatch);
					if (word_pipeline_status) {
						console.log("Analysis complete");
						dispatch(setExtractionStatus("Analysis complete"));

					}
					else {
						console.error("Analysis failed");
						dispatch(setExtractionStatus("Analysis failed"));
					}

				}
				else if (file.type == "application/pdf") {
					const pdf_pipeline_status = await pdfPipeline(file_json, dataset_json, config, clientInfo, dispatch);
					if (pdf_pipeline_status) {
						console.log("Analysis complete.");
						dispatch(setExtractionStatus("Analysis complete"));

					}
					else {
						console.error("Analysis failed");
						dispatch(setExtractionStatus("Analysis failed"));
					}

					// TODO add extracted output files to dataset state
					//const filesInDataset = listFilesInDatasetRequest(dataset_json["id"]);
					//Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
				}
				else {
					// TODO add error action
					console.error("Error in file type");
					dispatch(setExtractionStatus("Error in file type"));
				}
				// after submitting uploaded file for extraction, add the file to dataset state
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
			}
			else {
				console.error("Error in clowder upload of file ", file.name)
				dispatch(setExtractionStatus("Error in clowder upload of file " + file.name));
			}
		}
		else {
			console.error("Error in dataset creation");
			dispatch(setExtractionStatus("Error in dataset creation"));
			dispatch(resetFileToDefault());
			dispatch(resetDatasetToDefault());
			dispatch(resetPdfPreviewToDefault());
			dispatch(resetStatementToDefault());
			dispatch(resetUserCategoryToDefault());
		}
	};
}

