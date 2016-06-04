'use strict';
const EventEmitter = require('events'),
    superagent = require('superagent');
    
const promiseAdditions = require('./promise-additions');

const EVENTS = {
    data : 'data',
    error : 'error'
};

class UrlPoller {
    constructor(options){
        const URL = options.url;
        if(typeof URL != 'string') throw new Error(`${URL} needs to be a valid URL`);
        this.emitter = new EventEmitter();
        this._interval = options.interval || 500;
        this._url = URL;
    }
    
    init(){
        return this.check();
    }
    
    check(){
        const INTERVAL = this._interval,
            URL = this._url;
        return new Promise((resolve, reject) => {
                superagent.get(URL)
                    .end((err, res) => {
                        if(err) return reject(err);
                        resolve(res); 
                    });
            })
            .then(res => res.body)
            .then(data => this.emitter.emit(EVENTS.data, data))
            .catch(err => this.emitter.emit(EVENTS.error, err))
            .then(() => promiseAdditions.delay(INTERVAL))
            .then(() => process.nextTick(() => this.check()));
    }
    
    subscribe(eventName, listener){
        this.emitter.addListener(eventName, listener);
    }
    
    unsubscribe(eventName, listener){
        this.emitter.removeListener(eventName, listener);
    }
    
    unsubscribeAll(eventName){
        this.emitter.removeAllListener(eventName);
    }
}

module.exports = UrlPoller;