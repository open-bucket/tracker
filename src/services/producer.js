/**
 * Project imports
 */
const db = require('../db');
const {PRODUCER_STATES} = require('../enums');
const {createDebugLoggerP} = require('../utils');
const ContractService = require('@open-bucket/contracts');

const logP = createDebugLoggerP('consumer-services');

function create({name, userId}) {
    return db.Producer.create({name, userId});
}

function getProducersByUserId(userId) {
    return db.Producer.findAll({where: {userId}, order: [['id', 'ASC']]});
}

function getProducerByIdAndUserId({id, userId}) {
    return db.Producer.findOne({where: {id, userId}});
}

function getProducerWithShards(id) {
    return db.Producer.findOne({
        where: {id},
        include: [{
            model: db.Shard,
            as: 'shards',
            required: false,
            attributes: ['id', 'name', 'magnetURI', 'size'],
            through: {attributes: []} // remove junction table fields
        }],
    });
}

function activateProducer({modelId: id}) {
    return db.Producer.findAll({where: {id, state: PRODUCER_STATES.INACTIVE}})
        .then(consumer => consumer
            ? ContractService.confirmProducerActivationP(id)
            : logP('No INACTIVE producer matches the consumerId on consumerActivationCreated event. Ignore the event'));
}

function onProducerActivationConfirmedHandler({producerId, producer}) {
    return db.Producer.update({
        address: producer,
        state: PRODUCER_STATES.ACTIVE
    }, {where: {id: producerId}});
}

module.exports = {
    create,
    getProducersByUserId,
    getProducerByIdAndUserId,
    activateProducer,
    onProducerActivationConfirmedHandler,
    getProducerWithShards
};
