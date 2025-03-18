// RCT pipeline for pdf files
import {getDatasetMetadataLoop, getFileInDataset} from "../utils/dataset";
import {submitForExtraction} from "../utils/file";
import {csvPipeline} from "../utils/csv_pipeline";

// pdf_pipeline function
export async function pdfPipeline(file_json, dataset_json, config, clientInfo) {

    const fileid = file_json.id;
	const filename = file_json.filename;
	const datasetid = dataset_json.id;
    const statementType = config.statementType;
    const userCategory = config.userCategory;
    let pdf_extractor = config.pdf_extractor; // default pdf extractor is grobid for researcher category
    if (userCategory === "author") {
        pdf_extractor = config.pymupdf_extractor; // report only pdf extractor for author category
    }

    const pdf_extraction_submission = await submitForExtraction(fileid, pdf_extractor, statementType, clientInfo)
    if (pdf_extraction_submission) {
        const pdf_extraction_metadata = await getDatasetMetadataLoop(datasetid, pdf_extractor, clientInfo);
        if (pdf_extraction_metadata !== null && pdf_extraction_metadata !== undefined){
            console.log("Pdf extraction done");
            console.log("Pdf extraction metadata", pdf_extraction_metadata);
            let csv_file_id = null;
            let csv_file_name = null;
            let extracted_csv_file = null;
            if (pdf_extraction_metadata.extractor === config.pymupdf_extractor) {
                csv_file_name = pdf_extraction_metadata.extracted_files[2].filename;
            }
            else{
                const fileNameWithoutExtension = filename.split('.').slice(0, -1).join('.');
                csv_file_name = fileNameWithoutExtension + '.csv';
            }
            extracted_csv_file = await getFileInDataset(datasetid, "text/csv", csv_file_name, clientInfo);
            
            if (extracted_csv_file !== null && typeof extracted_csv_file.id === "string") {
                console.log("Extracted csv file found after pdf extraction", extracted_csv_file);
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
