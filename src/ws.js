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
const {WS_TYPE} = require('./enums');
const PM = require('./producer-manager');

function verifyClient({req}, cb) {
    const token = req.headers.authorization;

    if (token) {
        verifyJWTP(token)
            .then(() => cb(true))
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
        return (message) => {
            return {message, id};
        };
    }

    return type === WS_TYPE.PRODUCER
        ? handleProducerMessage(id)
        : handleConsumerMessage(id);
}

function handleClose({type, id}) {
    function handleProducerClose(id) {
        return () => {
            return PM.remove(id);
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
        wss.on('connection', async (ws, request) => {
            /*
            request.headers['WS-Metadata'] must be the stringified JS Object with the schema:
            {
                type: PRODUCER/CONSUMER,
                id: 1 // id of producer/consumer
            }
            */
            const {type, id} = JSON.parse(request.headers['WS-Metadata']);

            if (type === WS_TYPE.PRODUCER) {
                PM.add(id, {id, ws, startedAt: new Date()});
            }

            ws.on('message', handleMessage({type, id}))
                .on('close', handleClose({type, id}));
        }).on('listening', () => resolve(wss));
    });
}

module.exports = {
    startWSServerP
};
