'use strict';
const Pin = require("./Pin"),
  promiseAdditions = require('./promise-additions');

var LatchingPinPair = function(numA, numB, timeout){
  this.pinA = new Pin(numA);
  this.pinB = new Pin(numB);
  this.timeout = timeout || 200;
}


LatchingPinPair.prototype._set = function(pin){
  var turnOff;
  this.state = (pin === this.pinA);
  return new Promise((resolve, reject) => {
    if( this.pinA === pin ) {
      turnOff = this.pinB.off;
    } else {
      turnOff = this.pinA.off;
    }

    return turnOff()
      .then(() => pin.on())
      .then(() => promiseAdditions.delay(this.timeout))
      .then(() => pin.off());
  });

  // this.state = (pin === this.pinA);
  // if( this.activeTimeout ){
  //   clearTimeout(this.activeTimeout);
  //   if( this.pinA === pin ){
  //     this.pinB.off();
  //   } else {
  //     this.pinA.off();
  //   }
  // }

  // pin.on();

  // this.activeTimeout = setTimeout(function(){
  //   pin.off();
  // }, this.timeout);
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
