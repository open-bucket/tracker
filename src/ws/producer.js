/**
 * Project imports
 */
const PM = require('./producer-manager');
const {createDebugLogger} = require('../utils');
const {WS_ACTIONS} = require('../enums');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:producer');

function handleProducerMessage(model) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.PRODUCER_REPORT_SPACE_STATS) {
            log('WS_ACTIONS.PRODUCER_REPORT_SPACE_STATS received', payload);
            PM.update(model.id, payload);
        }

        if (action === WS_ACTIONS.PRODUCER_SHARD_ORDER_CONFIRM) {
            /*
            const {name, hash, size} = payload;
            const shard = await db.Shard.findOne({where: {name, hash, size}})
            shard.setProducers([{where: {id}}])

             */
            log('WS_ACTIONS.PRODUCER_SHARD_ORDER_CONFIRM received', payload);
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
