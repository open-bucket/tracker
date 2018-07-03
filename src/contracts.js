/**
 * Project imports
 */
const ContractService = require('@open-bucket/contracts');
const {createDebugLoggerC} = require('./utils');
const {activateConsumer, onConsumerActivationConfirmedHandler} = require('./services/consumer');
const {activateProducer, onProducerActivationConfirmedHandler} = require('./services/producer');

const logC = createDebugLoggerC('index');

async function listenConsumerActivatorEventsP() {
    const instance = await ContractService.getConsumerActivatorContractInstanceP();

    instance.events.onActivationCreated()
        .on('data', ({returnValues}) => activateConsumer(returnValues)
            .catch(logC('Error while confirming consumer activation:')))
        .on('error', logC('Error while listening consumer activation onActivationCreated:'));

    instance.events.onActivationConfirmed()
        .on('data', ({returnValues}) => onConsumerActivationConfirmedHandler(returnValues))
        .on('error', logC('Error while listening consumer activation onActivationConfirmed:'));

    return instance;
}

async function listenProducerActivatorEventsP() {
    const instance = await ContractService.getProducerActivatorContractInstanceP();

    instance.events.onActivationCreated()
        .on('data', ({returnValues}) => activateProducer(returnValues)
            .catch(logC('Error while confirming producer activation:')))
        .on('error', logC('Error while listening producer activation onActivationCreated:'));

    instance.events.onActivationConfirmed()
        .on('data', ({returnValues}) => onProducerActivationConfirmedHandler(returnValues))
        .on('error', logC('Error while listening producer activation onActivationConfirmed:'));

    return instance;
}

module.exports = {
    listenConsumerActivatorEventsP,
    listenProducerActivatorEventsP
};
