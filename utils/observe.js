const { IExec, utils } = require("iexec");

const { APP_ADDRESS, WORKERPOOL_ADDRESS, TEE_TAG, PRIVATE_KEY } = process.env;
const DEBUG = process.env.LOGLEVEL === "debug";

const ethProvider = utils.getSignerFromPrivateKey(
  "https://bellecour.iex.ec", // blockchain node URL
  PRIVATE_KEY
);

const configArgs = { ethProvider: ethProvider, chainId: 134 };
const configOptions = { smsURL: "https://v7.sms.debug-tee-services.bellecour.iex.ec" };
// const configOptions = { smsURL: "https://v7.sms.prod-tee-services.bellecour.iex.ec" };
const iexec = new IExec(configArgs, configOptions);

async function observe(resolve, reject, taskid, dealid) {
  var taskState;
  console.log(taskid);
  console.log(dealid);
  await iexec.task.obsTask(taskid).subscribe({
    next: ({ task }) => { taskState = task; },
    error: (e) => reject(e),
    complete: () => resolve(taskState),
  });
}

module.exports = observe;