/**
 * Lib imports
 */
const BPromise = require('bluebird');

/**
 * Project imports
 */
const PM = require('./producer-manager');
const CM = require('./consumer-manager');
const {createDebugLogger, tierToDesiredAv} = require('../utils');
const {WS_ACTIONS} = require('../enums');
const {verifyShardP, getShardAvP} = require('../services/shard');
const {findFileById} = require('../services/file');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:producer');

function handleProducerMessage(producerModel) {
    return (rawMessage) => {

        async function handleProducerShardOrderConfirm() {

            function sendDenyMessageP() {
                const message = {
                    action: WS_ACTIONS.PRODUCER_SHARD_ORDER_DENY,
                    payload // {id: shardId, name, hash, size, magnetURI}
                };
                return PM.sendWSP(producerModel.id, JSON.stringify(message));
            }

            function sendAcceptMessageP() {
                const message = {
                    action: WS_ACTIONS.PRODUCER_SHARD_ORDER_ACCEPT,
                    payload
                };
                return PM.sendWSP(producerModel.id, JSON.stringify(message));
            }

            function sendNewProducerAcceptedP(file, currentAv) {
                log(`Report status to consumer ${file.consumerId}:`);
                const message = {
                    action: WS_ACTIONS.CONSUMER_NEW_PRODUCER_ACCEPTED,
                    payload: {
                        fileId: file.id,
                        shardId: shard.id,
                        producerId: producerModel.id,
                        currentAv
                    }
                };
                return CM.sendWSP(file.consumerId, JSON.stringify(message));
            }

            function sendUploadDoneP(file, shards) {
                log(`File ${file.id} has current availability matched with desired availability, done uploading`);
                const message = {
                    action: WS_ACTIONS.CONSUMER_UPLOAD_FILE_DONE,
                    payload: {
                        fileId: file.id,
                        shards
                    }
                };
                return CM.sendWSP(file.consumerId, JSON.stringify(message));
            }

            // const {id: shardId, name, hash, size} = payload;
            const shard = await verifyShardP(payload);

            if (!shard) {
                await sendDenyMessageP();
            } else {
                const file = await findFileById(shard.fileId);
                const desiredAv = tierToDesiredAv(file.tier);

                const currentShardAv = await getShardAvP(shard);
                if (currentShardAv >= desiredAv) {
                    await sendDenyMessageP();
                } else {
                    log(`Verified PRODUCER_SHARD_ORDER_CONFIRM from Producer ${producerModel.id}, accept the confirmation`);
                    await shard.addProducer(producerModel);
                    await sendAcceptMessageP();

                    // get count of all shard of the file, get the min
                    const allShards = await file.getShards();
                    const allShardsCount = await BPromise.all(allShards.map(shard =>
                        getShardAvP(shard).then(count => ({id: shard.id, count}))));
                    const minAvShard = allShardsCount.reduce((acc, curr) => acc.count < curr.count ? acc : curr);
                    const currentMinAv = Number(minAvShard.count);

                    if (CM.connectedConsumers[file.consumerId]) {
                        await sendNewProducerAcceptedP(file, currentMinAv);

                        if (currentMinAv >= 1 && !CM.connectedConsumers[file.consumerId].done) {
                            CM.update(file.consumerId, {done: true});
                            await sendUploadDoneP(file, allShards);
                        }
                    }
                }
            }

        }

        log(`Received new message from Producer ${producerModel.id}`, rawMessage);
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.PRODUCER_REPORT_SPACE_STATS) {
            PM.update(producerModel.id, payload);
        }

        if (action === WS_ACTIONS.PRODUCER_SHARD_ORDER_CONFIRM) {
            handleProducerShardOrderConfirm()
                .then(() => log(`Handled PRODUCER_SHARD_ORDER_CONFIRM from Producer ${producerModel.id}`, payload))
                .catch((error) => log(`Error occurred while handling PRODUCER_SHARD_ORDER_CONFIRM ${producerModel.id}`, error));
        }
    };
}

function handleProducerClose(producerModel) {
    return async () => {
        log('Producer disconnected:', producerModel.id);
        PM.remove(producerModel.id);
        log('Current connected producers:', PM.connectedProducersCount);
        const missingShards = await producerModel.getShards();

        await producerModel.setShards([]);

        await BPromise.all(missingShards.map(({id, name, magnetURI, size}) => {
            const message = {
                action: WS_ACTIONS.PRODUCER_SHARD_ORDER,
                payload: {id, name, magnetURI, size}
            };
            return PM.broadcastWSP(JSON.stringify(message));
        }));
    };
}

module.exports = {
    handleProducerMessage,
    handleProducerClose
};
