/**
 * Lib imports
 */
const ContractService = require('@open-bucket/contracts');
const http = require('http');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const app = require('./app');
const Configs = require('./configs');
const db = require('./db');
const {createDebugLoggerP, createDebugLogger, constant} = require('./utils');
const {activateConsumer, onConsumerActivationConfirmedHandler} = require('./services/consumer');
const {activateProducer, onProducerActivationConfirmedHandler} = require('./services/producer');

const logP = createDebugLoggerP('index');
const log = createDebugLogger('index');

function serverListenP(app, port) {
    const server = http.createServer(app);
    return BPromise.promisify(server.listen.bind(server))(port)
        .then(constant({HttpServer: {state: 'OK', message: `HTTP Server is listening on port: ${port}`}}))
        .catch(({message}) => ({HttpServer: {state: 'ERROR', message}}));
}

function establishDBConnectionP() {
    return db.sequelize.authenticate()
        .then(constant({DB: {state: 'OK', message: 'DB connection has been established successfully'}}))
        .catch(({message}) => ({DB: {state: 'ERROR', message}}));
}

function createStartupTasks() {
    return establishDBConnectionP()
        .then(logP('DB Status: \n'))
        .then(() => serverListenP(app, Configs.PORT))
        .then(logP('HTTP Server Status: \n'))
        .then(() => ContractService.getConsumerActivatorContractInstanceP())
        .then(instance => {
            log('Consumer Activator Contract is available at address:', instance.options.address);
            instance.events.onActivationCreated()
                .on('data', ({returnValues}) => activateConsumer(returnValues)
                    .catch(log('Error while confirming consumer activation:')))
                .on('error', log);
            instance.events.onActivationConfirmed()
                .on('data', ({returnValues}) => onConsumerActivationConfirmedHandler(returnValues))
                .on('error', log);
            return instance;
        })
        .then(() => ContractService.getProducerActivatorContractInstanceP())
        .then(instance => {
            log('Producer Activator Contract is available at address:', instance.options.address);
            instance.events.onActivationCreated()
                .on('data', ({returnValues}) => activateProducer(returnValues)
                    .catch(log('Error while confirming producer activation:')))
                .on('error', log);
            instance.events.onActivationConfirmed()
                .on('data', ({returnValues}) => onProducerActivationConfirmedHandler(returnValues))
                .on('error', log);
            return instance;
        });
}

createStartupTasks()
    .then(() => logP('Tracker has been started.', null));


