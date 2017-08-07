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

  async function writeFiles(files,formater,progressCallback){
    progress=new Progress(progressCallback,'escrevendo arquivos')
    progress.start(files.length);
    var promisses=[];

    for(var id in files){
      progress.run();
      let file=files[id].file;
      if(formater){
        file=formater(file)
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

        function FilePagingOld(files,options){
          
          let arr=[];

          arr.paging={
            size:options.size,
            total:Math.floor(files.length/100),            
            current:0,
            files:files,
            format:options.format,
            hasNext:function(){
              return (arr.paging.current<arr.paging.total)
            },
            hasPrevious:function(){
              return (arr.paging.current>0)
            }
          }
          arr.addFiles = function(files){
            arr.paging.files.concat(files);
          }

          console.log(arr)
          arr.next=function(){
            if(arr.paging.hasNext()){
              arr.paging.current++;
              loadFiles(arr);
              return true;
            }
          }
          arr.previous=function(){
            if(arr.paging.hasPrevious()){
              arr.paging.current--;
              loadFiles(arr);
               return true;
            }
          }

          function loadFiles(arr){
            arr.splice(0,arr.length);
            progress=new Progress(progressCallback,'carregando pagina')
            progress.start(arr.paging.size);

            let itens=arr.paging.size*arr.paging.current;
            let maxItens=itens+arr.paging.size;
            if(maxItens>arr.paging.files.length){
              maxItens=arr.paging.files.length;
            }
                        
            for(itens;itens<maxItens;itens++){

              let filePackage=FileInfo(arr.paging.files[itens]);
              filePackage.file=fs.readFileSync(arr.paging.files[itens]);
              let formatReturn;
              if(arr.paging.format) {
                //se format for async?
                formatReturn=arr.paging.format(filePackage);
                if(!formatReturn)formatReturn=filePackage;
                if(formatReturn.then){arr.paging.hasPromise=true;}
              }else{
                formatReturn=filePackage;
              }

              arr.push(formatReturn);
              progress.run();
            }
          }
          loadFiles(arr);
          return arr;   
        }

        async function readAllFiles(files){
          var readPromisses=[];

          if(options.exceptions){
            let newFiles=[];
            for(var id in files){
              if(options.exceptions.indexOf(files[id])==-1){
                newFiles.push(files[id]);
              }
            }
            files=newFiles;
          }
          
          readPromisses=new FilePaging(files,options);
          return readPromisses;
        }
        readAllFiles(files).then(function(data){
          fulfill(data);
        })

      });
    });
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
