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

    get connectedProducers() {
        return this._connectedProducers;
    }

    // more fn here
}

const ProducerManagerInstance = new ProducerManager();

module.exports = ProducerManagerInstance;
