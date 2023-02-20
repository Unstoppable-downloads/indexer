require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require('child_process');
const { IExec, utils } = require('iexec');
const { APP_ADDRESS, PRIVATE_KEY, TEE_TAG } = process.env;


const indexingService = require("./common/indexingService.js");

const DEBUG = process.env.LOGLEVEL === "debug";
// const bodyParser = require('body-parser');

// Initialising app
const app = express();

app.use(express.json());
app.use(bodyParser.json());


var corsOptions = {
    "origin": "http://localhost:3000",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}


app.use(cors({ origin: true, credentials: true }));

const main = async () => {
    await indexingService.init();
};



/////////////////////////////////
///////// API ENDPOINTS /////////
/////////////////////////////////

app.options('*', cors()); // include before other routes

// hello world
app.get("/", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/search", (req, res) => {
    let foo = { "foo": "bar" };

    console.log("req.params", req.query);
    let categories = [];

    try {
        categories = JSON.parse(req.query.categories);
    } catch (e) {

    }
    let result = indexingService.search(req.query.terms, categories, req.query.count)
    res.set('Access-Control-Allow-Origin', '*');
    res.json(result);
});

app.get("/searchOne", (req, res) => {
    console.log("req.params", req.query);
    let categories = [];

    let result = indexingService.searchOne(req.query.terms, categories, req.query.count, req.query.uid)
    res.set('Access-Control-Allow-Origin', '*');
    res.json(result);
})

app.get("/recent", (req, res) => {
    let foo = { "foo": "bar" };
    console.log("req.body", req.body)
    console.log("req.params", req.query)
    let categories = [];

    try {
        categories = JSON.parse(req.query.categories);
    }
    catch (e) {

    }
    let result = indexingService.searchRecent(req.query.categories, req.query.count)
    res.set('Access-Control-Allow-Origin', '*');
    res.json(result);
})


process.on('uncaughtException', function (err) {
    console.error(process.pid, '- Caught exception unhandled exception: ', err);
});

process.on('unhandledRejection', function (error, p) {
    console.error(process.pid, "- \x1b[31m", "Error: ", error.message, "\x1b[0m");
});

/*
(async ()=>{
    await main();
    const users =  await User.find();
    console.log(users) ;
    
})();

return ;  */

const startTunnel = function (port) {
    let cmd = "ngrok http " + port + " &";
    console.log(cmd);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }

        console.log(`stdout:\n${stdout}`);
    });

    return;
}


let port = process.env.PORT || 5012
const server = app.listen(port, async () => {

    const ethProvider = utils.getSignerFromPrivateKey(
        'https://bellecour.iex.ec', // blockchain node URL
        PRIVATE_KEY,
    );


    console.log("🚀 app is running on port ", port);
    console.log("Running on process id", process.pid);
    console.log("LOGLEVEL:", process.env.LOGLEVEL, "DEBUG", DEBUG);
    console.log("indexer wallet address", ethProvider.address)
    console.log("app address", process.env.APP_ADDRESS)


    startTunnel(port);
    //await init();
    await main();
});