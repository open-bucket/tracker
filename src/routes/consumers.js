/**
 * Lib imports
 */
const router = require('express').Router();

/**
 * Project imports
 */
const {createLogFn} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:consumer');

router
    .post('/', (request, response) => {
        // const {ethAddress} = request.body;
        // This is a sample endpoint
        response.send('createConsumer :( - OK');
    });

module.exports = {
    path: '/consumers',
    router
};
