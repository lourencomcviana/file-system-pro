(function(){
  var Progress = require("./Progress");
  var FileInfo = require("./FileInfo");

  var sizeSymbol = Symbol("size of the page");
  var currentSymbol= Symbol("current page");
  var filesSymbol= Symbol("files to read");
  var formatSymbol= Symbol("function to run when formating file after loading");
  var progressCallbackSymbol = Symbol("progress report callback");

  class FilePaging extends Array {
    constructor(files,options) {
        super();
        this[sizeSymbol]=options.size;
        this[currentSymbol]=0;
        this[filesSymbol]=files;
        this[formatSymbol]=options.format;
        this[progressCallbackSymbol]=options.progress;
    }

    get files() {
        return this[filesSymbol];
    }
    get pageSize() {
        return this[sizeSymbol];
    }
     get pageCurrent() {
        return this[currentSymbol];
    }
    get pageTotal() {
        return Math.ceil(this.files.length/this.pageSize);
    }
    get pageItemRange() {
      let itemSize=this.pageSize*this.pageCurrent
        return{
          min:itemSize,
          max:itemSize+this.pageSize
        };
    }
    get pageStart() {
      return this.pageSize*this.pageCurrent;

    }
    get pageEnd() {
      let end=this.pageStart+this.pageSize;
      return end>this.files.length?this.files.length:end;
    }

    loadFiles(){
      this.length = 0;
      let progress=new Progress(this[progressCallbackSymbol])
      
      progress.start(this.pageEnd-this.pageStart);    

      for(let idItem=this.pageStart;idItem<this.pageEnd;idItem++){

        let filePackage=FileInfo(this.files[idItem]);

        try{
          filePackage.file=fs.readFileSync(this.files[idItem]);
        }catch(e){
          filePackage.file=e;
        }

        let formatReturn;
        if(this[formatSymbol]) {
          //se format for async?
          formatReturn=this[formatSymbol](filePackage);
          if(!formatReturn)formatReturn=filePackage;
          //if(formatReturn.then){arr.paging.hasPromise=true;}
        }else{
          formatReturn=filePackage;
        }

        this.push(formatReturn);
        progress.run();
      }
    }

    hasNext(){
      return (this.pageCurrent<this.pageTotal-1)
    }
    hasPrevious(){
      return (this.pageCurrent>0)
    }
    next(){
      if(this.hasNext()){
        this[currentSymbol]++;
        this.loadFiles();
        return true;
      }
      return false;
    }

    previous(){
      if(this.hasPrevious()){
        this[currentSymbol]--;
        this.loadFiles();
        return true;
      }
      return false;
    }
  }

  module.exports=FilePaging;
})()