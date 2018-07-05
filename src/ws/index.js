/**
 * Lib imports
 */
const {Server} = require('ws');
const {BAD_REQUEST, UNAUTHORIZED} = require('http-status-codes');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const {verifyJWTP} = require('../services/crypto');
const {WS_TYPE, PRODUCER_STATES} = require('../enums');
const PM = require('./producer-manager');
const CM = require('./consumer-manager');
const {handleConsumerClose, handleConsumerMessage} = require('./consumer');
const {handleProducerClose, handleProducerMessage} = require('./producer');
const {createDebugLogger} = require('../utils');
const {getProducerByIdAndUserId} = require('../services/producer');
const {getConsumerByIdAndUserId} = require('../services/consumer');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws');

function verifyClient({req}, cb) {
    const token = req.headers.authorization;
    const {type, id} = JSON.parse(req.headers['ws-metadata']);

    if (token) {
        verifyJWTP(token)
            .then(async ({userId}) => {
                const result = type === WS_TYPE.PRODUCER
                    ? await getProducerByIdAndUserId({id, userId})
                    : await getConsumerByIdAndUserId({id, userId});

                if (!result) {
                    return cb(false, BAD_REQUEST, `User ${userId} doesn't have ${type} ${id}`);
                }

                if (result.state !== PRODUCER_STATES.ACTIVE) {
                    return cb(false, BAD_REQUEST, 'Produce/Consumer is INACTIVE');
                }

                req.model = result;
                return cb(true);
            })
            .catch(({message}) => cb(false, UNAUTHORIZED, message));
    } else {
        cb(false, BAD_REQUEST, 'Token is missing');
    }
}

function handleMessage({type, model}) {
    return type === WS_TYPE.PRODUCER
        ? handleProducerMessage(model)
        : handleConsumerMessage(model);
}

function handleClose({type, model}) {
    return type === WS_TYPE.PRODUCER
        ? handleProducerClose(model)
        : handleConsumerClose(model);
}

function startWSServerP(port) {
    return new BPromise(resolve => {
        const wss = new Server({port, clientTracking: true, verifyClient});
        wss.on('connection', (ws, request) => {
            const {type} = JSON.parse(request.headers['ws-metadata']);
            const {model} = request;

            if (type === WS_TYPE.PRODUCER) {
                log('New Producer connected:', model.id);
                PM.add(model.id, {model, ws, startedAt: new Date()});
                log('Current connected Producers count:', PM.connectedProducersCount);
            } else {
                log('New Consumer connected:', model.id);
                CM.add(model.id, {model, ws});
                log('Current connected Consumers count:', CM.connectedConsumerCount);
            }

            ws.on('message', handleMessage({type, model}))
                .on('close', handleClose({type, model}));
        }).once('listening', () => resolve(wss));
    });
}

module.exports = {
    startWSServerP
};
