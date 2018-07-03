/**
 * Project imports
 */
const ContractService = require('@open-bucket/contracts');
const {createDebugLogger} = require('./utils');
const {activateConsumer, onConsumerActivationConfirmedHandler} = require('./services/consumer');
const {activateProducer, onProducerActivationConfirmedHandler} = require('./services/producer');

const log = createDebugLogger('index');

async function listenConsumerActivatorEventsP() {
    const instance = await ContractService.getConsumerActivatorContractInstanceP();

    instance.events.onActivationCreated()
        .on('data', ({returnValues}) => activateConsumer(returnValues)
            .catch(log('Error while confirming consumer activation:')))
        .on('error', log);

    instance.events.onActivationConfirmed()
        .on('data', ({returnValues}) => onConsumerActivationConfirmedHandler(returnValues))
        .on('error', log);

    return instance;
}

async function listenProducerActivatorEventsP() {
    const instance = await ContractService.getProducerActivatorContractInstanceP();

    instance.events.onActivationCreated()
        .on('data', ({returnValues}) => activateProducer(returnValues)
            .catch(log('Error while confirming producer activation:')))
        .on('error', log);

    instance.events.onActivationConfirmed()
        .on('data', ({returnValues}) => onProducerActivationConfirmedHandler(returnValues))
        .on('error', log);

    return instance;
}

module.exports = {
    listenConsumerActivatorEventsP,
    listenProducerActivatorEventsP
};
