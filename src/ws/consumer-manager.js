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

    get connectedConsumers() {
        return this._connectedConsumers;
    }
}

const ConsumerManagerInstance = new ConsumerManager();

module.exports = ConsumerManagerInstance;
