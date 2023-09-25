# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------

FROM node:14.21.2 AS consort-build
#ENV NODE_ENV=production
WORKDIR /usr/src/app

# development or production
#ARG DEPLOY_ENV=""
#ENV DEPLOY_ENV="${DEPLOY_ENV:-}"

# copy only package for caching purposes
COPY ["package.json", "package-lock.json*", "./"]
COPY tools/ /usr/src/app/tools/
RUN npm install

# copy rest of application
COPY .babelrc .eslintrc .istanbul.yml *.js /usr/src/app/
COPY src /usr/src/app/src/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM node:14.21.2
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY --from=consort-build /usr/src/app/dist/ /app/dist
COPY server/ ./
RUN npm install
RUN npm install --build-from-source sqlite3
CMD ["npm", "run", "start"]
