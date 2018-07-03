/**
 * Lib imports
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const http = require('http');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const routes = require('../routes');
const {sequelizeErrorHandler} = require('./middlewares');

const app = express()
    .use(cors())
    .use(morgan('common'))
    .use(bodyParser.json())
    .use(routes)
    .use(sequelizeErrorHandler);


function startHTTPServerP(port) {
    const server = http.createServer(app);
    return BPromise.promisify(server.listen.bind(server))(port);
}

module.exports = {
    app,
    startHTTPServerP,
};
