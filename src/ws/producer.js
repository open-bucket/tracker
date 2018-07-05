/**
 * Lib imports
 */
const {prop} = require('ramda');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const PM = require('./producer-manager');
const CM = require('./consumer-manager');
const {createDebugLogger, tierToDesiredAv} = require('../utils');
const {WS_ACTIONS} = require('../enums');
const db = require('../db');

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

            const {id: shardId, name, hash, size} = payload;
            const shard = await db.Shard.findOne({
                where: {
                    id: shardId,
                    name, hash, size
                }
            });

            if (!shard) {
                await sendDenyMessageP();
            } else {
                const file = await db.File.findById(shard.fileId);
                const desiredAv = tierToDesiredAv(file.tier);
                // get the shard count currently in the network
                const count = await shard.getProducers().then(prop('length'));
                if (count >= desiredAv) {
                    await sendDenyMessageP();
                } else {
                    await shard.addProducer(producerModel);
                    log(`Verified PRODUCER_SHARD_ORDER_CONFIRM from Producer ${producerModel.id}, accept the confirmation`);
                    await sendAcceptMessageP();

                    // get count of all shard of the file, get the min
                    const allShards = await file.getShards();
                    const allShardsCount = await BPromise.all(allShards.map(shard =>
                        shard.getProducers()
                            .then(prop('length'))
                            .then(count => ({id: shard.id, count}))
                    ));
                    const minAvShard = allShardsCount.reduce((acc, curr) => acc.count < curr.count ? acc : curr);
                    const currentAv = Number(minAvShard.count);

                    log(`Report status to consumer ${file.consumerId}:`, {
                        fileId: file.id,
                        shardId: shard.id,
                        producerId: producerModel.id,
                        currentAv
                    });
                    const message = {
                        action: WS_ACTIONS.CONSUMER_NEW_PRODUCER_ACCEPTED,
                        payload: {
                            fileId: file.id,
                            shardId: shard.id,
                            producerId: producerModel.id,
                            currentAv
                        }
                    };
                    await CM.sendWSP(file.consumerId, JSON.stringify(message));

                    // TODO: improve this. If many confirmation come when the fileAv is enough, this will be called many times
                    if (currentAv >= desiredAv) {
                        log(`File ${file.id} has current availability matched with desired availability, done uploading`, {
                            desiredAv,
                            currentAv
                        });
                        const message = {
                            action: WS_ACTIONS.CONSUMER_UPLOAD_FILE_DONE,
                            payload: {
                                fileId: file.id,
                                shards: allShards
                            }
                        };
                        await CM.sendWSP(file.consumerId, JSON.stringify(message));
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
