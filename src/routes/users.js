/**
 * Lib imports
 */
const router = require('express').Router();

/**
 * Project imports
 */
const {createLogFn, constant} = require('../utils');
const {registerT} = require('../services/user');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:users');

router
    .get('/', (request, response) => {
        // This is the sample endpoint
        response.send('sampleGET - OK');
    })
    .post('/', (request, response) => {
        return registerT(request.body)
            .map(constant(response.status(201).end('OK')))
            .run().promise();
    });

module.exports = {
    path: '/users',
    router
};
