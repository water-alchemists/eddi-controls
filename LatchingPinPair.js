var Pin = require("./Pin")

var LatchingPinPair = function(numA, numB, timeout){
  this.pinA = new Pin(numA);
  this.pinB = new Pin(numB);
  this.timeout = timeout || 200;
}

LatchingPinPair.prototype.initialize = function(){
  return Promise.all([this.pinA.initialize, this.pinB.initialize]).then( () => {
    this.ready = true;
  });
}


LatchingPinPair.prototype._set = function(pin){
  return new Promise( (resolve, reject) => {
    if( !this.ready ){
      reject(new Error("You must initialize a LatchingPinPair before using it"));
    }
    this.state = (pin === this.pinA);

    pin.on();
    setTimeout(function(){
      pin.off();
      resolve();
    }, this.timeout);
  });
}

LatchingPinPair.prototype.setA = function(){
  return this._set(this.pinA);
}

LatchingPinPair.prototype.setB = function(){
  return this._set(this.pinB);
}

LatchingPinPair.prototype.isA = function(){
  return this.state === this.pinA;
}

LatchingPinPair.prototype.off = function(){
  if( this.activeTimeout ){
    clearTimeout(this.activeTimeout);
    this.pinA.off();
    this.pinB.off();
  }
}


module.exports = LatchingPinPair;
