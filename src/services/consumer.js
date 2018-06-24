/**
 * Project imports
 */
const db = require('../db');
const {createDebugLogger} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('services:consumer');

function create({address, userId}) {
    return db.Consumer.create({address, userId});
}

function getConsumerByIdAndUserId({id, userId}) {
    return db.Consumer.findOne({where: {id, userId}});
}

function getConsumerByUserId(userId) {
    return db.Consumer.findAll({where: {userId}});
}

function activateConsumer(consumerId) {
    // TODO
    log('INSIDE activateConsumer: ', consumerId);
    return consumerId;
}

function activateConsumerHandler(...rest) {
    // TODO
    log('activateConsumerHandler: ', rest);
    return activateConsumer(...rest);
}

module.exports = {
    create,
    getConsumerByIdAndUserId,
    getConsumerByUserId,
    activateConsumerHandler
};
