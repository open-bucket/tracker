/**
 * Project imports
 */
const {HTTP_PORT, WS_PORT} = require('./configs');
const db = require('./db');
const {startHTTPServerP: _startHTTPServerP} = require('./http');
const {startWSServerP: _startWSServerP} = require('./ws');
const {listenConsumerActivatorEventsP, listenProducerActivatorEventsP} = require('./contracts');
const {createDebugLoggerCP, createDebugLoggerP, constant} = require('./utils');

const logCP = createDebugLoggerCP('index');
const logP = createDebugLoggerP('index');

function startHTTPServerP(port) {
    return _startHTTPServerP(port)
        .then(constant({HTTPServer: {state: 'OK', message: `HTTP Server is listening on port: ${port}`}}))
        .catch(({message}) => ({HttpServer: {state: 'ERROR', message}}));
}

function startWSServerP(port) {
    return _startWSServerP(port)
        .then(constant({WSServer: {state: 'OK', message: `WS Server is listening on port: ${port}`}}))
        .catch(({message}) => ({HttpServer: {state: 'ERROR', message}}));

}

function establishDBConnectionP() {
    return db.sequelize.authenticate()
        .then(constant({DB: {state: 'OK', message: 'DB connection has been established successfully'}}))
        .catch(({message}) => ({DB: {state: 'ERROR', message}}));
}

function createStartupTasks() {
    return establishDBConnectionP()
        .then(logCP('DB Status: \n'))
        .then(() => startHTTPServerP(HTTP_PORT))
        .then(logCP('HTTP Server Status: \n'))
        .then(() => startWSServerP(WS_PORT))
        .then(logCP('WS Server Status: \n'))
        .then(listenConsumerActivatorEventsP)
        .then(instance => logP('Consumer Activator Contract is available at address:', instance.options.address))
        .then(listenProducerActivatorEventsP)
        .then(instance => logP('Producer Activator Contract is available at address:', instance.options.address));
}

createStartupTasks()
    .then(() => logP('Tracker has been started.'));


