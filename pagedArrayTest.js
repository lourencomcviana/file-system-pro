(function(){
  const setTimeoutPromise = util.promisify(setTimeout);
  const PagedArray = require("./src/PagedArray");


  function time(val){
    return new Promise(function (fulfill, reject){
      setTimeout(function(){
        console.log(val.s);
        fulfill(val.s);
      },val.t)
    });
  }


  arr=new PagedArray(
    [
      {t:1000,s:'teste1'},
      {t:10,s:'teste2'},
      {t:1000,s:'teste2-1'},
      {t:800,s:'teste2-2'},
      {t:50,s:'teste3-1'},
      {t:2155,s:'teste3-3'},
      {t:600,s:'teste4'}
    ],{run:time,size:2}
    )

  arr.forEach(function(element) {
    //console.log(element)
  }, this);
})();