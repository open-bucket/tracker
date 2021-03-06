/**
 * Lib imports
 */
const {merge} = require('ramda');
const BPromise = require('bluebird');

class ConsumerManager {
    constructor() {
        if (!ConsumerManager.instance) {
            this._connectedConsumers = {};
            ConsumerManager.instance = this;
        }
        return ConsumerManager.instance;
    }

    add(id, data) {
        this._connectedConsumers[id] = data;
    }

    remove(id) {
        delete this._connectedConsumers[id];
    }

    update(id, data) {
        this.connectedConsumers[id] = merge(this.connectedConsumers[id], data);
    }

    get connectedConsumers() {
        return this._connectedConsumers;
    }

    get connectedConsumerCount() {
        return Object.keys(this.connectedConsumers).length;
    }

    sendWSP(consumerId, message) {
        return new BPromise(resolve => {
            this.connectedConsumers[consumerId].ws.send(message, resolve);
        });
    }
}

const ConsumerManagerInstance = new ConsumerManager();

module.exports = ConsumerManagerInstance;
