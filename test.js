var Pin = require('./Pin');
var LatchingPinPair = require('./LatchingPinPair');


var CONTROL = {
  MASTER:           new LatchingPinPair(2 , 3 , 200),
  POWER:            new Pin(4),
  PUMP:             new Pin(7),
  POWER_CHANNEL:    new LatchingPinPair(8 , 9 , 200),
  VALVE_CHANNEL:    new LatchingPinPair(10, 11, 200),
  DUMP:             new LatchingPinPair(12, 13, 200),
};




function test(){
  console.log("Beginning Test...");
  return CONTROL.MASTER.setB() // open
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.MASTER.setA())
      .then(() => console.log("Master Valve Test Success"))
      .then(() => CONTROL.POWER.on())
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.POWER.off())
      .then(() => console.log("High Power Test Success"))
      .then(() => CONTROL.PUMP.on())
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.PUMP.off())
      .then(() => console.log("Pump Test Success"))
      .then(() => CONTROL.POWER_CHANNEL.setB())
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => console.log("Power Channel Test Success"))
      .then(() => CONTROL.VALVE_CHANNEL.setB())
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log("Valve Channel Test Success"))
      .then(() => CONTROL.DUMP.setB()) // open
      .then(() => promiseAdditions.delay(1000))
      .then(() => CONTROL.DUMP.setA()) // close
      .then(() => console.log("Dump Valve Test Success"))
      .then(() => console.log("All Tests Successful!"));
}

// initialize and run
// var initializePromises = [];
// for( let key in CONTROL ){
//   if( CONTROL.hasOwnProperty(key) ){
//     initializePromises.push( CONTROL[key].initialize() );
//   }
// }

const controlKeys = Object.keys(CONTROL),
  initializePromises = controlKeys.map(key => CONTROL[key].initialize());

process.on('SIGINT', (event) => {
  console.log('Got SIGINT. Cleaning up this process.');
  const offPromises = controlKeys.map(key => CONTROL[key].off());
  return Promise.all(offPromises)
          .then(() => console.log('All pins are turned off.'))
          .then(() => process.exit());
});

process.on('beforeExit', () => {
  const offPromises = controlKeys.map(key => CONTROL[key].off());
  return Promise.all(offPromises)
          .then(() => console.log('All pins are turned off.'))
          .then(() => process.exit());
});

process.on('exit', () => {
  console.log('process exited');
});

console.log("Initializing Pins...");
Promise.all( initializePromises ).then( test ).catch(err => console.error(err.stack));

setInterval(() => 3000);
