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
  this.num = gpio[pin];
  this.pin = pin;
  this.file = "/sys/class/gpio/gpio"+this.num+"/value";
  this.state = null;
}

Pin.prototype.initialize = function(){
  // THE REAL DEAL
  return new Promise( (resolve, reject) => {
    fs.writeFile("/sys/class/gpio/export", this.num+"\n", (err) => {
      if( err ){
        console.error(err);
        process.exit(1);
        return reject();
      }
      fs.writeFile("/sys/class/gpio/gpio"+this.num+"/direction", "out\n", (err) => {
        if( err ){
          console.error(err);
          process.exit(1);
          return reject();
        }
        this.ready = true;
        return this.off().then(resolve);
      });
    });
  });
  // FOR TESTING ON LOCAL MACHINE
  // console.log(`${this.pin} initialize with mapping ${this.num}`);
  // this.ready = true
  // return this.off();
}


Pin.prototype._set = function(val){
  this.state = val;
  console.log(`Writing to pin ${this.pin}, mapped to ${this.num}, value: ${val}`);
  // THE REAL DEAL
  return new Promise((resolve, reject) => {
    if( !this.ready ){
      reject( new Error("You must initialize a Pin before using it") );
    }
    fs.writeFile(this.file, val+"\n", function(err){
      if( err ){
        console.error(err);
        return reject(err);
      }
      resolve();
    });
  });

  // FOR TESTING ON LOCAL MACHINE
  // if(!this.ready) return Promise.reject(new Error("You must initialize a Pin before using it"));
  // return Promise.resolve();
}

Pin.prototype.isOn = function(){
  return this.state === 1;
}

Pin.prototype.on = function(){
  return this._set(1);
}

Pin.prototype.off = function(){
  return this._set(0);
}


module.exports = Pin;
