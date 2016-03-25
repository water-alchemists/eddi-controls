'use strict';
const fs = require('fs');
const Pin = require('./Pin');
const LatchingPinPair = require('./LatchingPinPair');
const EddiFireStarter = require('./eddi-fire');
const promiseAdditions = require('./promise-additions');

const EddiFire = EddiFireStarter();

// https://docs.google.com/document/d/10JIoueW5nWawstjQoYBl2q0yIJkiKjjHA8fwlIf_kPw/edit

var CONTROL = {
  MASTER:           new LatchingPinPair(12 , 13 , 200),
  POWER:            new Pin(4),
  PUMP:             new Pin(7),
  POWER_CHANNEL:    new LatchingPinPair(8 , 9 , 200),
  VALVE_CHANNEL:    new LatchingPinPair(10, 11, 200),
  DUMP:             new LatchingPinPair(2, 3, 200),
};

const TEST_DELAY = 1000 * 60;

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

var CYCLE = {
  OFF: function(){
    console.log('OFF triggered.');
    return CONTROL.MASTER.setB() // closed
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.PUMP.off())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => CONTROL.DUMP.setB()); // closed

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
    return CONTROL.MASTER.setA() // open
      .then(() => console.log('MASTER setA'))
      .then(() => CONTROL.POWER.off())
      .then(() => console.log('POWER off'))
      .then(() => CONTROL.PUMP.off())
      .then(() => console.log('PUMP off'))
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => console.log('POWER setA'))
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'))
      .then(() => CONTROL.DUMP.setA()) // open
      .then(() => console.log('DUMP setA'))
      .then(() => promiseAdditions.delay(DELAY.PRIME.FIRST))
      .then(() => console.log('DELAY first ended'))
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => console.log('DUMP setB'))
      .then(() => CONTROL.VALVE_CHANNEL.setB()) // A is full, now fill B
      .then(() => console.log('VALVE setB'))
      .then(() => promiseAdditions.delay(DELAY.PRIME.SECOND))
      .then(() => console.log('DELAY second ended'))
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => console.log('VALVE setA'));


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

    return  CONTROL.MASTER.setA()
      .then(() => console.log('MASTER setA'))
      .then(() => CONTROL.POWER.on()) //open
      .then(() => CONTROL.PUMP.on())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_A.FIRST))
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.DUMP.setA())
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_A.SECOND))
      .then(() => CONTROL.DUMP.setB());

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

    return CONTROL.MASTER.setA() //open
      .then(() => CONTROL.POWER.on())
      .then(() => CONTROL.PUMP.on())
      .then(() => CONTROL.POWER_CHANNEL.setB())
      .then(() => CONTROL.VALVE_CHANNEL.setB())
      .then(() => CONTROL.DUMP.setB())
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_B.FIRST)) // close
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.DUMP.setA())
      .then(() => promiseAdditions.delay(DELAY.CHANNEL_B.SECOND))
      .then(() => CONTROL.DUMP.setB());

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

// OLD
// var currentCycle = CYCLE.OFF;
// var OVERIDE_OFF = false;
// var start = {
//     hour : 9,
//     minute : 0
//   },
//   end = {
//     hour : 15,
//     minute : 0
//   };

// NEW : put in object so that the event callbacks can update the values
const refs = {
  currentCycle : CYCLE.OFF,
  OVERIDE_OFF : false,
  start : {
    hour : 9,
    minute : 0
  },
  end : {
    hour : 15,
    minute : 0
  }
}

function checkTime(){
  //checks to see if the current time is within scheduled time
  const startTime = new Date(),
    endTime = new Date(),
    current = new Date();

  const start = refs.start,
    end = refs.end;

    //set start date
    startTime.setHours(start.hour);
    startTime.setMinutes(start.minute);

    //set end date
    endTime.setHours(end.hour);
    endTime.setMinutes(end.minute);

  return current < endTime && current > startTime;
}

function getCycleState(search){
  return Object.keys(CYCLE).reduce((result, key) => CYCLE[key] === search ? key : result, null);
}

function updateStart(newStart){
  refs.start = Object.assign(refs.start, newStart);
  console.log('this is the new start');
  console.log(refs.start);
}

function updateEnd(newEnd){
  refs.end = Object.assign(refs.end, newEnd);
  console.log('this is the new end');
  console.log(refs.end);
}

function updateCycle(state){
  refs.OVERRIDE_OFF = (state === 0);
}

//register event listeners
EddiFire.register('start', updateStart);
EddiFire.register('end', updateEnd);
EddiFire.register('state', updateCycle);

EddiFire.init();

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

  // Check for start and end time;
  if(!checkTime()){
    console.log('in checked time');
    targetCycle = CYCLE.OFF;
  }
  //check to see if user asked for it to be turned off
  if(refs.OVERRIDE_OFF){
    console.log('in override off');
    targetCycle = CYCLE.OFF;
  }

  // Trigger next cycle
  if( targetCycle !== refs.currentCycle ){
    console.log('in triggering next cycle');
    return targetCycle()
            .then( () => {
              refs.currentCycle = targetCycle;
              return EddiFire.alertState(getCycleState(targetCycle));
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
    console.log('set interval run');
    if( !locked ){
      locked = true;
      nextCycle().then( () => {
        locked = false;
      });
    }
  }, 3000);
  // this pattern prevents tail recursion
}

// initialize and run
// var initializePromises = [];
// for( let key in CONTROL ){
//   if( CONTROL.hasOwnProperty(key) ){
//     console.log('pushing', key);
//     initializePromises.push( CONTROL[key].initialize() );
//   }
// }
const controlKeys = Object.keys(CONTROL),
  initializePromises = controlKeys.map(key => CONTROL[key].initialize());

process.on('SIGINT', () => {
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

Promise.all( initializePromises ).then( () => loop() ).catch(err => console.error(err.stack));
