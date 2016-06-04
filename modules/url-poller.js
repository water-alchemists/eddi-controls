'use strict';
const EventEmitter = require('events'),
    request = require('superagent');
    
const promiseAdditions = require('./promise-additions');

class UrlPoller {
    constructor(options){
        this.emitter = new EventEmitter();
        this._interval = options.interval || 500;
        this._url = options.url;
    }
    
    init(){
        return this.check();
    }
    
    check(){
        const INTERVAL = this._interval,
            URL = this._url;
        return promiseAdditions.delay(INTERVAL)
            .then(() => {
                return new Promise((resolve, reject) => {
                    superagent.get(URL)
                        .end((err, res) => {
                           if(err) return reject(err);
                           resolve(res); 
                        });
                });
            })
            .then(res => this.emitter.emit('data', res))
            .catch(err => console.error('ERROR POLLING :', err))
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