var Pin = require("./Pin")

var LatchingPinPair = function(numA, numB, timeout){
  this.pinA = new Pin(numA);
  this.pinB = new Pin(numB);
  this.timeout = timeout || 200;
}


LatchingPinPair.prototype._set = function(pin){
  if( this.activeTimeout ){
    clearTimeout(this.activeTimeout);
    if( this.pinA === pin ){
      this.pinB.off();
    } else {
      this.pinA.off();
    }
  }

  pin.on();

  this.activeTimeout = setTimeout(function(){
    pin.off();
  }, this.timeout);
}

LatchingPinPair.prototype.setA = function(){
  this._set(this.pinA);
}

LatchingPinPair.prototype.setB = function(){
  this._set(this.pinB);
}

LatchingPinPair.prototype.off = function(){
  if( this.activeTimeout ){
    clearTimeout(this.activeTimeout);
    this.pinA.off();
    this.pinB.off();
  }
}
