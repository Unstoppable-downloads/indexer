require("dotenv").config();
const crypto = require("crypto-browserify");
const { IExec, utils } = require('iexec');

const { APP_ADDRESS, PRIVATE_KEY, TEE_TAG } = process.env;
const DEBUG = process.env.LOGLEVEL === "debug";

const ethProvider = utils.getSignerFromPrivateKey(
  'https://bellecour.iex.ec', // blockchain node URL
  PRIVATE_KEY,
);
const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = { smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec" };
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);


function generateDatasetNameLookup() {
  let str = `${APP_ADDRESS}`.toLowerCase();
  return crypto.createHash('sha256').update(str).digest('hex');
}

const datasetRegistryQuery = () => {

  const datasetNameLookup = generateDatasetNameLookup();

  const query = `
    {
      datasets(
        where: {name_contains: "${datasetNameLookup}"}
      ) {
        id
        name
        owner {
          id
        }
        orders {
          id
          deals {
            id
            startTime
            tasks(first: 1) {
              id,
              status
            }
          }
        }
      }
    }`;



  return query;

};


module.exports = { datasetRegistryQuery };