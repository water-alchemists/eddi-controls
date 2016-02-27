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
  OFF: function(){
    CONTROL.MASTER.setB();
    CONTROL.POWER.off();
    CONTROL.PUMP.off();
    CONTROL.POWER_CHANNEL.setA();
    CONTROL.VALVE_CHANNEL.setA();
    CONTROL.DUMP.setB();
  },
  PRIME: function(){
    CONTROL.MASTER.setA();
    CONTROL.POWER.off();
    CONTROL.PUMP.on();
    CONTROL.POWER_CHANNEL.setA();
    CONTROL.VALVE_CHANNEL.setA();
    CONTROL.DUMP.setA();
  },
  CHANNEL_A: function(){
    CONTROL.MASTER.setA();
    CONTROL.POWER.on();
    CONTROL.PUMP.off();
  }

};

var currentCycle = CYCLE.OFF;

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

#define STATE_OFF 0
#define STATE_PRIME 1
#define STATE_DESAL_A 2
#define STATE_DESAL_B 3
#define STATE_DUMP 4

int currentState = STATE_OFF;



int initializePin(int pin){
  FILE * fd;
  char fName[128];

  //Exporting the pin to be used
  if(( fd = fopen("/sys/class/gpio/export", "w")) == NULL) {
    printf("Error: unable to export pin\n");
    return 1;
  }
  fprintf(fd, "%d\n", pin);
  fclose(fd);

  // Setting direction of the pin
  sprintf(fName, "/sys/class/gpio/gpio%d/direction", pin);
  if((fd = fopen(fName, "w")) == NULL) {
    printf("Error: can't open pin direction\n");
    return 2;
  }
  fprintf(fd, "out\n");
  fclose(fd);

  // save value file for quick access
  char * valueFile = malloc(128 * sizeof(char));
  sprintf(valueFile, "/sys/class/gpio/gpio%d/value", pin);
  pins[pin] = valueFile;

  return 0;
}

int setPin(int pin, int state){
  FILE * fd;
  if((fd = fopen(pins[pin], "w")) == NULL) {
    printf("Error: can't open pin value\n");
    return 2;
  }
  fprintf(fd, "%d\n", state);
  return 0;
}



int main( int argc, char **argv ){
  char *fName;
  for( int pin=2; pin < 14; pin++ ){
    initializePin(pin);
    if( pin == 4 ){
      pin = 7;
    }
  }

  valveLatchTime.tv_sec = 0;
  valveLatchTime.tv_nsec = 200000000L; // only needs 200 ms

  // in a loop, run control state command
  int rc = 0;
  while( rc != -1 ){
    rc = determineControlState();
  }


}


int determineControlState(){
  int newState = STATE_PRIME;
  // TODO: Logic Here

  if( newState != currentState ){
    setState(newState);
  }
  return currentState;
}

static void setState(int newState){
  // control pins for state;
  switch(newState){
    case STATE_OFF:
      // This is the low power state. The only thing energized is the artik. Master Pins are off.
      for( int pin=2; pin < 14; pin++ ){
        setPin(pin, 0);
        if( pin == 4 ){
          pin = 7;
        }
      }
      exit(0);
      break;
    case STATE_PRIME:
      // The Artik decides when to turn the machine on.
      // Master pin 8 flips on (100ms). Once on, Eddi starts a priming cycle.
      // In this cycle, Channel A valves are clean, Channel B valves are dirty,
      // and the dump valve is open. The dump valve closes when the
      // recirculation flow sensor reads a steady-state flow rate that is
      // greater than zero. The priming cycle stops 5 minutes after the dump
      // valve is closed (for wetting the membranes).
      setPin(PIN_POWER, 0);
      setPin(PIN_MASTER_OPEN, 1);
      setPin(PIN_POWER_CHANNEL_A, 0);
      setPin(PIN_POWER_CHANNEL_B, 0);
      setPin(PIN_VALVE_CHANNEL_A, 1);
      setPin(PIN_VALVE_CHANNEL_B, 0);
      setPin(PIN_DUMP, 1);
      setPin(PIN_RECIRCULATE, 0);

      break;
    case STATE_DESAL_A:
      break;
    case STATE_DESAL_B:
      break;
    case STATE_DUMP:
      break;
  }
  currentState = newState;
}
