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