require("dotenv").config();
const indexingService = require("./indexingService.js");
const fs = require("fs");
const JSZip = require("jszip");
const crypto = require("crypto-browserify");
var nameToImdb = require("name-to-imdb");
var movier = require("movier")
var pinCIDs;
import ("./ipfs/ipfsNode.mjs").then(ipfsNode => pinCIDs = ipfsNode.pinCIDs)
const { IExec, utils } = require("iexec");
var metadata = require("../databases/MetaData.json");

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;

const ethProvider = utils.getSignerFromPrivateKey(
  "https://bellecour.iex.ec", // blockchain node URL
  PRIVATE_KEY
);
const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = {
  smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec",
};
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

const downloadResult = async (taskId, firstIndexingDate) => {
  const taskResult = await iexec.task.fetchResults(taskId);

  console.log("Task result", await taskResult);
  const url = await taskResult.url;
  console.log("\nurl", url);
  const binary = await taskResult.arrayBuffer();
  console.log("Response binary", binary);
  console.log("\n-----------------------------------------------\n");

  let zipInstance = new JSZip();
  let resultFileString = await zipInstance.loadAsync(binary).then((zip) => {
    return zip.file("result.json").async("string");
  });

  let resultFile = JSON.parse(resultFileString);
  console.log("resultFile", JSON.parse(resultFile));
  await updateMetadata(resultFile, firstIndexingDate);
  //metadata.push(JSON.parse(resultFile))
  return JSON.parse(resultFile);
};

const updateMetadata = async (newData, firstIndexingDate) => {
  const parsedMetaData = JSON.parse(newData);

  if (!parsedMetaData.id) {
    parsedMetaData.id = parsedMetaData.uid;
  }

  // TODO trouver une solution pour garder le nombre de downloads
  // censorship resistant.
  if (!parsedMetaData.nbDownloads) {
    parsedMetaData.nbDownloads = 0;
  }

  // TODO : Indexdate retrouver la date du premier deal pour mon wallet
  if (!parsedMetaData.indexDate) {
    parsedMetaData.indexDate = firstIndexingDate;
  }

  if (parsedMetaData && parsedMetaData.category && (parsedMetaData.category === "movie" || parsedMetaData.category === "series")) {
    const imdbInfo = await getIMDBInfo(parsedMetaData.title)
    console.log("imdbInfo", imdbInfo);
    if (!imdbInfo.isCached) {
      var sourceID = ""
      if (imdbInfo && imdbInfo.meta) {
        if (imdbInfo.meta.image.src) parsedMetaData.imdbImageUrl = imdbInfo.meta.image.src; //URL du result
        if (imdbInfo.meta.year)      parsedMetaData.year = imdbInfo.meta.year;
        if (imdbInfo.meta.id)        sourceID = imdbInfo.meta.id;
      }
      console.log("source ID", sourceID)
      const moreDetails = await movier.getTitleDetailsByIMDBId(sourceID);
      if (moreDetails.directors[0].name) {
        parsedMetaData.directedBy = moreDetails.directors[0].name;
      }
      if (moreDetails.casts) {
        var casts = moreDetails.casts;
        var starring = [];
        for (var i = 0; i < casts.length && i < 5; i += 1) {
          var actor = { actorName: casts[i].name, actorImdb: casts[i].source.sourceUrl };
          starring[i] = actor;
        }
        
        parsedMetaData.casts = starring;
      }
      if (moreDetails.mainSource.sourceUrl){
        parsedMetaData.imdbRessourceUrl = moreDetails.mainSource.sourceUrl;
      }
      if (moreDetails.plot) {
        parsedMetaData.description += moreDetails.plot;
      }
    }
  }
  
  try {
    const md = JSON.parse(fs.readFileSync("databases/MetaData.json"))

    const isAlreadyInMD = md.some(item => item.uid === parsedMetaData.uid)

    if (!isAlreadyInMD) {
      indexingService.add(parsedMetaData);
      if (parsedMetaData.chunks) {
        parsedMetaData.chunks.forEach(async chunk => {
          await pinCIDs(chunk.cid)
        });
      }
    }
  } catch (er) {
    console.log(er)
  }
  
  

  /*
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
  // }) */
};

const getIMDBInfo = async (title) => {
  const getIMDBResult = new Promise((resolve, reject) => {
    nameToImdb(title, async function (err, res, inf) {
      try {
        resolve(inf);
      } catch (err) {
          console.log(err)
      }
    });
  });

  const imdbInfo = getIMDBResult.then((info) => {
    return info;
  });

  return await imdbInfo;
};


module.exports = downloadResult;