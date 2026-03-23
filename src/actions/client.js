// client actions

import {
	createEmptyDatasetRequest,
	uploadFileToDatasetRequest
} from "../utils/dataset";
import {wordPipeline} from "../utils/word_pipeline";
import {pdfPipeline} from "../utils/pdf_pipeline";
import {setExtractionStatus} from "./file";
import {ADD_FILE_TO_DATASET, addFileToDataset, CREATE_DATASETS, createDataset} from "./dataset";
import {resetFileToDefault} from "./file";
import {resetDatasetToDefault} from "./dataset";
import {resetPdfPreviewToDefault} from "./pdfpreview";
import {resetStatementToDefault} from "./dashboard";
import {resetUserCategoryToDefault} from "./dashboard";
import {rctdbClient} from "../utils/rctdb-client";
import {ANONYMOUS_USER} from "../reducers/dashboard";


async function resolveUserUuid(getState) {
	const stateUserUuid = getState()?.user?.userUuid;
	if (stateUserUuid) return stateUserUuid;

	try {
		const user = await (await fetch("/getUser", { method: "GET", credentials: "include" })).json();
		const userName = user?.name || user?.username || ANONYMOUS_USER.userName;
		const isAnonymous = !user?.email || userName.toLowerCase() === ANONYMOUS_USER.userName;

		const upserted = await rctdbClient.upsertUser({
			name: isAnonymous ? ANONYMOUS_USER.userName : userName,
			email: isAnonymous ? ANONYMOUS_USER.userEmail : user.email,
			role: isAnonymous ? ANONYMOUS_USER.userRole : (user?.role || "researcher")
		});
		return upserted?.useruuid || null;
	} catch (error) {
		console.error("Unable to resolve user UUID for upload:", error);
		return null;
	}
}

// createUploadExtract thunk function
export function createUploadExtract(file, config) {
    return async function createUploadExtractThunk(dispatch, getState) {
		// this function creates an empty dataset. uploads the file to the dataset and submits for extraction
		// console.log("StatementType", config.statementType)
		// console.log("UserCategory", config.userCategory)
		console.log("Config", config);
		// Clowder API call to create empty dataset
		const file_name = file.name.replace(/\.[^/.]+$/, ""); // get filename without extension as dataset name
		const file_description = file.type;
		// console.log("Uploading file", file_name);
		const dataset_json = await createEmptyDatasetRequest(file_name, file_description); // returns the dataset ID {id:xxx}
		if (dataset_json !== undefined && dataset_json !== null) {
			dispatch(createDataset(CREATE_DATASETS, dataset_json));
			// upload input file to dataset
			const file_json = await uploadFileToDatasetRequest(dataset_json.id, file); // return file ID. {id:xxx} OR {ids:[{id:xxx}, {id:xxx}]}
			if (file_json !== undefined){
				const userUuid = await resolveUserUuid(getState);
				const publicationData = {
					source: "Clowder", 
					datasetid: dataset_json.id, 
					datasetname: file_name,
					sourcefilename: file.name, 
					sourcefileid: file_json.id, 
					sourcefileuploadtime: new Date(), 
					sourcefileformat: file.type,
					statement: config.statementType
				};

				if (userUuid) {
					publicationData.useruuid = userUuid;
				}
				try {
					const publication_record = await rctdbClient.upsertPublication(publicationData);
					console.log("Publication created in RCTDB", publication_record);
				} catch (error) {
					console.error("Error upserting publication:", error);
					dispatch(setExtractionStatus("Error upserting publication"));
				}
				file_json["filename"] = file.name;
				// submit uploaded file for extraction
				dispatch(setExtractionStatus("Analyzing file"));
				if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword"){
					const word_pipeline_status = await wordPipeline(file_json, dataset_json, config, dispatch);
					if (word_pipeline_status) {
						// console.log("Analysis complete");
						dispatch(setExtractionStatus("Analysis complete"));

					}
					else {
						// console.error("Analysis failed");
						dispatch(setExtractionStatus("Analysis failed"));
					}

				}
				else if (file.type === "application/pdf") {
					const pdf_pipeline_status = await pdfPipeline(file_json, dataset_json, config, dispatch);
					if (pdf_pipeline_status) {
						// console.log("Analysis complete.");
						dispatch(setExtractionStatus("Analysis complete"));

					}
					else {
						// console.error("Analysis failed");
						dispatch(setExtractionStatus("Analysis failed"));
					}

					// TODO add extracted output files to dataset state
					//const filesInDataset = listFilesInDatasetRequest(dataset_json["id"]);
					//Object.values(filesInDataset).map(file => dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file)));
				}
				else {
					// TODO add error action
					// console.error("Error in file type");
					dispatch(setExtractionStatus("Error in file type"));
				}
				// after submitting uploaded file for extraction, add the file to dataset state
				dispatch(addFileToDataset(ADD_FILE_TO_DATASET, file_json));
			}
			else {
				dispatch(setExtractionStatus(`Error in clowder upload of file ${file.name}`));
			}
		}
		else {
			// console.error("Error in dataset creation");
			dispatch(setExtractionStatus("Error in dataset creation"));
			dispatch(resetFileToDefault());
			dispatch(resetDatasetToDefault());
			dispatch(resetPdfPreviewToDefault());
			dispatch(resetStatementToDefault());
			dispatch(resetUserCategoryToDefault());
		}
	};
}

