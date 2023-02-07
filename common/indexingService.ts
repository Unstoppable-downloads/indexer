require("dotenv").config();
const ApolloClient = require("apollo-client").ApolloClient;
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const gql = require("graphql-tag");
const crypto = require("crypto-browserify");
const { IExec, utils } = require("iexec");
const JSZip = require("jszip");

const fetch = require("node-fetch");
const searchEngine = require("./searchEngine");
const dataAccess = require("./dataAccess");
const dataQuery = require("./dataQuery");
const delay = require("../utils/delay")
const FETCHING_DATA_INTERVAL = 30000; // in 

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;

const ethProvider = utils.getSignerFromPrivateKey(
  "https://bellecour.iex.ec", // blockchain node URL
  PRIVATE_KEY
);

const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = { smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec" };
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

const {
  getAppOrders,
  getWorkerpoolOrders,
  getDatasetOrders,
} = require("./getOrders.js");
const DEBUG = process.env.LOGLEVEL === "debug";

const getDatasets = async function () {
  const query = dataQuery.datasetRegistryQuery();

  const httpLink = createHttpLink({
    uri: process.env.API_THEGRAPH_URL,
    fetch: fetch,
  });

  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "ignore",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  });

  const res = client
    .query({
      query: gql(query),
    })
    .then(async (data) => {
      if (data && data.data && data.data.datasets) {
        console.log("data.data.datasets", data.data.datasets);
        //let historyItems = await dataQuery.mapInboxOrders(walletAddress, data.data.datasets, true);
        return data.data.datasets;
      }
    })
    .catch((err) => {
      console.log("Error data fetching", err);
      console.error(err);
    });

  return await res;
};

const pollRegistry = async function () {
  let datasets = await getDatasets();
  console.log("# of datasets", datasets.length)
  console.log("\n-----------------------------------------------\n");

  const ipfsToken = await iexec.storage.defaultStorageLogin();
  console.log("ipfsToken", ipfsToken);
  const { isPushed } = await iexec.storage.pushStorageToken(ipfsToken, { forceUpdate: true });
  console.log('Default storage initialized:', isPushed);
  console.log("\n-----------------------------------------------\n");


  var appOrders = await getAppOrders();
  var appOrderToMatch = null;
  if (appOrders && appOrders[0]) {
    appOrderToMatch = appOrders[0];
  }

  var workerpoolOrders = await getWorkerpoolOrders();
  var workerpoolOrderToMatch = null;
  if (workerpoolOrders && workerpoolOrders[0]) {
    workerpoolOrderToMatch = workerpoolOrders[0];
  }

  var datasetOrders = await getDatasetOrders(datasets[0].id);
  var datasetOrderToMatch = null;
  if (datasetOrders && datasetOrders[0]) {
    datasetOrderToMatch = datasetOrders[0];
  }

  const requestOrderTemplate = await iexec.order.createRequestorder({
    app: APP_ADDRESS,
    category: 0,
    dataset: datasets[0].id,
    workerpool: WORKERPOOL_ADDRESS,
    tag: "tee",
  });
  console.log("Request order", requestOrderTemplate);
  console.log("\n-----------------------------------------------\n");


  const signedRequestOrder = await iexec.order.signRequestorder(
    requestOrderTemplate
  );
  console.log("signedRequestOrder:", signedRequestOrder);

  console.log("\n-----------------------------------------------\n");
  console.log("Matching orders...");
  console.log("App order", appOrderToMatch);
  //   console.log("Workerpool order", workerpoolOrderToMatch);
  console.log("Dataset order", datasetOrderToMatch);

  const { dealid, txHash } = await iexec.order.matchOrders({
    apporder: appOrderToMatch.order,
    datasetorder: datasetOrderToMatch.order,
    workerpoolorder: workerpoolOrderToMatch.order,
    requestorder: signedRequestOrder,
  });

  console.log("deal id:", dealid);
  console.log("Tx hash", txHash);
  console.log("\n-----------------------------------------------\n");
  const deal = await iexec.deal.show(dealid);
  console.log("Deal details", deal)
  console.log("\n-----------------------------------------------\n"); 
  // await delay(10)
  // let task = await iexec.task.show(deal.tasks[0])

  // let task = await iexec.task.show("0x8da96c251b6eeb9cbdf56c87c0a63cf668239637fa4b89fe9985bb260bbfa460")
  // console.log("Task[0] details", task)
  // console.log("\n-----------------------------------------------\n");
  // while (task.statusName !== 'COMPLETED') {
  //   await delay(20);
  //   task = await iexec.task.show("0x8da96c251b6eeb9cbdf56c87c0a63cf668239637fa4b89fe9985bb260bbfa460")
  // }

  //const taskResult = await iexec.task.fetchResults(task); // fetch task id from table here
  // console.log("task result", taskResult);
  // const url = await taskResult.url;
  // console.log("", url);
  // const binary = await taskResult.blob();
  // console.log("Response binary", binary);
  // console.log("\n-----------------------------------------------\n");
  // const zipInstance = new JSZip();
  // let resultFileString = await zipInstance.loadAsync(binary).then((zip) => {
  //   return zip.file("result.json").async("string");
  // });

  // let resultFile = JSON.parse(resultFileString);
  // console.log("resultFile", resultFile);
  // return resultFile;

  // pour chaque dataset retourné, verifié s'il n'est pas deja traité par ce process (garder une liste des dataset addresses )
  // s'il n'est pas deja traité (c-a-d si il n'est pas dans la liste des dataset adress traité), alors il faut passer l'ordre d'achat et lancer la tache
  // pour recuperer le metadata contenu dans le dataset
  // Ajouter le metadata dans la liste en appelant searchEngine.indexDocument (metadata)
  // ...
  // A la fin de la boucle, il faut relancer pollRegistry  avec un setTimeout(pollRegistry, 30 minutes)
};

module.exports.init = function () {
  searchEngine.init(dataAccess);

  pollRegistry();
};

module.exports.add = function (item) {
  dataAccess.add(item);
  searchEngine.indexDocument(item);
};

module.exports.search = function (terms, categories, count) {
  return searchEngine.search(terms, categories, count);
};

module.exports.searchRecent = function (categories, count) {
  return searchEngine.searchRecent(categories, count);
};

module.exports.searchOne = function (terms, categories, count, uid) {
  let items = searchEngine.search(terms, categories, count);

  for (var i = 0; i < items.length; i++) {
    if (items[i].uid === uid) {
      return items[i];
    }
  }
  return null
}