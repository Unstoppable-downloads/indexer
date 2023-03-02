require("dotenv").config();
const { IExec, utils } = require("iexec");
const createHttpLink = require("apollo-link-http").createHttpLink;
const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const gql = require("graphql-tag");
const crypto = require("crypto-browserify");
const fetch = require("node-fetch");
const delay = require("../utils/delay");
const downloadResult = require("./download");
const observe = require("../utils/observe");
const dataQuery = require("./dataQuery");
const { getAppOrders, getWorkerpoolOrders, getDatasetOrders } = require("./getOrders.js");
const { STATUS_COMPLETED_TASK } = require("./indexingService");

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

const getDatasetOrderToMatch = async function (datasetId) {
  var datasetOrders = await getDatasetOrders(datasetId);
  var datasetOrderToMatch;
  if (datasetOrders && datasetOrders[0]) {
    datasetOrderToMatch = datasetOrders[0];
  }
  return datasetOrderToMatch;
};

const makeRequestOrder = async function (datasetId) {
  const requestOrderTemplate = await iexec.order.createRequestorder({
    app: APP_ADDRESS,
    category: 0,
    dataset: datasetId,
    workerpool: WORKERPOOL_ADDRESS,
    tag: "tee",
  });
  console.log("Request order", requestOrderTemplate);
  console.log("-----------------------------------------------");

  const signedRequestOrder = await iexec.order.signRequestorder(requestOrderTemplate);
  console.log("signedRequestOrder:", signedRequestOrder);
  await iexec.order.publishRequestorder(signedRequestOrder);

  return signedRequestOrder;
};

const pollRegistry = async function () {
  console.log("Starting indexing");
  let datasets = await getDatasets();
  console.log("# of datasets", datasets.length);
  console.log("\n-----------------------------------------------\n");

  const indexerWallet = await iexec.wallet.getAddress();
  console.log("Indexer's wallet", indexerWallet);
  console.log("\n-----------------------------------------------\n");

  const ipfsToken = await iexec.storage.defaultStorageLogin();
  console.log("ipfsToken", ipfsToken);
  const { isPushed } = await iexec.storage.pushStorageToken(ipfsToken, {
    forceUpdate: true,
  });
  console.log("Default storage initialized:", isPushed);
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

  datasets.forEach(async (dataset) => {
    console.log(dataset.id);
    let datasetOrderToMatch = await getDatasetOrderToMatch(dataset.id);

    const datasetOrderHasDeals = dataset.orders.length > 0 && dataset.orders[0] &&
      dataset.orders[0].deals && dataset.orders[0].deals[0]
      ? true : false;
    console.log("DatasetOrder has deals ?", datasetOrderHasDeals);

    var datasetOrderHasDealsWithIndexer = false;
    var skipTaskExecution = false;

    if (datasetOrderHasDeals === true) {
      //c.log(dataset.orders[0].deals[0].tasks)

      for (let j = 0; j < dataset.orders[0].deals.length; j++) {
        let oneDeal = await iexec.deal.show(dataset.orders[0].deals[j].id);
        if (oneDeal.requester === indexerWallet) {
          datasetOrderHasDealsWithIndexer = true;

          const tskId = oneDeal.tasks[0];
          const theTask = await iexec.task.show(tskId);
          console.log("theTask", theTask);

          skipTaskExecution =
            skipTaskExecution ||
            theTask.statusName === "COMPLETED" ||
            theTask.statusName === "REVEALING" ||
            theTask.statusName === "CLAIMED" ||
            theTask.statusName === "ACTIVE";

          console.log("oneDeal start time ", oneDeal.startTime.toNumber())
          let firstDealDateTime = oneDeal.startTime.toNumber();

          if (theTask.status === STATUS_COMPLETED_TASK) {
            console.log("Loading result for taskid", theTask.taskid);
            await downloadResult(theTask.taskid, firstDealDateTime);
            requireTaskExecution = false;
            break;
          }
        }
      }
    }

    if (!skipTaskExecution) {
      await delay(3);
      console.log("\n-----------------------------------------------\n");
      console.info("Fetching apporder from iExec Marketplace");
      console.log("-----------------------------------------------");
      console.info("Fetching workerpoolorder from iExec Marketplace");
      console.log("-----------------------------------------------");
      console.info("Using dataset", dataset.id);
      console.info("Fetching datasetorder from iExec Marketplace");
      console.log("-----------------------------------------------");
      console.info("Creating requestorder");
      let requestOrderToMatch = await makeRequestOrder(dataset.id);
      console.log("\n-----------------------------------------------\n");

      console.log("App order", appOrderToMatch);
      console.log("-----------------------------------------------");
      // console.log("Workerpool order", workerpoolOrderToMatch);
      console.log("Dataset order", datasetOrderToMatch);
      console.log("-----------------------------------------------");
      console.log("Request order", requestOrderToMatch);
      console.log("\n-----------------------------------------------\n");

      console.info("Matching orders...");
      const { dealid, txHash } = await iexec.order.matchOrders({
        apporder: appOrderToMatch.order,
        datasetorder: datasetOrderToMatch.order,
        workerpoolorder: workerpoolOrderToMatch.order,
        requestorder: requestOrderToMatch,
      });
      console.info("Deal submitted with dealid", dealid);
      console.log("\n-----------------------------------------------\n");

      const deal = await iexec.deal.show(dealid);
      console.log("Deal details", deal);


    //   const waitFinalState = async (taskid, dealid) => {
    //     new Promise((resolve, reject) => {
    //       observe(resolve, reject, taskid, dealid);
    //     });
    //   };
    //   console.log("task id", deal.tasks[0]);
    //   const task = await waitFinalState(deal.tasks[0], dealid);
    //   console.log("Task", task);
      //await downloadResult(task.taskid)
    }

    console.log("\n-----------------------------------------------");
    console.log("------------ Finished with dataset ------------");
    console.log("-----------------------------------------------\n");
  });


  // pour chaque dataset retourné, verifié s'il n'est pas deja traité par ce process (garder une liste des dataset addresses )
  // s'il n'est pas deja traité (c-a-d si il n'est pas dans la liste des dataset adress traité), alors il faut passer l'ordre d'achat et lancer la tache
  // pour recuperer le metadata contenu dans le dataset
  // Ajouter le metadata dans la liste en appelant searchEngine.indexDocument (metadata)
  // ...
  // A la fin de la boucle, il faut relancer pollRegistry  avec un setTimeout(pollRegistry, 30 minutes)
};
module.exports.pollRegistry = pollRegistry;