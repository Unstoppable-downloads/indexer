require("dotenv").config();

const express = require("express");
var nameToImdb = require("name-to-imdb")

(async function test() {
    console.log("nameToImdb", nameToImdb)

    // const getIMDBResult = new Promise((resolve, reject) => {
    //     nameToImdb("Saw", function (err, res, inf) {
    //         // try {
    //         //     console.log(res); // "tt0121955"
    //         //     // inf contains info on where we matched that name - e.g. metadata, or on imdb
    //         //     // and the meta object with all the available data
    //         //     // console.log("result", inf);
    //         //     return inf;
                
    //         // } catch (err) {
    //         //     console.log(err)
    //         // }
    //         // console.log("inf", inf)
    //         resolve(inf);
    //     })
    // })
    // let info = await getIMDBResult;
    //console.log(info)
})