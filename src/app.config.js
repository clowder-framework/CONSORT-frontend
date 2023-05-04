let config = {};
let hostname = process.env.CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
let apikey = process.env.APIKEY;

config["hostname"] = hostname;
config["apikey"] = apikey;
// space id for Consort Client
config["space"] = "645177dfe4b03d8d787951ea";
// setting extract to true will trigger extrations on files automatically
config["extract"] = false;
// extractor name for RCT Transparency extractor. Triggers on text and runs the consort model on the text file
config["rct_extractor"] = "ncsa.rctTransparencyExtractor";
// extractor name for pdf2text extractor based on Allen AI tool. Triggers on pdf and converts pdf to xml, json and text files
config["pdf_extractor"] = "extractors-pdf2text";

export default config;
