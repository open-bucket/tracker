/**
 * Project imports
 */
const PM = require('./producer-manager');
const {createDebugLogger} = require('../utils');
const {WS_ACTIONS} = require('../enums');
const {getShards} = require('../services/producer');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:producer');

function handleProducerMessage(id) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.PRODUCER_REPORT_SPACE_STATS) {
            PM.update(id, payload);
            getShards(id).then(shards => {
                PM.connectedProducers[id]
                    .ws
                    .send(JSON.stringify({action: 'I know!', payload: shards}));
            });
        }

    };
}

function handleProducerClose(id) {
    return () => {
        // TODO: remove all shards this producer is keeping (update ProducerShards table)
        // => Each time the producer is off, remove all data? YES
        log('Producer disconnected:', id);
        PM.remove(id);
        log('Current connected consumers:', PM.connectedProducers);
    };
}

module.exports = {
    handleProducerMessage,
    handleProducerClose
};
