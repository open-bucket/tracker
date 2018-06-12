/**
 * Lib imports
 */
const http = require('http');
const Task = require('folktale/concurrency/task');

/**
 * Project imports
 */
const app = require('./app');
const {PORT} = require('./configs');
const db = require('./db');
const {createLogFnT, constant} = require('./utils');

const logT = createLogFnT('index');

function serverListenT(app, port) {
    const server = http.createServer(app);
    return Task.fromNodeback(server.listen.bind(server))(port)
        .map(constant({HttpServer: {state: 'OK', message: `HTTP Server is listening on port: ${port}`}}))
        .orElse(({message}) => Task.of({HttpServer: {state: 'ERROR', message}}));
}

function establishDBConnection() {
    return Task.fromPromised(db.sequelize.authenticate.bind(db.sequelize))()
        .map(constant({DB: {state: 'OK', message: 'DB connection has been established successfully'}}))
        .orElse(({message}) => Task.of({DB: {state: 'ERROR', message}}));
}

function createStartupTasks() {
    return establishDBConnection()
        .chain(logT('DB Status: \n'))
        .chain(constant(serverListenT(app, PORT)))
        .chain(logT('HTTP Server Status: \n'))
        .chain(constant(logT('Tracker has been started.', null)));
}

createStartupTasks().run();


