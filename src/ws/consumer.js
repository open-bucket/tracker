/**
 * Lib imports
 */
const BPromise = require('bluebird');
const {pick, map} = require('ramda');
const BigNumber = require('bignumber.js');

/**
 * Project imports
 */
const CM = require('./consumer-manager');
const PM = require('./producer-manager');
const {createDebugLogger} = require('../utils');
const {createFileAndShardP, getFileById, getServingProducersP, getAllShards} = require('../services/file');
const {WS_ACTIONS} = require('../enums');
const ContractService = require('@open-bucket/contracts');

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

async function handleDownloadFile({fileId}, consumer) {
    async function verifyBalanceP(consumerContractAddress) {
        const producers = await getServingProducersP(fileId);
        const totalBytesBN = producers.reduce((acc, curr) => BigNumber(curr.servingBytes).plus(acc), 0);
        const {weiPerByteServed} = await ContractService.getPriceP(consumerContractAddress);
        const balance = await ContractService.getConsumerContractActualBalanceP(consumerContractAddress, consumer.address);

        const totalPaymentBN = BigNumber(weiPerByteServed).times(totalBytesBN);
        const balanceBN = BigNumber(balance);

        return balanceBN.gt(totalPaymentBN);
    }

    const file = await getFileById(fileId);
    if (file.consumerId !== consumer.id) {
        const message = {
            action: WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_DENY,
            payload: 'You don\'t have permission to download this file'
        };
        return CM.sendWSP(consumer.id, JSON.stringify(message));
    }

    const isBalanceSufficient = await verifyBalanceP(consumer.contractAddress);
    if (!isBalanceSufficient) {
        const message = {
            action: WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_DENY,
            payload: 'Your consumer contract balance is insufficient to pay for producers serving this file.'
        };
        return CM.sendWSP(consumer.id, JSON.stringify(message));
    }

    const shards = await getAllShards(fileId).then(map(pick(['name', 'magnetURI'])));
    const message = {
        action: WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_INFO,
        payload: {name: file.name, shards}
    };
    return CM.sendWSP(consumer.id, JSON.stringify(message));
}

async function handleDownloadFileConfirmation({hash, fileId}, consumer) {
    const producers = await getServingProducersP(fileId);
    const file = await getFileById(fileId);
    if (file.hash !== hash) {
        const message = {
            action: WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_CONFIRMATION_DENY,
            payload: 'Your file has been modified during the download process'
        };
        return CM.sendWSP(consumer.id, JSON.stringify(message));
    }

    await ContractService.confirmProducerServingP(consumer.contractAddress, producers);

    const shards = await getAllShards(fileId);
    const message = {
        action: WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_DONE,
        payload: {id: fileId, name: file.name, shards}
    };
    return CM.sendWSP(consumer.id, JSON.stringify(message));
}

function handleConsumerMessage(model) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.CONSUMER_UPLOAD_FILE) {
            handleUploadFile(payload)
                .then(() => log('Producer has been notified, waiting for their response..'))
                .catch((error) => log('Error while notifying producers', error));
        }

        if (action === WS_ACTIONS.CONSUMER_DOWNLOAD_FILE) {
            handleDownloadFile(payload, model)
                .then(() => log('CONSUMER_DOWNLOAD_FILE has been handled, waiting for consumer to download the file..'))
                .catch((error) => log('Error while notifying producers', error));
        }

        if (action === WS_ACTIONS.CONSUMER_DOWNLOAD_FILE_CONFIRMATION) {
            handleDownloadFileConfirmation(payload, model)
                .then(() => log('CONSUMER_DOWNLOAD_FILE has been handled, download done'))
                .catch((error) => log('Error while notifying producers', error));
        }
    };
}

function handleConsumerClose(model) {
    return () => {
        log('Consumer disconnected:', model.id);
        CM.remove(model.id);
        log('Current connected consumers count:', CM.connectedConsumerCount);
    };
}

module.exports = {
    handleConsumerMessage,
    handleConsumerClose
};
