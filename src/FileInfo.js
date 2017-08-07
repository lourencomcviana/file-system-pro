(function(){
  module.exports=FileInfo;
  function FileInfo(filePath){
    let saida={filePathStr:filePath,
      filePath:filePath.split(/[\\/]/),
      directoryStr:undefined,
      directory:undefined,
      name:undefined,
      file:undefined,
      options:undefined
    }
    saida.directory=saida.filePath.slice(0,saida.filePath.length-1);

    saida.directoryStr=saida.directory.join("/");
    saida.name=saida.filePath[saida.filePath.length-1]
    return saida;
  }
})()