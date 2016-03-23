'use strict';
const Pin = require("./Pin"),
  promiseAdditions = require('./promise-additions');

var LatchingPinPair = function(numA, numB, timeout){
  this.pinA = new Pin(numA);
  this.pinB = new Pin(numB);
  this.timeout = timeout || 200;
}

LatchingPinPair.prototype.initialize = function(){
  return Promise.all([this.pinA.initialize(), this.pinB.initialize()])
          .then( () => this.ready = true );
}


LatchingPinPair.prototype._set = function(pin){
  if( !this.ready ){
    return Promise.reject(new Error("You must initialize a LatchingPinPair before using it"));
  }
  this.state = (pin === this.pinA);
  return pin.on()
    .then(() => promiseAdditions.delay(this.timeout))
    .then(() => pin.off());
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
  const actions = [
    this.pinA.off(),
    this.pinB.off()
  ];

  return Promise.all(actions);
  // if( this.activeTimeout ){
  //   clearTimeout(this.activeTimeout);
  //   this.pinA.off();
  //   this.pinB.off();
  // }
}


module.exports = LatchingPinPair;
