var fs = require('fs');



var Pin = function(num){
  this.file = "/sys/class/gpio/gpio"+num+"/value";
  this.state = null;
  fs.writeFile("/sys/class/gpio/export", num+"\n", function(err){
    if( err ){
      console.error(err);
      process.exit(1);
    }
  });
  fs.writeFile("/sys/class/gpio/gpio"+num+"/direction", "out\n", function(err){
    if( err ){
      console.error(err);
      process.exit(1);
    }
  });
}

Pin.prototype._set = function(val){
  this.state = val;
  fs.writeFile(this.file, val+"\n", function(err){
    if( err ){
      console.error(err);
    }
  });
}

Pin.prototype.isOn = function(){
  return this.state === 1;
}

Pin.prototype.on = function(){
  this._set(1);
}

Pin.prototype.off = function(){
  this._set(0);
}


module.exports = Pin;
