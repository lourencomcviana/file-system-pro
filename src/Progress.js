(function(){
  module.exports=Progress;
  function Progress(progress,description){
    this.description=description;
    this.total=0;
    this.exec=0;
    this.progress=progress;
    this.state=0;
    this.showStatistcs=false;
    this.states=function(state){
      let statesEnum= ['CREATED','STARTED','RUNNING','FINISHED','FINISHED BUT STILL RUNNING'];
      if(!state)
        return statesEnum;
      else
        return statesEnum[this.state];
    }
    this.time={
      start:new Date().toISOString(),
      first:undefined,
      end:undefined
    }

    this.start=function(totalLength){
      if(this.progress){
        this.exec=0;
        this.total=Number(totalLength);
        
        this.time.first=new Date().toISOString();
        if(this.total==0 || !this.total){
          this.state=3
          this.time.end=new Date().toISOString();
        }
        else
          this.state=1;
        this.progress(this);
      }
    }

    this.run=function(){
      if(this.progress){
        this.exec++; 
        if(this.total==this.exec){
          this.state=3;
          this.time.end=new Date().toISOString();
        }else if(this.total<this.exec){
          this.state=4;
        }
        else{
          this.state=2;
        }
        this.progress(this);
      }
    }

    this.report=function(msg){
      if(!msg) msg=this.description
      if(this.progress){
        
        let text='';
        if(this.state) text+=(this.states(this.state)+' ')
        if(msg)  text+=(msg+' ');
        
        text+=(this.exec+"/"+this.total);
        if(this.state===3){
          text=reportEnd(text);
        }
       
        return text;
      }
    }
    function reportEnd(text){

      if(this.showStatistcs){
        text+=('\nstart: '+this.time.start)
        text+=('\nfirst: '+this.time.first)
        text+=('\nend:   '+this.time.end)
      } 
      
      return text;
    }
  }
})()