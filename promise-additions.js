'use strict';
function delayPromise(ms){
	return new Promise((resolve, reject) => {
		try {
			var timeout;

			function clear(){
				clearTimeout(timeout);
				return resolve();
			}
			timeout = setTimeout(clear, ms);
		} catch(e){
			reject(e);
		}
	});
}

module.exports = {
	delay : delayPromise
}