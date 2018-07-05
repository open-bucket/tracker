/**
 * Lib imports
 */
const {merge} = require('ramda');
const BPromise = require('bluebird');

class ProducerManager {
    constructor() {
        if (!ProducerManager.instance) {
            this._connectedProducers = {};
            ProducerManager.instance = this;
        }
        return ProducerManager.instance;
    }

    add(id, data) {
        this._connectedProducers[id] = data;
    }

    remove(id) {
        delete this._connectedProducers[id];
    }

    update(id, data) {
        this._connectedProducers[id] = merge(this._connectedProducers[id], data);
    }

    broadcastWSP(message) {
        return BPromise.all(Object.keys(this.connectedProducers)
            .map(id => this.sendWSP(id, message))
        );
    }

    sendWSP(producerId, message) {
        return new BPromise(resolve => {
            this.connectedProducers[producerId].ws.send(message, resolve);
        });
    }

    get connectedProducers() {
        return this._connectedProducers;
    }

    get connectedProducersCount() {
        return Object.keys(this.connectedProducers).length;
    }

}

const ProducerManagerInstance = new ProducerManager();

module.exports = ProducerManagerInstance;
