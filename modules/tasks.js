'use strict';
const superagent = require('superagent');

const config = require('../config');

function alertEddiState(stateText, reason){
    const URL = `${config.homeUrl}/${id}`,
        mapping = {
			OFF : 0,
			PRIME : 1,
			CHANNEL_A : 2, 
			CHANNEL_B : 3
		},
		newState = mapping[stateText],
		update = {
			state : newState,
			updated : Math.floor(new Date().getTime() / 1000),
            reason : reason
		};

    return new Promise((resolve, reject) => {
        superagent.put(URL)
            .send(state)
            .end((err, data) => {
                if(err) return reject(err);
                resolve(data);
            });
    });
}

module.exports = {
    alertState : alertEddiState
};