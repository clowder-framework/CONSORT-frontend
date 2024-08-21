// RCT pipeline for pdf files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {csvPipeline} from "../utils/csv_pipeline";

// pdf_pipeline function
export async function pdfPipeline(file_json, dataset_json, config, clientInfo) {

    const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;

    const pdf_extraction_submission = await submitForExtraction(fileid, config.pdf_extractor, clientInfo);
    if (pdf_extraction_submission) {
        const pdf_extraction_metadata = await getDatasetMetadataLoop(datasetid, config.pdf_extractor, clientInfo);
        if (pdf_extraction_metadata !== null){
            console.log("Pdf extraction done");
            const fileNameWithoutExtension = filename.split('.').slice(0, -1).join('.');
			const csv_file_name = fileNameWithoutExtension + '.csv';
            const extracted_csv_file = await getFileInDataset(datasetid, "text/csv", csv_file_name, clientInfo);
            if (extracted_csv_file !== null && typeof extracted_csv_file.id === "string") {
                console.log("Csv file found after pdf extraction");
                console.log("Extracted csv file", extracted_csv_file);
                const csv_pipeline_status = await csvPipeline(extracted_csv_file, dataset_json, config, clientInfo)
                return csv_pipeline_status;
            }
            else {
                console.error("Csv file not found after pdf extraction");
                return false;
            }
        }
        else {
            console.error("Pdf extraction dataset metadata not found");
            return false;
        }
    }
    else {
        console.error("Pdf extraction submission failed");
        return false;
    }

}
