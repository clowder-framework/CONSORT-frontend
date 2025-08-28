# CONSORT

custom react frontend working with consort clowder instance

## Install Dependencies
- Install node version 22.0.0, npm version 10.5.1
- Run `npm install`

## Run Project

- Set the environment variables in `server/.env` file. See `.template.env` file.
- Set CLOWDER_PREFIX, CILOGON_CALLBACK_URL, and CLOWDER_REMOTE_HOSTNAME values different for Consort instance (https://consort.clowderframework.org) and local development
- run `npm start` to build react client and start the express server.

### Dev
run `npm start`

## Build and push image to NCSA hub

- Run `docker build . -t hub.ncsa.illinois.edu/clowder/consort-frontend:<version>` to build docker image
- If you ran into error `[Errno 28] No space left on device:`, try below:
    - Free more spaces by running `docker system prune --all`
    - Increase the Disk image size. You can find the configuration in Docker Desktop

- Login first: `docker login hub.ncsa.illinois.edu`
- Run `docker image push hub.ncsa.illinois.edu/clowder/consort-frontend:<version>`


## Local testing
1. Change package.json start to  `"start": "npm-run-all --parallel open:src"`. This will not build the server side.
2. `utils.common.js` instead of axios request, return the clowder specific api key as in comments.
3. In `route.tsx` import `import CreateAndUpload from "./components/childComponents/CreateAndUpload";` and add `<Route path="/create/" element={<CreateAndUpload/>}/>`
4. Go to localhost:3000/create to test the basic functionality without login.

### Test only Preview components
1. Change `src/components/Preview.js` 
```
import Pdf from "./previewers/Pdf";
<Box className="filePreview">
     <Pdf />
</Box>
```
2. Change `components/previewers/Pdf.js ` to import a static pdf and json file directly from local directory.
```
import pdfFile from "../../../main.pdf";
import metadataFile from "../../../main.json";
if (metadata == undefined){
    let content = metadataFile['content'][0];
    setContent(content);
}
<Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
```
3. On terminal type "npm start". Point browser to localhost:3000/preview


## Code explanation
1. Server side
- Code `./server`
- Does auth using CILogon.
- RCTDB (postgresDB) schema and connection will be configured here.

2. Client side.
- Code `./src`
- `app.config.js` has some default configs on the extractor names - which extractor to trigger.
- `routes.tsx` defines the routes. 
- When user is signed in, `/home` route is provided. There's seperate route for Preview and FAQ page.
- `/home` route 

2.1. CreateAndUpload component
- `CreateAndUpload` is the main component
- The dropbox for file upload accepts pdf,doc and docx formats.
- The statment choice and report/preview choice should be done before dropping the file. Once an accepted file format is dropped, the extractors are triggered with the default choice of values(radio button values).
- The component calls a `createUploadExtract` thunk function in `actions/client.js`
- The component waits till a json file is created in the dataset in `highlights_file_loop` code. This highlights json file has the information needed to render the preview components. The loop checks every 5s for a json file existing in the dataset.
- The "View Results" button will either download the report or navigate to `preview` page to show the highglited preview.

2.2 actions/client.js
- Creates an empty dataset with the same name as the uploaded filename
- Uploads the file
- Calls `wordPipieline` `pdfPipeline` whether the filetype is pdf/word.

2.3 wordPipeline `utils.word_pipeline.js`
- Submits file for extraction to sOffice extractor.
- Checks if a pdf file is generated. 
- Once pdf file is generated, triggers the `pdfPipeline`

2.4 pdfPipeline `utils.pdfPipeline`
- submits file for extraction to pdf2text extractor
- Checks if a csv file is generated.
- Once csv is generated, triggers the `csvPipeline`

2.5 csvPipeline `utils.csv_pipeline`
- Submits file for rct-extractor
- Checks if a dataset metada is created with the extractor name of rct-extractor.

3. Previews
- FilePreview component is shown in `/preview` route.
- Get file previews using method `getPreviewResources`
- If the preview type is "thumbnail" or "pdf" the original pdf file with highlights and a PreviewDrawerLeft component is shown.

4. Pdf Preview
- The pdf file rendering with canvas highlights is done in this component. In `components/previewers/Pdf.js`
- The content from the highlights json file is used to render this.
- The highlights/content is rendered page py page using method `getPageHighlights`
- The colors used for highlights for different statement (spirit/consort) is in `components/styledComponents/HighlightColors.js`
- The labels for the sentences are placed on the sides/margin of the page next to the sentence. Theres a collision avoidance mechanism given that there can be multiple labels per sentence. From the testings, 3 labels per sentence can be shown without major rendering issues.

5. PdfDrawerLeft component
- This component drives the left side drawer. In file `childComponents/PreviewDrawerLeft`
- Uses the data in highlights json file to render this



