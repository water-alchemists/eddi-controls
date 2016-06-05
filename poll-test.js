'use strict';
const UrlPoller = require('./modules/url-poller'),
    tasks = require('./modules/tasks'),
    config = require('./config');
    
const POLL_URL = `${config.homeUrl}/${config.id}`, 
    pollerConfig = {
        url : POLL_URL,
        interval : 30 * 1000
    },
    INTERVAL = 15 * 1000;

const poller = new UrlPoller(pollerConfig);

const ref = {
    current : 'OFF',
    running : true,
    reason : 'initialize'
};

const log = function(data){
    if(data instanceof Error) return console.error('ERROR:', data);
    console.log('got a message', data);
    Object.assign(ref, { received : new Date() }, data);
}

poller.subscribe('data', log);
poller.subscribe('error', log);

poller.init();

const CYCLE = {
    OFF : 'OFF',
    PRIME : 'PRIME',
    CHANNEL_A : 'CHANNEL_A',
    CHANNEL_B : 'CHANNEL_B',
};

let index = 0;

setInterval(() => {
    console.log('reading this', Object.assign({ updated : new Date() }, ref));
    var currentCycle = ref.current,
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
    
    // Check for if it should go off;
    if(!ref.running) {
        console.log('cloud suggest to have it off because of', ref.reason);
        targetCycle = CYCLE.OFF;
    }
    
    // Trigger next cycle
    if( targetCycle !== currentCycle ){
        console.log('in triggering next cycle');
        ref.current = targetCycle;
    }
    
    console.log('current', currentCycle, 'target', targetCycle, 'refs.current', ref.current);
    
    return  tasks.alertState(ref.current, ref.reason);

}, INTERVAL);