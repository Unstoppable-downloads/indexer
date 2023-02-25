const dbLocal = require("db-local");
const { Schema } = new dbLocal({ path: "./databases" });

/*
const FileChunk = Schema("FileChunk",  {
  cid: { type: String, required: true },
  size: { type: Number, required: true },
  checksum: { type: Number, required: true }, 
  sequence:{ type: Number, required: true },
  byteBegin:{ type: Number, required: true },
  byteEnd:{ type: Number, required: true }
});
*/

const MetaData = Schema("MetaData", {
    _id: { type: String, required: true },
    uid: { type: String, required: true },
    title: { type: String , required: true },
    fileName: { type: String , required: true },
    description: { type: String },
    category: { type:  String, required: true },
    fileSize: { type: Number, required: true },
    imdbImageUrl: {type: String},
    year: {type: Number},
    starring: {type: String},
    hash: { type: String },
    chunks: { type: Array, required: true },
    indexDate: {type: Number, require:true},
    nbDownloads:{ type: Number, required: true },
    lastDownloadDate:{ type: Number },
});


exports.getAll = function ()
{
  return MetaData.find() ; 
}; 

exports.add= function (item) {
  const meta = MetaData.create(item).save()  ;
};
