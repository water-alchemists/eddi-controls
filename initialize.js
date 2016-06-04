'use strict';
const Pin = require('./Pin');
const LatchingPinPair = require('./LatchingPinPair');

const LATCHING_DELAY = 500;

// NEW
var CONTROL = {
  MASTER_SWTCH :    new Pin(4),   // Switch to control the rest of the circuit
  VALVE_CHANNEL:    new LatchingPinPair(2, 3, LATCHING_DELAY),    // Recirculation Valves - Controls the direction of the water
  DUMP:             new LatchingPinPair(8, 9, LATCHING_DELAY),    // Dump Valve
  POWER_CHANNEL:    new LatchingPinPair(10 , 11, LATCHING_DELAY), // EDR charges the water
  POWER:            new Pin(12),  // High Power Circuit
  PUMP:             new Pin(13),  // Pump
};

// OLD
// var CONTROL = {
//   MASTER:           new LatchingPinPair(2 , 3 , LATCHING_DELAY),
//   POWER:            new Pin(4),
//   PUMP:             new Pin(7),
//   POWER_CHANNEL:    new LatchingPinPair(8 , 9 , LATCHING_DELAY),
//   VALVE_CHANNEL:    new LatchingPinPair(10, 11, LATCHING_DELAY),
//   DUMP:             new LatchingPinPair(12, 13, LATCHING_DELAY),
// };

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