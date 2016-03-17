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


try{
	console.log("Testing Master Circuit");
	CONTROL.MASTER.setA(); // open
	setTimeout(function(){
		CONTROL.MASTER.setB();
	}, 1000);



	//CONTROL.POWER.off();
	//CONTROL.PUMP.off();
	//CONTROL.POWER_CHANNEL.setA();
	//CONTROL.VALVE_CHANNEL.setA();
	//CONTROL.DUMP.setA(); // open


	console.log("Tests Done...");
} catch (err) {

	console.error("Could not complete tests due to error: ");
	console.error(err);

}


