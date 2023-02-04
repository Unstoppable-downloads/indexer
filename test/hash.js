require("dotenv").config();
const   createHash  = require ("crypto-browserify").createHash;

let appid = process.env.APP_ADDRESS.toLowerCase()  ; 

console.log("appid", appid) ;   

let apphash  = createHash('sha256').update(appid).digest('hex');

console.log("app hash", apphash) ; 