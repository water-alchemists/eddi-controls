'use strict';
const Pin = require('./Pin');
const LatchingPinPair = require('./LatchingPinPair');

const LATCHING_DELAY = 500;

var CONTROL = {
  MASTER:           new LatchingPinPair(2 , 3 , LATCHING_DELAY),
  POWER:            new Pin(4),
  PUMP:             new Pin(7),
  POWER_CHANNEL:    new LatchingPinPair(8 , 9 , LATCHING_DELAY),
  VALVE_CHANNEL:    new LatchingPinPair(10, 11, LATCHING_DELAY),
  DUMP:             new LatchingPinPair(12, 13, LATCHING_DELAY),
};

const controlKeys = Object.keys(CONTROL),
  initializePromises = controlKeys.map( key => CONTROL[key].initialize() );


function allPinsOff(){
	const offPromises = controlKeys.map( key => CONTROL[key].off() );
	return Promise.all(offPromises)
          .then(() => console.log('All pins are turned off.'))
          .then(() => process.exit());
}

process.on('exit', () => {
  console.log('process exited');
});

Promise.all( initializePromises ).then( allPinsOff ).catch(err => console.error(err.stack));