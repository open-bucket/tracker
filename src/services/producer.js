/**
 * Project imports
 */
const db = require('../db');
const {createDebugLogger} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('consumer-services');

function create({name, userId}) {
    return db.Producer.create({name, userId});
}

function getProducersByUserId(userId) {
    return db.Producer.findAll({where: {userId}});
}

// function activateConsumer({consumerId: id}) {
//     return db.Consumer.findAll({where: {id, state: CONSUMER_STATES.INACTIVE}})
//         .then(consumer => consumer
//             ? ContractService.confirmActivationP(id)
//             : logP('No INACTIVE consumer matches the consumerId on consumerActivationCreated event. Ignore the event', null));
// }

// function onActivationConfirmedHandler({consumerId: id, consumerContract: contractAddress}) {
//     return db.Consumer.update({contractAddress, state: CONSUMER_STATES.ACTIVE}, {where: {id}});
// }

module.exports = {
    create,
    getProducersByUserId
};
