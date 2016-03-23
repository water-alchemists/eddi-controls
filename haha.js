'use strict';
const fs = require('fs');

const gpio = {
  2 : 8,
  3 : 9,
  4 : 10,
  7 : 11,
  8 : 12,
  9 : 13,
  10 : 14,
  11 : 16,
  12 : 21,
  13 : 22
};

const pin = process.argv[2],
	mappedPin = gpio[pin];
if(!mappedPin) throw new Error('need a valid pin');

fs.writeFile(`/sys/class/gpio/gpio${mappedPin}/value`, '1', (err, data) => {
	if(err) throw err;
	setTimeout(function(){
		fs.writeFile(`/sys/class/gpio/gpio${mappedPin}/value`, '0', (err, data) => {
			if(err) throw err;
		});
	}, 60000);
});

setInterval(() => console.log('i am alive'), 120000);