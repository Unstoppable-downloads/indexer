require("dotenv").config();
const crypto = require("crypto-browserify");
const { IExec, utils } = require('iexec');

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;
const DEBUG = process.env.LOGLEVEL === "debug";

const ethProvider = utils.getSignerFromPrivateKey(
  'https://bellecour.iex.ec', // blockchain node URL
  PRIVATE_KEY,
);

const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = { smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec" };
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

const getAppOrders = async () => {
 const { count, orders } = await iexec.orderbook.fetchAppOrderbook(
        APP_ADDRESS, {
            workerpool: WORKERPOOL_ADDRESS,
        }
    );
    // console.log("total orders:", count);
    // console.log("App orders:", orders);
    return orders;
};


const getWorkerpoolOrders = async() => {
  const { orders } = await iexec.orderbook.fetchWorkerpoolOrderbook({
      workerpool: WORKERPOOL_ADDRESS,
      category: 0,
      minTag: TEE_TAG,
      maxTag: TEE_TAG,
  });
  // console.log("Workerpool orders", orders);
  return orders;
};

const getDatasetOrders = async(datasetAddress) => {
  const { orders } = await iexec.orderbook.fetchDatasetOrderbook(
      datasetAddress, {
          app: APP_ADDRESS,
          minTag: TEE_TAG,
          maxTag: TEE_TAG,
      }
  );
  // console.log("dataset orders", orders);
  return orders;
};

module.exports = { getAppOrders, getWorkerpoolOrders, getDatasetOrders }