/**
 * Lib imports
 */
const express = require('express');
const cors = require('cors');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const morgan = require('morgan');

/**
 * Project imports
 */
const routes = require('./routes');

function createExpressApp() {
    return express()
        .use(cors())
        .use(morgan('common'))
        .use(errorHandler())
        .use(bodyParser.json())
        .use(routes);
}

module.exports = createExpressApp();
