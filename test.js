(function(){
  var fsq = require("./fsq");

  var files=process.argv[3]?process.argv[3]:'node_modules/**/*.js';
  fsq.readFiles(files,
  {
    format:function(data){
      data.file='editing file content\n'+data.file; 
      return data;
    },
    progress:function(progress){
      console.log(progress.report('loading page'))
    },
    size:20
  }
  ).then(
    function(data){   
      data.loadFiles();
      do{
        let filesLoaded=[]
        data.forEach(function(element) {
          filesLoaded.push(element.name);
        }, this);
        console.log('  '+filesLoaded.join(',').substring(0,100)+' ...');
      }while(data.next());
    },
    function(err){
      console.log(err);
    }
  )
})();