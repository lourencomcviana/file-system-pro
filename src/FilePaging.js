(function(){
  var fs = require('fs');
  var Progress = require("./Progress");
  var FileInfo = require("./FileInfo");
  var PagedArray = require("./PagedArray");

  var sizeSymbol = Symbol("size of the page");
  var currentSymbol= Symbol("current page");
  var filesSymbol= Symbol("files to read");
 // var formatSymbol= Symbol("function to run when formating file after loading");
  var progressCallbackSymbol = Symbol("progress report callback");

  function readFile(filename,options){
    
    return new Promise(function (fulfill, reject){
      fs.readFile(filename,options, function (err, res){
        if (err) reject(err);
        else{ 
          let info= FileInfo(filename)
         
          info.options=options;
          info.file=res;
          if(options.format ){
            info.file=options.format(info.file);
          }
          fulfill(info);
        };
      });
    });
  }
  class FilePaging extends PagedArray {
    constructor(files,options) {
        options=PagedArray.options(options);
        options.run=function(item){
          return readFile(item,options);
        }
        super(files,options);
    }

  }

  module.exports=FilePaging;
})()