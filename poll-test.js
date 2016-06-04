'use strict';
const UrlPoller = require('./modules/url-poller'),
    tasks = require('./modules/tasks'),
    config = require('./config');
    
const POLL_URL = `${config.homeUrl}/${config.id}`, 
    pollerConfig = {
        url : POLL_URL,
        interval : 30 * 1000
    },
    INTERVAL = 500;

const poller = new UrlPoller(pollerConfig);

const ref = {
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

setInterval(() => {
    console.log('reading this', Object.assign({ updated : new Date() }, ref));
}, INTERVAL);