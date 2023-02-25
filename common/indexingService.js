require("dotenv").config();
const { IExec, utils } = require('iexec');


const decompress = require("decompress");
const fetch = require("node-fetch");
const searchEngine = require("./searchEngine");
const dataAccess = require("./dataAccess");
const FETCHING_DATA_INTERVAL = 30000; // in 
const STATUS_COMPLETED_TASK = 3;
exports.STATUS_COMPLETED_TASK = STATUS_COMPLETED_TASK;

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;

const ethProvider = utils.getSignerFromPrivateKey(
    "https://bellecour.iex.ec", // blockchain node URL
    PRIVATE_KEY
);

const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = { smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec" };
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

const { pollRegistry } = require("./pollRegistry");
const DEBUG = process.env.LOGLEVEL === "debug";


module.exports.init = function() {
    searchEngine.init(dataAccess);
    pollRegistry()

    setInterval(() => {
      pollRegistry()
    }, 500000)
};

module.exports.add = function(item) {
    // TODO: check first if items does not already exists before inserting ... 
    dataAccess.add(item);
    searchEngine.indexDocument(item);
};

module.exports.search = function(terms, categories, count) {
    return searchEngine.search(terms, categories, count);
};

module.exports.searchRecent = function(categories, count) {
    return searchEngine.searchRecent(categories, count);
};

module.exports.searchOne = function(terms, categories, count, uid) {
    let items = searchEngine.search(terms, categories, count);

    for (var i = 0; i < items.length; i++) {
        if (items[i].uid === uid) {
            return items[i];
        }
    }
    return null
}