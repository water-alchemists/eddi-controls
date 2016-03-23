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

var CYCLE = {
  OFF: function(){
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
    return CONTROL.MASTER.setA() // open
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.PUMP.off())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => CONTROL.DUMP.setA()) // open
      .then(() => promiseAdditions.delay(20000))
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => CONTROL.VALVE_CHANNEL.setB()) // A is full, now fill B
      .then(() => promiseAdditions.delay(10000))
      .then(() => CONTROL.VALVE_CHANNEL.setA());

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
    return  CONTROL.MASTER.setA()
      .then(() => CONTROL.POWER.on()) //open
      .then(() => CONTROL.PUMP.on())
      .then(() => CONTROL.POWER_CHANNEL.setA())
      .then(() => CONTROL.VALVE_CHANNEL.setA())
      .then(() => CONTROL.DUMP.setB()) // close
      .then(() => promiseAdditions.delay(1000 * 60 * 20))
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.DUMP.setA())
      .then(() => promiseAdditions.delay(20 * 1000))
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
    return CONTROL.MASTER.setA() //open
      .then(() => CONTROL.POWER.on())
      .then(() => CONTROL.PUMP.on())
      .then(() => CONTROL.POWER_CHANNEL.setB())
      .then(() => CONTROL.VALVE_CHANNEL.setB())
      .then(() => CONTROL.DUMP.setB())
      .then(() => promiseAdditions.delay(1000 * 60 * 20)) // close
      .then(() => CONTROL.POWER.off())
      .then(() => CONTROL.DUMP.setA())
      .then(() => promiseAdditions.delay(20 * 1000))
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
}

function updateEnd(newEnd){
  refs.end = Object.assign(refs.start, newEnd);
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
  console.log('in next cycle');
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
    targetCycle = CYCLE.OFF;
  }
  //check to see if user asked for it to be turned off
  if(refs.OVERRIDE_OFF){
    targetCycle = CYCLE.OFF;
  }

  // Trigger next cycle
  if( targetCycle !== refs.currentCycle ){
    return targetCycle()
            .then( () => {
              refs.currentCycle = targetCycle;
              return EddiFire.alertState(getCycleState(targetCycle));
            });
  } else {
    return Promise.resolve();
  }
}


// eternal loop
function loop(){
  var locked = false;
  setInterval(function(){
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
const initializePromises = Object.keys(CONTROL).map(key => CONTROL[key].initialize());

Promise.all( initializePromises ).then( () => loop() ).catch(err => console.error(err.stack));
