/**
 * Lib imports
 */
const mongoose = require('mongoose');
const Task = require('folktale/concurrency/task');

/**
 * Project imports
 */
const {DB_HOST, DB_PORT, DB_NAME} = require('../configs');
const {constant} = require('../utils');

function _connectT(url, options) {
    return Task.task((r) => {
        mongoose.connect(url, options)
            .then(r.resolve)
            .catch(r.reject);
    });
}

function connectT() {
    return _connectT(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
        .map(constant({MongoDB: {state: 'OK', message: `Connected to DB: ${DB_HOST}:${DB_PORT}/${DB_NAME}`}}))
        .orElse(({message}) => Task.of({MongoDB: {state: 'ERROR', message}}));
}


module.exports = {
    connectT
};
