var fs = require('fs');
var Pin = require('./pin');
var LatchingPinPair = require('./LatchingPinPair');


// https://docs.google.com/document/d/10JIoueW5nWawstjQoYBl2q0yIJkiKjjHA8fwlIf_kPw/edit

var CONTROL = {
  MASTER:           new LatchingPinPair(2 , 3 , 200);
  POWER:            new Pin(4),
  PUMP:             new Pin(7),
  POWER_CHANNEL:    new LatchingPinPair(8 , 9 , 200);
  VALVE_CHANNEL:    new LatchingPinPair(10, 11, 200);
  DUMP:             new LatchingPinPair(12, 13, 200);
};

var CYCLE = {
  OFF: function(onReady){
    CONTROL.MASTER.setB(); // closed
    CONTROL.POWER.off();
    CONTROL.PUMP.off();
    CONTROL.POWER_CHANNEL.setA();
    CONTROL.VALVE_CHANNEL.setA();
    CONTROL.DUMP.setB(); // closed
    onReady();
  },
  PRIME: function(onReady){
    CONTROL.MASTER.setA(); // open
    CONTROL.POWER.off();
    CONTROL.PUMP.off();
    CONTROL.POWER_CHANNEL.setA();
    CONTROL.VALVE_CHANNEL.setA();
    CONTROL.DUMP.setA(); // open
    setTimeout(function(){
      CONTROL.DUMP.setB(); // close
      CONTROL.VALVE_CHANNEL.setB(); // A is full, now fill B
      setTimeout(function(){
        CONTROL.VALVE_CHANNEL.setA();
        onReady();
      }, 10000);
    }, 20000);
  },
  CHANNEL_A: function(onReady){
    CONTROL.MASTER.setA(); //open
    CONTROL.POWER.on();
    CONTROL.PUMP.on();
    CONTROL.POWER_CHANNEL.setA();
    CONTROL.VALVE_CHANNEL.setA();
    CONTROL.DUMP.setB(); // close
    setTimeout(function(){
      CONTROL.POWER.off();
      CONTROL.DUMP.setA();
      setTimeout(function(){
        CONTROL.DUMP.setB();
        onReady();
      }, 20 * 1000);
    }, 1000 * 60 * 20);
  },
  CHANNEL_B: function(onReady){
    CONTROL.MASTER.setA(); //open
    CONTROL.POWER.on();
    CONTROL.PUMP.on();
    CONTROL.POWER_CHANNEL.setB();
    CONTROL.VALVE_CHANNEL.setB();
    CONTROL.DUMP.setB(); // close
    setTimeout(function(){
      CONTROL.POWER.off();
      CONTROL.DUMP.setA();
      setTimeout(function(){
        CONTROL.DUMP.setB();
        onReady();
      }, 20 * 1000);
    }, 1000 * 60 * 20);
  }
};

var currentCycle = CYCLE.OFF;



while(1){

  // TODO: Check for start and end time;

  switch(currentCycle){
    case: CYCLE.OFF:
      currentCycle = CYCLE.PRIME;
      break;
    case: CYCLE.PRIME:
      currentCycle = CYCLE.CHANNEL_A;
      break;
    case: CYCLE.CHANNEL_A:
      currentCycle = CYCLE.CHANNEL_B;
      break;
    case: CYCLE.CHANNEL_B:
      currentCycle = CYCLE.CHANNEL_A;
      break;
  }

  currentCycle();

  // TODO: Report when cycle change happens to socket
}


/*
Cycle Specifications
There are 5 cycles: (Off, Prime, Channel A, Channel B, and Dump)
Off
Prime
Channel A
This is a desalination cycle. Channel A valves are clean, Channel B valves are dirty, dump valve is closed. The graphite is in state A.
Channel B
This is a desalination cycle. Channel B valves are clean, Channel A valves are dirty, dump valve is closed. The graphite is in state B.
Dump
This is a state where salty recirculation water is being dumped. To trigger this state, the previous channel cycle must detect a high salinity in the recirculation channel (or take 15 minutes if no salinity sensor in recirc). The channel valves remain unchanged from their previous state. Recirc pump is on. Dump Valve is open. This state remains on until the salinity of the recirculation channel returns to a steady-state level (or 30 seconds if no salinity sensor in recirc). After the dump cycle, the dump valve closes, and the Artik determines if there should be another round of desalination (based on scheduling). If there should be another round, the Artik flips to the channel that it wasn’t just on.
*/
