'use strict';
const firebase = require('firebase');

const PATHS = {
	BASE : 'https://eddi.firebaseIO.com',
	EDDI : 'eddis',
	SETTINGS : 'settings',
	STATE : 'state',
	TIMING : 'timing',
	START : 'start',
	END : 'end',
	HOUR : 'hour',
	MINUTE : 'minute'
};

const EVENTS = {
	start : 'start',
	end : 'end', 
	state : 'state'
};

const EDDI_ID = process.env.EDDI_ID || 'test-teddi';

console.log('this is the id :', EDDI_ID);

class EddiFire {
	constructor(){
		const ref = new Firebase(PATHS.BASE),
			EDDI = ref.child(PATHS.EDDI).child(EDDI_ID);

		this.refs = {
			[EVENTS.state] : EDDI.child(PATHS.SETTINGS).child(PATHS.STATE),
			[EVENTS.start] : EDDI.child(PATHS.SETTINGS).child(PATHS.TIMING).child(PATHS.START),
			[EVENTS.end] : EDDI.child(PATHS.SETTINGS).child(PATHS.TIMING).child(PATHS.END)
		}

		this.subscribers = {
			[EVENTS.start] : [],
			[EVENTS.end] : [],
			[EVENTS.state] : []
		};

		//these will be updated as values come in from firebase
		this.state = null;
		this.start = null;
		this.end = null;
	}

	init(){
		//alert all functions listening to the change of the state
		this.refs[EVENTS.state]
			.on('value', snapshot => {
				//get and parse value
				const data = snapshot.val();

				console.log(`EddiFire alerting of state change : ${data}`);
				//updates the value from firebase for referencing later
				this.state = data;

				//lets the subscribers know
				this.subscribers[EVENTS.state].forEach(func => func(data));
			});

		//alert all functions listening to the change of the start time
		this.refs[EVENTS.start]
			.on('value', snapshot => {
				//get and parse value
				const data = snapshot.val();

				console.log(`EddiFire alerting of start time change : ${data}`);
				//updates the value from firebase for referencing later
				this.start = data;

				//lets the subscribers know
				this.subscribers[EVENTS.start].forEach(func => func(data));
			});

		//alert all functions listening to the change of the end time
		this.refs[EVENTS.end]
			.on('value', snapshot => {
				//get and parse value
				const data = snapshot.val();

				console.log(`EddiFire alerting of end time change : ${data}`);

				//updates the value from firebase for referencing later
				this.end = data;

				//lets the subscribers know
				this.subscribers[EVENTS.end].forEach(func => func(data));
			});

	}

	register(event, func){
		//registers listeners
		const type = EVENTS[event];
		if(!type) throw new Error(`Not a valid event type. These are valid : ${Object.keys(EVENTS).reduce((accum, key) => `${accum} "${key}"`, '')}`);
		this.subscribers[type].push(func);
	}

	unregister(event, func){
		//unregisters listeners
		const type = EVENTS[event];
		if(!type) throw new Error(`Not a valid event type. These are valid : ${Object.keys(EVENTS).reduce((accum, key) => `${accum} "${key}"`, '')}`);
		const index = this.subscribers[type].indexOf(func);
		if(index > -1) this.subscribers[type].splice(index, 1);
	}

	alertState(stateText){
		const mapping = {
			OFF : 0,
			PRIME : 1,
			CHANNEL_A : 2, 
			CHANNEL_B : 3
		},
		newState = mapping[stateText],
		update = {
			state : newState,
			updated : new Date.getTime()
		};

		return new Promise((resolve, reject) => {
			this.EDDI
			.child(PATHS.STATE)
			.set(update, err => {
				if(err) return reject(err);
				console.log(`EddiFire alerted of state change to : ${newState}`);
				resolve();
			});
		});
	}

	exit(){
		//reset all subscribers
		Object.keys(this.subscribers).forEach(key => this.subscribers[key] = []);

		//clean all listeners
		Object.keys(this.refs).forEach(key => this.refs[key].off());
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