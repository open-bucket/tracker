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
const {activateConsumerHandler} = require('./services/consumer');

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
        .then(constant(serverListenP(app, Configs.PORT)))
        .then(logP('HTTP Server Status: \n'))
        .then(() => ContractService.getActivatorContractInstanceP())
        .then(activatorInstance => {
            log('Activator Contract is available at address:', activatorInstance.options.address);
            activatorInstance.events.onCreateConsumerActivation()
                .on('data', ({returnValues}) => activateConsumerHandler(returnValues))
                .on('error', log);
            log('Tracker is listening on onCreateConsumerActivation of Activator', null);
            return activatorInstance;
        });
}

createStartupTasks()
    .then(() => logP('Tracker has been started.', null));


