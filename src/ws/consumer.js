/**
 * Lib imports
 */
const BPromise = require('bluebird');

/**
 * Project imports
 */
const CM = require('./consumer-manager');
const PM = require('./producer-manager');
const {createDebugLogger} = require('../utils');
const {createFileAndShardP} = require('../services/file');
const {WS_ACTIONS} = require('../enums');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:consumer');

async function handleUploadFile(payload) {
    const file = await createFileAndShardP(payload);
    return BPromise.all(file.shards.map(({id, name, magnetURI, size}) => {
        const message = {
            action: WS_ACTIONS.PRODUCER_SHARD_ORDER,
            payload: {id, name, magnetURI, size}
        };
        return PM.broadcastWSP(JSON.stringify(message));
    }));
}

function handleConsumerMessage(model) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.CONSUMER_UPLOAD_FILE) {
            handleUploadFile(payload)
                .then(() => log('Producer has been notified, waiting for their response..'))
                .catch((error) => log('Error while notifying producers', error));
        }
        return model;
    };
}

function handleConsumerClose(model) {
    return () => {
        // TODO: consumer ws handle upload file
        // when it is closed while file's availability is not enough, delete the file.
        log('Consumer disconnected:', model.id);
        CM.remove(model.id);
        log('Current connected consumers count:', CM.connectedConsumerCount);
    };
}

module.exports = {
    handleConsumerMessage,
    handleConsumerClose
};
