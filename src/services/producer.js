/**
 * Project imports
 */
const db = require('../db');
const {PRODUCER_STATES} = require('../enums');
const {createDebugLogger, createDebugLoggerP} = require('../utils');
const ContractService = require('@open-bucket/contracts');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('consumer-services');
const logP = createDebugLoggerP('consumer-services');

function create({name, userId}) {
    return db.Producer.create({name, userId});
}

function getProducersByUserId(userId) {
    return db.Producer.findAll({where: {userId}});
}

function activateProducer({producerId: id}) {
    return db.Producer.findAll({where: {id, state: PRODUCER_STATES.INACTIVE}})
        .then(consumer => consumer
            ? ContractService.confirmProducerActivationP(id)
            : logP('No INACTIVE producer matches the consumerId on consumerActivationCreated event. Ignore the event', null));
}

function onProducerActivationConfirmedHandler({producerId: id, producerAddress: address}) {
    return db.Producer.update({address, state: PRODUCER_STATES.ACTIVE}, {where: {id}});
}

module.exports = {
    create,
    getProducersByUserId,
    activateProducer,
    onProducerActivationConfirmedHandler
};
