/**
 * Project imports
 */
const CM = require('./consumer-manager');
const {createDebugLogger, createDebugLoggerCP} = require('../utils');
const {createFileAndShardP} = require('../services/file');
const {WS_ACTIONS} = require('../enums');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:consumer');
const logCP = createDebugLoggerCP('ws:consumer');

function handleConsumerMessage(id) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.CONSUMER_UPLOAD_FILE) {
            createFileAndShardP(payload)
                .then((file) => log('Added a new file to DB', file.name))
                .catch(logCP('Error while creating file on DB'));
            /*
        TODO: match producer here => save to ProducerShards after the producer leeched the shard
        connectedProducers: [
            {ws, availableSize, data}
            Producer 2
            Producer 3
            Producer 4
        ]

        Shards: [

        ]
         */
        }

        return id;
    };
}

function handleConsumerClose(id) {
    return () => {
        // TODO: consumer ws handle upload file
        // when it is closed while file's availability is not enough, delete the file.
        log('Consumer disconnected:', id);
        CM.remove(id);
        log('Current connected consumers:', CM.connectedConsumers);
        return id;
    };
}

module.exports = {
    handleConsumerMessage,
    handleConsumerClose
};
