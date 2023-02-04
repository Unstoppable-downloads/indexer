require("dotenv").config();
const ApolloClient = require("apollo-client").ApolloClient;
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const gql = require("graphql-tag");
const crypto = require("crypto-browserify");
const { IExec, utils } = require("iexec");

const fetch = require("node-fetch");
const searchEngine = require("./searchEngine");
const dataAccess = require("./dataAccess");
const dataQuery = require("./dataQuery");
const FETCHING_DATA_INTERVAL = 30000; // in ms

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;

const ethProvider = utils.getSignerFromPrivateKey(
  "https://bellecour.iex.ec", // blockchain node URL
  PRIVATE_KEY
);

const iexec = new IExec({
  ethProvider,
});

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

  var datasetOrders = await getDatasetOrders(datasets[5].id);
  var datasetOrderToMatch = null;
  if (datasetOrders && datasetOrders[0]) {
    datasetOrderToMatch = datasetOrders[0];
  }

  const requestOrderTemplate = await iexec.order.createRequestorder({
    app: APP_ADDRESS,
    category: 0,
    dataset: datasets[5].id, // this is dataset 0xB7E4878629A6dbF16056891a5703D4439a6325ec
    workerpool: WORKERPOOL_ADDRESS,
    tag: "tee",
  });
  console.log("Request order", requestOrderTemplate);
  console.log("\n-----------------------------------------------\n");


  const signedRequestOrder = await iexec.order.signRequestorder(
    requestOrderTemplate
  );
  console.log("signedRequestOrder:", signedRequestOrder);

//   console.log("-----------------------------------------------");
//   console.log("Matching orders...");
//   console.log("App order", appOrderToMatch);
//   //   console.log("Workerpool order", workerpoolOrderToMatch);
//   console.log("Dataset order", datasetOrderToMatch);

//   const { dealid, txHash } = await iexec.order.matchOrders({
//     apporder: appOrderToMatch.order,
//     datasetorder: datasetOrderToMatch.order,
//     workerpoolorder: workerpoolOrderToMatch.order,
//     requestorder: signedRequestOrder,
//   });

//   console.log("deal id:", dealid);
//   console.log("Tx hash", txHash);
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