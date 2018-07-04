const {merge, forEachObjIndexed} = require('ramda');

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

    broadcast(message) {
        forEachObjIndexed((producer) => {
            producer.ws.send(message);
        })(this.connectedProducers);
    }

    get connectedProducers() {
        return this._connectedProducers;
    }

}

const ProducerManagerInstance = new ProducerManager();

module.exports = ProducerManagerInstance;
