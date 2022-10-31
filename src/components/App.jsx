import React, {useEffect, useState} from "react";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {makeStyles} from "@material-ui/core/styles";
import {fetchFileMetadata} from "../utils/file";
import {downloadThumbnail} from "../utils/thumbnail";
import Dashboard from "./Dashbard";
import Dataset from "./Dataset";
import File from "./File";
import {
	deleteFile as deleteFileAction,
	fetchFileExtractedMetadata,
	fetchFileMetadataJsonld,
	fetchFilePreviews
} from "../actions/file";
import {
	deleteDataset as deleteDatasetAction,
	fetchDatasetAbout,
	fetchDatasets,
	fetchFilesInDataset
} from "../actions/dataset";
import {useDispatch, useSelector} from "react-redux";

const useStyles = makeStyles((theme) => ({}));

export default function App(props) {
	const [selectedFileId, setSelectedFileId] = useState("");
	const [selectedFilename, setSelectedFilename] = useState("");
	const [selectedDatasetId, setSelectedDatasetId] = useState("");
	const [selectedDatasetName, setSelectedDatasetName] = useState("");
	const [fileMetadataList, setFileMetadataList] = useState([]);

	const [paths, setPaths] = useState([]);


	const datasetAbout = useSelector((state) => state.dataset.about);

	// for breadcrumbs
	useEffect(() => {
		if (datasetAbout !== undefined && datasetAbout["name"] !== undefined) {
			setSelectedDatasetName(datasetAbout["name"]);
			setPaths([
				{
					"name": datasetAbout["name"],
					"id": selectedDatasetId,
					"type": "dataset"
				}
			]);
		}
	}, [datasetAbout])

	useEffect(() => {
		fileMetadataList.map((fileMetadata) => {
			if (selectedFileId === fileMetadata["id"]) {
				if (fileMetadata !== undefined && fileMetadata["metadata"]["filename"] !== undefined) {
					setSelectedFilename(fileMetadata["metadata"]["filename"]);
					setPaths([
						{
							"name": selectedDatasetName,
							"id": selectedDatasetId,
							"type": "dataset"
						},
						{
							"name": fileMetadata["metadata"]["filename"],
							"id": selectedFileId,
							"type": "file"
						}
					]);
				}
			}
		});
	}, [selectedFileId])

	const goToPath = (pathType, id) => {
		if (pathType === "dataset") {
			selectDataset(id);
			setSelectedFileId("");
		} else {
			setSelectedDatasetId("");
			setSelectedFileId("");
			setPaths([]);
		}
	}

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs paths={paths} goToPath={goToPath}/>
				{
					(() => {
						if (selectedDatasetId === "") {
							return <Dashboard />
						} else if (selectedFileId === "") {
							return <Dataset />
						} else {
							return fileMetadataList.map((fileMetadata) => {
								if (selectedFileId === fileMetadata["id"]) {
									return (
										<File fileMetadata={fileMetadata["metadata"]}
											  fileMetadataJsonld={fileMetadataJsonld}
											  filePreviews={filePreviews}
											  fileId={selectedFileId}/>
									)
								} else {
									return <></>;
								}
							});
						}
					})()
				}
			</div>
		</div>
	);
}
