/**
 * Lib imports
 */
const http = require('http');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const app = require('./app');
const {PORT} = require('./configs');
const db = require('./db');
const {createDebugLoggerP, constant} = require('./utils');

const logP = createDebugLoggerP('index');

// create a new Activator Contract if the environment is dev
// Use existing Activator Contract if the environment is prod

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
        .then(constant(serverListenP(app, PORT)))
        .then(logP('HTTP Server Status: \n'));
}

createStartupTasks()
    .then(() => logP('Tracker has been started.', null));


