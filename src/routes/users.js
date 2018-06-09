/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED} = require('http-status-codes');

/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const {register} = require('../services/user');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:users');

router
    .get('/', (request, response) => {
        // This is the sample endpoint
        response.send('sampleGET - OK');
    })
    .post('/', (request, response, next) => {
        return register(request.body)
            .then(() => response.status(CREATED).send('OK'))
            .catch(next);
    });

module.exports = {
    path: '/users',
    router
};
