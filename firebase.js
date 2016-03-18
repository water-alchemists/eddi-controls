'use strict';
const firebase = require('firebase');

const PATHS = {
	BASE : 'https://eddi.firebaseIO.com',
	EDDI : 'eddis',
	SETTINGS : 'settings'
};

const EDDI_ID = process.env.EDDI_ID;

class EddiFire {
	constructor(){
		const ref = new Firebase(PATHS.BASE_PATH);

		this.refs = {
			BASE : ref,
			EDDI : ref.child(PATHS.EDDI)
		}, 
		subscribers = [];
	}

	init(){
		this.EDDI.child(EDDI_ID).child(PATHS.SETTINGS)
	}

	register(func){
		subscribers.push(func);
	}


}

module.exports = function(){
	var init;
	if(init) return init;
	else {
		init = new EddiFire();
		return init;
	}
}