# CONSORT

custom react frontend working with consort clowder instance

## Install Dependencies

run `npm install`

## Run Project

- Set the environment variables in `server/.env` file. See `.template.env` file.
- Set CLOWDER_PREFIX, CILOGON_CALLBACK_URL, and CLOWDER_REMOTE_HOSTNAME values different for Consort instance (https://consort.clowderframework.org) and local development
- run `npm start` to build react client and start the express server.

## Codegen

### Prod

run `npm run codegen`

### Dev

run `npm run codegen:dev`

## Build and push image to NCSA hub

- Run `docker build . -t hub.ncsa.illinois.edu/clowder/consort-frontend:<version>` to build docker image
- If you ran into error `[Errno 28] No space left on device:`, try below:
    - Free more spaces by running `docker system prune --all`
    - Increase the Disk image size. You can find the configuration in Docker Desktop

- Login first: `docker login hub.ncsa.illinois.edu`
- Run `docker image push hub.ncsa.illinois.edu/clowder/consort-frontend:<version>`
