//Puts fs asyn operations inside Promises
(function() {
  var fs = require('fs');
  var glob = require("glob")
  var Promise = require("bluebird");

  var FilePaging = require("./src/FilePaging");  
  var Progress = require("./src/Progress");
  var FileInfo = require("./src/FileInfo");

 

  module.exports = {
    readFile:readFile,
    readFiles:readFiles,
    writeFile:writeFile,
    writeFiles:writeFiles
   
  };

  var defaultEncoding='UTF-8';
  
  function readFile(filename,options){
    
    return new Promise(function (fulfill, reject){
      fs.readFile(filename,options, function (err, res){
        if (err) reject(err);
        else{ 
          let info= FileInfo(filename)
          info.encoding=encoding;
          info.options=options;
          info.file=res;
          fulfill(info);
        };
      });
    });
  }

  function writeDirRecursive(filename){
    let info= FileInfo(filename);
    
    var fullPath='.';
    for(var id in info.directory){
      fullPath+='/'+info.directory[id]
      if (!fs.existsSync(fullPath)){
        fs.mkdirSync(fullPath);
      }
    }
    return info;
  }

  function writeFile(filename,content,options){
    options=fillOptions({format:'format function'},options)
    
    return new Promise(function (fulfill, reject){
      var info=writeDirRecursive(filename);
      fs.writeFile(filename, content,encoding, function (err){
        if (err) reject(err);
        else{ 
          info.options=options;
          fulfill(info)
        };
      });
    });
  }

  async function writeFiles(files,options){
    options=fillOptions(
      {
        format:'format function',
        progress:'progress report callback'
      }
      ,options)

    progress=new Progress(options.progress,'escrevendo arquivos')
    progress.start(files.length);
    var promisses=[];

    for(var id in files){
      progress.run();
      let file=files[id].file;
      if(options.formater){
        file=options.formater(file)
      }
      promisses.push(
        writeFile(files[id].filePathStr,file)
      );

    }
    
    return Promise.all(promisses);
  }

  function readFiles(globPath,options,progressCallback){
    fillOptions(
      {
        size:100,
        format:undefined
      },options)

    return new Promise(function (fulfill, reject){
      progress=new Progress(progressCallback,'lendo arquivos')
      glob(globPath, options, function (err, files) {


        async function readAllFiles(files){
          var readPromisses=[];
          
          files=removeExceptions(files,options.exceptions)
          
          readPromisses=new FilePaging(files,options);
          return readPromisses;
        }
        readAllFiles(files).then(function(data){
          fulfill(data);
        })

      });
    });
  }

  //for to many files, glob exceptions sintax can be pretty slow. 
  //Thats a simple way to get your huge list of files you don't want to read without 
  //making glob searching a pain.
  function removeExceptions(files,exceptions){
    if(exceptions && exceptions.length>0){
      let newFiles=[];
      for(var id in files){
        if(options.exceptions.indexOf(files[id])==-1){
          newFiles.push(files[id]);
        }
      }
      return newFiles;
    }
    return files;
  }

  function fillOptions(model,source){
    if(source && typeof source =='object'){
      for(var id in model){
        if(!source[id]) source[id]= model[id];
      }
      return source;
    }
    return model;
  }

}());
