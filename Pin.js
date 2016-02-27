

var Pin = function(num){
  this.file = "/sys/class/gpio/gpio"+num+"/value";
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

Pin.prototype._set(val){
  fs.writeFile(this.file, val+"\n", function(err){
    if( err ){
      console.error(err);
    }
  });
}

Pin.prototype.on(){
  this._set(1);
}

Pin.prototype.off(){
  this._set(0);
}


module.exports = Pin;
