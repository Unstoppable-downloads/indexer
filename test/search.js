const indexingService = require("../common/indexingService.ts");
const DEBUG = process.env.LOGLEVEL == "debug";

console.log("LOGLEVEL:", process.env.LOGLEVEL, "DEBUG", DEBUG);

var args = process.argv.slice(2);
console.log("searching", args[0]) ;
indexingService.init() ; 

let searchResult = indexingService.search(args[0])

console.log("result, ", searchResult )  ;