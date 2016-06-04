'use strict';
const fs = require('fs');
const Pin = require('./Pin');
const LatchingPinPair = require('./LatchingPinPair');
const promiseAdditions = require('./modules/promise-additions'),
  config = require('./config'),
  tasks = require('./modules/tasks'),
  UrlPoller = require('./modules/url-poller');

// https://docs.google.com/document/d/10JIoueW5nWawstjQoYBl2q0yIJkiKjjHA8fwlIf_kPw/edit

const TEST_DELAY = 1000 * 60,
  STEPS_DELAY = 200,
  LATCHING_DELAY = 200;

const DELAY = {
  PRIME : {
    FIRST :  20000,
    SECOND : 10000
  },
  CHANNEL_A : {
    FIRST : TEST_DELAY || 1000 * 60 * 20,
    SECOND : 20 * 1000
  },
  CHANNEL_B : {
    FIRST : TEST_DELAY || 1000 * 60 * 20,
    SECOND : 20 * 1000
  }
}

// NEW
var CONTROL = {
  MASTER_SWITCH :   new Pin(4),   // Switch to control the rest of the circuit
  VALVE_CHANNEL:    new LatchingPinPair(2, 3, LATCHING_DELAY),    // Recirculation Valves - Controls the direction of the water
  DUMP:             new LatchingPinPair(8, 9, LATCHING_DELAY),    // Dump Valve
  POWER_CHANNEL:    new LatchingPinPair(10 , 11, LATCHING_DELAY), // EDR charges the water
  POWER:            new Pin(12),  // High Power Circuit
  PUMP:             new Pin(13),  // Pump
};

// OLD
// var CONTROL = {
//   MASTER:           new LatchingPinPair(12 , 13 , 200),
//   POWER:            new Pin(4),
//   PUMP:             new Pin(7),
//   POWER_CHANNEL:    new LatchingPinPair(8 , 9 , 200),
//   VALVE_CHANNEL:    new LatchingPinPair(10, 11, 200),
//   DUMP:             new LatchingPinPair(2, 3, 200),
// };

function createStepDelay(){
  return promiseAdditions.delay(STEPS_DELAY);
}

var CYCLE = {
  OFF: function(){
    console.log('OFF triggered.');
    return  CONTROL.POWER.off()
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      // .then(() => CONTROL.MASTER.setB()) // closed
      // .then(() => console.log('MASTER setB'))
      // .then(() => createStepDelay())
      .then(() => CONTROL.PUMP.off())
      .then(() => console.log('PUMP off'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => console.log('POWER setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setB()) // closed
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => console.log('OFF ended'));

    // CONTROL.MASTER.setB(); // closed
    // CONTROL.POWER.off();
    // CONTROL.PUMP.off();
    // CONTROL.POWER_CHANNEL.setA();
    // CONTROL.VALVE_CHANNEL.setA();
    // CONTROL.DUMP.setB(); // closed
    // onReady();
  },
  PRIME: function(){
    console.log('PRIME triggered');
    return CONTROL.POWER.off()
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      // .then(() => CONTROL.MASTER.setA()) // open
      // .then(() => console.log('MASTER setA'))
      // .then(() => createStepDelay())
      .then(() => CONTROL.PUMP.off())
      .then(() => console.log('PUMP off'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => console.log('POWER setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setA()) // open
      .then(() => console.log('DUMP setA'))
      .then(() => promiseAdditions.delay(DELAY.PRIME.FIRST))
      .then(() => console.log('DELAY first ended:', DELAY.PRIME.FIRST, 'ms'))
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => CONTROL.VALVE_CHANNEL.setB()) // A is full, now fill B
      .then(() => console.log('VALVE setB'))
      .then(() => createStepDelay())
      .then(() => promiseAdditions.delay(DELAY.PRIME.SECOND))
      .then(() => console.log('DELAY second ended:', DELAY.PRIME.SECOND, 'ms'))
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'))
      .then(() => createStepDelay())
      .then(() => console.log('PRIME ended'));


    // CONTROL.MASTER.setA(); // open
    // CONTROL.POWER.off();
    // CONTROL.PUMP.off();
    // CONTROL.POWER_CHANNEL.setA();
    // CONTROL.VALVE_CHANNEL.setA();
    // CONTROL.DUMP.setA(); // open
    // setTimeout(function(){
    //   CONTROL.DUMP.setB(); // close
    //   CONTROL.VALVE_CHANNEL.setB(); // A is full, now fill B
    //   setTimeout(function(){
    //     CONTROL.VALVE_CHANNEL.setA();
    //     onReady();
    //   }, 10000);
    // }, 20000);
  },
  CHANNEL_A: function(){
    console.log('CHANNEL_A triggered');

    return  CONTROL.POWER.off()
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      // .then(() => CONTROL.MASTER.setA())
      // .then(() => console.log('MASTER setA'))
      // .then(() => createStepDelay())
      .then(() => CONTROL.PUMP.on())
      .then(() => console.log('PUMP on'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => console.log('POWER setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER.on()) //open
      .then(() => console.log('POWER on'))
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_A.FIRST))
      .then(() => console.log('DELAY first ended:', DELAY.CHANNEL_A.FIRST, 'ms'))
      .then(() => CONTROL.POWER.off())
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setA())
      .then(() => console.log('DUMP setA'))
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_A.SECOND))
      .then(() => console.log('DELAY second ended:', DELAY.CHANNEL_A.SECOND, 'ms'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setB())
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => console.log('CHANNEL_A ended'));

    // CONTROL.MASTER.setA(); //open
    // CONTROL.POWER.on();
    // CONTROL.PUMP.on();
    // CONTROL.POWER_CHANNEL.setA();
    // CONTROL.VALVE_CHANNEL.setA();
    // CONTROL.DUMP.setB(); // close
    // setTimeout(function(){
    //   CONTROL.POWER.off();
    //   CONTROL.DUMP.setA();
    //   setTimeout(function(){
    //     CONTROL.DUMP.setB();
    //     onReady();
    //   }, 20 * 1000);
    // }, 1000 * 60 * 20);
  },
  CHANNEL_B: function(){
    	console.log('CHANNEL_B triggered');
	return CONTROL.POWER.off()
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      // .then(() => CONTROL.MASTER.setA()) //open
      // .then(() => console.log('MASTER setA'))
      // .then(() => createStepDelay())
      .then(() => CONTROL.PUMP.on())
      .then(() => console.log('PUMP on'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER_CHANNEL.setB())
      .then(() => console.log('POWER setB'))
      .then(() => createStepDelay())
      .then(() => CONTROL.VALVE_CHANNEL.setB())
      .then(() => console.log('VALVE setB'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setB())
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => CONTROL.POWER.on())
      .then(() => console.log('POWER on'))
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_B.FIRST)) // close
      .then(() => console.log('DELAY first ended:', DELAY.CHANNEL_B.FIRST, 'ms'))
      .then(() => CONTROL.POWER.off())
      .then(() => console.log('POWER off'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setA())
      .then(() => console.log('DUMP setA'))
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_B.SECOND))
      .then(() => console.log('DELAY second ended:', DELAY.CHANNEL_B.SECOND, 'ms'))
      .then(() => createStepDelay())
      .then(() => CONTROL.DUMP.setB())
      .then(() => console.log('DUMP setB'))
      .then(() => createStepDelay())
      .then(() => console.log('CHANNEL_B ended'));

    // CONTROL.MASTER.setA(); //open
    // CONTROL.POWER.on();
    // CONTROL.PUMP.on();
    // CONTROL.POWER_CHANNEL.setB();
    // CONTROL.VALVE_CHANNEL.setB();
    // CONTROL.DUMP.setB(); // close
    // setTimeout(function(){
    //   CONTROL.POWER.off();
    //   CONTROL.DUMP.setA();
    //   setTimeout(function(){
    //     CONTROL.DUMP.setB();
    //     onReady();
    //   }, 20 * 1000);
    // }, 1000 * 60 * 20);
  }
};

// Cycle change checks on this object and poller updates this object with new information
const refs = {
  currentCycle : CYCLE.OFF,
  running : false,
  reason : 'initialize',
  received : new Date()
}

/* 
  URL POLLER
  set up the url poller
*/

const BASE_URL = `${config.homeUrl}/${config.id}`,
  POLL_INTERVAL = 30 * 1000,
  pollerConfig = {
    url : BASE_URL,
    interval : POLL_INTERVAL
  },
  poller = new UrlPoller(pollerConfig);

function updateRefs(data){
  // log out error from polling
  if(data instanceof Error) return console.error('ERROR POLLING :', data);
  
  // update reference object with newest information
  const keys = [
    'running',
    'reason'
  ],
  newRef = keys.reduce((accum, key) => {
    accum[key] = data[key];
    return accum;
  }, {}),
  received = new Date();
  
  // update the reference object
  Object.assign(refs, { received : received }, newRef);
  
}

// listen to the events emitted from the url poller
poller.subscribe('data', updateRefs);
poller.subscribe('error', updateRefs);

// initialize the polling of the url
poller.init();

/*
  ALERT CLOUD OF THE STATE OF THE CURRENT CYCLE
*/
function alertCloudState(stateText, reason){
  return tasks.alertState(stateText, reason)
          .catch(err => console.log('ERROR UPDATING CLOUD:', err));
}

function getCycleState(search){
  return Object.keys(CYCLE).reduce((result, key) => CYCLE[key] === search ? key : result, null);
}

/*
  EVALUATE NEXT CYCLE
*/

function nextCycle(){
  console.log('evaluating in next cycle');
  var currentCycle = refs.currentCycle,
    targetCycle;
  switch(currentCycle){
    case CYCLE.OFF:
      targetCycle = CYCLE.PRIME;
      break;
    case CYCLE.PRIME:
      targetCycle = CYCLE.CHANNEL_A;
      break;
    case CYCLE.CHANNEL_A:
      targetCycle = CYCLE.CHANNEL_B;
      break;
    case CYCLE.CHANNEL_B:
      targetCycle = CYCLE.CHANNEL_A;
      break;
  }

  // Check for if it should go off;
  if(!refs.running) {
    console.log('cloud suggest to have it off');
    targetCycle = CYCLE.OFF;
  }

  // Trigger next cycle
  if( targetCycle !== refs.currentCycle ){
    console.log('in triggering next cycle');
    return targetCycle()
            .then( () => {
              refs.currentCycle = targetCycle;
              return alertCloudState(getCycleState(targetCycle), refs.reason);
            });
  } else {
    console.log('in the else');
    return Promise.resolve();
  }
}


// eternal loop
function loop(){
  var locked = false;
  setInterval(function(){
    if( !locked ){
      console.log('Not locked. Not in a cycle, setting the next cycle');
      locked = true;
      nextCycle()
        .catch(e => console.error(e.stack))
        .then( () => {
          locked = false;
        });
    }
    else console.log('Currently locked. In the middle of cycle:', getCycleState(refs.currentCycle));
  }, 3000);
  // this pattern prevents tail recursion
}

const controlKeys = Object.keys(CONTROL),
  initializePromises = controlKeys.map( key => CONTROL[key].initialize() );

// log out unhandled errors
const errors = ['uncaughtException', 'unhandledRejection'];

errors.forEach(event => {
  process.on(event, (err, data) => console.error(`${event} received for error`, err));  
});

// handles exits
process.on('SIGINT', () => {
  console.log('Got SIGINT. Cleaning up this process.');
  const offPromises = controlKeys.map( key => CONTROL[key].off() );
  return Promise.all(offPromises)
          .then(() => console.log('All pins are turned off.'))
          // .then(() => EddiFire.exit())
          // .then(() => console.log('EddiFire removed all event listeners.'))
          .then(() => process.exit());
});

process.on('beforeExit', () => {
  const offPromises = controlKeys.map( key => CONTROL[key].off() );
  return Promise.all(offPromises)
          .then(() => console.log('All pins are turned off.'))
          // .then(() => EddiFire.exit())
          // .then(() => console.log('EddiFire removed all event listeners.'))
          .then(() => process.exit());
});

process.on('exit', () => {
  console.log('process exited');
});

// initializes and starts off the process
Promise.all( initializePromises ).then( () => loop() ).catch(err => console.error(err.stack));

// OLD : put in object so that the event callbacks can update the values
// const EddiFireStarter = require('./modules/eddi-fire');
// const EddiFire = EddiFireStarter();
// const refs = {
//   currentCycle : CYCLE.OFF,
//   OVERIDE_OFF : false,
//   start : {
//     hour : 9,
//     minute : 0
//   },
//   end : {
//     hour : 15,
//     minute : 0
//   }
// }

// function checkTime(){
//   //checks to see if the current time is within scheduled time
//   const startTime = new Date(),
//     endTime = new Date(),
//     current = new Date();

//   const start = refs.start,
//     end = refs.end;

//     //set start date
//     startTime.setHours(start.hour);
//     startTime.setMinutes(start.minute);

//     //set end date
//     endTime.setHours(end.hour);
//     endTime.setMinutes(end.minute);

//   return current < endTime && current > startTime;
// }

// function updateStart(newStart){
//   refs.start = Object.assign(refs.start, newStart);
//   console.log('this is the new start');
//   console.log(refs.start);
// }

// function updateEnd(newEnd){
//   refs.end = Object.assign(refs.end, newEnd);
//   console.log('this is the new end');
//   console.log(refs.end);
// }

// function updateCycle(state){
//   refs.OVERRIDE_OFF = (state === 0);
// }

// //register event listeners
// EddiFire.register('start', updateStart);
// EddiFire.register('end', updateEnd);
// EddiFire.register('state', updateCycle);

// EddiFire.init();

// function nextCycle(){
//   console.log('evaluating in next cycle');
//   var currentCycle = refs.currentCycle,
//     targetCycle;
//   switch(currentCycle){
//     case CYCLE.OFF:
//       targetCycle = CYCLE.PRIME;
//       break;
//     case CYCLE.PRIME:
//       targetCycle = CYCLE.CHANNEL_A;
//       break;
//     case CYCLE.CHANNEL_A:
//       targetCycle = CYCLE.CHANNEL_B;
//       break;
//     case CYCLE.CHANNEL_B:
//       targetCycle = CYCLE.CHANNEL_A;
//       break;
//   }

//   // Check for start and end time;
//   if(!checkTime()){
//     console.log('in checked time');
//     targetCycle = CYCLE.OFF;
//   }
//   //check to see if user asked for it to be turned off
//   if(refs.OVERRIDE_OFF){
//     console.log('in override off');
//     targetCycle = CYCLE.OFF;
//   }

//   // Trigger next cycle
//   if( targetCycle !== refs.currentCycle ){
//     console.log('in triggering next cycle');
//     return targetCycle()
//             .then( () => {
//               refs.currentCycle = targetCycle;
//               return EddiFire.alertState(getCycleState(targetCycle));
//             });
//   } else {
//     console.log('in the else');
//     return Promise.resolve();
//   }
// }
