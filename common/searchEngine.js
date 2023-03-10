const MAX_SEARCH_RESULT = 1000;
const MiniSearch = require('minisearch');
let _dataAccess;

let miniSearch = new MiniSearch({
    fields: ['title', 'fileName', 'description'],
    storeFields: ['uid', 'title', 'fileName', 'description', 'category', 'fileSize', 'hash', 'chunks', 'indexDate', 'nbDownloads', 'lastDownloadDate'],
    searchOptions: {
        boost: { title: 2 },
        fuzzy: 0.2
    }

});


exports.init = function (dataAccess) {
    _dataAccess = dataAccess;
    let allItems = _dataAccess.getAll();

    if (allItems) {
        allItems = allItems.map((item) => {
            item.id = item._id;
            return item;
        });

        this.indexDocuments(allItems)
    }
}
exports.indexDocuments = function (items) {
    miniSearch.addAll(items);
    console.log("Added all documents !");

}


exports.indexDocument = function (item) {
    miniSearch.add(item);
    _dataAccess.add(item);
}

exports.search = function (searchTerms, categories, count) {
    count = undefined == count ? MAX_SEARCH_RESULT : count;

    let results = miniSearch.search(searchTerms);

    if (results && results.length > 0 && categories && categories.length > 0) {
        results = results.filter(item => {
                // TODO: s'assurer ques toutes les categories (parames et celle stockee sont en minuscule)
                return categories.indexOf(item.category) != -1;
        });
    }

    if (results && results.length > count) {
        results = results.slice(0, count);
    }

    results = results.sort((a, b) => {
        const titleA = a.title.toUpperCase();
        const titleB = b.title.toUpperCase();
        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });

    return results;
}


exports.searchRecent = function (categories, count) {
    let documents = _dataAccess.getAll();
    var cutOffDate = new Date();
    cutOffDate.setMonth(cutOffDate.getMonth() - 3);


    console.log(cutOffDate)
    let results = documents.filter((item) => {
        // console.log(item.indexDate, Math.round(cutOffDate.getTime() / 1000))
        return item.indexDate * 1000 > cutOffDate.getTime()
    });
   


    results = results.sort((a, b) => { return b.indexDate - a.indexDate });
    count = undefined == count ? MAX_SEARCH_RESULT : count;

    if (results && results.length > 0 && categories && categories.length > 0) {
        results = results.filter(item => {
            return categories.indexOf(item.category) > -1
        });
    }

    if (results && results.length > count) {
        results = results.slice(0, count);
    }

    return results;
}