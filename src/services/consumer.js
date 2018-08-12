/**
 * Project imports
 */
const db = require('../db');
const {createDebugLoggerP} = require('../utils');
const {CONSUMER_STATES} = require('../enums');
const ContractService = require('@open-bucket/contracts');
const {pick} = require('ramda');

const logP = createDebugLoggerP('consumer-services');

function create({tier, name, userId}) {
    return db.Consumer.create({tier, name, userId});
}

function getConsumerByIdAndUserId({id, userId}) {
    return db.Consumer.findOne({where: {id, userId}});
}

function getAllConsumersByUserId(userId) {
    return db.Consumer.findAll({where: {userId}, order: [['id', 'ASC']]});
}

function activateConsumer({modelId: id}) {
    return db.Consumer.findAll({where: {id, state: CONSUMER_STATES.INACTIVE}})
        .then(consumer => consumer
            ? ContractService.confirmConsumerActivationP(id)
            : logP('No INACTIVE consumer matches the consumerId on consumerActivationCreated event. Ignore the event'));
}

function onConsumerActivationConfirmedHandler({consumerId, consumer, consumerContract}) {
    return db.Consumer.update({
        contractAddress: consumerContract,
        state: CONSUMER_STATES.ACTIVE,
        address: consumer
    }, {where: {id: consumerId}});
}

function updateConsumerByIdAndUserId({id, userId, newValue}) {
    const validFields = ['name','tier'];
    const fields = Object.keys(pick(validFields, newValue));
    return db.Consumer.update(newValue, {returning: true, where: {id, userId}, fields})
        .then(affectedRows => affectedRows[1][0]);
}

module.exports = {
    create,
    getConsumerByIdAndUserId,
    getAllConsumersByUserId,
    activateConsumer,
    onConsumerActivationConfirmedHandler,
    updateConsumerByIdAndUserId
};
