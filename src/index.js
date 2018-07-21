/**
 * Lib imports
 */
const BPromise = require('bluebird');

/**
 * Project imports
 */
const {HTTP_PORT, WS_PORT, BITTORRENT_TRACKER_PORT} = require('./configs');
const db = require('./db');
const {startHTTPServerP: _startHTTPServerP} = require('./http');
const {startWSServerP: _startWSServerP} = require('./ws');
const {startBitTorrentTrackerP: _startTorrentTrackerP} = require('./bittorrent-tracker');
const {listenConsumerActivatorEventsP, listenProducerActivatorEventsP} = require('./contracts');
const {createDebugLoggerP, constant} = require('./utils');

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

function startTorrentTrackerP(port) {
    return _startTorrentTrackerP(port)
        .then(constant({TorrentServer: {state: 'OK', message: `Torrent Server is listening on port: ${port}`}}))
        .catch(({message}) => ({TorrentServer: {state: 'ERROR', message}}));
}

function establishDBConnectionP() {
    function resetShardStatesP() {
        return db.sequelize.query('DELETE FROM "ProducerShards"', {type: db.sequelize.QueryTypes.DELETE});
    }

    return db.sequelize.authenticate()
        .then(resetShardStatesP)
        .then(constant({DB: {state: 'OK', message: 'Database is OK'}}))
        .catch(({message}) => ({DB: {state: 'ERROR', message}}));
}

function listenActivatorEvents() {
    return listenConsumerActivatorEventsP()
        .then(instance => logP('Consumer Activator Contract is available at address:', instance.options.address))
        .then(listenProducerActivatorEventsP)
        .then(instance => logP('Producer Activator Contract is available at address:', instance.options.address));
}

function runStartupTasks() {
    return BPromise.all([
        establishDBConnectionP(),
        startHTTPServerP(HTTP_PORT),
        startWSServerP(WS_PORT),
        startTorrentTrackerP(BITTORRENT_TRACKER_PORT),
        listenActivatorEvents()
    ]);
}

runStartupTasks()
    .then((statuses) => logP('Tracker has been started.', statuses));


