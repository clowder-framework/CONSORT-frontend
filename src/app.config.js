let config = {};
let hostname = process.env.REACT_APP_CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
let apikey = process.env.REACT_APP_CLOWDER_APIKEY;

config["hostname"] = hostname;
config["apikey"] = apikey;

export default config;
