var fs = require('fs');

var gpio = {
  2 : 8,
  3 : 9,
  4 : 10,
  7 : 11,
  8 : 12,
  9 : 13,
  10 : 14,
  11 : 16,
  12 : 21,
  13 : 22
};


var Pin = function(pin){
  var num = gpio[pin];
  this.file = "/sys/class/gpio/gpio"+num+"/value";
  this.state = null;
  fs.writeFile("/sys/class/gpio/export", num+"\n", function(err){
    if( err ){
      console.error(err);
      process.exit(1);
    }
    fs.writeFile("/sys/class/gpio/gpio"+num+"/direction", "out\n", function(err){
      if( err ){
        console.error(err);
        process.exit(1);
      }
    });
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
