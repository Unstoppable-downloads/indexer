require("dotenv").config();
const fs = require('fs');
const JSZip = require("jszip");
const crypto = require("crypto-browserify");
const { IExec, utils } = require("iexec");
var metadata = require("../databases/MetaData.json")

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;

const ethProvider = utils.getSignerFromPrivateKey(
    'https://bellecour.iex.ec', // blockchain node URL
    PRIVATE_KEY,
);
const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = {
  smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec",
};
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

const downloadResult = async (taskId) => {
  const taskResult = await iexec.task.fetchResults(taskId);

  console.log("Task result", await taskResult);
  const url = await taskResult.url;
  console.log("\nurl", url);
  const binary = await taskResult.arrayBuffer();
  console.log("Response binary", binary);
  console.log("\n-----------------------------------------------\n");

  let zipInstance = new JSZip()
  let resultFileString = await zipInstance.loadAsync(binary)
    .then((zip) => {
    return zip.file("result.json").async("string");
  });

  let resultFile = JSON.parse(resultFileString);
  console.log("resultFile", JSON.parse(resultFile));
  updateMetadata(resultFile)
  //metadata.push(JSON.parse(resultFile))
  return JSON.parse(resultFile);

};

const updateMetadata = (newData) => {
  fs.readFile("databases/MetaData.json", (err, data) => {
    if (err) throw err;
    var parseMetadata = JSON.parse(data);
    console.log("Previous data \n", parseMetadata);
    parseMetadata.push(JSON.parse(newData))
    fs.writeFile("databases/MetaData.json", JSON.stringify(parseMetadata), (err) => {
        if(err) throw err;
    })
  });
  // fs.writeFile("databases/MetaData.json", newData, (err) => {
  //   if(err) throw err;
  // })
}



module.exports = downloadResult;