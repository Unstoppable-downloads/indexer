const indexingService = require("../common/indexingService.ts");
const DEBUG = process.env.LOGLEVEL == "debug";

console.log("LOGLEVEL:", process.env.LOGLEVEL, "DEBUG", DEBUG);

var args = process.argv.slice(2);
console.log("searching", args[0]) ;
indexingService.init() ; 

let searchResult = indexingService.searchRecent(["movie"], 1) ; 

console.log("result, ", searchResult )  ;