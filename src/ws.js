/**
 * Lib imports
 */
const {Server} = require('ws');
const {BAD_REQUEST, UNAUTHORIZED} = require('http-status-codes');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const {verifyJWTP} = require('./services/crypto');
const {WS_TYPE, WS_ACTIONS, PRODUCER_STATES} = require('./enums');
const PM = require('./producer-manager');
const {createDebugLogger, createDebugLoggerCP} = require('./utils');
const {getProducerByIdAndUserId} = require('./services/producer');
const {getConsumerByIdAndUserId} = require('./services/consumer');
const {createFileAndShardP} = require('./services/file');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws');
const logCP = createDebugLoggerCP('ws');

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

                return cb(true);
            })
            .catch(({message}) => cb(false, UNAUTHORIZED, message));
    } else {
        cb(false, BAD_REQUEST, 'Token is missing');
    }
}

function handleMessage({type, id}) {
    function handleProducerMessage(id) {
        return (message) => {
            return {message, id};
        };
    }

    function handleConsumerMessage(id) {
        return (rawMessage) => {
            const {action, payload} = JSON.parse(rawMessage);
            switch (action) {
                case WS_ACTIONS.CONSUMER_UPLOAD_FILE:
                    createFileAndShardP(payload)
                        .then((file) => log('Added a new file to DB', file.name))
                        .catch(logCP('Error while creating file on DB'));
            }
            log('consumer received message: ', rawMessage);
            return {rawMessage, id};
        };
    }

    return type === WS_TYPE.PRODUCER
        ? handleProducerMessage(id)
        : handleConsumerMessage(id);
}

function handleClose({type, id}) {
    function handleProducerClose(id) {
        return () => {
            PM.remove(id);
            log('current connected Producers on handleClose:', PM.connectedProducers);
        };
    }

    function handleConsumerClose(id) {
        return () => {
            return id;
        };
    }

    return type === WS_TYPE.PRODUCER
        ? handleProducerClose(id)
        : handleConsumerClose(id);
}

function startWSServerP(port) {
    return new BPromise(resolve => {
        const wss = new Server({port, clientTracking: true, verifyClient});
        wss.on('connection', (ws, request) => {
            const {type, id} = JSON.parse(request.headers['ws-metadata']);

            if (type === WS_TYPE.PRODUCER) {
                log('New Producer connected:', id);
                PM.add(id, {id, ws, startedAt: new Date()});
                log('Current connected Producers:', PM.connectedProducers);
            }

            ws.on('message', handleMessage({type, id}))
                .on('close', handleClose({type, id}));
        }).once('listening', () => resolve(wss));
    });
}

module.exports = {
    startWSServerP
};
