/**
 * Lib imports
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

/**
 * Project imports
 */
const routes = require('./routes');
const {sequelizeErrorHandler} = require('./middlewares');

function createExpressApp() {
    return express()
        .use(cors())
        .use(morgan('common'))
        .use(bodyParser.json())
        .use(routes)
        .use(sequelizeErrorHandler);
}

module.exports = createExpressApp();
