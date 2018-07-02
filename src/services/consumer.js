/**
 * Project imports
 */
const db = require('../db');
const {createDebugLogger, createDebugLoggerP} = require('../utils');
const {CONSUMER_STATES} = require('../enums');
const ContractService = require('@open-bucket/contracts');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('consumer-services');
const logP = createDebugLoggerP('consumer-services');

function create({tier, name, userId}) {
    return db.Consumer.create({tier, name, userId});
}

function getConsumerByIdAndUserId({id, userId}) {
    return db.Consumer.findOne({where: {id, userId}});
}

function getConsumerByUserId(userId) {
    return db.Consumer.findAll({where: {userId}});
}

function activateConsumer({consumerId: id}) {
    return db.Consumer.findAll({where: {id, state: CONSUMER_STATES.INACTIVE}})
        .then(consumer => consumer
            ? ContractService.confirmConsumerActivationP(id)
            : logP('No INACTIVE consumer matches the consumerId on consumerActivationCreated event. Ignore the event', null));
}

function onConsumerActivationConfirmedHandler({consumerId: id, consumerContract: contractAddress}) {
    return db.Consumer.update({contractAddress, state: CONSUMER_STATES.ACTIVE}, {where: {id}});
}

module.exports = {
    create,
    getConsumerByIdAndUserId,
    getConsumerByUserId,
    activateConsumer,
    onConsumerActivationConfirmedHandler
};
