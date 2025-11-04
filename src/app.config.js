let config = {};
// CLOWDER_REMOTE_HOSTNAME and APIKEY are no longer needed on the client
// All API calls are proxied through the Express server

// space id for Consort Client
config["space"] = "645177dfe4b03d8d787951ea";
// setting extract to true will trigger extractions on files automatically
config["extract"] = false;
// extractor name for RCT Transparency extractor. Triggers on text and runs the consort model on the text file
config["rct_extractor"] = "ncsa.rctTransparencyExtractor";
// extractor name for pdf2text extractor based on Allen AI tool. Triggers on pdf and converts pdf to xml, json and text files
config["pdf_extractor"] = "pdf2text-extractor";
// extractor name for pdf2text extractor based on PyMUPDF. Triggers on pdf and converts pdf to xml, json and text files
config["pymupdf_extractor"] = "pymupdf-extractor";
// extractor name for SOffice extractor. Triggers on word files and converts them to pdf.
config["soffice_extractor"] = "soffice-extractor";
// Add default statement type
config["statementType"] = "spirit";
// Add default user category
config["userCategory"] = "author";

export default config;
